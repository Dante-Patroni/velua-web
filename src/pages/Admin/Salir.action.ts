import { redirect } from "react-router-dom";

import { RUTA_LOGIN } from "@/auth/authService";
import { cerrarSesion } from "@/lib/api/auth.api";

/**
 * @description Action de /admin/salir. Le pide a la API que borre la cookie de
 * sesión y lleva al login. Si la API falla (sin conexión, sesión ya vencida),
 * lleva al login igual: quien quiere salir tiene que poder salir.
 * @returns Un redirect al login con el aviso de que se cerró la sesión.
 */
export async function accionSalir(): Promise<Response> {
  try {
    await cerrarSesion();
  } catch {
    // No se muestra nada: el objetivo de quien toca "Cerrar sesión" es salir.
  }
  return redirect(`${RUTA_LOGIN}?motivo=salio`);
}

/**
 * @description Loader de /admin/salir. Cerrar la sesión cambia estado, así que
 * solo se hace por POST (el formulario del menú). Entrar con un enlace (GET),
 * por ejemplo desde una imagen o un link en otro sitio, no cierra nada: vuelve
 * al panel. Evita que otra página le cierre la sesión a la usuaria (CSRF).
 * @returns Un redirect al panel.
 */
export function cargarSalir(): Response {
  return redirect("/admin");
}
