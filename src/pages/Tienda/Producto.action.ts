import type { LoaderFunctionArgs } from "react-router-dom";

import { listarCategorias, obtenerProductoTienda } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { Categoria, ProductoDetalle } from "@/types";
import { buscarEnArbol } from "./Categoria.utils";

/** Lo que el loader deja disponible para la ficha. */
export type DatosProducto = {
  producto: ProductoDetalle;
  /** Padre de la colección del producto, para la miga de pan. */
  padre: Categoria | null;
};

/**
 * @description Loader de `/productos/:slug`. Pide la ficha y, en paralelo, el
 * árbol de categorías para saber el nombre del padre de la colección: el
 * producto solo trae `padreId`. Si el producto no existe o está despublicado
 * responde 404. Si falla el árbol, la miga sale sin el nivel intermedio: no
 * vale la pena perder la ficha por eso.
 * @param args Argumentos del loader de react-router.
 * @returns El producto y el padre de su colección.
 * @throws Response 404 si el producto no existe.
 */
export async function cargarProducto({ request, params }: LoaderFunctionArgs): Promise<DatosProducto> {
  const slug = params.slug ?? "";

  const arbol = listarCategorias(request.signal).then(
    ({ datos }) => datos,
    (error: unknown) => {
      if (error instanceof ErrorApi) return [];
      throw error;
    },
  );

  let producto: ProductoDetalle;
  try {
    producto = await obtenerProductoTienda(slug, request.signal);
  } catch (error) {
    if (error instanceof ErrorApi && error.status === 404) {
      throw new Response(null, { status: 404, statusText: "Not Found" });
    }
    throw error;
  }

  const padre = buscarEnArbol(await arbol, producto.categoria.slug)?.padre ?? null;

  return { producto, padre };
}
