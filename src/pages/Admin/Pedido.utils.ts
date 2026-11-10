import type { EstadoPedido, PedidoAdminDetalle } from "@/types";

import type { ErrorAccionPedido, IntencionPreparacion } from "./Pedido.action";

/** Lo que hace falta del pedido para decidir qué botones mostrar. */
export type DatosAcciones = Pick<PedidoAdminDetalle, "estadoPago" | "estadoPedido" | "medioPago"> & {
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
  /** True si se puede registrar el aviso de una transferencia (todavía no hay). */
  registrarAviso: boolean;
  /** True si se puede confirmar que el dinero de una transferencia entró. */
  confirmarPago: boolean;
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

  // Transferencia que todavía se puede pagar. La reserva vencida no importa:
  // desde el panel se puede avisar y confirmar mientras no esté cancelado.
  const transferenciaAbierta =
    pedido.medioPago === "transferencia" &&
    pedido.estadoPedido !== "cancelado" &&
    (pedido.estadoPago === "pendiente" || pedido.estadoPago === "rechazado");

  return {
    avance,
    pideSeguimiento: avance === "enviar" && pedido.entrega.metodo === "envio",
    cancelacion,
    pideConfirmacionSinPago: cancelacion === "disponible" && pedido.pago.comprobanteInformadoEn !== null,
    registrarAviso: transferenciaAbierta && pedido.pago.comprobanteInformadoEn === null,
    confirmarPago: transferenciaAbierta,
  };
}

/** Los cuatro formularios del bloque de acciones, cada uno con su fetcher. */
export type FormularioAccion = "avance" | "cancelacion" | "aviso" | "confirmacion";

/** Orden fijo en que se muestran los errores sin botón. */
const FORMULARIOS: readonly FormularioAccion[] = ["avance", "cancelacion", "aviso", "confirmacion"];

/**
 * @description Si el bloque de cancelar se dibuja: el formulario, o el botón
 * deshabilitado con la explicación de Mercado Pago. Solo para admin. Es la única
 * regla de rol de la cancelación: la pantalla y formulariosVisibles la leen de acá.
 * Esconderlo es comodidad; el control real es el 403 de la API.
 * @param acciones Resultado de accionesDelPedido.
 * @param esAdmin True si la sesión es de un admin.
 * @returns True si la sesión ve algo de la cancelación.
 */
export function puedeVerCancelacion(acciones: AccionesPedido, esAdmin: boolean): boolean {
  return esAdmin && acciones.cancelacion !== null;
}

/**
 * @description Qué formularios se dibujan, según las acciones y el rol.
 * Cancelar y lo de la transferencia son solo para admin.
 * @param acciones Resultado de accionesDelPedido.
 * @param esAdmin True si la sesión es de un admin.
 * @returns Si cada formulario está en la pantalla.
 */
export function formulariosVisibles(
  acciones: AccionesPedido,
  esAdmin: boolean,
): Record<FormularioAccion, boolean> {
  return {
    avance: acciones.avance !== null,
    cancelacion: puedeVerCancelacion(acciones, esAdmin) && acciones.cancelacion === "disponible",
    aviso: esAdmin && acciones.registrarAviso,
    confirmacion: esAdmin && acciones.confirmarPago,
  };
}

/**
 * @description Errores que ya no tienen dónde mostrarse. Después de una action,
 * react-router vuelve a pedir el pedido: si cambió (otra pestaña lo pagó o lo
 * canceló), el formulario que falló desaparece, y su error con él. Estos se
 * muestran arriba del bloque, para que nadie vea un cambio sin explicación.
 * @param errores El último error de cada formulario, si hubo.
 * @param visibles Qué formularios siguen en la pantalla.
 * @returns Los errores de los formularios que ya no se ven, en orden fijo.
 */
export function erroresSinBoton(
  errores: Partial<Record<FormularioAccion, ErrorAccionPedido>>,
  visibles: Record<FormularioAccion, boolean>,
): ErrorAccionPedido[] {
  return FORMULARIOS.flatMap((formulario) => {
    const error = errores[formulario];
    return error && !visibles[formulario] ? [error] : [];
  });
}
