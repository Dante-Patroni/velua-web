import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { obtenerUsuarioActual } from "./authService";
import { AuthContext, type AuthContextValue } from "./useAuth";
import type { AuthUser } from "./types";

/**
 * Mantiene el estado global de la sesión administrativa.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let activo = true;

    obtenerUsuarioActual()
      .then((usuario) => {
        if (activo) {
          setUser(usuario);
        }
      })
      .catch(() => {
        if (activo) {
          setUser(null);
        }
      })
      .finally(() => {
        if (activo) {
          setIsLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
    }),
    [user, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}