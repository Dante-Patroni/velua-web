import { NavLink, Outlet, useLoaderData } from "react-router-dom";

import { AuthProvider } from "@/auth/AuthContext";
import type { authLoader } from "@/auth/authService";
import { ENLACES_ADMIN } from "@/lib/mappings";
import { cn } from "@/lib/utils";

/**
 * @description Layout del panel. Recibe el usuario del authLoader y lo expone
 * con AuthProvider. En el teléfono la navegación va arriba; desde md, al costado.
 * @returns El layout con el Outlet de la sección.
 */
export function AdminLayout() {
  const usuario = useLoaderData<typeof authLoader>();

  return (
    <AuthProvider usuario={usuario}>
      <div className="flex min-h-dvh flex-col bg-crema md:flex-row">
        <aside className="border-b border-borde bg-crema-clara md:w-56 md:border-r md:border-b-0">
          <div className="px-4 pt-4 md:py-6">
            <p className="font-display text-2xl font-medium text-tinta">Velua</p>
            <p className="text-sm text-texto-tenue">{usuario.nombre}</p>
          </div>
          <nav aria-label="Panel" className="overflow-x-auto">
            <ul className="flex gap-1 px-2 py-2 md:flex-col md:px-2">
              {ENLACES_ADMIN.map(({ ruta, texto }) => (
                <li key={ruta}>
                  <NavLink
                    to={ruta}
                    end
                    className={({ isActive }) =>
                      cn(
                        "flex h-11 items-center rounded-lg px-3 text-sm whitespace-nowrap text-tinta hover:bg-crema-calida",
                        isActive && "bg-crema-calida font-medium",
                      )
                    }
                  >
                    {texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </AuthProvider>
  );
}
