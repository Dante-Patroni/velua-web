/**
 * Fecha sin hora, tal como la manda la API. Acota el mes (01 a 12) y el día
 * (01 a 31) para no mostrar "45/13"; que el día exista en ese mes lo valida
 * la API.
 */
const FECHA_DIA = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * @description Muestra una fecha "AAAA-MM-DD" como "DD/MM", partiendo el texto.
 * No la convierte a Date: new Date("2026-11-05") es medianoche UTC, que en
 * Argentina es el día anterior, y mostraría un día menos.
 * @param fecha Fecha en formato AAAA-MM-DD.
 * @returns El día y el mes, o null si el texto no es una fecha AAAA-MM-DD.
 */
export function formatearDiaMes(
  fecha: string | null | undefined,
): string | null {
  const partes = fecha ? FECHA_DIA.exec(fecha) : null;
  return partes ? `${partes[3]}/${partes[2]}` : null;
}
