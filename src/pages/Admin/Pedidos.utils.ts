import { ETIQUETAS_ESTADO_PAGO, ETIQUETAS_ESTADO_PEDIDO } from "@/lib/mappings";
import type { EstadoPago, EstadoPedido, EventoPedido } from "@/types";

const ESTADOS_PAGO = Object.keys(ETIQUETAS_ESTADO_PAGO) as EstadoPago[];
const ESTADOS_PEDIDO = Object.keys(ETIQUETAS_ESTADO_PEDIDO) as EstadoPedido[];

/**
 * @description Indica si un texto es un estado de pago conocido. Usa la lista
 * de claves propias y no `in`: `"constructor" in {}` es true.
 * @param valor Texto a verificar, por ejemplo un parámetro de la URL.
 * @returns True si es un estado de pago.
 */
export const esEstadoPago = (valor: string | null): valor is EstadoPago =>
  ESTADOS_PAGO.includes(valor as EstadoPago);

/**
 * @description Indica si un texto es un estado de preparación conocido.
 * @param valor Texto a verificar.
 * @returns True si es un estado de preparación.
 */
export const esEstadoPedido = (valor: string | null): valor is EstadoPedido =>
  ESTADOS_PEDIDO.includes(valor as EstadoPedido);

/**
 * @description Etiqueta de un estado del historial. Los de pago y preparación
 * usan sus etiquetas; los avisos se muestran como vienen, siempre como texto.
 * @param campo Qué parte del pedido cambió.
 * @param estado Estado anterior o nuevo, o null si no había.
 * @returns La etiqueta para mostrar.
 */
export function etiquetaEstadoEvento(campo: EventoPedido["campo"], estado: string | null): string {
  if (estado === null) return "—";
  if (campo === "pago" && esEstadoPago(estado)) return ETIQUETAS_ESTADO_PAGO[estado];
  if (campo === "preparacion" && esEstadoPedido(estado)) return ETIQUETAS_ESTADO_PEDIDO[estado];
  return estado;
}