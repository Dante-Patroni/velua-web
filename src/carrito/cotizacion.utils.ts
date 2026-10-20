import type { Cotizacion } from "@/types";
import type { ItemCarrito } from "./types";

/**
 * @description Convierte las líneas de una cotización en un carrito. La API
 * quita lo que no se puede vender y baja las cantidades que pasaban el stock o
 * el tope, así que esto es lo que realmente se puede comprar.
 * @param cotizacion Respuesta de `/cotizar`.
 * @returns El carrito con solo ids y cantidades, nunca precios.
 */
export const itemsDeCotizacion = (cotizacion: Cotizacion): ItemCarrito[] =>
  cotizacion.items.map(({ varianteId, cantidad }) => ({ varianteId, cantidad }));

/**
 * @description Indica si un carrito es exactamente lo que devolvió una
 * cotización: las mismas variantes con las mismas cantidades, sin importar el
 * orden. Sirve para no volver a cotizar lo que ya está cotizado.
 * @param items Carrito actual.
 * @param cotizacion Última cotización recibida, o null si todavía no hay.
 * @returns true si no hace falta cotizar de nuevo.
 */
export const coincideConCotizacion = (
  items: ItemCarrito[],
  cotizacion: Cotizacion | null,
): boolean => {
  if (!cotizacion || items.length !== cotizacion.items.length) return false;

  const cotizadas = new Map(cotizacion.items.map((linea) => [linea.varianteId, linea.cantidad]));

  return items.every(({ varianteId, cantidad }) => cotizadas.get(varianteId) === cantidad);
};

/**
 * @description Mensaje que se precarga en WhatsApp cuando la clienta quiere
 * más unidades que el tope por compra. Nombra el producto.
 * @param producto Nombre del producto, si la API lo mandó.
 * @returns El texto del mensaje.
 */
export const mensajeMasUnidades = (producto?: string): string =>
  producto?.trim()
    ? `Hola, quiero comprar más unidades de ${producto.trim()}.`
    : "Hola, quiero comprar más unidades de un producto.";
