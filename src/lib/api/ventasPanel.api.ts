import { apiFetch } from "@/lib/apiFetch";
import type {
  VentaCotizacion,
  VentaCotizacionEntrada,
  VentaPanelEntrada,
  VentaPanelResultado,
} from "@/types";

/**
 * @description Cotiza una venta del panel con efectivo y transferencia. Solo
 * lectura: no crea ni reserva nada. Sin `medioPago`, la respuesta trae el total
 * de cada medio y si está disponible. El total que se manda después como
 * `totalEsperado` es `mediosPago[medio].total`, nunca `totales.total`.
 * @param entrada Ítems, entrega y, opcional, medio de pago. Sin precios.
 * @param signal Señal para cancelar la petición si la venta cambia antes de que responda.
 * @returns La cotización, con los totales de cada medio del panel.
 * @throws {ErrorApi} DATOS_INVALIDOS, CARRITO_SIN_ITEMS_VALIDOS, ZONA_INVALIDA,
 *   MEDIO_PAGO_NO_DISPONIBLE; 401 sin sesión; 403 sin permiso.
 */
export const cotizarVentaPanel = (entrada: VentaCotizacionEntrada, signal?: AbortSignal) =>
  apiFetch<VentaCotizacion>("/admin/ventas/cotizacion", {
    method: "POST",
    body: JSON.stringify(entrada),
    signal,
  });

/**
 * @description Registra una venta hecha fuera de la tienda. La clave de
 * idempotencia es un UUID por venta: un reintento con la misma clave y la misma
 * venta devuelve la original (200) sin descontar stock de nuevo; la misma clave
 * con otra venta es CLAVE_REUTILIZADA. La clave viaja en el encabezado
 * `Idempotency-Key`.
 * @param entrada La venta, con `totalEsperado` del medio elegido.
 * @param claveIdempotencia UUID de esta venta, el mismo en cada reintento.
 * @returns El número, el total y el estado de pago de la venta.
 * @throws {ErrorApi} TOTAL_CAMBIO, CARRITO_DESACTUALIZADO, STOCK_INSUFICIENTE,
 *   CLAVE_REUTILIZADA, MEDIO_PAGO_NO_DISPONIBLE, DATOS_INVALIDOS; 401; 403.
 */
export const registrarVentaPanel = (entrada: VentaPanelEntrada, claveIdempotencia: string) =>
  apiFetch<VentaPanelResultado>("/admin/ventas", {
    method: "POST",
    headers: { "Idempotency-Key": claveIdempotencia },
    body: JSON.stringify(entrada),
  });
