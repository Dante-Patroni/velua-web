import { useState } from "react";

import { Button } from "@/components/ui/Button";
import type { Imagen } from "@/types";
import { cn, srcsetCloudinary, urlCloudinary } from "@/lib/utils";
import { TexturaBotanica } from "./TexturaBotanica";

/** Ancho de la foto principal, a densidad normal. */
const ANCHO_PRINCIPAL = 800;
/** Ancho de las miniaturas, a densidad normal. */
const ANCHO_MINIATURA = 120;

type GaleriaProductoProps = {
  imagenes: Imagen[];
  nombre: string;
};

/**
 * @description Galería de la ficha: la foto principal y, si hay más de una,
 * miniaturas para cambiarla. La primera foto carga sin esperar porque es lo
 * primero visible; las miniaturas, de forma diferida. Un producto sin fotos
 * muestra la textura botánica con su nombre: es un estado normal del catálogo.
 * @param props Las imágenes del producto, en orden, y su nombre.
 * @returns La galería.
 */
export function GaleriaProducto({ imagenes, nombre }: GaleriaProductoProps) {
  const [indice, setIndice] = useState(0);

  if (imagenes.length === 0) {
    return (
      <TexturaBotanica className="flex aspect-square w-full items-end justify-center rounded-2xl p-6">
        <span className="rounded-full bg-crema-clara/90 px-5 py-2 text-center font-display text-xl text-tinta">
          {nombre}
        </span>
      </TexturaBotanica>
    );
  }

  const actual = imagenes[indice] ?? imagenes[0];

  return (
    <div className="flex flex-col gap-3">
      <img
        // Con la key, al cambiar de foto no se ve un instante la anterior.
        key={actual.url}
        src={urlCloudinary(actual.url, ANCHO_PRINCIPAL)}
        srcSet={srcsetCloudinary(actual.url, ANCHO_PRINCIPAL)}
        alt={actual.alt || nombre}
        width={ANCHO_PRINCIPAL}
        height={ANCHO_PRINCIPAL}
        fetchPriority={indice === 0 ? "high" : undefined}
        className="aspect-square w-full rounded-2xl border border-borde object-cover"
      />

      {imagenes.length > 1 && (
        <ul className="flex flex-wrap gap-2">
          {imagenes.map((imagen, posicion) => (
            <li key={imagen.url}>
              <Button
                variante="fantasma"
                tamano="icono"
                className={cn(
                  "size-16 overflow-hidden rounded-lg border p-0",
                  posicion === indice ? "border-lavanda" : "border-borde opacity-70 hover:opacity-100",
                )}
                aria-label={`Ver foto ${posicion + 1} de ${imagenes.length}`}
                aria-pressed={posicion === indice}
                onClick={() => setIndice(posicion)}
              >
                <img
                  src={urlCloudinary(imagen.url, ANCHO_MINIATURA)}
                  srcSet={srcsetCloudinary(imagen.url, ANCHO_MINIATURA)}
                  alt=""
                  width={ANCHO_MINIATURA}
                  height={ANCHO_MINIATURA}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
