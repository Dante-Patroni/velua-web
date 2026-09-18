import { Outlet } from "react-router-dom";

/**
 * Layout base para las rutas del panel administrativo de Velua.
 */
export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Outlet />
      </main>
    </div>
  );
}