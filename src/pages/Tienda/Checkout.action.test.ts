import type { ActionFunctionArgs } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { crearPedido } from "@/lib/api/pedidos.api";
import { ErrorApi } from "@/lib/apiFetch";
import { enviarPedido, leerPedido } from "@/pages/Tienda/Checkout.action";
import type { PedidoCreado } from "@/types";

vi.mock("@/lib/api/pedidos.api", () => ({ crearPedido: vi.fn(), listarZonasEnvio: vi.fn() }));

const formulario = (campos: Record<string, string>) => {
  const datos = new FormData();
  for (const [clave, valor] of Object.entries(campos)) datos.set(clave, valor);
  return datos;
};

const retiro = {
  items: JSON.stringify([{ varianteId: 9, cantidad: 2 }]),
  totalEsperado: "17000.00",
  medioPago: "mercadopago",
  metodo: "retiro",
  nombre: "  Lucía Fernández ",
  email: "lucia@example.com",
  telefono: "358 412-3344",
  documento: "",
};

const envio = {
  ...retiro,
  metodo: "envio",
  zonaEnvioId: "2",
  calle: "San Martín",
  numero: "123",
  extra: "",
  ciudad: "Río Cuarto",
  provincia: "Córdoba",
  cp: "5800",
};

describe("leerPedido", () => {
  it("arma un pedido de retiro, sin zona ni dirección", () => {
    expect(leerPedido(formulario(retiro))).toEqual({
      items: [{ varianteId: 9, cantidad: 2 }],
      cliente: {
        nombre: "Lucía Fernández",
        email: "lucia@example.com",
        telefono: "358 412-3344",
        documento: null,
      },
      entrega: { metodo: "retiro" },
      medioPago: "mercadopago",
      totalEsperado: "17000.00",
    });
  });

  it("arma un pedido con envío: zona numérica y dirección, con el extra vacío como null", () => {
    const pedido = leerPedido(formulario(envio));

    expect(pedido?.entrega).toEqual({
      metodo: "envio",
      zonaEnvioId: 2,
      direccion: {
        calle: "San Martín",
        numero: "123",
        extra: null,
        ciudad: "Río Cuarto",
        provincia: "Córdoba",
        cp: "5800",
      },
    });
  });

  it("manda el total esperado como texto, sin convertirlo a número", () => {
    expect(leerPedido(formulario(retiro))?.totalEsperado).toBe("17000.00");
  });

  it("sanea el carrito: descarta precios y líneas inválidas", () => {
    const sucio = JSON.stringify([
      { varianteId: 9, cantidad: 2, precio: "1.00" },
      { varianteId: -1, cantidad: 1 },
    ]);

    expect(leerPedido(formulario({ ...retiro, items: sucio }))?.items).toEqual([
      { varianteId: 9, cantidad: 2 },
    ]);
  });

  it.each([
    ["sin carrito", { items: "[]" }],
    ["carrito roto", { items: "no es json" }],
    ["total con formato raro", { totalEsperado: "17,000" }],
    ["total vacío", { totalEsperado: "" }],
    ["medio de pago distinto de Mercado Pago", { medioPago: "transferencia" }],
    ["método de entrega desconocido", { metodo: "drone" }],
    ["envío sin zona", { ...envio, zonaEnvioId: "" }],
    ["envío con zona inválida", { ...envio, zonaEnvioId: "-3" }],
  ])("devuelve null: %s", (_nombre, cambio) => {
    expect(leerPedido(formulario({ ...retiro, ...cambio }))).toBeNull();
  });
});

describe("enviarPedido", () => {
  const argumentos = (campos: Record<string, string>) =>
    ({
      request: new Request("http://localhost/checkout", { method: "POST", body: formulario(campos) }),
      params: {},
      context: {},
    }) as unknown as ActionFunctionArgs;

  beforeEach(() => {
    vi.mocked(crearPedido).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("con link de Mercado Pago, manda a pagar", async () => {
    vi.mocked(crearPedido).mockResolvedValue({
      numero: "VEL-4K7Q2X",
      urlPago: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1",
    } as PedidoCreado);

    await expect(enviarPedido(argumentos(retiro))).resolves.toEqual({
      ok: true,
      numero: "VEL-4K7Q2X",
      destino: { tipo: "externo", url: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1" },
    });
  });

  it("si Mercado Pago no respondió (urlPago null), va a la página del pedido", async () => {
    vi.mocked(crearPedido).mockResolvedValue({ numero: "VEL-4K7Q2X", urlPago: null } as PedidoCreado);

    await expect(enviarPedido(argumentos(retiro))).resolves.toEqual({
      ok: true,
      numero: "VEL-4K7Q2X",
      destino: { tipo: "interno", ruta: "/pedido/VEL-4K7Q2X" },
    });
  });

  it("devuelve el código de la API y los errores por campo, sin mensajes", async () => {
    vi.mocked(crearPedido).mockRejectedValue(
      new ErrorApi("DATOS_INVALIDOS", 400, { "cliente.email": "Email inválido" }),
    );

    await expect(enviarPedido(argumentos(retiro))).resolves.toEqual({
      ok: false,
      codigo: "DATOS_INVALIDOS",
      details: { "cliente.email": "Email inválido" },
    });
  });

  it.each(["CARRITO_DESACTUALIZADO", "TOTAL_CAMBIO", "STOCK_INSUFICIENTE"])(
    "%s vuelve como código para que la página vuelva a cotizar",
    async (codigo) => {
      vi.mocked(crearPedido).mockRejectedValue(new ErrorApi(codigo, 409));

      await expect(enviarPedido(argumentos(retiro))).resolves.toMatchObject({ ok: false, codigo });
    },
  );

  it("un formulario mal formado no llega a la API", async () => {
    await expect(enviarPedido(argumentos({ ...retiro, items: "[]" }))).resolves.toEqual({
      ok: false,
      codigo: "DATOS_INVALIDOS",
    });
    expect(crearPedido).not.toHaveBeenCalled();
  });

  it("un error que no es de la API no se pierde ni se muestra crudo", async () => {
    vi.mocked(crearPedido).mockRejectedValue(new Error("boom con datos de Lucía"));

    await expect(enviarPedido(argumentos(retiro))).resolves.toEqual({
      ok: false,
      codigo: "ERROR_DESCONOCIDO",
    });
  });

  it("no escribe los datos personales en la consola, ni al fallar", async () => {
    const consola = [
      vi.spyOn(console, "log").mockImplementation(() => {}),
      vi.spyOn(console, "error").mockImplementation(() => {}),
      vi.spyOn(console, "warn").mockImplementation(() => {}),
      vi.spyOn(console, "info").mockImplementation(() => {}),
      vi.spyOn(console, "debug").mockImplementation(() => {}),
    ];
    vi.mocked(crearPedido)
      .mockResolvedValueOnce({ numero: "VEL-1", urlPago: null } as PedidoCreado)
      .mockRejectedValueOnce(new ErrorApi("ERROR_INTERNO", 500))
      .mockRejectedValueOnce(new Error("falla"));

    await enviarPedido(argumentos(retiro));
    await enviarPedido(argumentos(retiro));
    await enviarPedido(argumentos(retiro));

    for (const espia of consola) expect(espia).not.toHaveBeenCalled();
  });
});
