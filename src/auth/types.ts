/**
 * Roles administrativos disponibles en Velua.
 */
export type RolUsuario = "admin" | "operador";

/**
 * Usuario autenticado devuelto por la API de Velua.
 */
export interface AuthUser {
  id: number;
  nombre: string;
  rol: RolUsuario;
}