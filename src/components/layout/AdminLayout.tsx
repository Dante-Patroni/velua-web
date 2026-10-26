import { Form, NavLink, Outlet, ScrollRestoration, useLoaderData, useNavigation } from "react-router-dom";
import { LogOut } from "lucide-react";

import { AuthProvider } from "@/auth/AuthContext";
import type { authLoader } from "@/auth/authService";
import { Button } from "@/components/ui/Button";
import { ENLACES_ADMIN } from "@/lib/mappings";
import { cn } from "@/lib/utils";

/** Ruta de la action que cierra la sesión. */
const RUTA_SALIR = "/admin/salir";

/**
 * @description Layout del panel. Recibe el usuario del authLoader y lo expone
 * con AuthProvider. En el teléfono la navegación va arriba; desde md, al costado.
 * "Cerrar sesión" va junto al nombre y no en el menú: el menú se desplaza de
 * costado en el teléfono, y una salida que no se ve es una sesión que queda abierta.
 * @returns El layout con el Outlet de la sección.
 */
export function AdminLayout() {
  const usuario = useLoaderData<typeof authLoader>();
  const navegacion = useNavigation();
  const saliendo = navegacion.state === "submitting" && navegacion.formAction === RUTA_SALIR;

  return (
    <AuthProvider usuario={usuario}>
      <div className="flex min-h-dvh flex-col bg-crema md:flex-row">
        <aside className="border-b border-borde bg-crema-clara md:w-56 md:border-r md:border-b-0">
          <div className="flex items-center justify-between gap-3 px-4 pt-4 md:block md:py-6">
            <div className="min-w-0">
              <p className="font-display text-2xl font-medium text-tinta">Velua</p>
              <p className="truncate text-sm text-texto-tenue">{usuario.nombre}</p>
            </div>
            <Form method="post" action={RUTA_SALIR} replace className="md:mt-4">
              <Button type="submit" variante="fantasma" tamano="chico" disabled={saliendo}>
                <LogOut aria-hidden className="size-4" />
                Cerrar sesión
              </Button>
            </Form>
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

        <ScrollRestoration />
      </div>
    </AuthProvider>
  );
}