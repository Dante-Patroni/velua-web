import { redirect, type LoaderFunctionArgs } from "react-router-dom";

import { obtenerSesion } from "@/lib/api/auth.api";
import { ErrorApi } from "@/lib/apiFetch";

/** Ruta del login del panel. */
export const RUTA_LOGIN = "/admin/login";

/**
 * @description Arma la URL del login recordando a dónde volver. Si la sesión se
 * cerró porque alguien cambió la contraseña, lo indica con motivo=revocada para
 * que el login lo diga: si no fue la usuaria, es la señal de que alguien entró.
 * @param volver Ruta interna a la que volver después de ingresar.
 * @param codigo Código del 401 que obligó a salir, si lo hay.
 * @returns La URL del login con sus parámetros.
 */
export function urlLogin(volver: string, codigo?: string): string {
  const parametros = new URLSearchParams({ volver });
  if (codigo === "SESION_REVOCADA") {
    parametros.set("motivo", "revocada");
  }
  return `${RUTA_LOGIN}?${parametros.toString()}`;
}

/**
 * @description Si el error es un 401 de la API (sin sesión, sesión vencida o
 * revocada), devuelve la URL del login a la que hay que ir. Si es otro error,
 * devuelve null y se muestra la página de error de siempre.
 * @param error Lo que llegó al error boundary.
 * @param volver Ruta en la que estaba la usuaria.
 * @returns La URL del login, o null.
 */
export function destinoSiSinSesion(error: unknown, volver: string): string | null {
  if (error instanceof ErrorApi && error.status === 401) {
    return urlLogin(volver, error.codigo);
  }
  return null;
}

/**
 * @description Loader de la rama admin. Verifica la sesión contra la API
 * (`GET /auth/yo`); no lee nada de storage. Sin sesión, redirige al login
 * recordando a dónde quería ir.
 * @param args Argumentos del loader de react-router.
 * @returns El usuario logueado, disponible con useLoaderData en AdminLayout.
 * @throws Un redirect al login si la API responde 401, o el error si es otro.
 */
export async function authLoader({ request }: LoaderFunctionArgs) {
  try {
    return await obtenerSesion(request.signal);
  } catch (error) {
    const { pathname, search } = new URL(request.url);
    const destino = destinoSiSinSesion(error, pathname + search);
    if (destino) {
      throw redirect(destino);
    }

    throw error;
  }
}
