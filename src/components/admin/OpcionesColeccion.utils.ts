import type { CategoriaAdmin } from "@/types";

/** Una colección suelta, o un grupo con las colecciones de adentro. */
export type EntradaColeccion =
  | { tipo: "opcion"; categoria: CategoriaAdmin }
  | { tipo: "grupo"; padre: CategoriaAdmin; hijas: CategoriaAdmin[] };

/**
 * Arma las entradas del selector de colección de un producto.
 *
 * Solo las categorías sin hijas pueden tener productos: las que agrupan otras
 * aparecen como título de grupo, no como opción elegible.
 *
 * @param categorias Lista plana del panel, en el orden en que se muestran.
 * @returns Opciones sueltas y grupos, respetando ese orden.
 */
export function entradasColeccion(
  categorias: CategoriaAdmin[],
): EntradaColeccion[] {
  return categorias
    .filter((c) => (c.padreId ?? null) === null)
    .map((c): EntradaColeccion =>
      (c.cantidadHijas ?? 0) > 0
        ? {
            tipo: "grupo",
            padre: c,
            hijas: categorias.filter((h) => h.padreId === c.id),
          }
        : { tipo: "opcion", categoria: c },
    );
}
