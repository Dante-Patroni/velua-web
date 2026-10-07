import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import {
  quitarImagenCategoria,
  subirImagenCategoria,
} from "@/lib/api/imagenes.api";

import {
  actualizarCategoria,
  cambiarEstadoCategoria,
  crearCategoria,
  listarCategoriasAdmin,
  reordenarCategorias,
} from "@/lib/api/catalogoAdmin.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { CategoriaAdmin, CategoriaCambios } from "@/types";

/** Lo que el loader deja disponible para la pantalla. */
export type DatosCategorias = { categorias: CategoriaAdmin[] };

/** Lo que devuelve la action cuando algo falla. */
export type ErrorCategorias = {
  codigo: string;
  details?: Record<string, string>;
  intencion: string;
  /** Id de la categoría que falló, para mostrar el error en su fila. */
  id?: number;
};

/**
 * @description Loader de la pantalla. Trae todas las categorías, incluidas las
 * despublicadas, con la cantidad de productos activos de cada una.
 * @param args Argumentos del loader de react-router.
 * @returns Las categorías ordenadas por su posición en el menú.
 */
export async function cargarCategorias({
  request,
}: LoaderFunctionArgs): Promise<DatosCategorias> {
  const { datos } = await listarCategoriasAdmin(request.signal);
  return { categorias: datos };
}

/**
 * @description Lee un texto del formulario, devolviendo undefined si vino vacío.
 * @param datos Datos del formulario.
 * @param nombre Nombre del campo.
 * @returns El texto recortado, o undefined si está vacío.
 */
const texto = (datos: FormData, nombre: string): string | undefined => {
  const valor = datos.get(nombre);
  if (valor === null) return undefined;
  const limpio = String(valor).trim();
  return limpio === "" ? undefined : limpio;
};

/**
 * @description Arma los cambios de una categoría a partir del formulario.
 * Solo se envían los campos presentes: el backend deja sin tocar los que no
 * llegan, así que mandar todo pisaría datos que no se editaron.
 * @param datos Datos del formulario.
 * @returns Los campos a modificar.
 */
export function leerCambiosCategoria(datos: FormData): CategoriaCambios {
  const cambios: CategoriaCambios = {};

  if (datos.has("nombre")) cambios.nombre = texto(datos, "nombre") ?? "";
  if (datos.has("descripcion"))
    cambios.descripcion = texto(datos, "descripcion") ?? null;
  if (datos.has("slug")) cambios.slug = texto(datos, "slug") ?? null;

  return cambios;
}

/**
 * @description Action de la pantalla. Como en la ficha de producto, cada
 * formulario manda un campo oculto `intencion` y acá se despacha según su valor.
 * @param args Argumentos de la action de react-router.
 * @returns El error si algo falla, o null si salió bien.
 */
export async function accionCategorias({ request }: ActionFunctionArgs) {
  const datos = await request.formData();
  const intencion = String(datos.get("intencion") ?? "");
  const id = datos.has("id") ? Number(datos.get("id")) : undefined;

  try {
    switch (intencion) {
      case "crear":
        await crearCategoria({
          nombre: texto(datos, "nombre") ?? "",
          descripcion: texto(datos, "descripcion") ?? null,
        });
        return null;

      case "guardar":
        await actualizarCategoria(id!, leerCambiosCategoria(datos));
        return null;

      case "estado":
        await cambiarEstadoCategoria(id!, datos.get("activa") === "true");
        return null;

      case "orden": {
        const ids = String(datos.get("ids") ?? "")
          .split(",")
          .map(Number)
          .filter((n) => Number.isInteger(n) && n > 0);
        await reordenarCategorias(ids);
        return null;
      }

      case "subir-imagen": {
        const archivo = datos.get("imagen");
        if (!(archivo instanceof File) || archivo.size === 0) {
          return {
            codigo: "ARCHIVO_REQUERIDO",
            intencion,
            id,
          } satisfies ErrorCategorias;
        }
        await subirImagenCategoria(id!, archivo);
        return null;
      }

      case "quitar-imagen":
        await quitarImagenCategoria(id!);
        return null;

      default:
        return {
          codigo: "DATOS_INVALIDOS",
          intencion,
        } satisfies ErrorCategorias;
    }
  } catch (error) {
    if (error instanceof ErrorApi) {
      return {
        codigo: error.codigo,
        details: error.details,
        intencion,
        id,
      } satisfies ErrorCategorias;
    }
    throw error;
  }
}
