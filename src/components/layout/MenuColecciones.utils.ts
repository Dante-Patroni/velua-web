import type { Categoria } from "@/types";

/** Un enlace del menú. */
export type EnlaceMenu = { ruta: string; texto: string };

/** Un ítem del menú: un enlace y, si es una categoría con colecciones, sus hijas. */
export type ItemMenu = EnlaceMenu & { hijas: EnlaceMenu[] };

/**
 * @description Arma los ítems del menú a partir del árbol de categorías de la
 * API, y le suma al final los enlaces fijos. Los nombres y los slugs salen de
 * la API: sumar una categoría o una colección no requiere tocar el código. Una
 * categoría sin hijas queda como enlace directo.
 * @param categorias Categorías de primer nivel, con sus hijas.
 * @param fijos Enlaces que no vienen de la API, como "La marca".
 * @returns Los ítems, en el orden en que los devolvió la API.
 */
export const itemsMenu = (categorias: Categoria[], fijos: readonly EnlaceMenu[]): ItemMenu[] => [
  ...categorias.map((categoria) => ({
    ruta: `/${categoria.slug}`,
    texto: categoria.nombre,
    hijas: (categoria.hijas ?? []).map((hija) => ({ ruta: `/${hija.slug}`, texto: hija.nombre })),
  })),
  ...fijos.map((enlace) => ({ ...enlace, hijas: [] })),
];
