import { redirect } from "react-router-dom";
import type { ActionFunctionArgs } from "react-router-dom";

import { iniciarSesion } from "@/lib/api/auth.api";
import { ErrorApi } from "@/lib/apiFetch";

/** Ruta a la que se entra después de iniciar sesión, si no se pidió otra. */
const DESTINO_POR_DEFECTO = "/admin";

/** Lo que devuelve la action cuando el login falla. */
export type ErrorLogin = { codigo: string; details?: Record<string, string> };

/**
 * @description Devuelve una ruta interna del panel, o el destino por defecto.
 *
 * El authLoader arma `/admin/login?volver=<a donde iba>`. Si ese valor se usara
 * tal cual, alguien podría mandar un link con `volver=https://sitio-falso.com`:
 * la usuaria pondría su contraseña acá y terminaría en un sitio ajeno que imita
 * el panel. Por eso solo se acepta una ruta relativa que empiece en `/admin`.
 *
 * @param volver Valor del parámetro `volver`, tal como llega en la URL.
 * @returns Una ruta interna segura.
 */
export function rutaSegura(volver: string | null): string {
  if (!volver) return DESTINO_POR_DEFECTO;

  // Una barra doble o una contrabarra al principio son rutas hacia otro host.
  if (!volver.startsWith("/admin") || volver.startsWith("//") || volver.includes("\\")) {
    return DESTINO_POR_DEFECTO;
  }

  return volver;
}

/**
 * @description Action del login. Verifica las credenciales contra la API y, si
 * salen bien, redirige a donde la usuaria quería ir.
 * @param args Argumentos de la action de react-router.
 * @returns El error para mostrar en pantalla, o un redirect si el login salió bien.
 */
export async function accionLogin({ request }: ActionFunctionArgs) {
  const datos = await request.formData();
  const email = String(datos.get("email") ?? "").trim();
  const password = String(datos.get("password") ?? "");

  if (!email || !password) {
    return { codigo: "DATOS_INVALIDOS" } satisfies ErrorLogin;
  }

  try {
    await iniciarSesion(email, password);
  } catch (error) {
    if (error instanceof ErrorApi) {
      return { codigo: error.codigo, details: error.details } satisfies ErrorLogin;
    }
    throw error;
  }

  const volver = new URL(request.url).searchParams.get("volver");
  return redirect(rutaSegura(volver ? decodeURIComponent(volver) : null));
}