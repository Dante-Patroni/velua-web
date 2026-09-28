import { apiFetch } from "@/lib/apiFetch";
import type { CategoriaAdmin, ListadoProductosAdmin, ProductoAdmin } from "@/types";

/** Filtros del listado de productos del panel. */
export type FiltrosProductos = {
  pagina?: number;
  limite?: number;
  q?: string;
  categoriaId?: number;
  estado?: "todos" | "activos" | "inactivos";
  orden?: "recientes" | "nombre" | "stock";
};

/**
 * @description Arma la cadena de consulta descartando los valores vacíos, para
 * que la URL no se llene de parámetros sin valor.
 * @param filtros Filtros a enviar.
 * @returns La cadena de consulta, con `?` adelante, o vacía si no hay filtros.
 */
const aConsulta = (filtros: FiltrosProductos): string => {
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
 * @description Lista los productos del panel, incluidos los despublicados.
 * El backend pagina y filtra: acá no se filtra nada sobre el resultado.
 * @param filtros Filtros y paginación.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns Los productos de la página pedida y el total del catálogo filtrado.
 * @throws {ErrorApi} Con status 401 si no hay sesión.
 */
export const listarProductos = (filtros: FiltrosProductos = {}, signal?: AbortSignal) =>
  apiFetch<ListadoProductosAdmin>(`/admin/productos${aConsulta(filtros)}`, { signal });

/**
 * @description Obtiene la ficha completa de un producto, con todas sus variantes
 * e imágenes.
 * @param id Id del producto.
 * @param signal Señal para cancelar la petición.
 * @returns El producto con sus variantes e imágenes.
 * @throws {ErrorApi} NO_ENCONTRADO si no existe.
 */
export const obtenerProducto = (id: number | string, signal?: AbortSignal) =>
  apiFetch<ProductoAdmin>(`/admin/productos/${id}`, { signal });

/**
 * @description Publica o despublica un producto.
 * @param id Id del producto.
 * @param activo Estado nuevo.
 * @returns El producto con su estado nuevo.
 * @throws {ErrorApi} NO_ENCONTRADO si no existe.
 */
export const cambiarEstadoProducto = (id: number, activo: boolean) =>
  apiFetch<ProductoAdmin>(`/admin/productos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });

/**
 * @description Lista las categorías del panel, con la cantidad de productos
 * activos de cada una.
 * @param signal Señal para cancelar la petición.
 * @returns Las categorías, activas e inactivas.
 * @throws {ErrorApi} Con status 401 si no hay sesión.
 */
export const listarCategoriasAdmin = (signal?: AbortSignal) =>
  apiFetch<{ datos: CategoriaAdmin[] }>("/admin/categorias", { signal });
