import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarProductosTienda } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import { CANTIDAD_DESTACADOS, cargarPortada } from "@/pages/Tienda/Portada.action";
import type { ListadoProductos } from "@/types";

vi.mock("@/lib/api/catalogo.api", () => ({ listarProductosTienda: vi.fn() }));

const argumentos = () =>
  ({ request: new Request("http://localhost/"), params: {}, context: {} }) as LoaderFunctionArgs;

describe("cargarPortada", () => {
  beforeEach(() => {
    vi.mocked(listarProductosTienda).mockReset();
  });

  it("pide solo los destacados, con el límite de la portada", async () => {
    const listado = { datos: [], meta: { pagina: 1, limite: 4, total: 0 } } as unknown as ListadoProductos;
    vi.mocked(listarProductosTienda).mockResolvedValue(listado);

    await cargarPortada(argumentos());

    expect(listarProductosTienda).toHaveBeenCalledWith(
      { destacados: true, limite: CANTIDAD_DESTACADOS },
      expect.any(AbortSignal),
    );
  });

  it("si la API falla, la portada sigue sin destacados", async () => {
    vi.mocked(listarProductosTienda).mockRejectedValue(new ErrorApi("ERROR_DE_RED", 0));

    await expect(cargarPortada(argumentos())).resolves.toEqual({ destacados: [] });
  });

  it("deja pasar una navegación cancelada", async () => {
    const cancelada = new DOMException("cancelada", "AbortError");
    vi.mocked(listarProductosTienda).mockRejectedValue(cancelada);

    await expect(cargarPortada(argumentos())).rejects.toBe(cancelada);
  });
});
