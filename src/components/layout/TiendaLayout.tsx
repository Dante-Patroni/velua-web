import { Outlet, useLoaderData } from "react-router-dom";

import { CarritoProvider } from "@/carrito/CarritoContext";
import type { cargarTiendaLayout } from "./TiendaLayout.action";
import { EncabezadoTienda } from "./EncabezadoTienda";
import { PieTienda } from "./PieTienda";

/**
 * @description Layout de la tienda pública: encabezado, contenido y pie. El
 * CarritoProvider vive acá y no en main.tsx, así el panel no carga nada de la
 * canasta. Mobile first.
 * @returns El layout con el Outlet de la ruta hija.
 */
export function TiendaLayout() {
  const { categorias } = useLoaderData<typeof cargarTiendaLayout>();

  return (
    <CarritoProvider>
      <div className="flex min-h-dvh flex-col bg-crema">
        <EncabezadoTienda categorias={categorias} />

        <main className="flex-1">
          <Outlet />
        </main>

        <PieTienda categorias={categorias} />
      </div>
    </CarritoProvider>
  );
}
