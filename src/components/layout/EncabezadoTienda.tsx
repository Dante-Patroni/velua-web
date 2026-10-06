import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Search, ShoppingBasket, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useCarrito } from "@/carrito/useCarrito";
import type { Categoria } from "@/types";
import { ENLACES_MENU_TIENDA, PROMESAS_TIENDA } from "@/lib/mappings";
import { cn } from "@/lib/utils";
import logo from "@/assets/Logo-velua.png";
import { FormBusqueda } from "./FormBusqueda";

const ID_MENU = "menu-tienda";
const ID_BUSQUEDA = "busqueda-tienda";

const claseEnlaceMenu = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-xs font-semibold tracking-[0.14em] uppercase text-tinta underline-offset-8 hover:text-dorado-texto",
    isActive && "underline decoration-dorado-hondo decoration-2",
  );

/**
 * @description Encabezado de la tienda: franja de promesas, logo, buscador,
 * canasta y menú de colecciones. En el teléfono el menú y el buscador van en
 * un panel desplegable; desde md, el menú queda a la vista.
 * @param props Las colecciones activas, ya ordenadas por el backend.
 * @returns El encabezado.
 */
export function EncabezadoTienda({ categorias }: { categorias: Categoria[] }) {
  const { unidades } = useCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);

  const enlaces = [
    ...categorias.map((categoria) => ({ ruta: `/${categoria.slug}`, texto: categoria.nombre })),
    ...ENLACES_MENU_TIENDA,
  ];
  const etiquetaCanasta =
    unidades === 0
      ? "Tu canasta, vacía"
      : `Tu canasta, ${unidades} ${unidades === 1 ? "producto" : "productos"}`;

  const cerrarPaneles = () => {
    setMenuAbierto(false);
    setBusquedaAbierta(false);
  };

  return (
    <header>
      <div className="bg-tinta px-4 py-2.5 text-crema-clara">
        <ul className="flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.12em] uppercase md:gap-4 md:text-xs">
          {PROMESAS_TIENDA.map((promesa, indice) => (
            // La del medio no entra a 390 px: se muestra desde md.
            <li key={promesa} className={cn("flex items-center gap-3 md:gap-4", indice === 1 && "hidden md:flex")}>
              {indice > 0 && (
                <span aria-hidden className="text-dorado">
                  •
                </span>
              )}
              {promesa}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-b border-borde-frio">
        <div className="mx-auto grid h-[70px] max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 md:h-[122px] md:px-8">
          <div>
            <Button
              variante="fantasma"
              tamano="icono"
              className="md:hidden"
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuAbierto}
              aria-controls={ID_MENU}
              onClick={() => setMenuAbierto((abierto) => !abierto)}
            >
              {menuAbierto ? (
                <X className="size-6" strokeWidth={1.5} aria-hidden />
              ) : (
                <Menu className="size-6" strokeWidth={1.5} aria-hidden />
              )}
            </Button>
            <Button
              variante="secundario"
              className="hidden rounded-sm text-xs font-semibold tracking-[0.12em] uppercase md:inline-flex"
              aria-expanded={busquedaAbierta}
              aria-controls={ID_BUSQUEDA}
              onClick={() => setBusquedaAbierta((abierta) => !abierta)}
            >
              <Search strokeWidth={1.5} aria-hidden />
              Buscar
            </Button>
          </div>

          <Link to="/" onClick={cerrarPaneles} className="flex justify-center">
            <img
              src={logo}
              alt="Velua, cosmética natural artesanal"
              width={867}
              height={434}
              className="h-11 w-auto md:h-[86px]"
            />
          </Link>

          <div className="flex justify-end">
            <Link
              to="/carrito"
              onClick={cerrarPaneles}
              aria-label={etiquetaCanasta}
              className="relative flex size-11 items-center justify-center rounded-sm text-tinta hover:bg-crema-calida md:border md:border-lavanda"
            >
              <ShoppingBasket className="size-6 md:size-5" strokeWidth={1.5} aria-hidden />
              {unidades > 0 && (
                <span
                  aria-hidden
                  className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-tinta px-1.5 text-[11px] font-bold text-crema-clara md:-top-2 md:-right-2"
                >
                  {unidades}
                </span>
              )}
            </Link>
          </div>
        </div>

        {busquedaAbierta && (
          <div id={ID_BUSQUEDA} className="hidden border-t border-borde-frio md:block">
            <div className="mx-auto max-w-xl px-4 py-4">
              <FormBusqueda alBuscar={cerrarPaneles} autoFocus />
            </div>
          </div>
        )}

        <nav aria-label="Colecciones" className="hidden border-t border-borde-frio md:block">
          <ul className="flex h-[58px] items-center justify-center gap-11">
            {enlaces.map(({ ruta, texto }) => (
              <li key={ruta}>
                <NavLink to={ruta} className={claseEnlaceMenu}>
                  {texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {menuAbierto && (
        <div id={ID_MENU} className="border-b border-borde bg-crema-clara md:hidden">
          <div className="px-4 pt-4">
            <FormBusqueda alBuscar={cerrarPaneles} />
          </div>
          <nav aria-label="Colecciones">
            <ul className="flex flex-col px-4 py-2">
              {enlaces.map(({ ruta, texto }) => (
                <li key={ruta} className="border-b border-borde last:border-b-0">
                  <NavLink
                    to={ruta}
                    onClick={cerrarPaneles}
                    className={(estado) => cn(claseEnlaceMenu(estado), "flex h-12 items-center")}
                  >
                    {texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
