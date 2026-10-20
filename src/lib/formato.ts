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

const FORMATO_FECHA_HORA = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

/** Lo que se muestra si llega una fecha que no se puede leer. */
export const FECHA_NO_DISPONIBLE = "—";

/**
 * @description Formatea un instante de la API (fecha y hora ISO, por ejemplo
 * "2026-10-20T19:30:00.000Z") como "20/10, 16:30" en hora de Argentina. Se usa
 * solo para mostrar un dato que ya viene del servidor, como hasta cuándo se
 * guarda un pedido: no decide nada ni se compara con el reloj del navegador.
 * @param instante Fecha y hora ISO.
 * @returns El día, el mes y la hora, o FECHA_NO_DISPONIBLE si no se puede leer.
 */
export function formatearFechaHora(instante: string | null | undefined): string {
  if (!instante) return FECHA_NO_DISPONIBLE;

  const fecha = new Date(instante);

  return Number.isNaN(fecha.getTime()) ? FECHA_NO_DISPONIBLE : FORMATO_FECHA_HORA.format(fecha);
}
