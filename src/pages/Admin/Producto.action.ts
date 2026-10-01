import { redirect } from "react-router-dom";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";

import {
  actualizarProducto,
  actualizarVariante,
  agregarVariante,
  borrarProducto,
  cambiarEstadoProducto,
  cambiarEstadoVariante,
  crearProducto,
  listarCategoriasAdmin,
  obtenerProducto,
} from "@/lib/api/catalogoAdmin.api";
import { ErrorApi } from "@/lib/apiFetch";
import type {
  CategoriaAdmin,
  ProductoAdmin,
  ProductoCambios,
  VarianteEntrada,
} from "@/types";

/** Lo que el loader deja disponible para la ficha. */
export type DatosFicha = {
  /** Null cuando se está creando un producto nuevo. */
  producto: ProductoAdmin | null;
  categorias: CategoriaAdmin[];
};

/** Lo que devuelve la action cuando algo falla. */
export type ErrorFicha = {
  codigo: string;
  details?: Record<string, string>;
  /** Qué formulario falló, para mostrar el error donde corresponde. */
  intencion: string;
};

/**
 * @description Loader de la ficha. Sirve a las dos rutas: `/nuevo`, donde no hay
 * producto que traer, y `/:id`, donde se pide el producto y las categorías en
 * paralelo para que la pantalla aparezca completa.
 * @param args Argumentos del loader de react-router.
 * @returns El producto, o null si es uno nuevo, más las categorías.
 */
export async function cargarFicha({
  params,
  request,
}: LoaderFunctionArgs): Promise<DatosFicha> {
  const categorias = listarCategoriasAdmin(request.signal);

  if (!params.id) {
    return { producto: null, categorias: (await categorias).datos };
  }

  const [producto, listaCategorias] = await Promise.all([
    obtenerProducto(params.id, request.signal),
    categorias,
  ]);

  return { producto, categorias: listaCategorias.datos };
}

/**
 * @description Lee un texto del formulario, devolviendo undefined si vino vacío.
 * Un campo vacío no es lo mismo que un campo sin enviar: el backend solo
 * modifica los campos que llegan.
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
 * @description Arma una variante a partir de los campos del formulario.
 *
 * El precio viaja como texto, tal como se escribió: el backend acepta coma o
 * punto y normaliza a dos decimales. Convertirlo a número acá sería
 * exactamente lo que la regla del proyecto prohíbe.
 *
 * @param datos Datos del formulario.
 * @param prefijo Prefijo de los campos, para las variantes de la creación.
 * @returns La variante lista para enviar.
 */
export function leerVariante(datos: FormData, prefijo = ""): VarianteEntrada {
  const campo = (nombre: string) => texto(datos, `${prefijo}${nombre}`);
  const stock = campo("stock");

  return {
    nombre: campo("nombre") ?? "",
    sku: campo("sku") ?? null,
    precio: campo("precio") ?? "",
    precioAnterior: campo("precioAnterior") ?? null,
    stock: stock === undefined ? 0 : Number(stock),
    pesoGramos: campo("pesoGramos") === undefined ? null : Number(campo("pesoGramos")),
  };
}

/**
 * @description Arma el producto nuevo a partir del formulario de creación,
 * incluidas todas sus variantes.
 *
 * Las variantes llegan numeradas: `variantes.0.nombre`, `variantes.1.nombre` y
 * así. Se recorren los índices presentes en vez de asumir que son correlativos,
 * porque si se agregan tres y se quita la del medio, los índices quedan con
 * huecos.
 *
 * @param datos Datos del formulario.
 * @returns El producto con sus variantes, listo para enviar.
 */
