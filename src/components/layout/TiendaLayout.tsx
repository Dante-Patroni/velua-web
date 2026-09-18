import { Outlet } from "react-router-dom";

/**
 * Layout base para las rutas públicas de la tienda Velua.
 */
export function TiendaLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}