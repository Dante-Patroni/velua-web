import { apiFetch } from "@/lib/apiFetch";
import type { Usuario } from "@/types";

/**
 * @description Consulta el usuario de la sesión actual. La cookie la envía el navegador.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns El usuario logueado con su rol y permisos.
 * @throws {ErrorApi} Con status 401 si no hay sesión o expiró.
 */
export const obtenerSesion = (signal?: AbortSignal) =>
  apiFetch<Usuario>("/auth/yo", { signal });
