import { useMemo, type ReactNode } from "react";

import type { Usuario } from "@/types";
import { AuthContext } from "./useAuth";

type AuthProviderProps = {
  usuario: Usuario;
  children: ReactNode;
};

/**
 * @description Expone el usuario de la sesión a los componentes del panel.
 * No consulta la API: recibe el usuario que ya validó el authLoader, así la
 * tienda pública nunca dispara una verificación de sesión.
 * @param props El usuario validado y los hijos.
 * @returns El proveedor del contexto.
 */
export function AuthProvider({ usuario, children }: AuthProviderProps) {
  const valor = useMemo(() => ({ usuario }), [usuario]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
