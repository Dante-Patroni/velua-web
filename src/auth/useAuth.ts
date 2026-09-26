import { createContext, useContext } from "react";

import type { ValorAuth } from "./types";

export const AuthContext = createContext<ValorAuth | null>(null);

/**
 * @description Devuelve el usuario de la sesión dentro de la rama admin.
 * @returns El usuario que validó el authLoader.
 * @throws Si se usa fuera de AuthProvider, es decir, fuera del panel.
 */
export function useAuth(): ValorAuth {
  const valor = useContext(AuthContext);

  if (!valor) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return valor;
}
