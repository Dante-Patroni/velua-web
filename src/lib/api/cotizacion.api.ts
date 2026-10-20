import { apiFetch } from "@/lib/apiFetch";
import type { Cotizacion, CotizacionEntrada } from "@/types";

/** Datos opcionales de la cotización: con zona se suma el envío y con medio de pago se aplica su ajuste. */
export type OpcionesCotizacion = Pick<CotizacionEntrada, "zonaEnvioId" | "medioPago">;

/**
 * @description Cotiza un carrito. El carrito viaja como ids y cantidades: los
 * precios, los nombres y el stock los pone el servidor, y la respuesta trae los
 * avisos de lo que cambió (producto sin stock, Próximamente, cantidad ajustada).
 * No crea ni reserva nada. Sin zona se cotiza como retiro en persona.
 * @param items Carrito: variante y cantidad de cada línea.
 * @param signal Señal para cancelar la petición si el carrito cambia antes de que responda.
 * @param opciones Zona de envío y medio de pago, para el checkout.
 * @returns La cotización con las líneas, los avisos y los totales.
 * @throws {ErrorApi} CARRITO_SIN_ITEMS_VALIDOS si ninguno de los productos se puede vender.
 */
export const cotizarCarrito = (
  items: CotizacionEntrada["items"],
  signal?: AbortSignal,
  opciones: OpcionesCotizacion = {},
) =>
  apiFetch<Cotizacion>("/cotizar", {
    method: "POST",
    body: JSON.stringify({ items, ...opciones }),
    signal,
  });
