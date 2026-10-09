import type { LoaderFunctionArgs } from "react-router-dom";

import { listarProductosTienda } from "@/lib/api/catalogo.api";
import type { ListadoProductos } from "@/types";
import { paginaDesdeUrl, PRODUCTOS_POR_PAGINA } from "./Categoria.utils";

/**
 * @description Loader de `/catalogo`. Trae una página de todos los productos
 * publicados, sin filtrar por categoría. Un error de la API sube al error
 * boundary de la tienda.
 * @param args Argumentos del loader de react-router.
 * @returns Los productos de la página pedida y la meta de paginación.
 */
export async function cargarCatalogo({ request }: LoaderFunctionArgs): Promise<ListadoProductos> {
  const pagina = paginaDesdeUrl(new URL(request.url).searchParams.get("pagina"));

  return listarProductosTienda({ pagina, limite: PRODUCTOS_POR_PAGINA }, request.signal);
}