export function leerProductoNuevo(datos: FormData) {
  const indices = [
    ...new Set(
      [...datos.keys()]
        .map((clave) => clave.match(/^variantes\.(\d+)\./)?.[1])
        .filter((i): i is string => i !== undefined)
    ),
  ];

  return {
    categoriaId: Number(datos.get("categoriaId")),
    nombre: texto(datos, "nombre") ?? "",
    slug: texto(datos, "slug") ?? null,
    descripcionCorta: texto(datos, "descripcionCorta") ?? null,
    descripcion: texto(datos, "descripcion") ?? null,
    ingredientes: texto(datos, "ingredientes") ?? null,
    modoUso: texto(datos, "modoUso") ?? null,
    destacado: datos.get("destacado") === "true",
    variantes: indices.map((i) => leerVariante(datos, `variantes.${i}.`)),
  };
}

/**
 * @description Arma los cambios del producto a partir del formulario de edición.
 * Solo se envían los campos presentes: el backend deja sin tocar los que no llegan.
 * @param datos Datos del formulario.
 * @returns Los campos a modificar.
 */
export function leerCambiosProducto(datos: FormData): ProductoCambios {
  const cambios: ProductoCambios = {};

  if (datos.has("categoriaId")) cambios.categoriaId = Number(datos.get("categoriaId"));
  if (datos.has("nombre")) cambios.nombre = texto(datos, "nombre") ?? "";
  if (datos.has("slug")) cambios.slug = texto(datos, "slug") ?? null;
  if (datos.has("descripcionCorta"))
    cambios.descripcionCorta = texto(datos, "descripcionCorta") ?? null;
  if (datos.has("descripcion")) cambios.descripcion = texto(datos, "descripcion") ?? null;
  if (datos.has("ingredientes")) cambios.ingredientes = texto(datos, "ingredientes") ?? null;
  if (datos.has("modoUso")) cambios.modoUso = texto(datos, "modoUso") ?? null;
  if (datos.has("destacado")) cambios.destacado = datos.get("destacado") === "true";

  return cambios;
}

/**
 * @description Action de la ficha. React Router permite una sola action por
 * ruta, pero esta pantalla tiene siete operaciones: cada formulario manda un
 * campo oculto `intencion` y acá se despacha según ese valor.
 * @param args Argumentos de la action de react-router.
 * @returns Un redirect al crear o borrar, el error si algo falla, o null si salió bien.
 */
export async function accionFicha({ params, request }: ActionFunctionArgs) {
  const datos = await request.formData();
  const intencion = String(datos.get("intencion") ?? "");
  const productoId = params.id;

  try {
    switch (intencion) {
      case "crear": {
        const creado = await crearProducto(leerProductoNuevo(datos));
        return redirect(`/admin/productos/${creado.id}?creado=1`);
      }

      case "guardar":
        await actualizarProducto(productoId!, leerCambiosProducto(datos));
        return null;

      case "estado-producto":
        await cambiarEstadoProducto(Number(productoId), datos.get("activo") === "true");
        return null;

      case "borrar":
        await borrarProducto(productoId!);
        return redirect("/admin/productos?borrado=1");

      case "agregar-variante":
        await agregarVariante(productoId!, leerVariante(datos));
        return null;

      case "guardar-variante":
        await actualizarVariante(productoId!, String(datos.get("varianteId")), {
          nombre: texto(datos, "nombre"),
          sku: texto(datos, "sku") ?? null,
          precio: texto(datos, "precio"),
          precioAnterior: texto(datos, "precioAnterior") ?? null,
          stock: datos.has("stock") ? Number(datos.get("stock")) : undefined,
        });
        return null;

      case "estado-variante":
        await cambiarEstadoVariante(
          productoId!,
          String(datos.get("varianteId")),
          datos.get("activa") === "true"
        );
        return null;

      default:
        return { codigo: "DATOS_INVALIDOS", intencion } satisfies ErrorFicha;
    }
  } catch (error) {
    if (error instanceof ErrorApi) {
      return { codigo: error.codigo, details: error.details, intencion } satisfies ErrorFicha;
    }
    throw error;
  }
}
