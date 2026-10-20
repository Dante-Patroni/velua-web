/**
 * Códigos con los que la API avisa que el estado cambió desde que la clienta
 * miró el carrito: hay que volver a cotizar y mostrarle qué cambió.
 */
const CODIGOS_PARA_COTIZAR_DE_NUEVO: readonly string[] = [
  "CARRITO_DESACTUALIZADO",
  "TOTAL_CAMBIO",
  "STOCK_INSUFICIENTE",
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
