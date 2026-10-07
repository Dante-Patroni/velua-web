const FORMATO_PESOS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

/** Para importes sin centavos: "$ 8.500" se lee mejor que "$ 8.500,00". */
const FORMATO_PESOS_ENTEROS = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Lo que se muestra si llega un importe que no es una cadena decimal válida. */
export const PRECIO_NO_DISPONIBLE = "—";

/**
 * @description Formatea un importe en pesos. Sin decimales cuando los centavos
 * son cero ("$ 8.500"), con dos si no ("$ 8.500,50"). Convierte a número solo
 * para formatear: nunca se opera con importes en el frontend.
 * @param valor Importe como cadena decimal, tal como lo manda la API. Ej: "8500.00".
 * Puede venir null cuando el dato no existe, por ejemplo un producto sin
 * variantes activas no tiene precio mínimo.
 * @returns El importe formateado, ej. "$ 8.500", o PRECIO_NO_DISPONIBLE si es inválido.
 */
export function formatearPrecio(valor: string | null | undefined): string {
  if (valor === null || valor === undefined) return PRECIO_NO_DISPONIBLE;

  const numero = Number(valor);
  // Number("") da 0: una cadena vacía no puede mostrarse como "$ 0".
  if (valor.trim() === "" || !Number.isFinite(numero)) return PRECIO_NO_DISPONIBLE;

  return Number.isInteger(numero) ? FORMATO_PESOS_ENTEROS.format(numero) : FORMATO_PESOS.format(numero);
}
