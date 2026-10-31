import { ErrorApi } from "@/lib/apiFetch";

/** Segmentos que el navegador interpreta como "este lugar" o "subir un nivel". */
const SEGMENTOS_DE_PUNTO = new Set(["", ".", ".."]);

/**
 * @description Codifica un texto para usarlo como un segmento de la URL de la
 * API. `encodeURIComponent` codifica la barra, pero deja "." y ".." tal cual, y
 * el navegador los resuelve antes de pedir: `/pedidos/..` termina en `/`, y
 * `/pedidos/../pago` en `/pago`. Un segmento vacío también cambia la ruta.
 * Esos valores se rechazan sin hacer ninguna petición.
 * @param valor Texto de la URL de la tienda, por ejemplo un slug o un número de pedido.
 * @returns El segmento listo para concatenar.
 * @throws {ErrorApi} NO_ENCONTRADO (404) si el valor es vacío, "." o "..".
 */
export function segmentoRuta(valor: string): string {
  if (SEGMENTOS_DE_PUNTO.has(valor)) throw new ErrorApi("NO_ENCONTRADO", 404);
  return encodeURIComponent(valor);
}
