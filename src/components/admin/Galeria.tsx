import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  borrarImagen,
  actualizarAlt,
  MAXIMO_IMAGENES,
  reordenarImagenes,
  subirImagen,
  TIPOS_ACEPTADOS,
} from "@/lib/api/imagenes.api";
import { ErrorApi } from "@/lib/apiFetch";
import { obtenerMensajeError } from "@/lib/mappings";
import type { ImagenAdmin } from "@/types";
import { mover, validarArchivo } from "./Galeria.utils";

/**
 * @description Galería de fotos de un producto. Permite subir, reordenar,
 * describir y borrar.
 *
 * El estado vive acá y no en el loader porque cada operación devuelve la galería
 * completa: actualizar el estado con esa respuesta evita tener que recargar la
 * pantalla entera después de cada foto.
 *
 * @param props Datos del producto.
 * @param props.productoId Id del producto.
 * @param props.iniciales Imágenes que trajo el loader.
 * @returns La galería con sus controles.
 */
export function Galeria({
  productoId,
  iniciales,
}: {
  productoId: number;
  iniciales: ImagenAdmin[];
}) {
  const [imagenes, setImagenes] = useState(iniciales);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [encima, setEncima] = useState(false);
  const [arrastrada, setArrastrada] = useState<number | null>(null);
  const [confirmando, setConfirmando] = useState<number | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  /**
   * @description Traduce un error de la API a un mensaje para mostrar.
   * @param e Error capturado.
   * @returns Nada.
   */
  const mostrarError = (e: unknown) =>
    setError(
      e instanceof ErrorApi
        ? obtenerMensajeError(e.codigo, "panel")
        : "No se pudo completar la operación."
    );

  /**
   * @description Valida y sube los archivos elegidos, de a uno.
   * @param archivos Archivos del input o del arrastre.
   * @returns Nada.
   */
  const subir = async (archivos: FileList | null) => {
    if (!archivos?.length) return;
    setError(null);

    let actuales = imagenes;

    for (const archivo of Array.from(archivos)) {
      const validacion = validarArchivo(archivo, actuales.length);
      if (!validacion.valido) {
        setError(validacion.motivo);
        break;
      }

      setSubiendo(true);
      try {
        const { datos } = await subirImagen(productoId, archivo);
        actuales = datos;
        setImagenes(datos);
      } catch (e) {
        mostrarError(e);
        break;
      } finally {
        setSubiendo(false);
      }
    }

    if (entrada.current) entrada.current.value = "";
  };

  /**
   * @description Cambia una foto de posición. Actualiza la pantalla primero y
   * avisa al servidor después: si se esperara la respuesta, arrastrar tendría
   * medio segundo de retraso y se sentiría roto. Si el servidor falla, se
   * vuelve al orden anterior.
   * @param desde Posición actual.
   * @param hasta Posición destino.
   * @returns Nada.
   */
  const reordenar = async (desde: number, hasta: number) => {
    const anterior = imagenes;
    const nuevo = mover(imagenes, desde, hasta);
    if (nuevo === anterior) return;

    setImagenes(nuevo);
    setError(null);

    try {
      const { datos } = await reordenarImagenes(
        productoId,
        nuevo.map((i) => i.id)
      );
      setImagenes(datos);
    } catch (e) {
      setImagenes(anterior);
      mostrarError(e);
    }
  };

  /**
   * @description Borra una foto. La confirmación se hace en dos pasos dentro de
   * la tarjeta, igual que el borrado del producto: dos formas distintas de
   * confirmar en la misma pantalla confunden.
   * @param imagen Imagen a borrar.
   * @returns Nada.
   */
  const borrar = async (imagen: ImagenAdmin) => {
    setError(null);
    setConfirmando(null);

    try {
      const { datos } = await borrarImagen(productoId, imagen.id);
      setImagenes(datos);
    } catch (e) {
      mostrarError(e);
    }
  };

  /**
   * @description Guarda el texto alternativo de una foto cuando se sale del campo.
   * @param imagen Imagen a describir.
   * @param alt Texto nuevo.
   * @returns Nada.
   */
  const guardarAlt = async (imagen: ImagenAdmin, alt: string) => {
    if (alt.trim() === (imagen.alt ?? "")) return;

    try {
      const { datos } = await actualizarAlt(productoId, imagen.id, alt.trim() || null);
      setImagenes(datos);
    } catch (e) {
      mostrarError(e);
    }
  };

  const lleno = imagenes.length >= MAXIMO_IMAGENES;

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-lg border border-error px-4 py-3 text-sm text-error">
          {error}
        </p>
      )}

      {imagenes.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {imagenes.map((imagen, posicion) => (
            <li
              key={imagen.id}
              draggable
              onDragStart={() => setArrastrada(posicion)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (arrastrada !== null) reordenar(arrastrada, posicion);
                setArrastrada(null);
              }}
              onDragEnd={() => setArrastrada(null)}
              className={`overflow-hidden rounded-lg border bg-crema-clara ${
                arrastrada === posicion ? "border-dorado-hondo opacity-50" : "border-borde"
              }`}
            >
              <div className="relative aspect-square cursor-move">
                <img
                  src={imagen.url}
                  alt={imagen.alt ?? ""}
                  className="size-full object-cover"
                  loading="lazy"
                />
                {posicion === 0 && (
                  <span className="absolute top-2 left-2 rounded-sm bg-tinta px-2 py-1 text-xs font-bold text-crema">
                    PRINCIPAL
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 p-3">
                <Input
                  defaultValue={imagen.alt ?? ""}
                  placeholder="Describí la foto"
                  maxLength={200}
                  className="h-9 text-sm"
                  aria-label={`Descripción de la foto ${posicion + 1}`}
                  onBlur={(e) => guardarAlt(imagen, e.target.value)}
                />

                {confirmando === imagen.id ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-texto-suave">
                      ¿Borrar esta foto? No se puede deshacer.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => borrar(imagen)}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-sm bg-error text-sm text-crema"
                      >
                        <Trash2 aria-hidden className="size-4" />
                        Sí, borrar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmando(null)}
                        className="h-9 px-3 text-sm text-texto-suave hover:text-tinta"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => reordenar(posicion, posicion - 1)}
                        disabled={posicion === 0}
                        aria-label={`Mover la foto ${posicion + 1} hacia atrás`}
                        className="flex size-9 items-center justify-center rounded-sm text-tinta hover:bg-crema-calida disabled:opacity-30"
                      >
                        <ChevronLeft aria-hidden className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reordenar(posicion, posicion + 1)}
                        disabled={posicion === imagenes.length - 1}
                        aria-label={`Mover la foto ${posicion + 1} hacia adelante`}
                        className="flex size-9 items-center justify-center rounded-sm text-tinta hover:bg-crema-calida disabled:opacity-30"
                      >
                        <ChevronRight aria-hidden className="size-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmando(imagen.id)}
                      aria-label={`Borrar la foto ${posicion + 1}`}
                      className="flex size-9 items-center justify-center rounded-sm text-texto-suave hover:bg-crema-calida hover:text-error"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!lleno && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setEncima(true);
          }}
          onDragLeave={() => setEncima(false)}
          onDrop={(e) => {
            e.preventDefault();
            setEncima(false);
            subir(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center ${
            encima ? "border-dorado-hondo bg-crema-calida" : "border-lavanda"
          }`}
        >
          {subiendo ? (
            <>
              <Loader2 aria-hidden className="size-8 animate-spin text-tinta" />
              <p className="text-sm text-texto-suave">Subiendo…</p>
            </>
          ) : (
            <>
              <ImagePlus aria-hidden className="size-8 text-lavanda" />
              <div>
                <p className="text-sm text-texto-suave">
                  Arrastrá las fotos acá, o elegilas desde tu computadora
                </p>
                <p className="mt-1 text-xs text-texto-tenue">
                  JPG, PNG o WEBP, hasta 5 MB cada una. Quedan{" "}
                  {MAXIMO_IMAGENES - imagenes.length} de {MAXIMO_IMAGENES}.
                </p>
              </div>

              <input
                ref={entrada}
                type="file"
                accept={TIPOS_ACEPTADOS.join(",")}
                multiple
                className="hidden"
                onChange={(e) => subir(e.target.files)}
              />
              <Button
                type="button"
                onClick={() => entrada.current?.click()}
                className="w-auto"
              >
                Elegir fotos
              </Button>
            </>
          )}
        </div>
      )}

      <p className="text-sm text-texto-suave">
        La primera foto es la que se ve en el catálogo. Para cambiarla, arrastrá
        otra al primer lugar o usá las flechitas. La descripción es para quien no
        puede ver la imagen.
      </p>
    </div>
  );
}
