import { MAXIMO_IMAGENES, TIPOS_ACEPTADOS, TOPE_BYTES } from "@/lib/api/imagenes.api";

/** Resultado de validar un archivo antes de subirlo. */
export type Validacion =
  | { valido: true; motivo?: undefined }
  | { valido: false; motivo: string };

/**
 * @description Expresa un tamaño en bytes de forma legible.
 * @param bytes Cantidad de bytes.
 * @returns El tamaño en MB con un decimal, o en KB si es chico.
 */
export function tamanoLegible(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/**
 * @description Verifica un archivo antes de mandarlo al servidor.
 *
 * El backend rechaza lo mismo, pero esperar a que suban cuatro megas para
 * recibir el error es una mala experiencia, sobre todo desde el teléfono con
 * datos móviles. Esto corta antes de empezar.
 *
 * @param archivo Archivo elegido.
 * @param cantidadActual Imágenes que el producto ya tiene.
 * @returns Si es válido, o el motivo del rechazo en lenguaje llano.
 */
export function validarArchivo(archivo: File, cantidadActual: number): Validacion {
  if (cantidadActual >= MAXIMO_IMAGENES) {
    return {
      valido: false,
      motivo: `Este producto ya tiene ${MAXIMO_IMAGENES} fotos, que es el máximo. Borrá alguna para subir otra.`,
    };
  }

  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    return {
      valido: false,
      motivo: "Solo se aceptan fotos en formato JPG, PNG o WEBP.",
    };
  }

  if (archivo.size > TOPE_BYTES) {
    return {
      valido: false,
      motivo: `La foto pesa ${tamanoLegible(archivo.size)} y el máximo son ${tamanoLegible(TOPE_BYTES)}. Mandala por WhatsApp a tu computadora, que las achica, o exportala más chica.`,
    };
  }

  return { valido: true };
}

/**
 * @description Mueve un elemento de una posición a otra, devolviendo una lista
 * nueva. Se usa para reordenar la galería.
 * @param lista Lista original.
 * @param desde Posición actual.
 * @param hasta Posición destino.
 * @returns La lista con el elemento movido, o la misma si las posiciones no son válidas.
 */
export function mover<T>(lista: T[], desde: number, hasta: number): T[] {
  if (desde === hasta) return lista;
  if (desde < 0 || hasta < 0 || desde >= lista.length || hasta >= lista.length) {
    return lista;
  }

  const copia = [...lista];
  const [elemento] = copia.splice(desde, 1);
  copia.splice(hasta, 0, elemento);
  return copia;
}
