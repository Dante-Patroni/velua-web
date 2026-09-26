import { Link, Outlet } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import { ENLACES_PIE, INSTAGRAM } from "@/lib/mappings";

/**
 * @description Layout de la tienda pública: encabezado con marca y carrito,
 * contenido y pie. Mobile first.
 * @returns El layout con el Outlet de la ruta hija.
 */
export function TiendaLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-crema">
      <header className="border-b border-borde-frio">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="font-display text-3xl font-medium text-tinta">
            Velua
          </Link>
          <Link
            to="/carrito"
            aria-label="Carrito"
            className="flex size-11 items-center justify-center rounded-full text-tinta hover:bg-crema-calida"
          >
            <ShoppingBag className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-tinta text-crema-clara">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:justify-between">
          <nav aria-label="Información">
            <ul className="flex flex-col gap-3 text-sm">
              {ENLACES_PIE.map(({ ruta, texto }) => (
                <li key={ruta}>
                  <Link to={ruta} className="underline-offset-4 hover:underline">
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={INSTAGRAM.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline-offset-4 hover:underline"
          >
            {INSTAGRAM.handle}
          </a>
        </div>
      </footer>
    </div>
  );
}
