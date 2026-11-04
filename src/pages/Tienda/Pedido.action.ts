import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";

import { iniciarPago, informarTransferencia, obtenerPedido } from "@/lib/api/pedidos.api";
import { ErrorApi } from "@/lib/apiFetch";
import { urlPagoSegura, type DestinoPago } from "@/lib/pagos";
import type { PedidoPublico } from "@/types";

/**
 * Lo que el loader deja disponible para la página del pedido. `error` es el
 * código de la API cuando la consulta falló sin ser un 404 (límite de
 * consultas, red, 500): la página lo traduce y deja de consultar sola.
 */
export type DatosPedido = { pedido: PedidoPublico | null; error: string | null };

/** Resultado de pedir un link de pago. */
export type ResultadoPago = { ok: true; destino: DestinoPago } | { ok: false; codigo: string };

/** Resultado de avisar una transferencia. `intencion` lo distingue del resultado de pagar. */
export type ResultadoAviso =
  | { intencion: "aviso"; ok: true }
  | { intencion: "aviso"; ok: false; codigo: string };

/**
 * @description Loader de `/pedido/:numero`. El estado sale siempre de
 * `GET /pedidos/{numero}`: lo que Mercado Pago agrega a la URL de vuelta
 * (`collection_status`, `payment_id`, etc.) no se lee, porque cualquiera puede
 * escribirlo a mano. Un número que no existe responde 404 y corta la
 * consulta. Cualquier otro error se devuelve como código para mostrarlo sin
 * tirar la página.
 * @param args Argumentos del loader de react-router.
 * @returns El pedido, o el código del error.
 * @throws Response 404 si el pedido no existe.
 */
export async function cargarPedido({ request, params }: LoaderFunctionArgs): Promise<DatosPedido> {
  try {
    return { pedido: await obtenerPedido(params.numero ?? "", request.signal), error: null };
  } catch (error) {
    if (error instanceof ErrorApi) {
      if (error.status === 404) throw new Response(null, { status: 404, statusText: "Not Found" });

      return { pedido: null, error: error.codigo };
    }

    throw error;
  }
}

/**
 * @description Action de `/pedido/:numero`: pide un link de pago nuevo para un
 * pedido pendiente o rechazado. Solo se manda a la clienta a un link de Mercado
 * Pago; si el link no es seguro se trata como si el procesador no respondiera.
 * @param args Argumentos del action de react-router.
 * @returns El destino de pago, o el código de error.
 */
export async function pagarPedido({ params }: ActionFunctionArgs): Promise<ResultadoPago> {
  try {
    const { urlPago } = await iniciarPago(params.numero ?? "");
    const url = urlPagoSegura(urlPago);

    return url
      ? { ok: true, destino: { tipo: "externo", url } }
      : { ok: false, codigo: "PROCESADOR_NO_DISPONIBLE" };
  } catch (error) {
    if (error instanceof ErrorApi) return { ok: false, codigo: error.codigo };

    return { ok: false, codigo: "ERROR_DESCONOCIDO" };
  }
}

/**
 * @description "Ya transferí": registra en la API que la clienta avisó la
 * transferencia. El estado que se muestra después sale de volver a pedir el
 * pedido (react-router recarga el loader tras la action), no de esta respuesta.
 * @param args Argumentos del action de react-router.
 * @returns El aviso hecho, o el código de error.
 */
export async function avisarTransferencia({ params }: ActionFunctionArgs): Promise<ResultadoAviso> {
  try {
    await informarTransferencia(params.numero ?? "");

    return { intencion: "aviso", ok: true };
  } catch (error) {
    if (error instanceof ErrorApi) return { intencion: "aviso", ok: false, codigo: error.codigo };

    return { intencion: "aviso", ok: false, codigo: "ERROR_DESCONOCIDO" };
  }
}

/**
 * @description Action de `/pedido/:numero`. La página tiene dos formularios: el
 * de pagar con Mercado Pago y el de "Ya transferí". El campo `intencion` dice
 * cuál se envió; sin él, o con cualquier otro valor, se trata como pagar.
 * @param args Argumentos del action de react-router.
 * @returns El resultado de pagar o de avisar.
 */
export async function gestionarPedido(args: ActionFunctionArgs): Promise<ResultadoPago | ResultadoAviso> {
  const datos = await args.request.clone().formData().catch(() => null);

  return datos?.get("intencion") === "avisar" ? avisarTransferencia(args) : pagarPedido(args);
}
