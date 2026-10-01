import type { components } from "./api.generated";

type Esquemas = components["schemas"];

// Alias de los tipos generados desde el OpenAPI. No se redefinen a mano.
export type Usuario = Esquemas["Usuario"];
export type RolUsuario = Usuario["rol"];
export type RespuestaError = Esquemas["Error"];

// Catálogo público
export type ProductoListado = Esquemas["ProductoListado"];
export type ProductoDetalle = Esquemas["ProductoDetalle"];
export type Categoria = Esquemas["Categoria"];
export type Variante = Esquemas["Variante"];
export type Imagen = Esquemas["Imagen"];
export type Meta = Esquemas["Meta"];

// Catálogo del panel
export type ProductoAdminFila = Esquemas["ProductoAdminFila"];
export type ProductoAdmin = Esquemas["ProductoAdmin"];
export type VarianteAdmin = Esquemas["VarianteAdmin"];
export type ImagenAdmin = Esquemas["ImagenAdmin"];
export type CategoriaAdmin = Esquemas["CategoriaAdmin"];
export type ProductoEntrada = Esquemas["ProductoEntrada"];
export type ProductoCambios = Esquemas["ProductoCambios"];
export type VarianteEntrada = Esquemas["VarianteEntrada"];
export type VarianteCambios = Esquemas["VarianteCambios"];


/** Respuesta del listado de productos del panel. */
export type ListadoProductosAdmin = { datos: ProductoAdminFila[]; meta: Meta };

export type * from "./error.types";
