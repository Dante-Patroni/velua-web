import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { iniciarPago, informarTransferencia, obtenerPedido } from "@/lib/api/pedidos.api";
import { ErrorApi } from "@/lib/apiFetch";
import { avisarTransferencia, cargarPedido, gestionarPedido, pagarPedido } from "@/pages/Tienda/Pedido.action";
import type { PedidoPublico } from "@/types";

vi.mock("@/lib/api/pedidos.api", () => ({
  obtenerPedido: vi.fn(),
  iniciarPago: vi.fn(),
  informarTransferencia: vi.fn(),
}));

const pedido = { numero: "VEL-4K7Q2X", estadoPago: "pendiente", medioPago: "mercadopago" } as PedidoPublico;

const cargar = (url = "http://localhost/pedido/VEL-4K7Q2X") =>
  ({
    request: new Request(url),
    params: { numero: "VEL-4K7Q2X" },
    context: {},
  }) as unknown as LoaderFunctionArgs;

const pagar = () =>
  ({
    request: new Request("http://localhost/pedido/VEL-4K7Q2X", { method: "POST" }),
    params: { numero: "VEL-4K7Q2X" },
    context: {},
  }) as unknown as ActionFunctionArgs;

describe("cargarPedido", () => {
  beforeEach(() => {
    vi.mocked(obtenerPedido).mockReset();
  });

  it("devuelve el pedido tal como lo informa la API", async () => {
    vi.mocked(obtenerPedido).mockResolvedValue(pedido);

    await expect(cargarPedido(cargar())).resolves.toEqual({ pedido, error: null });
    expect(obtenerPedido).toHaveBeenCalledWith("VEL-4K7Q2X", expect.any(AbortSignal));
  });

  it("ignora lo que Mercado Pago agrega a la URL: el estado sale solo de la API", async () => {
    vi.mocked(obtenerPedido).mockResolvedValue(pedido);

    const resultado = await cargarPedido(
      cargar(
        "http://localhost/pedido/VEL-4K7Q2X?collection_status=approved&status=approved&payment_id=999&external_reference=otro",
      ),
    );

    expect(resultado.pedido?.estadoPago).toBe("pendiente");
    expect(obtenerPedido).toHaveBeenCalledTimes(1);
    expect(obtenerPedido).toHaveBeenCalledWith("VEL-4K7Q2X", expect.any(AbortSignal));
  });

  it("un número que no existe corta con un 404", async () => {
    vi.mocked(obtenerPedido).mockRejectedValue(new ErrorApi("NO_ENCONTRADO", 404));

    await expect(cargarPedido(cargar())).rejects.toMatchObject({ status: 404 });
  });

  it.each([
    ["LIMITE_SUPERADO", 429],
    ["ERROR_INTERNO", 500],
    ["ERROR_DE_RED", 0],
  ])("%s no tira la página: devuelve el código", async (codigo, status) => {
    vi.mocked(obtenerPedido).mockRejectedValue(new ErrorApi(codigo, status));

    await expect(cargarPedido(cargar())).resolves.toEqual({ pedido: null, error: codigo });
  });

  it("deja pasar una navegación cancelada", async () => {
    const cancelada = new DOMException("cancelada", "AbortError");
    vi.mocked(obtenerPedido).mockRejectedValue(cancelada);

    await expect(cargarPedido(cargar())).rejects.toBe(cancelada);
  });
});

