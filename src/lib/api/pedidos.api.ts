import { apiFetch } from "@/lib/apiFetch";
import type { PagoIniciado, PedidoCreado, PedidoEntrada, PedidoPublico, ZonaEnvio } from "@/types";

/** Respuesta de GET /zonas-envio. */
type ListaZonas = { datos: ZonaEnvio[] };

/**
 * @description Lista las zonas de envío con su costo y demora, para elegir
 * adónde se entrega. Los costos solo se muestran: el envío lo calcula la
 * cotización.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns Las zonas de envío activas.
 */
export const listarZonasEnvio = (signal?: AbortSignal) =>
  apiFetch<ListaZonas>("/zonas-envio", { signal });

/**
 * @description Crea un pedido con el stock apartado. Es más estricto que la
 * cotización: si algo cambió responde CARRITO_DESACTUALIZADO, y si el total no
 * es el que la clienta vio, TOTAL_CAMBIO. Los datos personales viajan solo en
 * esta petición: no se guardan ni se registran en ningún lado.
 * @param entrada Carrito, datos de la clienta, entrega, medio de pago y total esperado.
 * @returns El pedido creado, con el link de pago si Mercado Pago respondió.
 * @throws {ErrorApi} CARRITO_DESACTUALIZADO, TOTAL_CAMBIO, STOCK_INSUFICIENTE, DATOS_INVALIDOS, ZONA_INVALIDA o LIMITE_SUPERADO.
 */
export const crearPedido = (entrada: PedidoEntrada) =>
  apiFetch<PedidoCreado>("/pedidos", { method: "POST", body: JSON.stringify(entrada) });

/**
 * @description Consulta el estado de un pedido por su número, sin datos
 * personales. Es la única fuente del estado que se muestra: nada de lo que
 * agregue Mercado Pago a la URL de vuelta se usa. Las consultas de números que
 * no existen tienen un tope por hora y por dirección.
 * @param numero Número del pedido, por ejemplo VEL-4K7Q2X.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns El estado del pedido, sus líneas y sus totales.
 * @throws {ErrorApi} NO_ENCONTRADO (404) o LIMITE_SUPERADO (429).
 */
export const obtenerPedido = (numero: string, signal?: AbortSignal) =>
  apiFetch<PedidoPublico>(`/pedidos/${encodeURIComponent(numero)}`, { signal });

/**
 * @description Genera un link de pago de Mercado Pago para un pedido pendiente
 * o rechazado cuya reserva sigue vigente. Se usa si al crear el pedido no hubo
 * link, o para reintentar después de un rechazo.
 * @param numero Número del pedido.
 * @returns El link de pago.
 * @throws {ErrorApi} PEDIDO_NO_PAGABLE, PEDIDO_VENCIDO, PEDIDO_YA_PAGADO, PAGO_EN_PROCESO o PROCESADOR_NO_DISPONIBLE.
 */
export const iniciarPago = (numero: string) =>
  apiFetch<PagoIniciado>(`/pedidos/${encodeURIComponent(numero)}/pago`, { method: "POST" });
