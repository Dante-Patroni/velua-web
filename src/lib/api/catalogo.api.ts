import { apiFetch } from "@/lib/apiFetch";
import type { Categoria } from "@/types";

/** Respuesta de GET /categorias. */
type ListaCategorias = { datos: Categoria[] };

/**
 * @description Lista las colecciones activas, ya ordenadas por el backend. Se
 * usan para el menú y el pie de la tienda.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns Las categorías activas.
 */
export const listarCategorias = (signal?: AbortSignal) =>
  apiFetch<ListaCategorias>("/categorias", { signal });
