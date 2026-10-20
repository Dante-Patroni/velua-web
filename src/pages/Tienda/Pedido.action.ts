import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";

import { iniciarPago, obtenerPedido } from "@/lib/api/pedidos.api";
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
