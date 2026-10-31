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

// Carrito y cotización
export type Cotizacion = Esquemas["Cotizacion"];
export type CotizacionEntrada = Esquemas["CotizacionEntrada"];
export type ItemCotizado = Esquemas["ItemCotizado"];
export type AvisoCotizacion = Esquemas["AvisoCotizacion"];
export type MotivoAviso = AvisoCotizacion["motivo"];
export type ZonaEnvio = Esquemas["ZonaEnvio"];

// Pedidos y pago
export type PedidoEntrada = Esquemas["PedidoEntrada"];
export type PedidoCreado = Esquemas["PedidoCreado"];
export type PedidoPublico = Esquemas["PedidoPublico"];
export type PagoIniciado = Esquemas["PagoIniciado"];
export type EstadoPago = PedidoPublico["estadoPago"];
export type EstadoPedido = PedidoPublico["estadoPedido"];

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
export type CategoriaEntrada = Esquemas["CategoriaEntrada"];
export type CategoriaCambios = Esquemas["CategoriaCambios"];

// Pedidos del panel
export type PedidoAdminFila = Esquemas["PedidoAdminFila"];
export type PedidoAdminDetalle = Esquemas["PedidoAdminDetalle"];
export type PreparacionEntrada = Esquemas["PreparacionEntrada"];
export type PreparacionResultado = Esquemas["PreparacionResultado"];
export type CancelacionEntrada = Esquemas["CancelacionEntrada"];
export type CancelacionResultado = Esquemas["CancelacionResultado"];

/** Respuesta del listado público de productos. */
export type ListadoProductos = { datos: ProductoListado[]; meta: Meta };

/** Respuesta del listado de productos del panel. */
export type ListadoProductosAdmin = { datos: ProductoAdminFila[]; meta: Meta };

/** Respuesta del listado de pedidos del panel. */
export type ListadoPedidosAdmin = { datos: PedidoAdminFila[]; meta: Meta };

export type MedioPago = PedidoAdminFila["medioPago"];
export type MetodoEntrega = PedidoAdminFila["metodoEntrega"];
export type EventoPedido = PedidoAdminDetalle["eventos"][number];
export type * from "./error.types";
