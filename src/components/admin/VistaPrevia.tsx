import { ImageOff } from "lucide-react";
import { calcularDescuento, type DatosVistaPrevia } from "./VistaPrevia.utils";

import { formatearPrecio } from "@/lib/formato";


/**
 * @description Muestra cómo se va a ver el producto en la grilla de la tienda,
 * mientras se lo está cargando.
 *
 * Existe porque los productos no tienen fotos todavía: sin esto, quien carga un
 * producto no tiene forma de saber si el nombre entra bien o si la descripción
 * corta se corta a la mitad.
 *
 * @param props Datos que se van escribiendo en el formulario.
 * @param props.datos Nombre, descripción, precios, colección y stock.
 * @returns La tarjeta tal como la vería una clienta.
 */
export function VistaPrevia({ datos }: { datos: DatosVistaPrevia }) {
  const descuento = calcularDescuento(datos.precio, datos.precioAnterior);

  return (
    <aside className="lg:sticky lg:top-6">
      <p className="mb-3 text-xs tracking-widest text-etiqueta uppercase">
        Así se va a ver en la tienda
      </p>

      <article className="overflow-hidden rounded-lg border border-borde bg-crema-clara">
        <div className="relative flex aspect-square items-center justify-center bg-crema-calida">
          {datos.imagenUrl ? (
            <img
              src={datos.imagenUrl}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 text-texto-tenue">
              <ImageOff aria-hidden className="size-8" />
              <span className="text-xs tracking-wider uppercase">Foto pendiente</span>
            </span>
          )}

          {descuento !== null && (
            <span className="absolute top-3 left-3 rounded-sm bg-tinta px-3 py-1.5 text-xs font-bold text-crema">
              {descuento}% OFF
            </span>
          )}

          {!datos.hayStock && (
            <span className="absolute top-3 right-3 rounded-sm bg-tinta px-3 py-1.5 text-xs font-bold text-crema">
              SIN STOCK
            </span>
          )}
        </div>

        <div className="p-5">
          {datos.coleccion && (
            <p className="text-xs tracking-widest text-etiqueta uppercase">
              {datos.coleccion}
            </p>
          )}

          <h3 className="mt-2 font-display text-2xl font-semibold text-tinta">
            {datos.nombre || "Nombre del producto"}
          </h3>

          <p className="mt-2 min-h-10 text-sm leading-relaxed text-texto-suave">
            {datos.descripcionCorta || "La descripción corta aparece acá."}
          </p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold text-tinta">
              {formatearPrecio(datos.precio.replace(",", "."))}
            </span>
            {descuento !== null && (
              <span className="text-sm text-texto-tenue line-through">
                {formatearPrecio(datos.precioAnterior.replace(",", "."))}
              </span>
            )}
          </div>
        </div>
      </article>

      <p className="mt-3 text-xs leading-relaxed text-texto-tenue">
        La primera foto que cargues es la que se ve acá. Los textos largos, los
        ingredientes y el modo de uso aparecen en la ficha, no en la grilla.
      </p>
    </aside>
  );
}
