import { redirect, type ActionFunctionArgs } from "react-router-dom";

import { urlLogin } from "@/auth/authService";
import { cambiarContrasena } from "@/lib/api/auth.api";
import { ErrorApi } from "@/lib/apiFetch";

/** Ruta de esta pantalla, para volver después de ingresar. */
const RUTA_MI_CUENTA = "/admin/mi-cuenta";

/** Lo que devuelve la action: éxito, o el error para mostrar. */
/** Lo que devuelve la action cuando algo falla: el código y, si hay, el detalle por campo. */
export type ErrorMiCuenta = { ok: false; codigo: string; details?: Record<string, string> };

/** Lo que devuelve la action: éxito, o el error para mostrar. */
export type ResultadoMiCuenta = { ok: true } | ErrorMiCuenta;

/**
 * @description Action de "Mi cuenta". Verifica en el navegador solo lo que es
 * experiencia de usuario (campos completos y que la nueva se repita igual); la
 * política de la contraseña la aplica la API. Si la sesión ya no vale, manda al
 * login con el motivo.
 * @param args Argumentos de la action de react-router.
 * @returns El resultado para mostrar en pantalla.
 * @throws Un redirect al login si la API responde 401.
 */
export async function accionMiCuenta({ request }: ActionFunctionArgs): Promise<ResultadoMiCuenta> {
  const datos = await request.formData();
  const contrasenaActual = String(datos.get("contrasenaActual") ?? "");
  const contrasenaNueva = String(datos.get("contrasenaNueva") ?? "");
  const repetirContrasena = String(datos.get("repetirContrasena") ?? "");

  const faltantes: Record<string, string> = {};
  if (!contrasenaActual) faltantes.contrasenaActual = "Escribí tu contraseña actual.";
  if (!contrasenaNueva) faltantes.contrasenaNueva = "Escribí la contraseña nueva.";
  if (Object.keys(faltantes).length > 0) {
    return { ok: false, codigo: "DATOS_INVALIDOS", details: faltantes };
  }

  if (contrasenaNueva !== repetirContrasena) {
    return {
      ok: false,
      codigo: "DATOS_INVALIDOS",
      details: { repetirContrasena: "No coincide con la contraseña nueva." },
    };
  }

  try {
    await cambiarContrasena(contrasenaActual, contrasenaNueva);
    return { ok: true };
  } catch (error) {
    if (error instanceof ErrorApi) {
      if (error.status === 401) {
        throw redirect(urlLogin(RUTA_MI_CUENTA, error.codigo));
      }
      return { ok: false, codigo: error.codigo, details: error.details };
    }
    throw error;
  }
}