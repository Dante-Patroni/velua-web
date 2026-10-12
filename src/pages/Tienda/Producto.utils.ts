import type { Categoria, ProductoDetalle } from "@/types";
import { tramosMiga, type TramoMiga } from "./Categoria.utils";

/** Largo máximo de la descripción para buscadores y vistas previas. */
const LARGO_DESCRIPCION_META = 160;

/**
 * @description Arma la descripción para los metadatos de la página: la corta si
 * existe y, si no, el principio de la larga, recortado sin cortar a mitad de
 * palabra.
 * @param producto El producto.
 * @returns El texto, o null si el producto no tiene ninguna descripción.
 */
export const descripcionMeta = (
  producto: Pick<ProductoDetalle, "descripcionCorta" | "descripcion">,
): string | null => {
  const corta = producto.descripcionCorta?.trim();
  if (corta) return corta;

  const larga = producto.descripcion?.replace(/\s+/g, " ").trim();
  if (!larga) return null;
  if (larga.length <= LARGO_DESCRIPCION_META) return larga;

  const recorte = larga.slice(0, LARGO_DESCRIPCION_META);
  const ultimoEspacio = recorte.lastIndexOf(" ");
  return `${(ultimoEspacio > 0 ? recorte.slice(0, ultimoEspacio) : recorte).trimEnd()}…`;
};

/**
 * @description Arma la miga de pan de la ficha: Inicio, el padre de la colección
 * si lo hay, la colección (ahora con enlace) y el producto.
 * @param producto El producto, con su colección.
 * @param padre Padre de la colección, o null si es de primer nivel.
 * @returns Los tramos en orden.
 */
export const tramosMigaProducto = (
  producto: Pick<ProductoDetalle, "nombre" | "categoria">,
  padre: Categoria | null,
): TramoMiga[] => {
  const { categoria } = producto;

  return [
    ...tramosMiga(categoria, padre).slice(0, -1),
    { texto: categoria.nombre, ruta: `/${categoria.slug}` },
    { texto: producto.nombre },
  ];
};
