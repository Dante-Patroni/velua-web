import { apiFetch } from "@/lib/apiFetch";
import type { EstadoPago, EstadoPedido, ListadoPedidosAdmin, PedidoAdminDetalle } from "@/types";

/** Filtros del listado de pedidos del panel. */
export type FiltrosPedidos = {
    pagina?: number;
    limite?: number;
    estadoPago?: EstadoPago;
    estadoPedido?: EstadoPedido;
};

/**
 * @description Arma la cadena de consulta con los filtros que vinieron.
 * @returns La cadena de consulta, con `?` adelante, o vacía si no hay filtros.
 */
const aConsulta = (filtros: FiltrosPedidos): string => {
    const parametros = new URLSearchParams();

    for (const [clave, valor] of Object.entries(filtros)) {
        if (valor !== undefined) {
            parametros.set(clave, String(valor));
        }
    }

    const cadena = parametros.toString();
    return cadena ? `?${cadena}` : "";
};

/**
 * @description Lista los pedidos del panel, del más nuevo al más viejo.
 * El backend pagina y filtra: acá no se filtra nada sobre el resultado.
 * @param filtros Filtros y paginación.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns Los pedidos de la página pedida y el total filtrado.
 * @throws {ErrorApi} 401 sin sesión, 403 sin permiso de ver pedidos.
 */
export const listarPedidos = (filtros: FiltrosPedidos = {}, signal?: AbortSignal) =>
    apiFetch<ListadoPedidosAdmin>(`/admin/pedidos${aConsulta(filtros)}`, { signal });

/**
 * @description Obtiene el detalle de un pedido: contacto, entrega, totales,
 * pago, ítems e historial.
 * @param id Id del pedido, ya validado como entero positivo.
 * @param signal Señal para cancelar la petición.
 * @returns El detalle del pedido.
 * @throws {ErrorApi} NO_ENCONTRADO si no existe; 401 o 403 como el listado.
 */
export const obtenerPedidoAdmin = (id: number, signal?: AbortSignal) =>
    apiFetch<PedidoAdminDetalle>(`/admin/pedidos/${id}`, { signal });