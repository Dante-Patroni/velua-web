import { apiFetch } from "@/lib/apiFetch";
import type { CategoriaAdmin, ImagenAdmin } from "@/types";

/** Respuesta de todos los endpoints de imágenes: la galería completa. */
type Galeria = { datos: ImagenAdmin[] };

/** Tope de tamaño por archivo, en bytes. Lo mismo que acepta el backend. */
export const TOPE_BYTES = 5 * 1024 * 1024;

/** Formatos que acepta el backend. */
export const TIPOS_ACEPTADOS = ["image/jpeg", "image/png", "image/webp"];

/** Máximo de imágenes por producto, igual que en el backend. */
export const MAXIMO_IMAGENES = 8;

/**
 * @description Lista las imágenes de un producto, ordenadas. La primera es la
 * principal: es la que se ve en la grilla de la tienda.
 * @param productoId Id del producto.
 * @param signal Señal para cancelar la petición.
 * @returns La galería del producto.
 * @throws {ErrorApi} NO_ENCONTRADO si el producto no existe.
 */
export const listarImagenes = (
  productoId: number | string,
  signal?: AbortSignal,
) => apiFetch<Galeria>(`/admin/productos/${productoId}/imagenes`, { signal });

/**
 * @description Sube una imagen y la agrega al final de la galería.
 *
 * Va como multipart y no como JSON, con el archivo en el campo `imagen`.
 * `apiFetch` no fuerza el Content-Type cuando el cuerpo es un FormData: lo tiene
 * que armar el navegador, porque incluye el separador entre partes.
 *
 * @param productoId Id del producto.
 * @param archivo Archivo elegido.
 * @param alt Texto alternativo para accesibilidad.
 * @returns La galería actualizada.
 * @throws {ErrorApi} ARCHIVO_REQUERIDO, TIPO_ARCHIVO_INVALIDO,
 *   ARCHIVO_DEMASIADO_GRANDE, LIMITE_IMAGENES o ERROR_AL_SUBIR.
 */
export const subirImagen = (
  productoId: number | string,
  archivo: File,
  alt?: string,
) => {
  const cuerpo = new FormData();
  cuerpo.append("imagen", archivo);
  if (alt) cuerpo.append("alt", alt);

  return apiFetch<Galeria>(`/admin/productos/${productoId}/imagenes`, {
    method: "POST",
    body: cuerpo,
  });
};

/**
 * @description Cambia el texto alternativo de una imagen.
 * @param productoId Id del producto.
 * @param imagenId Id de la imagen.
 * @param alt Texto alternativo, o null para dejarlo vacío.
 * @returns La galería actualizada.
 * @throws {ErrorApi} NO_ENCONTRADO si la imagen no es de ese producto.
 */
export const actualizarAlt = (
  productoId: number | string,
  imagenId: number | string,
  alt: string | null,
) =>
  apiFetch<Galeria>(`/admin/productos/${productoId}/imagenes/${imagenId}`, {
    method: "PATCH",
    body: JSON.stringify({ alt }),
  });

/**
 * @description Borra una imagen del producto y del proveedor.
 * @param productoId Id del producto.
 * @param imagenId Id de la imagen.
 * @returns La galería sin esa imagen.
 * @throws {ErrorApi} NO_ENCONTRADO si la imagen no es de ese producto.
 */
export const borrarImagen = (
  productoId: number | string,
  imagenId: number | string,
) =>
  apiFetch<Galeria>(`/admin/productos/${productoId}/imagenes/${imagenId}`, {
    method: "DELETE",
  });

/**
 * @description Reordena la galería. Hay que mandar los ids de todas las
 * imágenes: un orden parcial dejaría dos en la misma posición y la principal
 * sería impredecible.
 * @param productoId Id del producto.
 * @param ids Ids de todas las imágenes, en el orden deseado.
 * @returns La galería en el orden nuevo.
 * @throws {ErrorApi} DATOS_INVALIDOS si la lista está incompleta.
 */
export const reordenarImagenes = (productoId: number | string, ids: number[]) =>
  apiFetch<Galeria>(`/admin/productos/${productoId}/imagenes/orden`, {
    method: "PUT",
    body: JSON.stringify({ ids }),
  });

/**
 * @description Sube o reemplaza la imagen de una colección. El backend borra la
 * anterior del proveedor después de guardar la nueva.
 * @param categoriaId Id de la colección.
 * @param archivo Archivo elegido.
 * @returns La colección con la imagen nueva.
 * @throws {ErrorApi} ARCHIVO_REQUERIDO, TIPO_ARCHIVO_INVALIDO,
 *   ARCHIVO_DEMASIADO_GRANDE, NO_ENCONTRADO o ERROR_AL_SUBIR.
 */
export const subirImagenCategoria = (
  categoriaId: number | string,
  archivo: File,
) => {
  const cuerpo = new FormData();
  cuerpo.append("imagen", archivo);

  return apiFetch<CategoriaAdmin>(`/admin/categorias/${categoriaId}/imagen`, {
    method: "POST",
    body: cuerpo,
  });
};

/**
 * @description Quita la imagen de una colección.
 * @param categoriaId Id de la colección.
 * @returns La colección sin imagen.
 * @throws {ErrorApi} NO_ENCONTRADO si la colección no existe.
 */
export const quitarImagenCategoria = (categoriaId: number | string) =>
  apiFetch<CategoriaAdmin>(`/admin/categorias/${categoriaId}/imagen`, {
    method: "DELETE",
  });