describe("pagarPedido", () => {
  beforeEach(() => {
    vi.mocked(iniciarPago).mockReset();
  });

  it("manda a Mercado Pago con el link nuevo", async () => {
    vi.mocked(iniciarPago).mockResolvedValue({
      numero: "VEL-4K7Q2X",
      urlPago: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=2",
    });

    await expect(pagarPedido(pagar())).resolves.toEqual({
      ok: true,
      destino: { tipo: "externo", url: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=2" },
    });
  });

  it("un link que no es de Mercado Pago se trata como procesador no disponible", async () => {
    vi.mocked(iniciarPago).mockResolvedValue({ numero: "VEL-4K7Q2X", urlPago: "https://evil.com/pagar" });

    await expect(pagarPedido(pagar())).resolves.toEqual({
      ok: false,
      codigo: "PROCESADOR_NO_DISPONIBLE",
    });
  });

  it.each(["PEDIDO_VENCIDO", "PEDIDO_YA_PAGADO", "PAGO_EN_PROCESO", "PEDIDO_NO_PAGABLE", "PROCESADOR_NO_DISPONIBLE"])(
    "%s vuelve como código",
    async (codigo) => {
      vi.mocked(iniciarPago).mockRejectedValue(new ErrorApi(codigo, 409));

      await expect(pagarPedido(pagar())).resolves.toEqual({ ok: false, codigo });
    },
  );
});

const enviarFormulario = (campos: Record<string, string>) => {
  const cuerpo = new FormData();
  for (const [clave, valor] of Object.entries(campos)) cuerpo.set(clave, valor);

  return {
    request: new Request("http://localhost/pedido/VEL-4K7Q2X", { method: "POST", body: cuerpo }),
    params: { numero: "VEL-4K7Q2X" },
    context: {},
  } as unknown as ActionFunctionArgs;
};

describe("avisarTransferencia", () => {
  beforeEach(() => {
    vi.mocked(informarTransferencia).mockReset();
  });

  it("llama a la ruta del comprobante con el número del pedido", async () => {
    vi.mocked(informarTransferencia).mockResolvedValue({ numero: "VEL-4K7Q2X", comprobanteInformado: true });

    await expect(avisarTransferencia(pagar())).resolves.toEqual({ intencion: "aviso", ok: true });
    expect(informarTransferencia).toHaveBeenCalledWith("VEL-4K7Q2X");
  });

  it.each([
    ["PEDIDO_NO_PAGABLE", 409],
    ["PEDIDO_YA_PAGADO", 409],
    ["PEDIDO_VENCIDO", 409],
    ["LIMITE_SUPERADO", 429],
    ["NO_ENCONTRADO", 404],
  ])("devuelve el código %s para que la página lo traduzca", async (codigo, status) => {
    vi.mocked(informarTransferencia).mockRejectedValue(new ErrorApi(codigo, status));

    await expect(avisarTransferencia(pagar())).resolves.toEqual({ intencion: "aviso", ok: false, codigo });
  });

  it("ante un error que no es de la API devuelve un código desconocido", async () => {
    vi.mocked(informarTransferencia).mockRejectedValue(new Error("boom"));

    await expect(avisarTransferencia(pagar())).resolves.toEqual({
      intencion: "aviso",
      ok: false,
      codigo: "ERROR_DESCONOCIDO",
    });
  });
});

describe("gestionarPedido", () => {
  beforeEach(() => {
    vi.mocked(informarTransferencia).mockReset();
    vi.mocked(iniciarPago).mockReset();
  });

  it("con intencion=avisar registra el aviso y no pide link de pago", async () => {
    vi.mocked(informarTransferencia).mockResolvedValue({ numero: "VEL-4K7Q2X", comprobanteInformado: true });

    await gestionarPedido(enviarFormulario({ intencion: "avisar" }));

    expect(informarTransferencia).toHaveBeenCalledTimes(1);
    expect(iniciarPago).not.toHaveBeenCalled();
  });

  it("sin intención, o con una desconocida, se trata como pagar", async () => {
    vi.mocked(iniciarPago).mockResolvedValue({ numero: "VEL-4K7Q2X", urlPago: "https://www.mercadopago.com.ar/x" });

    await gestionarPedido(enviarFormulario({}));
    await gestionarPedido(enviarFormulario({ intencion: "otra" }));

    expect(iniciarPago).toHaveBeenCalledTimes(2);
    expect(informarTransferencia).not.toHaveBeenCalled();
  });
});
