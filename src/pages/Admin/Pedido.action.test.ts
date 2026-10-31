import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { cambiarPreparacion, cancelarPedido, obtenerPedidoAdmin } from "@/lib/api/pedidosAdmin.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { PedidoAdminDetalle } from "@/types";

import { accionPedido, cargarPedido } from "./Pedido.action";

vi.mock("@/lib/api/pedidosAdmin.api", () => ({
  cambiarPreparacion: vi.fn(),
  cancelarPedido: vi.fn(),
  obtenerPedidoAdmin: vi.fn(),
}));

/** Arma los argumentos del loader con el id de la ruta ya decodificado. */
const argumentos = (id: string) =>
  ({
    request: new Request(`http://localhost/admin/pedidos/${encodeURIComponent(id)}`),
    params: { id },
    context: {},
  }) as unknown as LoaderFunctionArgs;

/** Arma los argumentos de la action: un POST con los campos del formulario. */
const envio = (campos: Record<string, string>, id = "12") => {
  const datos = new FormData();
  for (const [clave, valor] of Object.entries(campos)) datos.append(clave, valor);

  return {
    request: new Request(`http://localhost/admin/pedidos/${encodeURIComponent(id)}`, {
      method: "POST",
      body: datos,
    }),
    params: { id },
    context: {},
  } as unknown as ActionFunctionArgs;
};

describe("cargarPedido", () => {
  beforeEach(() => {
    vi.mocked(obtenerPedidoAdmin).mockReset();
  });

  test("con un id válido pide ese pedido a la API", async () => {
    const pedido = { id: 12, numero: "VEL-4K7Q2X" } as PedidoAdminDetalle;
    vi.mocked(obtenerPedidoAdmin).mockResolvedValue(pedido);

    await expect(cargarPedido(argumentos("12"))).resolves.toEqual({ pedido });
    expect(obtenerPedidoAdmin).toHaveBeenCalledWith(12, expect.any(AbortSignal));
  });

  test("con un id inválido responde no encontrado sin llamar a la API", async () => {
    for (const id of ["../categorias", "1abc", "0", "1e2"]) {
      await expect(cargarPedido(argumentos(id)), id).rejects.toMatchObject({
        codigo: "NO_ENCONTRADO",
        status: 404,
      });
    }
    expect(obtenerPedidoAdmin).not.toHaveBeenCalled();
  });

  test("deja subir el 401 para que el panel vuelva al login", async () => {
    vi.mocked(obtenerPedidoAdmin).mockRejectedValue(new ErrorApi("NO_AUTORIZADO", 401));

    await expect(cargarPedido(argumentos("12"))).rejects.toMatchObject({ status: 401 });
  });
});

describe("accionPedido", () => {
  beforeEach(() => {
    vi.mocked(cambiarPreparacion).mockReset();
    vi.mocked(cancelarPedido).mockReset();
  });

  test.each([
    ["preparar", "en_preparacion"],
    ["enviar", "enviado"],
    ["entregar", "entregado"],
  ])("la intención %s pide el estado %s", async (intencion, estado) => {
    await expect(accionPedido(envio({ intencion }))).resolves.toBeNull();
    expect(cambiarPreparacion).toHaveBeenCalledWith(12, { estado });
  });

  test("al enviar manda el seguimiento sin los espacios de los extremos", async () => {
    await accionPedido(envio({ intencion: "enviar", seguimiento: "  AR123456789  " }));

    expect(cambiarPreparacion).toHaveBeenCalledWith(12, {
      estado: "enviado",
      seguimiento: "AR123456789",
    });
  });

  test("ignora un estado o un seguimiento agregados a mano al formulario", async () => {
    await accionPedido(
      envio({ intencion: "preparar", estado: "entregado", seguimiento: "AR123456789" }),
    );

    expect(cambiarPreparacion).toHaveBeenCalledWith(12, { estado: "en_preparacion" });
  });

  test.each(["", "cancelado", "constructor", "toString"])(
    "una intención desconocida (%j) no llama a la API",
    async (intencion) => {
      await expect(accionPedido(envio({ intencion }))).resolves.toEqual({
        codigo: "DATOS_INVALIDOS",
        intencion,
      });
      expect(cambiarPreparacion).not.toHaveBeenCalled();
      expect(cancelarPedido).not.toHaveBeenCalled();
    },
  );

  test("con un id inválido no llama a la API", async () => {
    for (const id of ["../categorias", "1abc", "0"]) {
      await expect(accionPedido(envio({ intencion: "cancelar" }, id)), id).resolves.toEqual({
        codigo: "NO_ENCONTRADO",
        intencion: "cancelar",
      });
    }
    expect(cancelarPedido).not.toHaveBeenCalled();
  });

  test("cancelar manda confirmaSinPago como booleano verdadero", async () => {
    await accionPedido(
      envio({ intencion: "cancelar", motivo: "Pidió cancelar", confirmaSinPago: "true" }),
    );

    expect(cancelarPedido).toHaveBeenCalledWith(12, {
      motivo: "Pidió cancelar",
      confirmaSinPago: true,
    });
  });

  test.each([
    ["sin el campo", {}],
    ["con otro texto", { confirmaSinPago: "si" }],
  ])("cancelar %s manda confirmaSinPago en false", async (_caso, extra) => {
    await accionPedido(envio({ intencion: "cancelar", motivo: "Pidió cancelar", ...extra }));

    expect(cancelarPedido).toHaveBeenCalledWith(12, {
      motivo: "Pidió cancelar",
      confirmaSinPago: false,
    });
  });

  test("devuelve el código de la API para mostrarlo junto al botón", async () => {
    vi.mocked(cancelarPedido).mockRejectedValue(new ErrorApi("PAGO_EN_CURSO", 409));

    await expect(
      accionPedido(envio({ intencion: "cancelar", motivo: "Pidió cancelar" })),
    ).resolves.toEqual({ codigo: "PAGO_EN_CURSO", details: undefined, intencion: "cancelar" });
  });

  test("un error que no es de la API sube sin tocar", async () => {
    const falla = new TypeError("se rompió algo");
    vi.mocked(cambiarPreparacion).mockRejectedValue(falla);

    await expect(accionPedido(envio({ intencion: "preparar" }))).rejects.toBe(falla);
  });
});
