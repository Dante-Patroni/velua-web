import type { LoaderFunctionArgs } from "react-router-dom";

import { obtenerPedidoAdmin } from "@/lib/api/pedidosAdmin.api";
import { ErrorApi } from "@/lib/apiFetch";
import { leerIdRuta } from "@/lib/idRuta";
import type { PedidoAdminDetalle } from "@/types";

/** Lo que el loader deja disponible para la pantalla. */
export type DatosPedido = { pedido: PedidoAdminDetalle };

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