import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS condicionales y resuelve conflictos de Tailwind CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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