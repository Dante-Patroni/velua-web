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
 * @description Pide a Cloudinary una miniatura cuadrada: recorta al centro
 * (c_fill) hasta el lado pedido, en el mejor formato (f_auto) y con la calidad
 * ajustada (q_auto). Para el carrito, donde la foto es un cuadrado chico.
 * @param url URL de la imagen tal como la devuelve la API.
 * @param lado Lado del cuadrado en píxeles.
 * @returns La URL con la transformación, o la original si no es de Cloudinary.
 */
export const urlCloudinaryCuadrada = (url: string, lado: number): string => {
  const indice = url.indexOf(TRAMO_CLOUDINARY);

  if (indice === -1) return url;

  const corte = indice + TRAMO_CLOUDINARY.length;
  return `${url.slice(0, corte)}c_fill,w_${lado},h_${lado},f_auto,q_auto/${url.slice(corte)}`;
};

/**
 * @description Arma el srcset de una miniatura cuadrada con el lado normal y el
 * doble, para pantallas de alta densidad.
 * @param url URL de la imagen tal como la devuelve la API.
 * @param lado Lado del cuadrado en píxeles a densidad normal.
 * @returns El srcset con las versiones 1x y 2x.
 */
export const srcsetCloudinaryCuadrada = (url: string, lado: number): string =>
  `${urlCloudinaryCuadrada(url, lado)} 1x, ${urlCloudinaryCuadrada(url, lado * 2)} 2x`;

/**
 * @description Elige el texto alternativo de una imagen: el que cargó la marca
 * y, si viene vacío o solo con espacios (hoy muchas fotos no lo tienen), el
 * nombre del producto, para que un lector de pantalla no la lea sin nombre.
 * @param alt Texto alternativo de la imagen, si lo hay.
 * @param nombre Nombre del producto.
 * @returns El texto alternativo.
 */
export const textoAlternativo = (alt: string | null | undefined, nombre: string): string =>
  alt?.trim() || nombre;

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