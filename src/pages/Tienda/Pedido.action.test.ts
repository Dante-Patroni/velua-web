import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { iniciarPago, obtenerPedido } from "@/lib/api/pedidos.api";
import { ErrorApi } from "@/lib/apiFetch";
import { cargarPedido, pagarPedido } from "@/pages/Tienda/Pedido.action";
import type { PedidoPublico } from "@/types";

vi.mock("@/lib/api/pedidos.api", () => ({ obtenerPedido: vi.fn(), iniciarPago: vi.fn() }));

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

    await expect(cargarPedido(cargar())).resolves.toEqual({
      pedido,
      error: null,
      consultadoEn: expect.any(Number),
    });
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

    await expect(cargarPedido(cargar())).resolves.toEqual({
      pedido: null,
      error: codigo,
      consultadoEn: expect.any(Number),
    });
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
