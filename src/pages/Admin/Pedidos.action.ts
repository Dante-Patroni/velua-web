import type { LoaderFunctionArgs } from "react-router-dom";

import { listarPedidos, type FiltrosPedidos } from "@/lib/api/pedidosAdmin.api";
import type { ListadoPedidosAdmin } from "@/types";

import { esEstadoPago, esEstadoPedido } from "./Pedidos.utils";

/** Pedidos por página en el panel. */
export const LIMITE = 20;

/** La misma página máxima que acepta la API: pedir más daría un 400. */
export const PAGINA_MAXIMA = 10000;

/** Lo que el loader deja disponible para la página. */
export type DatosPedidos = {
  listado: ListadoPedidosAdmin;
  filtros: FiltrosPedidos;
};

/**
 * @description Convierte los parámetros de la URL en filtros válidos para la
 * API. Lo que no está en la lista de valores aceptados se descarta: la URL la
 * puede escribir cualquiera.
 * @param parametros Parámetros de búsqueda de la URL.
 * @returns Filtros saneados.
 */
export function leerFiltros(parametros: URLSearchParams): FiltrosPedidos {
  const pagina = Number(parametros.get("pagina"));
  const estadoPago = parametros.get("estadoPago");
  const estadoPedido = parametros.get("estadoPedido");

  return {
    pagina: Number.isInteger(pagina) && pagina >= 1 && pagina <= PAGINA_MAXIMA ? pagina : 1,
    limite: LIMITE,
    estadoPago: esEstadoPago(estadoPago) ? estadoPago : undefined,
    estadoPedido: esEstadoPedido(estadoPedido) ? estadoPedido : undefined,
  };
}

/**
 * @description Loader del listado de pedidos. Los errores (401, 403, red)
 * suben a la pantalla de error del panel, igual que en productos.
 * @param args Argumentos del loader de react-router.
 * @returns El listado y los filtros aplicados.
 */
export async function cargarPedidos({ request }: LoaderFunctionArgs): Promise<DatosPedidos> {
  const filtros = leerFiltros(new URL(request.url).searchParams);
  const listado = await listarPedidos(filtros, request.signal);
  return { listado, filtros };
}