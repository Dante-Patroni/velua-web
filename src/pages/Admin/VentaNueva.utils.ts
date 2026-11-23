import { esEnteroPositivo } from "@/carrito/carrito.utils";
import type {
  EntregaPanel,
  MedioPagoPanel,
  VentaCotizacion,
  VentaCotizacionEntrada,
} from "@/types";

/** Una línea de la venta: solo qué y cuánto. Los precios los pone la API. */
export type LineaVenta = { varianteId: number; cantidad: number };

/**
 * @description Agrega unidades de una variante a la venta. Una variante repetida
 * es DATOS_INVALIDOS en la API, así que si ya está se suman las cantidades en la
 * misma línea. Contar unidades no es operar con dinero.
 * @param lineas Líneas actuales.
 * @param varianteId Variante que se agrega.
 * @param cantidad Unidades que se agregan.
 * @returns Las líneas nuevas, o las mismas si los datos no son enteros positivos.
 */
export const sumarLinea = (
  lineas: readonly LineaVenta[],
  varianteId: number,
  cantidad: number,
): LineaVenta[] => {
  if (!esEnteroPositivo(varianteId) || !esEnteroPositivo(cantidad)) return [...lineas];

  if (!lineas.some((linea) => linea.varianteId === varianteId)) {
    return [...lineas, { varianteId, cantidad }];
  }

  return lineas.map((linea) =>
    linea.varianteId === varianteId ? { ...linea, cantidad: linea.cantidad + cantidad } : linea,
  );
};

/**
 * @description Cambia la cantidad de una línea.
 * @param lineas Líneas actuales.
 * @param varianteId Variante de la línea.
 * @param cantidad Cantidad nueva. Si no es un entero positivo, no cambia nada.
 * @returns Las líneas nuevas.
 */
export const fijarCantidad = (
  lineas: readonly LineaVenta[],
  varianteId: number,
  cantidad: number,
): LineaVenta[] =>
  esEnteroPositivo(cantidad)
    ? lineas.map((linea) => (linea.varianteId === varianteId ? { ...linea, cantidad } : linea))
    : [...lineas];

/**
 * @description Saca una variante de la venta.
 * @param lineas Líneas actuales.
 * @param varianteId Variante que se quita.
 * @returns Las líneas sin esa variante.
 */
export const quitarLinea = (lineas: readonly LineaVenta[], varianteId: number): LineaVenta[] =>
  lineas.filter((linea) => linea.varianteId !== varianteId);

/**
 * @description Arma el cuerpo de la cotización del panel. Sin `medioPago`, a
 * propósito: así la API informa el total y la disponibilidad de cada medio, y
 * cambiar de medio no obliga a cotizar de nuevo. La zona solo viaja con envío.
 * @param lineas Líneas de la venta.
 * @param entrega Cómo se entrega.
 * @param zonaEnvioId Zona elegida, o null.
 * @returns El cuerpo, o null si todavía no hay nada que cotizar (sin líneas, o
 *   con envío y sin zona).
 */
export const entradaCotizacion = (
  lineas: readonly LineaVenta[],
  entrega: EntregaPanel,
  zonaEnvioId: number | null,
): VentaCotizacionEntrada | null => {
  if (lineas.length === 0) return null;

  const items = lineas.map(({ varianteId, cantidad }) => ({ varianteId, cantidad }));

  if (entrega !== "envio") return { items, entrega: { metodo: entrega } };
  if (!esEnteroPositivo(zonaEnvioId)) return null;

  return { items, entrega: { metodo: "envio", zonaEnvioId } };
};

/**
 * @description Total que se manda como `totalEsperado`: el del medio elegido,
 * tal como lo informa la API, sin sumar ni redondear nada. Nunca `totales.total`:
 * sin medio elegido no lleva descuento y no es el total de ninguna venta.
 * @param cotizacion Última cotización, o null si todavía no hay.
 * @param medio Medio elegido, o null si todavía no se eligió.
 * @returns El total del medio como cadena decimal, o null si no hay cotización,
 *   no hay medio elegido o el medio no está disponible.
 */
export const totalDelMedio = (
  cotizacion: VentaCotizacion | null,
  medio: MedioPagoPanel | null,
): string | null => {
  if (!cotizacion || medio === null) return null;

  const cotizado = cotizacion.mediosPago[medio];

  return cotizado.disponible && typeof cotizado.total === "string" ? cotizado.total : null;
};

/**
 * @description Dice si las líneas de la pantalla son exactamente lo que cotizó
 * la API: las mismas variantes con las mismas cantidades. Si no, la API ajustó o
 * quitó algo, y registrar daría CARRITO_DESACTUALIZADO.
 * @param lineas Líneas de la pantalla.
 * @param cotizacion Última cotización.
 * @returns true si coinciden.
 */
export const lineasCoinciden = (
  lineas: readonly LineaVenta[],
  cotizacion: VentaCotizacion,
): boolean => {
  if (lineas.length !== cotizacion.items.length) return false;

  const cotizadas = new Map(cotizacion.items.map((i) => [i.varianteId, i.cantidad]));

  return lineas.every(({ varianteId, cantidad }) => cotizadas.get(varianteId) === cantidad);
};

/**
 * @description Decide si se puede registrar la venta. Hace falta una cotización
 * vigente (de lo que hay hoy en pantalla), sin avisos, que coincida con las
 * líneas, y un medio elegido y disponible con su total.
 * @param cotizacion Cotización vigente, o null si falta, está en curso o falló.
 * @param lineas Líneas de la pantalla.
 * @param medio Medio elegido, o null.
 * @returns true si el botón puede estar activo. La API vuelve a validar todo.
 */
export const puedeRegistrar = (
  cotizacion: VentaCotizacion | null,
  lineas: readonly LineaVenta[],
  medio: MedioPagoPanel | null,
): boolean =>
  cotizacion !== null &&
  cotizacion.avisos.length === 0 &&
  lineasCoinciden(lineas, cotizacion) &&
  totalDelMedio(cotizacion, medio) !== null;

/** Errores del registro que se arreglan volviendo a calcular el total. */
const CODIGOS_PARA_RECALCULAR: readonly string[] = ["TOTAL_CAMBIO", "CARRITO_DESACTUALIZADO", "STOCK_INSUFICIENTE"];

/**
 * @description Dice si, después de este error al registrar, conviene ofrecer
 * "volver a calcular el total": el precio, el descuento o el stock cambiaron
 * mientras se cargaba la venta.
 * @param codigo Código de error de la API.
 * @returns true si hay que volver a cotizar para ver lo que cambió.
 */
export const debeRecalcular = (codigo: string): boolean => CODIGOS_PARA_RECALCULAR.includes(codigo);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * @description Indica si un texto tiene forma de UUID.
 * @param valor Texto a revisar.
 * @returns true si es un UUID.
 */
export const esClaveVenta = (valor: string): boolean => UUID.test(valor);

/**
 * @description Genera la clave de idempotencia de una venta. Se genera una vez
 * al abrir la pantalla y se repite en cada reintento de esa venta.
 * @returns Un UUID v4.
 */
export const nuevaClaveVenta = (): string => crypto.randomUUID();
