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

/**
 * @description Inicia sesión en el panel. La API responde con el usuario y deja
 * la sesión en una cookie httpOnly; el token nunca viaja en el cuerpo, así que
 * no hay nada que guardar acá.
 * @param email Mail del usuario.
 * @param password Contraseña.
 * @returns El usuario que inició sesión.
 * @throws {ErrorApi} CREDENCIALES_INVALIDAS, USUARIO_INACTIVO, LIMITE_SUPERADO o DATOS_INVALIDOS.
 */
export const iniciarSesion = (email: string, password: string) =>
  apiFetch<Usuario>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

/**
 * @description Cierra la sesión borrando la cookie. Responde 204 aunque no
 * hubiera sesión abierta.
 * @returns Nada.
 */
export const cerrarSesion = () => apiFetch<void>("/auth/logout", { method: "POST" });
