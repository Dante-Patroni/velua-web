import type { LoaderFunctionArgs, ShouldRevalidateFunction } from "react-router-dom";

import { listarCategorias } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { Categoria } from "@/types";

/** Lo que el loader deja disponible para el layout. */
export type DatosTiendaLayout = { categorias: Categoria[] };

/**
 * @description Loader del layout de la tienda. Trae las colecciones para el
 * menú y el pie. Si la API falla, devuelve una lista vacía en vez de lanzar:
 * sin menú la tienda sigue sirviendo, y un error acá tiraría abajo todas las
 * páginas, incluida la del pedido de una clienta que ya pagó.
 * @param args Argumentos del loader de react-router.
 * @returns Las categorías activas, o ninguna si no se pudieron traer.
 */
export async function cargarTiendaLayout({
  request,
}: LoaderFunctionArgs): Promise<DatosTiendaLayout> {
  try {
    const { datos } = await listarCategorias(request.signal);
    return { categorias: datos };
  } catch (error) {
    if (error instanceof ErrorApi) return { categorias: [] };
    throw error;
  }
}

/**
 * @description Evita volver a pedir las categorías en cada navegación. Por
 * defecto react-router recarga los loaders padres cuando cambia la consulta de
 * la URL, y la tienda la cambia seguido: página, orden, búsqueda.
 * @returns false: el menú se carga una vez por visita.
 */
export const revalidarTiendaLayout: ShouldRevalidateFunction = () => false;
