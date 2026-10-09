import type { Categoria } from "@/types";

/** Un tramo de la miga de pan. El último no lleva ruta: es la página actual. */
export type TramoMiga = { texto: string; ruta?: string };

/** Lo que devuelve la búsqueda: la categoría y, si es hija, su padre. */
export type ResultadoBusqueda = { categoria: Categoria; padre: Categoria | null };

/** Productos por página en la grilla de una colección. */
export const PRODUCTOS_POR_PAGINA = 12;

/**
 * @description Busca un slug en el árbol de categorías, en los dos niveles. Los
 * slugs son únicos en toda la tabla, así que la primera coincidencia es la única.
 * @param arbol Categorías de primer nivel, con sus hijas.
 * @param slug Slug de la URL.
 * @returns La categoría y su padre (null si es de primer nivel), o null si el
 * slug no existe o está despublicado y la API no lo devuelve.
 */
export const buscarEnArbol = (arbol: Categoria[], slug: string): ResultadoBusqueda | null => {
  for (const raiz of arbol) {
    if (raiz.slug === slug) return { categoria: raiz, padre: null };

    const hija = raiz.hijas?.find((candidata) => candidata.slug === slug);
    if (hija) return { categoria: hija, padre: raiz };
  }

  return null;
};

/**
 * @description Arma la miga de pan: Inicio, el padre si lo hay y la categoría
 * actual. Las URLs son planas, así que el padre enlaza a `/<slug>`.
 * @param categoria Categoría que se está mirando.
 * @param padre Su categoría padre, o null si es de primer nivel.
 * @returns Los tramos en orden.
 */
export const tramosMiga = (categoria: Categoria, padre: Categoria | null): TramoMiga[] => [
  { texto: "Inicio", ruta: "/" },
  ...(padre ? [{ texto: padre.nombre, ruta: `/${padre.slug}` }] : []),
  { texto: categoria.nombre },
];

/**
 * @description Lee el número de página de la URL. Cualquier valor que no sea un
 * entero positivo cae en la primera página.
 * @param valor Valor de `?pagina=`, o null si no vino.
 * @returns El número de página, desde 1.
 */
export const paginaDesdeUrl = (valor: string | null): number => {
  const pagina = Number(valor);
  return Number.isInteger(pagina) && pagina >= 1 ? pagina : 1;
};

/**
 * @description Cuenta las páginas a partir de la meta de la API. Son cuentas
 * sobre cantidades de elementos, no sobre importes.
 * @param total Total de productos que cumplen el filtro.
 * @param limite Productos por página.
 * @returns La cantidad de páginas, al menos una.
 */
export const totalPaginas = (total: number, limite: number): number =>
  limite > 0 ? Math.max(1, Math.ceil(total / limite)) : 1;
