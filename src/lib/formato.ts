const FORMATO_PESOS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

/** Lo que se muestra si llega un importe que no es una cadena decimal válida. */
export const PRECIO_NO_DISPONIBLE = "—";

/**
 * @description Formatea un importe en pesos. Convierte a número solo para
 * formatear: nunca se opera con importes en el frontend.
 * @param valor Importe como cadena decimal, tal como lo manda la API. Ej: "8500.00".
 * Puede venir null cuando el dato no existe, por ejemplo un producto sin
 * variantes activas no tiene precio mínimo.
 * @returns El importe formateado, ej. "$ 8.500,00", o PRECIO_NO_DISPONIBLE si es inválido.
 */
export function formatearPrecio(valor: string | null | undefined): string {
  if (valor === null || valor === undefined) return PRECIO_NO_DISPONIBLE;

  const numero = Number(valor);
  if (valor.trim() === "" || !Number.isFinite(numero)) return PRECIO_NO_DISPONIBLE;
  // Number("") da 0: una cadena vacía no puede mostrarse como "$ 0,00".
  if (valor.trim() === "" || !Number.isFinite(numero)) return PRECIO_NO_DISPONIBLE;

  return FORMATO_PESOS.format(numero);
};
