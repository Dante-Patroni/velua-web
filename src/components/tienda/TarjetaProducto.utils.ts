import { formatearDiaMes } from "@/lib/fechas";

/**
 * @description Decide si se muestra la oferta: solo si hay precio anterior y es
 * mayor que el actual. Sin esta guarda aparecen ofertas de cero pesos. Los
 * importes se convierten a número solo para comparar, nunca para operar.
 * @param precio Precio actual, como cadena decimal.
 * @param precioAnterior Precio anterior, si existe.
 * @returns true si corresponde mostrar la oferta.
 */
export const hayOferta = (precio: string, precioAnterior?: string | null): boolean => {
  if (!precioAnterior?.trim() || !precio.trim()) return false;

  const actual = Number(precio);
  const anterior = Number(precioAnterior);

  if (!Number.isFinite(actual) || !Number.isFinite(anterior)) return false;

  return anterior > actual;
};

/**
 * @description Mensaje que se precarga en WhatsApp cuando una clienta pide que
 * le avisen al volver el stock. Nombra el producto para que la marca sepa a
 * quién avisar sin preguntar.
 * @param nombre Nombre del producto agotado.
 * @returns El texto del mensaje.
 */
export const mensajeAvisarme = (nombre: string): string =>
  `Hola, quiero que me avisen cuando vuelva a haber ${nombre}.`;

/**
 * @description Etiqueta de un producto que todavía no salió a la venta:
 * "Próximamente · listo el 05/11 (faltan 19 días)". Los días vienen del
 * servidor tal cual: nunca se calculan con el reloj del navegador. Sin fecha
 * válida o sin días (la API manda `diasRestantes: null` cuando la fecha no es
 * válida), muestra solo "Próximamente".
 * @param disponibleDesde Día de lanzamiento, AAAA-MM-DD.
 * @param diasRestantes Días que faltan, según la API.
 * @returns El texto de la etiqueta.
 */
export const etiquetaProximamente = (
  disponibleDesde: string | null | undefined,
  diasRestantes: number | null | undefined,
): string => {
  const fecha = formatearDiaMes(disponibleDesde);

  if (!fecha || diasRestantes == null) return "Próximamente";

  const faltan = diasRestantes === 1 ? "falta 1 día" : `faltan ${diasRestantes} días`;
  return `Próximamente · listo el ${fecha} (${faltan})`;
};

/**
 * @description Mensaje que se precarga en WhatsApp para consultar por un
 * producto que todavía no salió. Nombra el producto y, si la fecha es válida,
 * el día en que sale.
 * @param nombre Nombre del producto.
 * @param disponibleDesde Día de lanzamiento, AAAA-MM-DD.
 * @returns El texto del mensaje.
 */
export const mensajeConsultar = (
  nombre: string,
  disponibleDesde: string | null | undefined,
): string => {
  const fecha = formatearDiaMes(disponibleDesde);

  return fecha
    ? `Hola, quiero consultar por ${nombre}, que sale el ${fecha}.`
    : `Hola, quiero consultar por ${nombre}.`;
};
