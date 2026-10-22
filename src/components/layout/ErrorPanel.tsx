import { Navigate, useLocation, useRouteError } from "react-router-dom";

import { destinoSiSinSesion } from "@/auth/authService";
import { ErrorPage } from "@/pages/Errores/ErrorPage";

/**
 * @description Error boundary de la rama del panel. Un 401 en cualquier pantalla
 * (sesión vencida o revocada a mitad de camino) manda al login con el aviso que
 * corresponde, en lugar de mostrar la página de error. Los demás errores se
 * muestran como siempre.
 * @returns La redirección al login, o la página de error.
 */
export function ErrorPanel() {
  const error = useRouteError();
  const { pathname, search } = useLocation();

  const destino = destinoSiSinSesion(error, pathname + search);
  if (destino) {
    return <Navigate to={destino} replace />;
  }

  return <ErrorPage />;
}