import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarCategorias, listarProductosTienda } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import { cargarCategoria } from "@/pages/Tienda/Categoria.action";
import type { Categoria, ListadoProductos } from "@/types";

vi.mock("@/lib/api/catalogo.api", () => ({
  listarCategorias: vi.fn(),
  listarProductosTienda: vi.fn(),
}));

const arbol: Categoria[] = [
  {
    id: 1,
    nombre: "Jabones",
    slug: "jabones",
    hijas: [{ id: 10, nombre: "Essence Botanique", slug: "essence-botanique", padreId: 1 }],
  },
  { id: 2, nombre: "Aceites", slug: "aceites", hijas: [] },
];

const listado = (total: number) =>
  ({ datos: [], meta: { pagina: 1, limite: 12, total } }) as unknown as ListadoProductos;

const argumentos = (slug: string, consulta = "") =>
  ({
    request: new Request(`http://localhost/${slug}${consulta}`),
    params: { categoria: slug },
    context: {},
  }) as unknown as LoaderFunctionArgs;

describe("cargarCategoria", () => {
  beforeEach(() => {
    vi.mocked(listarCategorias).mockReset().mockResolvedValue({ datos: arbol });
    vi.mocked(listarProductosTienda).mockReset().mockResolvedValue(listado(0));
  });

  it("una categoría con hijas devuelve sus colecciones y no pide productos", async () => {
    const datos = await cargarCategoria(argumentos("jabones"));

    expect(datos).toMatchObject({ tipo: "hijas", padre: null });
    expect(datos.tipo === "hijas" && datos.hijas).toHaveLength(1);
    expect(listarProductosTienda).not.toHaveBeenCalled();
  });

  it("una colección pide sus productos con la página de la URL", async () => {
    await cargarCategoria(argumentos("aceites", "?pagina=2"));

    expect(listarProductosTienda).toHaveBeenCalledWith(
      { categoria: "aceites", pagina: 2, limite: 12 },
      expect.any(AbortSignal),
    );
  });

  it("una colección hija trae su padre para la miga de pan", async () => {
    const datos = await cargarCategoria(argumentos("essence-botanique"));

    expect(datos).toMatchObject({ tipo: "productos", padre: { slug: "jabones" } });
  });

  it("una página inválida cae en la primera", async () => {
    await cargarCategoria(argumentos("aceites", "?pagina=abc"));

    expect(listarProductosTienda).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 1 }),
      expect.any(AbortSignal),
    );
  });

  it("un slug que la API no devuelve responde 404", async () => {
    const respuesta = await cargarCategoria(argumentos("despublicada")).catch((error) => error);

    expect(respuesta).toBeInstanceOf(Response);
    expect(respuesta.status).toBe(404);
    expect(listarProductosTienda).not.toHaveBeenCalled();
  });

  it("un error de la API sube al error boundary", async () => {
    vi.mocked(listarCategorias).mockRejectedValue(new ErrorApi("ERROR_DE_RED", 0));

    await expect(cargarCategoria(argumentos("jabones"))).rejects.toBeInstanceOf(ErrorApi);
  });
});
