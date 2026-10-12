import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarCategorias, obtenerProductoTienda } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import { cargarProducto } from "@/pages/Tienda/Producto.action";
import type { Categoria, ProductoDetalle } from "@/types";

vi.mock("@/lib/api/catalogo.api", () => ({
  listarCategorias: vi.fn(),
  obtenerProductoTienda: vi.fn(),
}));

const arbol: Categoria[] = [
  {
    id: 1,
    nombre: "Jabones",
    slug: "jabones",
    hijas: [{ id: 10, nombre: "Essence Botanique", slug: "essence-botanique", padreId: 1 }],
  },
  { id: 2, nombre: "Combos", slug: "combos", hijas: [] },
];

const producto = (slugCategoria: string) =>
  ({ id: 7, nombre: "Calma", slug: "calma", categoria: { id: 10, nombre: "X", slug: slugCategoria } }) as ProductoDetalle;

const argumentos = (slug = "calma") =>
  ({
    request: new Request(`http://localhost/productos/${slug}`),
    params: { slug },
    context: {},
  }) as unknown as LoaderFunctionArgs;

describe("cargarProducto", () => {
  beforeEach(() => {
    vi.mocked(listarCategorias).mockReset().mockResolvedValue({ datos: arbol });
    vi.mocked(obtenerProductoTienda).mockReset().mockResolvedValue(producto("essence-botanique"));
  });

  it("devuelve el producto y el padre de su colección", async () => {
    const datos = await cargarProducto(argumentos());

    expect(datos.producto.slug).toBe("calma");
    expect(datos.padre?.slug).toBe("jabones");
  });

  it("una colección de primer nivel no tiene padre", async () => {
    vi.mocked(obtenerProductoTienda).mockResolvedValue(producto("combos"));

    await expect(cargarProducto(argumentos())).resolves.toMatchObject({ padre: null });
  });

  it("si falla el árbol, la ficha sigue sin padre", async () => {
    vi.mocked(listarCategorias).mockRejectedValue(new ErrorApi("ERROR_DE_RED", 0));

    await expect(cargarProducto(argumentos())).resolves.toMatchObject({ padre: null });
  });

  it("un producto que la API no encuentra responde 404", async () => {
    vi.mocked(obtenerProductoTienda).mockRejectedValue(new ErrorApi("NO_ENCONTRADO", 404));

    const respuesta = await cargarProducto(argumentos("fantasma")).catch((error) => error);

    expect(respuesta).toBeInstanceOf(Response);
    expect(respuesta.status).toBe(404);
  });

  it("otro error de la API sube al error boundary", async () => {
    vi.mocked(obtenerProductoTienda).mockRejectedValue(new ErrorApi("ERROR_DE_RED", 0));

    await expect(cargarProducto(argumentos())).rejects.toBeInstanceOf(ErrorApi);
  });
});
