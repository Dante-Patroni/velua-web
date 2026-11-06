import { TEXTOS_ESTADO_PAGO, TEXTOS_TRANSFERENCIA, TEXTO_PEDIDO_VENCIDO } from "@/lib/mappings";
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
 * @description Indica si el último intento de pago falló porque la reserva del
 * pedido venció. Lo informa la API (PEDIDO_VENCIDO): no se adivina con el reloj
 * del navegador.
 * @param codigoFallo Código de error de la respuesta de POST /pago, si falló.
 * @returns true si el fallo fue por vencimiento.
 */
export const falloPorVencimiento = (codigoFallo: string | undefined): boolean => codigoFallo === "PEDIDO_VENCIDO";

/**
 * @description Decide si se ofrece pagar (o pagar de nuevo) con Mercado Pago:
 * solo un pedido de Mercado Pago con el pago pendiente o rechazado, y mientras
 * el último intento de pago no haya fallado por vencimiento. No mira el reloj:
 * si la reserva ya venció, la API responde PEDIDO_VENCIDO al intentar pagar.
 * @param pedido Medio de pago y estado del pago del pedido.
 * @param codigoFallo Código de error del último intento de pago, si falló.
 * @returns true si corresponde mostrar el botón de pagar.
 */
export const puedePagarPedido = (
  pedido: Pick<PedidoPublico, "medioPago" | "estadoPago">,
  codigoFallo?: string,
): boolean =>
  pedido.medioPago === "mercadopago" &&
  (pedido.estadoPago === "pendiente" || pedido.estadoPago === "rechazado") &&
  !falloPorVencimiento(codigoFallo);

/** Lo mínimo del pedido que decide qué se muestra de la transferencia. */
type PedidoTransferencia = Pick<PedidoPublico, "transferencia" | "comprobanteInformado">;

/**
 * @description Indica si se muestran los datos para transferir. La API es la que
 * decide: manda `transferencia` solo mientras la clienta tiene que pagar, y
 * `null` en cualquier otro caso. No se mira el reloj ni el estado del pago.
 * @param pedido Pedido tal como lo informa la API.
 * @returns true si `transferencia` trae datos.
 */
export const mostrarDatosTransferencia = (pedido: Pick<PedidoPublico, "transferencia">): boolean =>
  pedido.transferencia != null;

/**
 * @description Indica si se ofrece el botón "Ya transferí": hay datos para
 * transferir y la clienta todavía no avisó.
 * @param pedido Pedido tal como lo informa la API.
 * @returns true si corresponde mostrar el botón.
 */
export const puedeAvisarTransferencia = (pedido: PedidoTransferencia): boolean =>
  mostrarDatosTransferencia(pedido) && pedido.comprobanteInformado !== true;

/**
 * @description Indica si la clienta ya avisó la transferencia, según la API.
 * @param pedido Pedido tal como lo informa la API.
 * @returns true si el aviso está registrado.
 */
export const transferenciaAvisada = (pedido: Pick<PedidoPublico, "comprobanteInformado">): boolean =>
  pedido.comprobanteInformado === true;

/**
 * @description Decide si el botón "Ya transferí" va deshabilitado: mientras el
 * formulario viaja o la página se recarga, para no mandar el aviso dos veces.
 * Es una función aparte porque ese estado no se puede simular al renderizar.
 * @param estado `useNavigation().state`.
 * @returns true si hay una navegación en curso.
 */
export const botonAvisoDeshabilitado = (estado: "idle" | "loading" | "submitting"): boolean => estado !== "idle";

/**
 * @description Elige el título y el detalle de la página según el pedido. Un
 * pedido por transferencia con el pago pendiente habla de transferir y, si ya
 * avisó, de que se revisa el banco: nunca de pago confirmado. Un vencimiento que
 * informó la API pisa todo lo demás.
 * @param pedido Medio de pago, estado del pago, aviso y datos para transferir.
 * @param vencido true si la API respondió PEDIDO_VENCIDO en el último intento.
 * @returns El título y el detalle.
 */
export const textosDelPedido = (
  pedido: Pick<PedidoPublico, "medioPago" | "estadoPago" | "transferencia" | "comprobanteInformado">,
  vencido: boolean,
): { titulo: string; detalle: string } => {
  if (vencido) return TEXTO_PEDIDO_VENCIDO;

  if (pedido.medioPago === "transferencia" && pedido.estadoPago === "pendiente") {
    if (transferenciaAvisada(pedido)) return TEXTOS_TRANSFERENCIA.informado;

    return mostrarDatosTransferencia(pedido) ? TEXTOS_TRANSFERENCIA.pendiente : TEXTOS_TRANSFERENCIA.sinDatos;
  }

  return TEXTOS_ESTADO_PAGO[pedido.estadoPago];
};

/**
 * @description Arma el texto con que se abre WhatsApp después de avisar. Lleva
 * solo el número del pedido: ni nombre, ni mail, ni monto.
 * @param numero Número del pedido.
 * @returns El mensaje, sin codificar para URL (eso lo hace `enlaceWhatsApp`).
 */
export const mensajeTransferencia = (numero: string): string => `Hola, ya transferí el pedido ${numero}`;
