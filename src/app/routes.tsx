import { createBrowserRouter } from "react-router-dom";

import { ErrorPage } from "@/pages/Errores/ErrorPage";
import { rutasAdmin } from "./rutasAdmin";
import { rutasTienda } from "./rutasTienda";

/**
 * Router de la app. La raíz no renderiza nada propio: solo aporta el error
 * boundary común y el fallback de la primera carga. Las dos ramas cuelgan de ella.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    ErrorBoundary: ErrorPage,
    // Mientras corre el primer loader (el authLoader al entrar directo al panel).
    HydrateFallback: () => null,
    children: [...rutasTienda, ...rutasAdmin],
  },
]);
