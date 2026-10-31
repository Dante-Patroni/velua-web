import type { EstadoPedido, PedidoAdminDetalle } from "@/types";

import type { IntencionPreparacion } from "./Pedido.action";

/** Lo que hace falta del pedido para decidir qué botones mostrar. */
export type DatosAcciones = Pick<PedidoAdminDetalle, "estadoPago" | "estadoPedido"> & {
  entrega: Pick<PedidoAdminDetalle["entrega"], "metodo">;
  pago: Pick<PedidoAdminDetalle["pago"], "tieneLinkMercadoPago" | "comprobanteInformadoEn">;
};

/** Qué botones muestra el detalle del pedido. */
export type AccionesPedido = {
  /** El próximo paso de la preparación, o null si no hay ninguno. */
  avance: IntencionPreparacion | null;
  /** True si el paso es enviar y el pedido va por correo. */
  pideSeguimiento: boolean;
  /**
   * "disponible": se puede cancelar. "mercado-pago": el botón se ve
   * deshabilitado, con la explicación. null: no se muestra.
   */
  cancelacion: "disponible" | "mercado-pago" | null;
  /** True si la clienta avisó que transfirió: hay que confirmar que no llegó. */
  pideConfirmacionSinPago: boolean;
};

/**
 * @description Próximo paso de la preparación según el estado actual. Es un
 * switch y no un objeto: así no hay claves heredadas que puedan colarse.
 * @param estado Estado de preparación del pedido.
 * @returns La intención del botón, o null si no hay paso siguiente.
 */
function siguienteAvance(estado: EstadoPedido): IntencionPreparacion | null {
  switch (estado) {
    case "nuevo":
      return "preparar";
    case "en_preparacion":
      return "enviar";
    case "enviado":
      return "entregar";
    default:
      return null;
  }
}

/**
 * @description Decide qué acciones ofrece el detalle de un pedido. Copia las
 * reglas de la API solo para no mostrar botones que van a fallar: la que decide
 * es la API. El rol se controla aparte, en la pantalla.
 * @param pedido Estados, método de entrega y datos del pago.
 * @returns Los botones a mostrar y qué pide cada uno.
 */
export function accionesDelPedido(pedido: DatosAcciones): AccionesPedido {
  const avance = pedido.estadoPago === "aprobado" ? siguienteAvance(pedido.estadoPedido) : null;

  const cancelable =
    pedido.estadoPedido === "nuevo" &&
    (pedido.estadoPago === "pendiente" || pedido.estadoPago === "rechazado");

  let cancelacion: AccionesPedido["cancelacion"] = null;
  if (cancelable) {
    cancelacion = pedido.pago.tieneLinkMercadoPago ? "mercado-pago" : "disponible";
  }

  return {
    avance,
    pideSeguimiento: avance === "enviar" && pedido.entrega.metodo === "envio",
    cancelacion,
    pideConfirmacionSinPago: cancelacion === "disponible" && pedido.pago.comprobanteInformadoEn !== null,
  };
}
