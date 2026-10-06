import { Link } from "react-router-dom";

import type { Categoria } from "@/types";
import {
  DEFENSA_CONSUMIDOR,
  ENLACES_AYUDA,
  ENLACES_LEGALES,
  INSTAGRAM,
  WHATSAPP_NUMERO,
} from "@/lib/mappings";
import { cn, enlaceWhatsApp } from "@/lib/utils";

const claseEnlace = "underline-offset-4 hover:underline";
const claseTituloColumna = "text-xs font-bold tracking-[0.14em] uppercase";

/**
 * @description Pie de la tienda: marca y redes, colecciones, ayuda y los
 * enlaces legales obligatorios (arrepentimiento y defensa del consumidor).
 * @param props Las colecciones activas, ya ordenadas por el backend.
 * @returns El pie.
 */
export function PieTienda({ categorias }: { categorias: Categoria[] }) {
  const whatsapp = enlaceWhatsApp(WHATSAPP_NUMERO);
  const anio = new Date().getFullYear();

  return (
    <footer className="bg-tinta text-crema-clara">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 md:px-8 md:pt-16">
        <div
          className={cn(
            "grid gap-10 border-b border-texto-tenue pb-10",
            // Sin colecciones (por ejemplo si /categorias falla), la grilla
            // pierde una columna en vez de dejar un hueco a la derecha.
            categorias.length > 0 ? "md:grid-cols-[1.4fr_1fr_1fr]" : "md:grid-cols-[1.4fr_1fr]",
          )}
        >
          <div className="flex flex-col gap-4">
            <p className="font-display text-4xl">veluá</p>
            <p className="text-sm">Cosmética natural artesanal. Río Cuarto, Córdoba.</p>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
                  Instagram {INSTAGRAM.handle}
                </a>
              </li>
              {whatsapp && (
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          {categorias.length > 0 && (
            <nav aria-labelledby="pie-catalogo">
              <p id="pie-catalogo" className={claseTituloColumna}>
                Catálogo
              </p>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                {categorias.map((categoria) => (
                  <li key={categoria.id}>
                    <Link to={`/${categoria.slug}`} className={claseEnlace}>
                      {categoria.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <nav aria-labelledby="pie-ayuda">
            <p id="pie-ayuda" className={claseTituloColumna}>
              Ayuda
            </p>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {ENLACES_AYUDA.map(({ ruta, texto }) => (
                <li key={ruta}>
                  <Link to={ruta} className={claseEnlace}>
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm md:flex-row md:items-start md:justify-between">
          <p className="shrink-0 whitespace-nowrap">© {anio} Velua · veluanature.com.ar</p>
          <nav aria-label="Legales">
            <ul className="flex flex-col gap-3 md:flex-row md:flex-wrap md:justify-end md:gap-x-6">
              {ENLACES_LEGALES.map(({ ruta, texto }, indice) => (
                <li key={ruta}>
                  <Link to={ruta} className={indice === 0 ? `${claseEnlace} font-bold` : claseEnlace}>
                    {texto}
                  </Link>
                </li>
              ))}
              <li>
                {DEFENSA_CONSUMIDOR.url ? (
                  <a
                    href={DEFENSA_CONSUMIDOR.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={claseEnlace}
                  >
                    {DEFENSA_CONSUMIDOR.texto}
                  </a>
                ) : (
                  DEFENSA_CONSUMIDOR.texto
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
