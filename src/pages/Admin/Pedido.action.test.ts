import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { obtenerPedidoAdmin } from "@/lib/api/pedidosAdmin.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { PedidoAdminDetalle } from "@/types";

import { cargarPedido } from "./Pedido.action";

vi.mock("@/lib/api/pedidosAdmin.api", () => ({ obtenerPedidoAdmin: vi.fn() }));

/** Arma los argumentos del loader con el id de la ruta ya decodificado. */
const argumentos = (id: string) =>
  ({
    request: new Request(`http://localhost/admin/pedidos/${encodeURIComponent(id)}`),
    params: { id },
    context: {},
  }) as unknown as LoaderFunctionArgs;

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