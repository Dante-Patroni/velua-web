import type { ReactNode } from "react";

import type { RolUsuario } from "@/types";
import { useAuth } from "./useAuth";

type RequireRolProps = {
  roles: RolUsuario[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * @description Renderiza sus hijos solo si el usuario tiene uno de los roles.
 * Es una ayuda de interfaz: el permiso real lo valida la API.
 * @param props Roles admitidos, hijos y contenido alternativo.
 * @returns Los hijos o el fallback.
 */
export function RequireRol({ roles, children, fallback = null }: RequireRolProps) {
  const { usuario } = useAuth();

  return <>{roles.includes(usuario.rol) ? children : fallback}</>;
}
