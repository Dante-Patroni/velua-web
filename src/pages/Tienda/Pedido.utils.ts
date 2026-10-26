import type { EstadoPago, PedidoPublico } from "@/types";

/** Cada cuánto se vuelve a preguntar por el pago. La consulta tiene tope por hora, así que no se apura. */
export const INTERVALO_CONSULTA_PEDIDO_MS = 8000;

/** Cuántas veces se vuelve a preguntar antes de dejar de hacerlo solo. */
export const MAX_CONSULTAS_PEDIDO = 10;

type EntradaConsulta = {
  /** Consultas automáticas hechas hasta ahora. */
  intentos: number;
  /** Estado del pago según la última respuesta de la API, o undefined si no hay pedido. */
  estadoPago: EstadoPago | undefined;
  /** Medio de pago del pedido. Solo Mercado Pago confirma solo. */
  medioPago: PedidoPublico["medioPago"] | undefined;
  /** `document.visibilityState` de la pestaña. */
  visibilidad: DocumentVisibilityState;
};

/**
 * @description Decide si hay que volver a preguntar por el estado del pedido.
 * Solo mientras el pago de Mercado Pago siga pendiente, la pestaña esté a la
 * vista y no se hayan agotado los intentos. Con la pestaña oculta no se
 * pregunta; los intentos no se gastan.
 * @param entrada Intentos hechos, estado del pago, medio de pago y visibilidad de la pestaña.
 * @returns true si corresponde consultar ahora.
 */
export const debeConsultarPedido = ({
  intentos,
  estadoPago,
  medioPago,
  visibilidad,
}: EntradaConsulta): boolean =>
  estadoPago === "pendiente" &&
  medioPago === "mercadopago" &&
  visibilidad === "visible" &&
  intentos < MAX_CONSULTAS_PEDIDO;

/**
 * @description Indica si se dejó de consultar solo por falta de intentos, para
 * ofrecer una actualización manual. No aplica si el pago ya salió de pendiente.
 * @param intentos Consultas automáticas hechas.
 * @param estadoPago Estado del pago según la última respuesta.
 * @returns true si se agotaron los intentos con el pago todavía pendiente.
 */
export const intentosAgotados = (intentos: number, estadoPago: EstadoPago | undefined): boolean =>
  estadoPago === "pendiente" && intentos >= MAX_CONSULTAS_PEDIDO;

/**
 * @description Indica si la reserva del pedido ya venció: pasó el instante
 * hasta el que la API guarda los productos. Es solo una guía para no ofrecer
 * "Pagar" cuando seguro va a fallar: la decisión real la toma la API, que
 * responde PEDIDO_VENCIDO si se intenta pagar igual. `ahora` lo recibe quien
 * llama para poder probarlo y para usar el momento de la consulta.
 * @param expiraEn Instante de vencimiento (fecha y hora ISO), o null si no vence.
 * @param ahora Momento actual, en milisegundos.
 * @returns true si venció. Sin fecha o con una fecha ilegible, false.
 */
export const pedidoVencido = (expiraEn: string | null | undefined, ahora: number): boolean => {
  if (!expiraEn) return false;

  const limite = Date.parse(expiraEn);

  return Number.isFinite(limite) && ahora >= limite;
};

/**
 * @description Decide si se ofrece pagar (o pagar de nuevo) con Mercado Pago:
 * solo un pedido de Mercado Pago, con el pago pendiente o rechazado y la
 * reserva vigente. Un pedido vencido no se ofrece: los productos ya no están
 * apartados.
 * @param pedido Medio de pago, estado del pago y vencimiento del pedido.
 * @param ahora Momento actual, en milisegundos.
 * @returns true si corresponde mostrar el botón de pagar.
 */
export const puedePagarPedido = (
  pedido: Pick<PedidoPublico, "medioPago" | "estadoPago" | "expiraEn">,
  ahora: number,
): boolean =>
  pedido.medioPago === "mercadopago" &&
  (pedido.estadoPago === "pendiente" || pedido.estadoPago === "rechazado") &&
  !pedidoVencido(pedido.expiraEn, ahora);
