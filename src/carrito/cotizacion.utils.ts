import { ErrorApi } from "@/lib/apiFetch";
import type { AvisoCotizacion, Cotizacion } from "@/types";
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
 * @description Decide si lo que la clienta ve está confirmado por la API: el
 * carrito es exactamente lo que devolvió la última cotización (mismas
 * variantes y mismas cantidades) y no hay una cotización en curso. Mientras no
 * lo esté, no se puede seguir al checkout ni mostrar el subtotal como vigente.
 * @param items Carrito actual.
 * @param cotizacion Última cotización recibida, o null si todavía no hay.
 * @param cargando true si hay una cotización en curso.
 * @returns true si el carrito está confirmado.
 */
export const carritoConfirmado = (
  items: ItemCarrito[],
  cotizacion: Cotizacion | null,
  cargando: boolean,
): boolean => !cargando && coincideConCotizacion(items, cotizacion);

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

/** Qué pasó al cotizar el carrito. */
export type ResultadoCotizacion =
  /** El carrito cambió mientras tanto: esta respuesta no vale y no se toca nada. */
  | { tipo: "obsoleta" }
  /** La API respondió. `items` es el carrito corregido, solo si respondió con avisos que lo cambian. */
  | { tipo: "cotizado"; cotizacion: Cotizacion; avisos: AvisoCotizacion[]; items: ItemCarrito[] | null }
  /** Ninguno de los productos se puede vender. */
  | { tipo: "sin_items_validos" }
  /** Falló la red o la API respondió un error: el carrito queda como estaba. */
  | { tipo: "error"; codigo: string };

/**
 * @description Cotiza un carrito y decide qué hacer con la respuesta, sin
 * tocar ningún estado. Una respuesta que llega después de que la petición se
 * canceló nunca se aplica, aunque haya alcanzado a resolverse. El carrito solo
 * se corrige cuando la API responde con avisos y las líneas cotizadas son
 * distintas de las enviadas; un error de red o un 500 no lo modifican.
 * @param items Carrito que se envía.
 * @param cotizar Función que llama a `/cotizar`.
 * @param signal Señal de cancelación: se aborta cuando el carrito cambia o la pantalla se cierra.
 * @returns El resultado, para que el hook lo aplique.
 */
export const resolverCotizacion = async (
  items: ItemCarrito[],
  cotizar: (items: ItemCarrito[], signal: AbortSignal) => Promise<Cotizacion>,
  signal: AbortSignal,
): Promise<ResultadoCotizacion> => {
  try {
    const cotizacion = await cotizar(items, signal);

    if (signal.aborted) return { tipo: "obsoleta" };

    const corregir = cotizacion.avisos.length > 0 && !coincideConCotizacion(items, cotizacion);

    return {
      tipo: "cotizado",
      cotizacion,
      avisos: cotizacion.avisos,
      items: corregir ? itemsDeCotizacion(cotizacion) : null,
    };
  } catch (error) {
    if (signal.aborted) return { tipo: "obsoleta" };

    const codigo = error instanceof ErrorApi ? error.codigo : "ERROR_DESCONOCIDO";

    return codigo === "CARRITO_SIN_ITEMS_VALIDOS"
      ? { tipo: "sin_items_validos" }
      : { tipo: "error", codigo };
  }
};
