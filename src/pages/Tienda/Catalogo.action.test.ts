import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarProductosTienda } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import { cargarCatalogo } from "@/pages/Tienda/Catalogo.action";
import type { ListadoProductos } from "@/types";

vi.mock("@/lib/api/catalogo.api", () => ({ listarProductosTienda: vi.fn() }));

const listado = { datos: [], meta: { pagina: 1, limite: 12, total: 0 } } as unknown as ListadoProductos;

const argumentos = (consulta = "") =>
  ({
    request: new Request(`http://localhost/catalogo${consulta}`),
    params: {},
    context: {},
  }) as unknown as LoaderFunctionArgs;

describe("cargarCatalogo", () => {
  beforeEach(() => {
    vi.mocked(listarProductosTienda).mockReset().mockResolvedValue(listado);
  });

  it("pide todos los productos, sin filtrar por categoría", async () => {
    await expect(cargarCatalogo(argumentos())).resolves.toBe(listado);

    expect(listarProductosTienda).toHaveBeenCalledWith(
      { pagina: 1, limite: 12 },
      expect.any(AbortSignal),
    );
  });

  it("lee la página de la URL", async () => {
    await cargarCatalogo(argumentos("?pagina=3"));

    expect(listarProductosTienda).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 3 }),
      expect.any(AbortSignal),
    );
  });

  it("una página inválida cae en la primera", async () => {
    await cargarCatalogo(argumentos("?pagina=0"));

    expect(listarProductosTienda).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 1 }),
      expect.any(AbortSignal),
    );
  });

  it("un error de la API sube al error boundary", async () => {
    vi.mocked(listarProductosTienda).mockRejectedValue(new ErrorApi("ERROR_DE_RED", 0));

    await expect(cargarCatalogo(argumentos())).rejects.toBeInstanceOf(ErrorApi);
  });
});
