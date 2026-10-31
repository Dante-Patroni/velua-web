import { apiFetch } from "@/lib/apiFetch";
import type {
    CancelacionEntrada,
    CancelacionResultado,
    EstadoPago,
    EstadoPedido,
    ListadoPedidosAdmin,
    PedidoAdminDetalle,
    PreparacionEntrada,
    PreparacionResultado,
} from "@/types";

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

/**
 * @description Cambia el estado de preparación de un pedido: en preparación,
 * enviado o entregado. La API decide si el paso es válido.
 * @param id Id del pedido, ya validado como entero positivo.
 * @param entrada Estado nuevo y, para enviar, el código de seguimiento.
 * @returns Si cambió y el número. `cambiado: false` es un doble clic, no un error.
 * @throws {ErrorApi} TRANSICION_INVALIDA, PAGO_NO_APROBADO, SEGUIMIENTO_REQUERIDO
 *   o DATOS_INVALIDOS; NO_ENCONTRADO; 401 o 403 como el listado.
 */
export const cambiarPreparacion = (id: number, entrada: PreparacionEntrada) =>
    apiFetch<PreparacionResultado>(`/admin/pedidos/${id}/preparacion`, {
        method: "PATCH",
        body: JSON.stringify(entrada),
    });

/**
 * @description Cancela a mano un pedido nuevo y sin pagar, y repone el stock.
 * Solo admin. Un pedido con link de Mercado Pago no se cancela acá: lo cancela
 * el job, que consulta a Mercado Pago.
 * @param id Id del pedido, ya validado como entero positivo.
 * @param entrada Motivo para el historial y la confirmación de que no llegó la
 *   transferencia (true solo si la clienta avisó que transfirió).
 * @returns Si se canceló y el número. `cancelado: false` si ya estaba cancelado.
 * @throws {ErrorApi} DATOS_INVALIDOS o TRANSICION_INVALIDA (400); PEDIDO_PAGADO,
 *   COMPROBANTE_INFORMADO o PAGO_EN_CURSO (409); NO_ENCONTRADO; 401 o 403.
 */
export const cancelarPedido = (id: number, entrada: CancelacionEntrada) =>
    apiFetch<CancelacionResultado>(`/admin/pedidos/${id}/cancelacion`, {
        method: "POST",
        body: JSON.stringify(entrada),
    });
