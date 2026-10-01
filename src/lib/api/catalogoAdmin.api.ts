import { apiFetch } from "@/lib/apiFetch";
import type {
  CategoriaAdmin,
  ListadoProductosAdmin,
  ProductoAdmin,
  ProductoCambios,
  ProductoEntrada,
  VarianteCambios,
  VarianteEntrada,

} from "@/types";

/** Filtros del listado de productos del panel. */
export type FiltrosProductos = {
  pagina?: number;
  limite?: number;
  q?: string;
  categoriaId?: number;
  estado?: "todos" | "activos" | "inactivos";
  orden?: "recientes" | "nombre" | "stock";
};

/**
 * @description Arma la cadena de consulta descartando los valores vacíos, para
 * que la URL no se llene de parámetros sin valor.
 * @param filtros Filtros a enviar.
 * @returns La cadena de consulta, con `?` adelante, o vacía si no hay filtros.
 */
const aConsulta = (filtros: FiltrosProductos): string => {
  const parametros = new URLSearchParams();

  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      parametros.set(clave, String(valor));
    }
  }

  const cadena = parametros.toString();
  return cadena ? `?${cadena}` : "";
};

/**
 * @description Lista los productos del panel, incluidos los despublicados.
 * El backend pagina y filtra: acá no se filtra nada sobre el resultado.
 * @param filtros Filtros y paginación.
 * @param signal Señal para cancelar la petición si la navegación cambia.
 * @returns Los productos de la página pedida y el total del catálogo filtrado.
 * @throws {ErrorApi} Con status 401 si no hay sesión.
 */
export const listarProductos = (filtros: FiltrosProductos = {}, signal?: AbortSignal) =>
  apiFetch<ListadoProductosAdmin>(`/admin/productos${aConsulta(filtros)}`, { signal });

/**
 * @description Obtiene la ficha completa de un producto, con todas sus variantes
 * e imágenes.
 * @param id Id del producto.
 * @param signal Señal para cancelar la petición.
 * @returns El producto con sus variantes e imágenes.
 * @throws {ErrorApi} NO_ENCONTRADO si no existe.
 */
export const obtenerProducto = (id: number | string, signal?: AbortSignal) =>
  apiFetch<ProductoAdmin>(`/admin/productos/${id}`, { signal });

/**
 * @description Publica o despublica un producto.
 * @param id Id del producto.
 * @param activo Estado nuevo.
 * @returns El producto con su estado nuevo.
 * @throws {ErrorApi} NO_ENCONTRADO si no existe.
 */
export const cambiarEstadoProducto = (id: number, activo: boolean) =>
  apiFetch<ProductoAdmin>(`/admin/productos/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });

/**
 * @description Lista las categorías del panel, con la cantidad de productos
 * activos de cada una.
 * @param signal Señal para cancelar la petición.
 * @returns Las categorías, activas e inactivas.
 * @throws {ErrorApi} Con status 401 si no hay sesión.
 */
export const listarCategoriasAdmin = (signal?: AbortSignal) =>
  apiFetch<{ datos: CategoriaAdmin[] }>("/admin/categorias", { signal });

/**
 * @description Borra un producto que nunca se vendió, con sus variantes e
 * imágenes.
 * @param id Id del producto.
 * @returns Nada.
 * @throws {ErrorApi} NO_ENCONTRADO, o PRODUCTO_CON_VENTAS si alguna variante
 *   figura en un pedido: en ese caso hay que despublicarlo, no borrarlo.
 */
export const borrarProducto = (id: number | string) =>
  apiFetch<void>(`/admin/productos/${id}`, { method: "DELETE" });
 
/**
 * @description Agrega una variante a un producto existente.
 * @param productoId Id del producto.
 * @param datos Datos de la variante.
 * @returns El producto con la variante agregada.
 * @throws {ErrorApi} DATOS_INVALIDOS, o CONFLICTO_DE_DATOS si el SKU ya existe.
 */
export const agregarVariante = (productoId: number | string, datos: VarianteEntrada) =>
  apiFetch<ProductoAdmin>(`/admin/productos/${productoId}/variantes`, {
    method: "POST",
    body: JSON.stringify(datos),
  });
 
/**
 * @description Edita una variante. Si se cambia el precio anterior sin cambiar
 * el precio, el backend lo valida contra el que ya tiene guardado.
 * @param productoId Id del producto.
 * @param varianteId Id de la variante.
 * @param cambios Solo los campos que se modifican.
 * @returns El producto con la variante actualizada.
 * @throws {ErrorApi} NO_ENCONTRADO si la variante no es de ese producto, DATOS_INVALIDOS o CONFLICTO_DE_DATOS.
 */
export const actualizarVariante = (
  productoId: number | string,
  varianteId: number | string,
  cambios: VarianteCambios
) =>
  apiFetch<ProductoAdmin>(`/admin/productos/${productoId}/variantes/${varianteId}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });
 
/**
 * @description Activa o desactiva una variante. No se borran nunca: los pedidos
 * históricos las referencian.
 * @param productoId Id del producto.
 * @param varianteId Id de la variante.
 * @param activa Estado nuevo.
 * @returns El producto con la variante actualizada.
 * @throws {ErrorApi} NO_ENCONTRADO, o ULTIMA_VARIANTE_ACTIVA si es la única
 *   activa: quedaría un producto visible que no se puede comprar.
 */
export const cambiarEstadoVariante = (
  productoId: number | string,
  varianteId: number | string,
  activa: boolean
) =>
  apiFetch<ProductoAdmin>(
    `/admin/productos/${productoId}/variantes/${varianteId}/estado`,
    { method: "PATCH", body: JSON.stringify({ activa }) }
  );

  /**
 * @description Crea un producto con todas sus variantes en una sola operación.
 * El backend las guarda juntas en una transacción: el esquema no admite un
 * producto sin variantes, así que no se pueden crear por separado.
 * @param datos Producto y sus variantes.
 * @returns El producto creado, con su ficha completa.
 * @throws {ErrorApi} DATOS_INVALIDOS, SIN_VARIANTES o CONFLICTO_DE_DATOS si el slug está tomado.
 */
export const crearProducto = (datos: ProductoEntrada) =>
  apiFetch<ProductoAdmin>("/admin/productos", {
    method: "POST",
    body: JSON.stringify(datos),
  });

  /**
 * @description Edita los datos de un producto. No toca las variantes: cada una
 * tiene sus propios endpoints.
 * @param id Id del producto.
 * @param cambios Solo los campos que se modifican.
 * @returns El producto actualizado.
 * @throws {ErrorApi} NO_ENCONTRADO, DATOS_INVALIDOS o CONFLICTO_DE_DATOS.
 */
export const actualizarProducto = (id: number | string, cambios: ProductoCambios) =>
  apiFetch<ProductoAdmin>(`/admin/productos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });