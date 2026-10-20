import { DOMINIOS_MERCADO_PAGO } from "@/lib/mappings";

/** Adónde se manda a la clienta después de crear un pedido o pedir un link de pago. */
export type DestinoPago =
  | { tipo: "externo"; url: string }
  | { tipo: "interno"; ruta: string };

/**
 * @description Comprueba que un link de pago sea seguro para redirigir: https y
 * del dominio de Mercado Pago (o un subdominio). Cualquier otra cosa, incluidos
 * `javascript:`, `http:` o un dominio que solo se parece, se descarta.
 * @param url Link de pago tal como lo devolvió la API.
 * @returns La URL normalizada, o null si no sirve.
 */
export const urlPagoSegura = (url: string | null | undefined): string | null => {
  if (!url) return null;

  let analizada: URL;

  try {
    analizada = new URL(url);
  } catch {
    return null;
  }

  const dominioPermitido = DOMINIOS_MERCADO_PAGO.some(
    (dominio) => analizada.hostname === dominio || analizada.hostname.endsWith(`.${dominio}`),
  );

  return analizada.protocol === "https:" && dominioPermitido ? analizada.href : null;
};

/**
 * @description Decide adónde ir después de crear el pedido: al link de pago si
 * es seguro, y si no hay link (Mercado Pago no respondió) o no es seguro, a la
 * página del pedido, desde donde se puede reintentar el pago.
 * @param numero Número del pedido.
 * @param urlPago Link de pago devuelto por la API, si lo hubo.
 * @returns El destino: externo (Mercado Pago) o interno (`/pedido/:numero`).
 */
export const destinoDePago = (numero: string, urlPago: string | null | undefined): DestinoPago => {
  const segura = urlPagoSegura(urlPago);

  return segura
    ? { tipo: "externo", url: segura }
    : { tipo: "interno", ruta: `/pedido/${encodeURIComponent(numero)}` };
};
