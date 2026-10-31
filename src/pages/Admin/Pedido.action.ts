import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";

import {
  cambiarPreparacion,
  cancelarPedido,
  obtenerPedidoAdmin,
} from "@/lib/api/pedidosAdmin.api";
import { ErrorApi } from "@/lib/apiFetch";
import { leerIdRuta } from "@/lib/idRuta";
import type { PedidoAdminDetalle, PreparacionEntrada } from "@/types";

/** Lo que el loader deja disponible para la pantalla. */
export type DatosPedido = { pedido: PedidoAdminDetalle };

/** Lo que devuelve la action cuando algo falla. */
export type ErrorAccionPedido = {
  codigo: string;
  details?: Record<string, string>;
  /** Qué botón falló, para mostrar el error donde corresponde. */
  intencion: string;
};

/**
 * Estado que pide cada botón de preparación. El estado nunca se lee del
 * formulario: solo estas intenciones existen, así un campo agregado a mano no
 * puede elegir otro.
 */
const ESTADO_POR_INTENCION = {
  preparar: "en_preparacion",
  enviar: "enviado",
  entregar: "entregado",
} as const satisfies Record<string, PreparacionEntrada["estado"]>;

export type IntencionPreparacion = keyof typeof ESTADO_POR_INTENCION;

/**
 * @description Dice si la intención es uno de los botones de preparación.
 * `Object.hasOwn` evita que "constructor" o "toString" cuenten como válidas.
 * @param intencion Valor del campo oculto del formulario.
 * @returns true si es preparar, enviar o entregar.
 */
const esIntencionPreparacion = (intencion: string): intencion is IntencionPreparacion =>
  Object.hasOwn(ESTADO_POR_INTENCION, intencion);

/**
 * @description Loader del detalle de un pedido. Valida el id ANTES de llamar a
 * la API: si no es un entero válido, responde "no encontrado" sin hacer ninguna
 * petición, así un `..%2F` en la URL nunca llega a armar otra ruta.
 * @param args Argumentos del loader de react-router.
 * @returns El detalle del pedido.
 * @throws {ErrorApi} NO_ENCONTRADO si el id no es válido o el pedido no existe;
 *   401 o 403 los resuelve la pantalla de error del panel.
 */
export async function cargarPedido({ params, request }: LoaderFunctionArgs): Promise<DatosPedido> {
  const id = leerIdRuta(params.id);
  if (id === null) throw new ErrorApi("NO_ENCONTRADO", 404);

  const pedido = await obtenerPedidoAdmin(id, request.signal);
  return { pedido };
}

/**
 * @description Action del detalle: preparar, enviar, entregar o cancelar. Cada
 * botón manda un campo oculto `intencion`. Arma el cuerpo campo por campo, nunca
 * con el formulario entero. La API decide si el cambio vale; esconder botones
 * en la pantalla es solo comodidad.
 * @param args Argumentos de la action de react-router.
 * @returns null si salió bien (react-router vuelve a pedir el detalle), o el error.
 */
export async function accionPedido({ params, request }: ActionFunctionArgs) {
  const datos = await request.formData();
  const intencion = String(datos.get("intencion") ?? "");

  // Mismo control que el loader: sin id válido no sale ninguna petición.
  const id = leerIdRuta(params.id);
  if (id === null) {
    return { codigo: "NO_ENCONTRADO", intencion } satisfies ErrorAccionPedido;
  }

  try {
    if (esIntencionPreparacion(intencion)) {
      const entrada: PreparacionEntrada = { estado: ESTADO_POR_INTENCION[intencion] };
      const seguimiento = String(datos.get("seguimiento") ?? "").trim();
      if (intencion === "enviar" && seguimiento !== "") entrada.seguimiento = seguimiento;

      await cambiarPreparacion(id, entrada);
      return null;
    }

    if (intencion === "cancelar") {
      await cancelarPedido(id, {
        motivo: String(datos.get("motivo") ?? ""),
        // Booleano de verdad: la API no acepta el texto "true".
        confirmaSinPago: datos.get("confirmaSinPago") === "true",
      });
      return null;
    }

    return { codigo: "DATOS_INVALIDOS", intencion } satisfies ErrorAccionPedido;
  } catch (error) {
    if (error instanceof ErrorApi) {
      return { codigo: error.codigo, details: error.details, intencion } satisfies ErrorAccionPedido;
    }
    throw error;
  }
}
