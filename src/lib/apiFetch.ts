const API_URL = import.meta.env.VITE_API_URL;

/**
 * Wrapper de fetch para realizar solicitudes a la API de Velua.
 * Incluye las credenciales necesarias para la sesión mediante cookie httpOnly.
 */
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });
};