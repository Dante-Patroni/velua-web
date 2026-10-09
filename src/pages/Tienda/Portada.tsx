import { Link, useLoaderData, useRouteLoaderData } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { TarjetaProducto } from "@/components/tienda/TarjetaProducto";
import { TarjetaColeccion } from "@/components/tienda/TarjetaColeccion";
import { cn } from "@/lib/utils";
import { ID_RUTA_TIENDA, type cargarTiendaLayout } from "@/components/layout/TiendaLayout.action";
import type { cargarPortada } from "./Portada.action";
import ilustracion from "@/assets/ilustracion-calendulas.webp";

/** Lo que propone Velua a quien la elige. Texto de la marca. */
const PROMESAS = [
  {
    titulo: "Tu rutina, un ritual de cuidado",
    texto:
      "Transformá tu rutina en un ritual de cuidado. Descubrí texturas y aromas que invitan a hacer una pausa y dedicarte un momento cada día.",
  },
  {
    titulo: "Elegí lo que toca tu piel",
    texto:
      "Aceites, mantecas e ingredientes de origen natural, seleccionados para crear una experiencia de cuidado especial.",
  },
  {
    titulo: "Cuidarte también es elegir",
    texto:
      "Volvé a lo esencial: valorá la elaboración artesanal y los pequeños gestos que ayudan a cuidar nuestro entorno.",
  },
] as const;

const claseEyebrow = "text-xs font-bold tracking-[0.18em] text-etiqueta uppercase";

/**
 * @description Portada de la tienda: encabezado con la frase de la marca,
 * colecciones, destacados y lo que hace distintos a los jabones. Las
 * colecciones salen del loader del layout, sin pedirlas de nuevo.
 * @returns La portada.
 */
export function Portada() {
  const { destacados } = useLoaderData<typeof cargarPortada>();
  const categorias = useRouteLoaderData<typeof cargarTiendaLayout>(ID_RUTA_TIENDA)?.categorias ?? [];

  return (
    <>
      <section className="relative">
        <img
          src={ilustracion}
          alt=""
          width={1600}
          height={1600}
          fetchPriority="high"
          className="h-[300px] w-full object-cover md:absolute md:inset-0 md:h-full"
        />
        {/* El degradado mantiene el texto legible sea cual sea la imagen de fondo. */}
        <div
          aria-hidden
          className="absolute inset-0 hidden bg-linear-to-r from-crema from-0% via-crema/95 via-45% to-crema/0 to-80% md:block"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-8 md:flex md:min-h-[600px] md:items-center md:px-8">
          <div className="flex max-w-xl flex-col gap-5 md:gap-6">
            <p className={claseEyebrow}>Cosmética natural · Río Cuarto</p>
            <h1 className="text-5xl leading-[0.98] font-medium text-tinta md:text-7xl">
              La piel <em className="font-medium text-dorado-texto">recuerda</em> lo que toca
            </h1>
            <p className="max-w-lg font-display text-xl leading-relaxed text-texto-suave italic md:text-2xl">
              Hay belleza en los pequeños rituales: en el agua, en los aromas, en la pausa de un
              instante propio. En Veluá nos inspira que tu cuidado cotidiano sea un encuentro con lo
              esencial.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <Button nativeButton={false} render={<Link to="/catalogo" />} className="h-13 px-9">
                Ver el catálogo
              </Button>
              <Link
                to="/la-marca"
                className="text-sm font-bold tracking-[0.12em] text-dorado-texto uppercase underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta"
              >
                Nuestra historia
              </Link>
            </div>
          </div>
        </div>
      </section>

      {categorias.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14 md:px-8 md:pt-24">
          <h2 className="text-4xl font-medium text-tinta md:text-5xl">Colecciones</h2>
          <ul
            className={cn(
              "mt-8 grid gap-5 md:grid-cols-2 md:gap-6",
              categorias.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4",
            )}
          >
            {categorias.map((categoria) => (
              <li key={categoria.id} className="flex">
                <TarjetaColeccion categoria={categoria} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {destacados.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-14 md:px-8 md:pt-24">
          <h2 className="text-4xl font-medium text-tinta md:text-5xl">Destacados</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {destacados.map((producto) => (
              <li key={producto.id} className="flex">
                <TarjetaProducto producto={producto} mostrarCategoria mostrarDestacado={false} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-24">
        <ul className="grid gap-8 border-t border-borde pt-10 md:grid-cols-3 md:gap-12">
          {PROMESAS.map(({ titulo, texto }) => (
            <li key={titulo} className="flex flex-col gap-2">
              <h2 className="text-2xl font-medium text-tinta">{titulo}</h2>
              <p className="text-texto-suave">{texto}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
