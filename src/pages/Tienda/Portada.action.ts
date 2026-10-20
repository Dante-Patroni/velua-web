import type { LoaderFunctionArgs } from "react-router-dom";

import { listarProductosTienda, type FiltrosCatalogo } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { ProductoListado } from "@/types";

/** Destacados de la portada: dos filas de dos en el teléfono, una de cuatro en escritorio. */
export const CANTIDAD_DESTACADOS = 4;

/** Lanzamientos que se muestran en la portada. */
export const CANTIDAD_PROXIMOS = 4;

/**
 * Lanzamientos que se piden a la API antes de ordenar por fecha. La API los
 * devuelve por colección, así que los más cercanos pueden no estar entre los
 * primeros. 50 es el máximo que acepta el parámetro `limite`.
 */
const LIMITE_PROXIMOS = 50;

/** Lo que el loader deja disponible para la portada. */
export type DatosPortada = { destacados: ProductoListado[]; proximos: ProductoListado[] };

/**
 * @description Ordena los lanzamientos del más cercano al más lejano. Compara
 * `disponibleDesde` como texto: AAAA-MM-DD se ordena bien así, sin convertirlo
 * a Date. Los que no tienen fecha van al final y el orden de la API se
 * conserva entre iguales.
 * @param productos Productos próximamente, como los devuelve la API.
 * @returns Una lista nueva, ordenada por fecha de lanzamiento.
 */
export const ordenarPorLanzamiento = (productos: ProductoListado[]): ProductoListado[] =>
  [...productos].sort((a, b) => {
    if (a.disponibleDesde === b.disponibleDesde) return 0;
    if (!a.disponibleDesde) return 1;
    if (!b.disponibleDesde) return -1;
    return a.disponibleDesde < b.disponibleDesde ? -1 : 1;
  });

/**
 * @description Pide productos a la API y, si falla, devuelve una lista vacía.
 * Una navegación cancelada u otro error inesperado sí se propaga.
 * @param filtros Filtros del listado.
 * @param signal Señal para cancelar la petición.
 * @returns Los productos, o ninguno si la API falló.
 */
const traerOVacio = async (
  filtros: FiltrosCatalogo,
  signal: AbortSignal,
): Promise<ProductoListado[]> => {
  try {
    const { datos } = await listarProductosTienda(filtros, signal);
    return datos;
  } catch (error) {
    if (error instanceof ErrorApi) return [];
    throw error;
  }
};

/**
 * @description Loader de la portada. Trae los destacados y los próximos
 * lanzamientos, cada uno por separado. Si la API falla en uno, devuelve la
 * lista vacía y esa sección no se muestra: la portada es la puerta de entrada
 * y no se cae por un bloque.
 * @param args Argumentos del loader de react-router.
 * @returns Los destacados y los lanzamientos, o listas vacías si no se pudieron traer.
 */
export async function cargarPortada({ request }: LoaderFunctionArgs): Promise<DatosPortada> {
  const [destacados, proximos] = await Promise.all([
    traerOVacio({ destacados: true, limite: CANTIDAD_DESTACADOS }, request.signal),
    traerOVacio({ proximamente: true, limite: LIMITE_PROXIMOS }, request.signal),
  ]);

  return { destacados, proximos: ordenarPorLanzamiento(proximos).slice(0, CANTIDAD_PROXIMOS) };
}
