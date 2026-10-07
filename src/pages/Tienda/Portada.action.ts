import type { LoaderFunctionArgs } from "react-router-dom";

import { listarProductosTienda } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { ProductoListado } from "@/types";

/** Destacados de la portada: dos filas de dos en el teléfono, una de cuatro en escritorio. */
export const CANTIDAD_DESTACADOS = 4;

/** Lo que el loader deja disponible para la portada. */
export type DatosPortada = { destacados: ProductoListado[] };

/**
 * @description Loader de la portada. Trae los productos destacados. Si la API
 * falla, devuelve la lista vacía y la sección no se muestra: la portada es la
 * puerta de entrada y no se cae por un bloque.
 * @param args Argumentos del loader de react-router.
 * @returns Los destacados, o ninguno si no se pudieron traer.
 */
export async function cargarPortada({ request }: LoaderFunctionArgs): Promise<DatosPortada> {
  try {
    const { datos } = await listarProductosTienda(
      { destacados: true, limite: CANTIDAD_DESTACADOS },
      request.signal,
    );
    return { destacados: datos };
  } catch (error) {
    if (error instanceof ErrorApi) return { destacados: [] };
    throw error;
  }
}
