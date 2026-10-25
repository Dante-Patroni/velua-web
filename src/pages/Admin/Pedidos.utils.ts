import type { EstadoPago, EstadoPedido, PedidoAdminDetalle, PedidoAdminFila } from "@/types";

/**
 * Etiqueta de cada estado de pago. Es un Record: si la API agrega un estado,
 * TypeScript no compila hasta que se le ponga su etiqueta.
 */
export const ETIQUETAS_ESTADO_PAGO: Record<EstadoPago, string> = {
    pendiente: "Pendiente",
    aprobado: "Pagado",
    rechazado: "Rechazado",
    cancelado: "Cancelado",
    devuelto: "Devuelto",
};

/** Etiqueta de cada estado de preparación. Mismo criterio que los de pago. */
export const ETIQUETAS_ESTADO_PEDIDO: Record<EstadoPedido, string> = {
    nuevo: "Nuevo",
    en_preparacion: "En preparación",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Cancelado",
};

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

/** Etiqueta del medio de pago. */
export const ETIQUETAS_MEDIO_PAGO: Record<PedidoAdminFila["medioPago"], string> = {
  mercadopago: "Mercado Pago",
  transferencia: "Transferencia",
};

/** Etiqueta del método de entrega. */
export const ETIQUETAS_ENTREGA: Record<PedidoAdminFila["metodoEntrega"], string> = {
  envio: "Envío",
  retiro: "Retiro",
};

/** Un evento del historial del pedido. */
type EventoPedido = PedidoAdminDetalle["eventos"][number];

/**
 * Origen de cada evento. Dice desde dónde se hizo el cambio, no quién:
 * el evento trae el id del usuario, no su nombre.
 */
export const ETIQUETAS_ORIGEN: Record<EventoPedido["origen"], string> = {
  checkout: "Checkout",
  webhook: "Mercado Pago",
  job: "Automático",
  panel: "Panel",
  cliente: "Clienta",
};

/** Qué parte del pedido cambió. */
export const ETIQUETAS_CAMPO: Record<EventoPedido["campo"], string> = {
  pago: "Pago",
  preparacion: "Preparación",
  aviso: "Aviso",
};

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