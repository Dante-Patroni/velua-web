/**
 * Mensajes asociados a códigos de dominio devueltos por la API.
 *
 * Los códigos se agregarán por contexto a medida que se implementen
 * las distintas funcionalidades de Velua.
 */
export const mensajesError: Record<string, string> = {};

/**
 * Obtiene un mensaje legible para un código de error de dominio.
 */
export function obtenerMensajeError(codigo: string): string {
  return mensajesError[codigo] ?? "Ocurrió un error inesperado";
}