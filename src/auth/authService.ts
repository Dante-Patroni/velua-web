import { redirect, type LoaderFunctionArgs } from "react-router-dom";

import { obtenerSesion } from "@/lib/api/auth.api";
import { ErrorApi } from "@/lib/apiFetch";

/** Ruta del login del panel. */
export const RUTA_LOGIN = "/admin/login";

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
    if (error instanceof ErrorApi && error.status === 401) {
      const { pathname, search } = new URL(request.url);
      const volver = encodeURIComponent(pathname + search);

      throw redirect(`${RUTA_LOGIN}?volver=${volver}`);
    }

    throw error;
  }
}
