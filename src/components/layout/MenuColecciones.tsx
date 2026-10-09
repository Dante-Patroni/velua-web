import { useId, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ItemMenu } from "./MenuColecciones.utils";

const claseEnlaceMenu = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-xs font-semibold tracking-[0.14em] uppercase text-tinta underline-offset-8 hover:text-dorado-texto",
    isActive && "underline decoration-dorado-hondo decoration-2",
  );

const claseEnlaceHija = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-sm text-tinta underline-offset-4 hover:text-dorado-texto",
    isActive && "underline decoration-dorado-hondo decoration-2",
  );

type ItemProps = { item: ItemMenu };

/**
 * @description Flecha que abre y cierra las colecciones de una categoría. Es un
 * botón aparte del enlace: el nombre lleva a la página de la categoría y la
 * flecha despliega el menú, así no se pelean el clic y el toque.
 * @param props Estado, controles y nombre de la categoría.
 * @returns El botón con la flecha.
 */
function BotonDespliegue({
  abierto,
  controla,
  nombre,
  alAlternar,
  boton,
  className,
}: {
  abierto: boolean;
  controla: string;
  nombre: string;
  alAlternar: () => void;
  boton?: React.Ref<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <Button
      ref={boton}
      variante="fantasma"
      tamano="icono"
      className={className}
      aria-label={`Colecciones de ${nombre}`}
      aria-expanded={abierto}
      aria-controls={controla}
      onClick={alAlternar}
    >
      <ChevronDown
        className={cn("size-4 transition-transform", abierto && "rotate-180")}
        strokeWidth={1.5}
        aria-hidden
      />
    </Button>
  );
}

/**
 * @description Ítem del menú de escritorio. Sin hijas es un enlace directo; con
 * hijas suma un desplegable que abre al pasar el mouse o con la flecha, y
 * cierra al salir, con Escape, al perder el foco o al navegar. El toque en
 * pantallas táctiles no abre por hover: usa la flecha.
 * @param props El ítem.
 * @returns El elemento de la lista.
 */
function ItemEscritorio({ item }: ItemProps) {
  const { ruta, texto, hijas } = item;
  const [abierto, setAbierto] = useState(false);
  const botonRef = useRef<HTMLButtonElement>(null);
  const idPanel = useId();

  if (hijas.length === 0) {
    return (
      <li>
        <NavLink to={ruta} className={claseEnlaceMenu}>
          {texto}
        </NavLink>
      </li>
    );
  }

  return (
    <li
      className="relative flex h-full items-center"
      onPointerEnter={(evento) => evento.pointerType === "mouse" && setAbierto(true)}
      onPointerLeave={(evento) => evento.pointerType === "mouse" && setAbierto(false)}
      onBlur={(evento) => {
        if (!evento.currentTarget.contains(evento.relatedTarget)) setAbierto(false);
      }}
      onKeyDown={(evento) => {
        if (evento.key === "Escape" && abierto) {
          setAbierto(false);
          botonRef.current?.focus();
        }
      }}
    >
      <NavLink to={ruta} className={claseEnlaceMenu} onClick={() => setAbierto(false)}>
        {texto}
      </NavLink>
      <BotonDespliegue
        boton={botonRef}
        abierto={abierto}
        controla={idPanel}
        nombre={texto}
        alAlternar={() => setAbierto((valor) => !valor)}
        className="-ml-2 size-8"
      />

      {abierto && (
        <ul
          id={idPanel}
          className="absolute top-full left-1/2 z-30 flex min-w-60 -translate-x-1/2 flex-col gap-1 rounded-xl border border-borde bg-crema-clara p-3"
        >
          {hijas.map((hija) => (
            <li key={hija.ruta}>
              <NavLink
                to={hija.ruta}
                className={(estado) => cn(claseEnlaceHija(estado), "block rounded-lg px-3 py-2 hover:bg-crema-calida")}
                onClick={() => setAbierto(false)}
              >
                {hija.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * @description Ítem del menú del teléfono. Sin hijas es un enlace directo; con
 * hijas es un acordeón: el nombre lleva a la categoría y la flecha despliega
 * las colecciones debajo.
 * @param props El ítem y qué hacer al navegar (cerrar el menú).
 * @returns El elemento de la lista.
 */
function ItemMovil({ item, alNavegar }: ItemProps & { alNavegar: () => void }) {
  const { ruta, texto, hijas } = item;
  const [abierto, setAbierto] = useState(false);
  const idPanel = useId();

  return (
    <li className="border-b border-borde last:border-b-0">
      <div className="flex items-center">
        <NavLink
          to={ruta}
          onClick={alNavegar}
          className={(estado) => cn(claseEnlaceMenu(estado), "flex h-12 flex-1 items-center")}
        >
          {texto}
        </NavLink>
        {hijas.length > 0 && (
          <BotonDespliegue
            abierto={abierto}
            controla={idPanel}
            nombre={texto}
            alAlternar={() => setAbierto((valor) => !valor)}
          />
        )}
      </div>

      {abierto && hijas.length > 0 && (
        <ul id={idPanel} className="flex flex-col pb-2 pl-4">
          {hijas.map((hija) => (
            <li key={hija.ruta}>
              <NavLink
                to={hija.ruta}
                onClick={alNavegar}
                className={(estado) => cn(claseEnlaceHija(estado), "flex h-11 items-center")}
              >
                {hija.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * @description Menú de colecciones de escritorio: una fila de enlaces, con un
 * desplegable en las categorías que tienen colecciones.
 * @param props Los ítems del menú.
 * @returns La navegación.
 */
export function MenuEscritorio({ items }: { items: ItemMenu[] }) {
  return (
    <nav aria-label="Colecciones" className="hidden border-t border-borde-frio md:block">
      <ul className="flex h-[58px] items-center justify-center gap-11">
        {items.map((item) => (
          <ItemEscritorio key={item.ruta} item={item} />
        ))}
      </ul>
    </nav>
  );
}

/**
 * @description Menú de colecciones del teléfono, dentro del panel desplegable:
 * una lista vertical, con acordeón en las categorías que tienen colecciones.
 * @param props Los ítems del menú y qué hacer al navegar.
 * @returns La navegación.
 */
export function MenuMovil({ items, alNavegar }: { items: ItemMenu[]; alNavegar: () => void }) {
  return (
    <nav aria-label="Colecciones">
      <ul className="flex flex-col px-4 py-2">
        {items.map((item) => (
          <ItemMovil key={item.ruta} item={item} alNavegar={alNavegar} />
        ))}
      </ul>
    </nav>
  );
}
