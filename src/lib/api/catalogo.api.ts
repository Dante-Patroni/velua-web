import { apiFetch } from "@/lib/apiFetch";
import type { Categoria, ListadoProductos } from "@/types";

/** Respuesta de GET /categorias. */
type ListaCategorias = { datos: Categoria[] };

/** Filtros del listado público de productos. */
export type FiltrosCatalogo = {
  pagina?: number;
  limite?: number;
  categoria?: string;
  destacados?: boolean;
  q?: string;
  orden?: "defecto" | "precio_asc" | "precio_desc";
};

/**
 * @description Arma la cadena de consulta descartando los valores vacíos.
 * @param filtros Filtros a enviar.
 * @returns La cadena de consulta, con `?` adelante, o vacía si no hay filtros.
 */
const aConsulta = (filtros: FiltrosCatalogo): string => {
  const parametros = new URLSearchParams();

  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      parametros.set(clave, String(valor));
    }
  }

  const cadena = parametros.toString();
  return cadena ? `?${cadena}` : "";
};

/**
 * @description Lista las colecciones activas, ya ordenadas por el backend. Se
 * usan para el menú y el pie de la tienda.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns Las categorías activas.
 */
export const listarCategorias = (signal?: AbortSignal) =>
  apiFetch<ListaCategorias>("/categorias", { signal });

/**
 * @description Lista los productos publicados para la grilla de la tienda.
 * Paginado y liviano: solo la imagen principal y el precio mínimo.
 * @param filtros Filtros, orden y paginación.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns Los productos de la página pedida y el total.
 */
export const listarProductosTienda = (filtros: FiltrosCatalogo = {}, signal?: AbortSignal) =>
  apiFetch<ListadoProductos>(`/productos${aConsulta(filtros)}`, { signal });
