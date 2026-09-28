import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";

import {
  cambiarEstadoProducto,
  listarCategoriasAdmin,
  listarProductos,
  type FiltrosProductos,
} from "@/lib/api/catalogoAdmin.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { CategoriaAdmin, ListadoProductosAdmin } from "@/types";

/** Valores aceptados por el filtro de estado. */
const ESTADOS = ["todos", "activos", "inactivos"] as const;

/** Valores aceptados por el orden. */
const ORDENES = ["recientes", "nombre", "stock"] as const;

/** Productos por página en el panel. */
export const LIMITE = 20;

/** Lo que el loader deja disponible para la página. */
export type DatosProductos = {
  listado: ListadoProductosAdmin;
  categorias: CategoriaAdmin[];
  filtros: FiltrosProductos;
};

/** Lo que devuelve la action cuando algo falla. */
export type ErrorAccion = { codigo: string };

/**
 * @description Convierte los parámetros de la URL en filtros válidos para la API.
 *
 * Los filtros viven en la URL y no en el estado del componente: así el back
 * del navegador no los pierde, el link se puede compartir, y el loader puede
 * pedirle al backend exactamente la página que hace falta. El backend pagina,
 * así que filtrar sobre el resultado daría números de una sola página.
 *
 * @param parametros Parámetros de búsqueda de la URL.
 * @returns Filtros saneados, sin valores fuera de los aceptados.
 */
export function leerFiltros(parametros: URLSearchParams): FiltrosProductos {
  const pagina = Number(parametros.get("pagina"));
  const categoriaId = Number(parametros.get("categoriaId"));
  const estado = parametros.get("estado");
  const orden = parametros.get("orden");
  const q = parametros.get("q")?.trim();

  return {
    pagina: Number.isInteger(pagina) && pagina > 0 ? pagina : 1,
    limite: LIMITE,
    q: q || undefined,
    categoriaId: Number.isInteger(categoriaId) && categoriaId > 0 ? categoriaId : undefined,
    estado: ESTADOS.includes(estado as (typeof ESTADOS)[number])
      ? (estado as FiltrosProductos["estado"])
      : undefined,
    orden: ORDENES.includes(orden as (typeof ORDENES)[number])
      ? (orden as FiltrosProductos["orden"])
      : undefined,
  };
}

/**
 * @description Loader del listado. Pide los productos y las categorías en
 * paralelo: en cascada, el selector de categorías aparecería vacío un instante.
 * @param args Argumentos del loader de react-router.
 * @returns Listado, categorías y los filtros aplicados.
 */
export async function cargarProductos({ request }: LoaderFunctionArgs): Promise<DatosProductos> {
  const filtros = leerFiltros(new URL(request.url).searchParams);

  const [listado, categorias] = await Promise.all([
    listarProductos(filtros, request.signal),
    listarCategoriasAdmin(request.signal),
  ]);

  return { listado, categorias: categorias.datos, filtros };
}

/**
 * @description Action del listado. Publica o despublica un producto desde la
 * misma tabla, sin abrir la ficha.
 * @param args Argumentos de la action de react-router.
 * @returns El error para mostrar, o null si salió bien.
 */
export async function accionProductos({ request }: ActionFunctionArgs) {
  const datos = await request.formData();
  const id = Number(datos.get("id"));
  const activo = datos.get("activo") === "true";

  if (!Number.isInteger(id) || id <= 0) {
    return { codigo: "DATOS_INVALIDOS" } satisfies ErrorAccion;
  }

  try {
    await cambiarEstadoProducto(id, activo);
  } catch (error) {
    if (error instanceof ErrorApi) {
      return { codigo: error.codigo } satisfies ErrorAccion;
    }
    throw error;
  }

  return null;
}
