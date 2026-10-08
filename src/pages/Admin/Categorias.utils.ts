import type { CategoriaAdmin } from "@/types";

/** Una fila de la lista del panel: la categoría y en qué nivel del árbol está. */
export type FilaArbol = { categoria: CategoriaAdmin; nivel: 0 | 1 };

/**
 * @description Ordena las categorías como se ven en el menú: cada una de primer
 * nivel, seguida de sus hijas. Dentro de cada nivel manda el campo `orden`.
 *
 * Si una hija apunta a un padre que no vino en la lista, se la muestra arriba
 * para que no desaparezca del panel.
 *
 * @param categorias Categorías tal como las devuelve la API, en cualquier orden.
 * @returns Las filas en el orden del árbol.
 */
export function aplanarArbol(categorias: CategoriaAdmin[]): FilaArbol[] {
  const porOrden = [...categorias].sort(
    (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)
  );
  const ids = new Set(porOrden.map((c) => c.id));
  const raices = porOrden.filter((c) => !c.padreId || !ids.has(c.padreId));

  return raices.flatMap((padre) => [
    { categoria: padre, nivel: 0 as const },
    ...porOrden
      .filter((c) => c.padreId === padre.id)
      .map((hija) => ({ categoria: hija, nivel: 1 as const })),
  ]);
}

/**
 * @description Calcula el orden completo del menú después de mover una
 * categoría un lugar arriba o abajo entre sus hermanas.
 *
 * La API pide la lista de TODAS las categorías: se arma recorriendo el árbol,
 * cada padre seguido de sus hijas, con el cambio aplicado.
 *
 * @param filas Filas en el orden actual del árbol.
 * @param id Id de la categoría que se mueve.
 * @param direccion -1 para subir, 1 para bajar.
 * @returns Los ids de todas las categorías en el orden nuevo, o null si no se
 *   puede mover (ya es la primera o la última de sus hermanas).
 */
export function ordenTrasMover(
  filas: FilaArbol[],
  id: number,
  direccion: -1 | 1
): number[] | null {
  const actual = filas.find((f) => f.categoria.id === id);
  if (!actual) return null;

  const padreDe = (f: FilaArbol) => (f.nivel === 0 ? null : f.categoria.padreId);
  const padre = padreDe(actual);
  const hermanas = filas.filter((f) => padreDe(f) === padre).map((f) => f.categoria.id);

  const i = hermanas.indexOf(id);
  const j = i + direccion;
  if (j < 0 || j >= hermanas.length) return null;
  [hermanas[i], hermanas[j]] = [hermanas[j], hermanas[i]];

  let raices = filas.filter((f) => f.nivel === 0).map((f) => f.categoria.id);
  const hijasDe = new Map<number, number[]>();
  for (const f of filas) {
    if (f.nivel === 1 && f.categoria.padreId) {
      hijasDe.set(f.categoria.padreId, [...(hijasDe.get(f.categoria.padreId) ?? []), f.categoria.id]);
    }
  }

  if (padre === null) raices = hermanas;
  else hijasDe.set(padre, hermanas);

  return raices.flatMap((r) => [r, ...(hijasDe.get(r) ?? [])]);
}

/** Una opción del selector "Dentro de". */
export type OpcionPadre = { id: number; nombre: string; disponible: boolean };

/**
 * @description Categorías que pueden ser padre de otra: las de primer nivel,
 * menos ella misma. Las que tienen productos se muestran deshabilitadas, para
 * que se entienda por qué no se pueden elegir.
 *
 * El backend vuelve a validar todo: esto es solo para no ofrecer opciones que
 * van a fallar.
 *
 * @param categorias Todas las categorías.
 * @param propia La categoría que se edita, o null si se está creando una.
 * @returns Las opciones del selector.
 */
export function posiblesPadres(
  categorias: CategoriaAdmin[],
  propia: CategoriaAdmin | null
): OpcionPadre[] {
  return [...categorias]
    .filter((c) => !c.padreId && c.id !== propia?.id)
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
    .map((c) => ({ id: c.id, nombre: c.nombre, disponible: c.cantidadProductos === 0 }));
}
