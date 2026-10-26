/** Ids de la base: enteros desde 1, sin ceros adelante, de hasta 10 dígitos. */
const ID_VALIDO = /^[1-9]\d{0,9}$/;

/**
 * @description Convierte el `:id` de la URL en un número, o null si no es un id
 * válido. La URL la escribe cualquiera, y react-router decodifica `%2F` como
 * `/`: sin esta validación, `..%2Fcategorias` haría que el panel llame a otro
 * endpoint de la API (Client-Side Path Traversal).
 * @param valor Parámetro de la ruta, tal como lo entrega react-router.
 * @returns El id como número, o null si no es válido.
 */
export function leerIdRuta(valor: string | undefined): number | null {
  if (valor === undefined || !ID_VALIDO.test(valor)) return null;
  return Number(valor);
}