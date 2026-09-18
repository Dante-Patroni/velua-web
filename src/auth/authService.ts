import { apiFetch } from "../lib/apiFetch";
import type { AuthUser } from "./types";

/**
 * Obtiene el usuario asociado a la sesión actual.
 * La autenticación se realiza mediante cookie httpOnly.
 */
export async function obtenerUsuarioActual(): Promise<AuthUser | null> {
  const response = await apiFetch("/api/v1/auth/yo");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("No se pudo obtener la sesión actual");
  }

  return response.json() as Promise<AuthUser>;
}