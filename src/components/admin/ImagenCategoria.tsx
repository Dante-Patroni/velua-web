import { useRef, useState, type ChangeEvent } from "react";
import { useFetcher } from "react-router-dom";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { validarArchivo } from "@/components/admin/Galeria.utils";
import { TIPOS_ACEPTADOS } from "@/lib/api/imagenes.api";
import { obtenerMensajeError } from "@/lib/mappings";
import type { CategoriaAdmin } from "@/types";
import type { ErrorCategorias } from "@/pages/Admin/Categorias.action";

/**
 * @description Imagen de una colección: la muestra y permite subirla,
 * cambiarla o quitarla.
 *
 * Una colección tiene una sola imagen, así que no hace falta la galería de los
 * productos: elegir un archivo lo sube enseguida y reemplaza al anterior. El
 * backend borra la imagen vieja del proveedor.
 *
 * @param props Datos de la colección.
 * @param props.categoria Colección a editar.
 * @returns El recuadro con la imagen y sus botones.
 */
export function ImagenCategoria({ categoria }: { categoria: CategoriaAdmin }) {
  const fetcher = useFetcher();
  const entrada = useRef<HTMLInputElement>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const trabajando = fetcher.state !== "idle";
  const enCurso = fetcher.formData?.get("intencion");
  const error = fetcher.data as ErrorCategorias | undefined;

  /**
   * @description Valida el archivo elegido y, si sirve, lo manda.
   * @param evento Cambio del selector de archivos.
   * @returns Nada.
   */
  const alElegir = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    // Sin esto, elegir de nuevo el mismo archivo no dispara el evento
    evento.target.value = "";
    if (!archivo) return;

    // Una colección tiene una sola imagen: el tope de cantidad no aplica
    const validacion = validarArchivo(archivo, 0);
    if (!validacion.valido) {
      setAviso(validacion.motivo);
      return;
    }
    setAviso(null);

    const datos = new FormData();
    datos.append("intencion", "subir-imagen");
    datos.append("id", String(categoria.id));
    datos.append("imagen", archivo);
    fetcher.submit(datos, { method: "post", encType: "multipart/form-data" });
  };

  /**
   * @description Quita la imagen, después de la confirmación.
   * @returns Nada.
   */
  const quitar = () => {
    setConfirmando(false);
    fetcher.submit(
      { intencion: "quitar-imagen", id: String(categoria.id) },
      { method: "post" },
    );
  };

  return (
    <div className="flex flex-col gap-3 border-t border-borde pt-4">
      <p className="text-sm font-medium text-tinta">Imagen de la colección</p>

      <div className="flex flex-wrap items-start gap-4">
        <div className="aspect-[3/2] w-48 overflow-hidden rounded-md border border-borde bg-crema-calida">
          {categoria.imagenUrl ? (
            <img
              src={categoria.imagenUrl}
              alt={`Imagen actual de ${categoria.nombre}`}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center p-3 text-center text-xs text-texto-tenue">
              Sin imagen: la tienda muestra la ilustración
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <input
            ref={entrada}
            id={`imagen-${categoria.id}`}
            type="file"
            accept={TIPOS_ACEPTADOS.join(",")}
            onChange={alElegir}
            className="sr-only"
            tabIndex={-1}
          />
          <Button
            type="button"
            onClick={() => entrada.current?.click()}
            disabled={trabajando}
            className="w-auto"
          >
            <ImagePlus aria-hidden className="size-4" />
            {enCurso === "subir-imagen"
              ? "Subiendo…"
              : categoria.imagenUrl
                ? "Cambiar imagen"
                : "Subir imagen"}
          </Button>

          {categoria.imagenUrl &&
            (confirmando ? (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-texto-suave">¿Quitar la imagen?</span>
                <button
                  type="button"
                  onClick={quitar}
                  disabled={trabajando}
                  className="text-error underline-offset-4 hover:underline"
                >
                  Sí, quitar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmando(false)}
                  className="text-texto-suave hover:text-tinta"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                disabled={trabajando}
                className="text-sm text-dorado-texto underline-offset-4 hover:underline"
              >
                {enCurso === "quitar-imagen" ? "Quitando…" : "Quitar imagen"}
              </button>
            ))}
        </div>
      </div>

      <p className="text-xs text-texto-tenue">
        Horizontal, de al menos 1200 px de ancho. JPG, PNG o WEBP, hasta 5 MB.
      </p>

      {aviso && (
        <p role="alert" className="text-sm text-error">
          {aviso}
        </p>
      )}
      {error && !trabajando && (
        <p role="alert" className="text-sm text-error">
          {obtenerMensajeError(error.codigo, "panel")}
        </p>
      )}
    </div>
  );
}
