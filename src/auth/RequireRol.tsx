import type { ReactNode } from "react";

import { useAuth } from "./useAuth";
import type { RolUsuario } from "./types";

interface RequireRolProps {
  roles: RolUsuario[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza sus hijos únicamente si el usuario posee uno de los roles indicados.
 */
export function RequireRol({
  roles,
  children,
  fallback = null,
}: RequireRolProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user || !roles.includes(user.rol)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}