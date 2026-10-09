import type { LoaderFunctionArgs } from "react-router-dom";

import { listarCategorias, listarProductosTienda } from "@/lib/api/catalogo.api";
import type { Categoria, Meta, ProductoListado } from "@/types";
import { buscarEnArbol, paginaDesdeUrl, PRODUCTOS_POR_PAGINA } from "./Categoria.utils";

/** Lo que el loader deja disponible para la página de colección. */
export type DatosCategoria =
  | { tipo: "hijas"; categoria: Categoria; padre: Categoria | null; hijas: Categoria[] }
  | {
      tipo: "productos";
      categoria: Categoria;
      padre: Categoria | null;
      productos: ProductoListado[];
      meta: Meta;
    };

/**
 * @description Loader de `/:categoria`. Busca el slug en el árbol de categorías
 * y resuelve uno de dos casos: una categoría con hijas muestra sus colecciones;
 * una colección muestra sus productos, paginados. Un slug que la API no devuelve
 * (inexistente o despublicado) responde 404. El árbol se pide acá y no se toma
 * del layout, para que una colección despublicada deje de verse en la próxima
 * visita sin recargar. Los errores de la API suben al error boundary.
 * @param args Argumentos del loader de react-router.
 * @returns Los datos del caso que corresponda.
 * @throws Response 404 si el slug no existe.
 */
export async function cargarCategoria({
  request,
  params,
}: LoaderFunctionArgs): Promise<DatosCategoria> {
  const slug = params.categoria ?? "";
  const pagina = paginaDesdeUrl(new URL(request.url).searchParams.get("pagina"));

  const { datos: arbol } = await listarCategorias(request.signal);
  const encontrada = buscarEnArbol(arbol, slug);

  if (!encontrada) {
    throw new Response(null, { status: 404, statusText: "Not Found" });
  }

  const { categoria, padre } = encontrada;

  if (categoria.hijas && categoria.hijas.length > 0) {
    return { tipo: "hijas", categoria, padre, hijas: categoria.hijas };
  }

  const { datos, meta } = await listarProductosTienda(
    { categoria: categoria.slug, pagina, limite: PRODUCTOS_POR_PAGINA },
    request.signal,
  );

  return { tipo: "productos", categoria, padre, productos: datos, meta };
}
