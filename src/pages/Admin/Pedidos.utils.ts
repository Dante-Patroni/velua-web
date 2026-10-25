import type { EstadoPago, EstadoPedido } from "@/types";

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