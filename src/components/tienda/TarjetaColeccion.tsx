import { Link } from "react-router-dom";

import type { Categoria } from "@/types";
import { srcsetCloudinary, urlCloudinary } from "@/lib/utils";
import { TexturaBotanica } from "./TexturaBotanica";

/** Ancho de la imagen de una colección, a densidad normal. */
const ANCHO_COLECCION = 600;

/**
 * @description Tarjeta de una colección: su imagen, o la textura botánica si
 * todavía no tiene, con el nombre y la descripción. Enlaza a `/<slug>`: las
 * URLs son planas, también para las colecciones que cuelgan de un padre.
 * @param props La categoría.
 * @returns El enlace a la colección.
 */
export function TarjetaColeccion({ categoria }: { categoria: Categoria }) {
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
