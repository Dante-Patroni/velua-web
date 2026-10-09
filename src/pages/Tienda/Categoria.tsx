import { useLoaderData } from "react-router-dom";

import { MigaDePan } from "@/components/tienda/MigaDePan";
import { GrillaProductos } from "@/components/tienda/GrillaProductos";
import { TarjetaColeccion } from "@/components/tienda/TarjetaColeccion";
import { TexturaBotanica } from "@/components/tienda/TexturaBotanica";
import { srcsetCloudinary, urlCloudinary } from "@/lib/utils";
import type { cargarCategoria } from "./Categoria.action";
import { tramosMiga } from "./Categoria.utils";

/** Ancho de la imagen del encabezado, a densidad normal. */
const ANCHO_ENCABEZADO = 1200;

/**
 * @description Página de `/:categoria`. Con el mismo encabezado (miga de pan,
 * nombre, descripción e imagen) resuelve dos casos: una categoría con hijas
 * muestra la grilla de colecciones; una colección muestra sus productos,
 * paginados, o un aviso amable si todavía no tiene.
 * @returns La página de la categoría.
 */
export function Categoria() {
  const datos = useLoaderData<typeof cargarCategoria>();
  const { categoria, padre } = datos;
  const { nombre, descripcion, imagenUrl } = categoria;

  return (
    <>
      <title>{`${nombre} · Veluá`}</title>
      {descripcion && <meta name="description" content={descripcion} />}

      <section className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
        <MigaDePan tramos={tramosMiga(categoria, padre)} />

        <h1 className="mt-5 text-5xl leading-[0.98] font-medium text-tinta md:text-6xl">{nombre}</h1>
        {descripcion && (
          <p className="mt-4 max-w-2xl font-display text-xl leading-relaxed text-texto-suave italic md:text-2xl">
            {descripcion}
          </p>
        )}

        {/* Es lo primero visible bajo el título: se carga sin esperar. */}
        {imagenUrl ? (
          <img
            src={urlCloudinary(imagenUrl, ANCHO_ENCABEZADO)}
            srcSet={srcsetCloudinary(imagenUrl, ANCHO_ENCABEZADO)}
            alt=""
            width={ANCHO_ENCABEZADO}
            height={400}
            fetchPriority="high"
            className="mt-8 aspect-[16/7] w-full rounded-2xl object-cover md:aspect-[16/5]"
          />
        ) : (
          <TexturaBotanica className="mt-8 aspect-[16/7] w-full rounded-2xl md:aspect-[16/5]" />
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        {datos.tipo === "hijas" ? (
          <ul className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {datos.hijas.map((hija) => (
              <li key={hija.id} className="flex">
                <TarjetaColeccion categoria={hija} />
              </li>
            ))}
          </ul>
        ) : (
          <GrillaProductos
            productos={datos.productos}
            meta={datos.meta}
            mensajeVacio="Estamos preparando esta colección. Volvé a visitarnos en unos días."
          />
        )}
      </section>
    </>
  );
}
