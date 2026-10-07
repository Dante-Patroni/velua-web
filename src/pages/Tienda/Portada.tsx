import { Link, useLoaderData, useRouteLoaderData } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { TarjetaProducto } from "@/components/tienda/TarjetaProducto";
import { TexturaBotanica } from "@/components/tienda/TexturaBotanica";
import type { Categoria } from "@/types";
import { cn, srcsetCloudinary, urlCloudinary } from "@/lib/utils";
import { ID_RUTA_TIENDA, type cargarTiendaLayout } from "@/components/layout/TiendaLayout.action";
import type { cargarPortada } from "./Portada.action";
import ilustracion from "@/assets/ilustracion-calendulas.webp";

/** Ancho de la imagen de una colección, a densidad normal. */
const ANCHO_COLECCION = 600;

/** Lo que distingue a los jabones de Velua. Texto de la marca, del diseño. */
const PROMESAS = [
  {
    titulo: "Elaboración en frío",
    texto: "El método conserva la glicerina natural, que es lo que deja la piel suave en vez de tirante.",
  },
  {
    titulo: "Seis semanas de curado",
    texto: "La barra pierde agua y se endurece. Dura bastante más que un jabón industrial.",
  },
  {
    titulo: "Ninguna igual a otra",
    texto: "Las vetas y los matices salen distintos en cada tanda. Es la marca de lo hecho a mano.",
  },
] as const;

const claseEyebrow = "text-xs font-bold tracking-[0.18em] text-etiqueta uppercase";

/**
 * @description Tarjeta de una colección: su imagen, o la textura botánica si
 * todavía no tiene, con el nombre y la descripción.
 * @param props La categoría.
 * @returns El enlace a la colección.
 */
function TarjetaColeccion({ categoria }: { categoria: Categoria }) {
  const { nombre, slug, descripcion, imagenUrl } = categoria;

  return (
    <Link
      to={`/${slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-borde bg-crema-clara"
    >
      {imagenUrl ? (
        <img
          src={urlCloudinary(imagenUrl, ANCHO_COLECCION)}
          srcSet={srcsetCloudinary(imagenUrl, ANCHO_COLECCION)}
          alt=""
          width={ANCHO_COLECCION}
          height={400}
          loading="lazy"
          className="aspect-[3/2] w-full object-cover"
        />
      ) : (
        <TexturaBotanica className="aspect-[3/2] w-full" />
      )}
      <div className="flex flex-col gap-2 p-5">
        <h3 className="font-display text-2xl font-medium text-tinta group-hover:text-dorado-texto">
          {nombre}
        </h3>
        {descripcion && <p className="text-sm text-texto-suave">{descripcion}</p>}
      </div>
    </Link>
  );
}

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
          className="absolute inset-0 hidden bg-linear-to-r from-crema from-0% via-crema/90 via-35% to-crema/0 to-75% md:block"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-8 md:flex md:min-h-[600px] md:items-center md:px-8">
          <div className="flex max-w-xl flex-col gap-5 md:gap-6">
            <p className={claseEyebrow}>Elaboración en frío · Río Cuarto</p>
            <h1 className="text-5xl leading-[0.98] font-medium text-tinta md:text-7xl">
              La piel <em className="font-medium text-dorado-texto">recuerda</em> lo que toca
            </h1>
            <p className="max-w-md font-display text-lg leading-relaxed text-texto-suave italic md:text-xl">
              Jabones de proceso en frío, con ingredientes botánicos seleccionados. Cada pieza, única.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <Button nativeButton={false} render={<a href="#colecciones" />} className="h-13 px-9">
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
        <section id="colecciones" className="mx-auto max-w-6xl scroll-mt-4 px-4 pt-14 md:px-8 md:pt-24">
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
                <TarjetaProducto producto={producto} mostrarCategoria />
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
