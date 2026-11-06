import type { Cotizacion, PedidoEntrada } from "@/types";

/** Medio de pago de un pedido, tal como lo define el contrato. */
export type MedioPago = PedidoEntrada["medioPago"];

/** Un medio que la API ofrece hoy, con el total que informa para él. */
export type MedioOfrecido = { medio: MedioPago; total: string };

/** Orden en que se ofrecen los medios en pantalla. */
const ORDEN_MEDIOS: readonly MedioPago[] = ["mercadopago", "transferencia"];

/**
 * @description Lista los medios de pago que la API ofrece hoy, con el total de
 * cada uno. Solo cuentan los que vienen con `disponible: true` y un total: nada
 * se calcula acá. Sin cotización no se ofrece nada.
 * @param cotizacion Última cotización, o null si todavía no hay.
 * @returns Los medios disponibles, en el orden de la pantalla.
 */
export const mediosOfrecidos = (cotizacion: Pick<Cotizacion, "mediosPago"> | null): MedioOfrecido[] => {
  if (!cotizacion) return [];

  return ORDEN_MEDIOS.flatMap((medio) => {
    const { disponible, total } = cotizacion.mediosPago[medio];

    return disponible && total !== null ? [{ medio, total }] : [];
  });
};

/**
 * @description Decide qué medio queda elegido: el que la clienta marcó si la API
 * lo ofrece; si no, el primero que se ofrezca. Mientras no hay cotización se
 * respeta la elección, para no pedir una cotización con otro medio de más.
 * @param elegido Medio que la clienta marcó (o el de por defecto).
 * @param cotizacion Última cotización, o null si todavía no hay.
 * @returns El medio a usar, o null si la API no ofrece ninguno.
 */
export const resolverMedioPago = (
  elegido: MedioPago,
  cotizacion: Pick<Cotizacion, "mediosPago"> | null,
): MedioPago | null => {
  if (!cotizacion) return elegido;

  const ofrecidos = mediosOfrecidos(cotizacion);

  return ofrecidos.some(({ medio }) => medio === elegido) ? elegido : (ofrecidos[0]?.medio ?? null);
};

/**
 * Códigos con los que la API avisa que el estado cambió desde que la clienta
 * miró el carrito: hay que volver a cotizar y mostrarle qué cambió. Incluye
 * MEDIO_PAGO_NO_DISPONIBLE: la cotización dirá qué medios quedan.
 */
const CODIGOS_PARA_COTIZAR_DE_NUEVO: readonly string[] = [
  "CARRITO_DESACTUALIZADO",
  "TOTAL_CAMBIO",
  "STOCK_INSUFICIENTE",
  "MEDIO_PAGO_NO_DISPONIBLE",
];

/**
 * @description Indica si, tras un error al crear el pedido, hay que volver a
 * cotizar el carrito para mostrarle a la clienta lo que cambió.
 * @param codigo Código de error de la API.
 * @returns true si el estado cambió y la cotización que se veía ya no vale.
 */
export const debeCotizarDeNuevo = (codigo: string): boolean =>
  CODIGOS_PARA_COTIZAR_DE_NUEVO.includes(codigo);

/**
 * @description Busca el mensaje de error de un campo en los `details` de la
 * API. La API nombra el campo con su ruta ("cliente.email",
 * "entrega.direccion.calle"), así que se acepta el nombre solo o terminando en
 * él.
 * @param details Errores por campo que devolvió la API, si los hubo.
 * @param campo Nombre del campo, por ejemplo "email".
 * @returns El mensaje, o undefined si ese campo no tiene error.
 */
export const errorDeCampo = (
  details: Record<string, string> | undefined,
  campo: string,
): string | undefined => {
  if (!details) return undefined;

  const clave = Object.keys(details).find((ruta) => ruta === campo || ruta.endsWith(`.${campo}`));

  return clave ? details[clave] : undefined;
};
