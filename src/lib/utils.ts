import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS condicionales y resuelve conflictos de Tailwind CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Tramo de las URLs de Cloudinary después del cual van las transformaciones. */
const TRAMO_CLOUDINARY = "/image/upload/";

/**
 * @description Pide a Cloudinary la imagen del ancho justo, en el mejor formato
 * que soporte el navegador (f_auto) y con la calidad ajustada (q_auto). Las
 * fotos se suben una sola vez, a 1600 px: el tamaño de cada pantalla sale de acá.
 * @param url URL de la imagen tal como la devuelve la API.
 * @param ancho Ancho en píxeles que se necesita.
 * @returns La URL con la transformación, o la original si no es de Cloudinary.
 */
export const urlCloudinary = (url: string, ancho: number): string => {
  const indice = url.indexOf(TRAMO_CLOUDINARY);

  if (indice === -1) return url;

  const corte = indice + TRAMO_CLOUDINARY.length;
  return `${url.slice(0, corte)}f_auto,q_auto,w_${ancho}/${url.slice(corte)}`;
};

/**
 * @description Arma el srcset de una imagen de Cloudinary con el ancho normal y
 * el doble, para que en pantallas de alta densidad no se vea borrosa.
 * @param url URL de la imagen tal como la devuelve la API.
 * @param ancho Ancho en píxeles a densidad normal.
 * @returns El srcset con las versiones 1x y 2x.
 */
export const srcsetCloudinary = (url: string, ancho: number): string =>
  `${urlCloudinary(url, ancho)} 1x, ${urlCloudinary(url, ancho * 2)} 2x`;

/**
 * @description Arma el enlace para abrir una conversación de WhatsApp, con un
 * mensaje ya escrito si se pasa uno.
 * @param numero Número de la marca, con o sin espacios, guiones o el signo +.
 * @param mensaje Texto inicial de la conversación.
 * @returns El enlace a wa.me, o null si el número está vacío.
 */
export const enlaceWhatsApp = (numero: string, mensaje?: string): string | null => {
  const digitos = numero.replace(/\D/g, "");

  if (!digitos) return null;

  const texto = mensaje?.trim();
  return texto
    ? `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`
    : `https://wa.me/${digitos}`;
};