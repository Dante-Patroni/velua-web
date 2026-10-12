import type { Variante } from "@/types";

/**
 * @description Elige la variante que se muestra al abrir la ficha: la primera
 * con stock, para que el botón de compra esté disponible si se puede. Si
 * ninguna tiene stock, la primera.
 * @param variantes Variantes activas del producto.
 * @returns La variante inicial, o undefined si no hay ninguna.
 */
export const varianteInicial = (variantes: Variante[]): Variante | undefined =>
  variantes.find((variante) => variante.hayStock) ?? variantes[0];
