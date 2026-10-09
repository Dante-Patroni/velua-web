import { Fragment } from "react";
import { Link } from "react-router-dom";

import type { TramoMiga } from "@/pages/Tienda/Categoria.utils";

/**
 * @description Miga de pan de la tienda. Los tramos con ruta son enlaces; el
 * último es la página actual y se marca para los lectores de pantalla.
 * @param props Los tramos, en orden.
 * @returns La navegación.
 */
export function MigaDePan({ tramos }: { tramos: TramoMiga[] }) {
  return (
    <nav aria-label="Miga de pan">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-texto-tenue">
        {tramos.map(({ texto, ruta }, indice) => (
          <Fragment key={`${indice}-${texto}`}>
            {indice > 0 && (
              <li aria-hidden className="text-lavanda">
                ›
              </li>
            )}
            <li>
              {ruta ? (
                <Link to={ruta} className="underline-offset-4 hover:text-tinta hover:underline">
                  {texto}
                </Link>
              ) : (
                <span aria-current="page" className="text-tinta">
                  {texto}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
