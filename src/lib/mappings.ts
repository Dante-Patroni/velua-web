import { ErrorApi } from "@/lib/apiFetch";
import type { CodigoError, ContextoError } from "@/types";

type Enlace = { ruta: string; texto: string };

/** Columna de ayuda del pie de la tienda. */
export const ENLACES_AYUDA: readonly Enlace[] = [
  { ruta: "/la-marca", texto: "La marca" },
  { ruta: "/cambios", texto: "Cambios y devoluciones" },
];

/**
 * Enlaces legales del pie. El botón de arrepentimiento es obligatorio y va
 * primero, a la vista desde cualquier página.
 */
export const ENLACES_LEGALES: readonly Enlace[] = [
  { ruta: "/arrepentimiento", texto: "Botón de arrepentimiento" },
  { ruta: "/terminos", texto: "Términos y condiciones" },
  { ruta: "/privacidad", texto: "Política de privacidad" },
];

/** Navegación del panel. */
export const ENLACES_ADMIN: readonly Enlace[] = [
  { ruta: "/admin", texto: "Pedidos" },
  { ruta: "/admin/productos", texto: "Productos" },
  { ruta: "/admin/categorias", texto: "Categorías" },
];

/** Enlaces fijos del menú de la tienda, después de las colecciones. */
export const ENLACES_MENU_TIENDA: readonly Enlace[] = [
  { ruta: "/la-marca", texto: "La marca" },
];

/**
 * Promesas de la franja superior. Son de la marca y no cambian con la
 * configuración comercial: el umbral de envío gratis y el descuento por
 * transferencia vienen del backend y no se escriben acá.
 */
export const PROMESAS_TIENDA: readonly string[] = [
  "Elaboración en frío",
  "Ingredientes naturales",
  "Hecho a mano en Río Cuarto",
];

/** Cuenta de Instagram de la marca. El handle lleva punto. */
export const INSTAGRAM = {
  handle: "@velua.nature",
  url: "https://www.instagram.com/velua.nature/",
} as const;

/**
 * Número de WhatsApp de la marca, desde VITE_WHATSAPP. Vacío mientras no esté
 * configurado: en ese caso los enlaces a WhatsApp no se muestran.
 */
export const WHATSAPP_NUMERO = import.meta.env.VITE_WHATSAPP ?? "";

/**
 * Enlace obligatorio a la Ventanilla Federal de reclamos (Resolución 274/2021
 * de la Secretaría de Comercio Interior). El texto es el que exige la norma y
 * no se modifica. La URL es la que indica la página oficial del trámite en
 * argentina.gob.ar, y vive solo acá: si el organismo la cambia, se toca este
 * lugar.
 */
export const DEFENSA_CONSUMIDOR = {
  texto: "Defensa de las y los Consumidores. Para reclamos. Ingrese aquí",
  url: "https://autogestion.produccion.gob.ar/consumidores",
} as const;

/** Mensaje para un código que el frontend todavía no contempla. */
export const MENSAJE_ERROR_POR_DEFECTO =
  "Algo salió mal. Probá de nuevo en unos minutos.";

type DiccionarioErrores = Partial<Record<CodigoError, string>>;

/**
 * Mensajes legibles por código de dominio, agrupados por contexto. El mismo
 * código dice cosas distintas según dónde aparece.
 *
 * `general` está tipado como Record completo: si se agrega un código a
 * CodigoError y falta acá, la compilación rompe. Los demás contextos solo
 * sobrescriben lo que necesitan decir distinto.
 */
export const MENSAJES_ERROR: { general: Record<CodigoError, string> } & Record<
  Exclude<ContextoError, "general">,
  DiccionarioErrores
> = {
  general: {
    DATOS_INVALIDOS: "Revisá los datos marcados.",
    JSON_INVALIDO:
      "No pudimos procesar la información enviada. Probá de nuevo.",
    NO_ENCONTRADO: "No encontramos lo que buscabas.",
    NO_AUTORIZADO: "Tenés que iniciar sesión para continuar.",
    TOKEN_INVALIDO: "Tu sesión no es válida. Iniciá sesión de nuevo.",
    TOKEN_EXPIRADO: "Tu sesión venció. Iniciá sesión de nuevo.",
    CREDENCIALES_INVALIDAS: "El mail o la contraseña no son correctos.",
    USUARIO_INACTIVO: "Este usuario está desactivado.",
    SIN_PERMISO: "No tenés permiso para hacer esto.",
    CONFLICTO_DE_DATOS: "Ya existe un registro con esos datos.",
    LIMITE_SUPERADO:
      "Hiciste demasiados intentos. Esperá unos minutos y volvé a probar.",
    TRANSICION_INVALIDA: "Ese cambio de estado no está permitido.",
    CATEGORIA_PADRE_INVALIDA: "Esa ubicación no es válida para la categoría.",
    CATEGORIA_CON_HIJAS: "La categoría agrupa otras y no se puede mover.",
    CATEGORIA_CON_PRODUCTOS:
      "La categoría tiene productos y no puede agrupar otras.",
    PRODUCTO_CON_VENTAS: "El producto tiene ventas y no se puede borrar.",
    PAGO_NO_APROBADO: "El pago no fue aprobado.",
    SEGUIMIENTO_REQUERIDO: "Falta cargar el código de seguimiento del envío.",
    SIN_VARIANTES: "El producto necesita al menos una variante.",
    ULTIMA_VARIANTE_ACTIVA:
      "No podés desactivar la última variante activa del producto.",
    LIMITE_IMAGENES: "El producto ya tiene el máximo de imágenes permitido.",
    ARCHIVO_REQUERIDO: "Elegí un archivo para subir.",
    TIPO_ARCHIVO_INVALIDO: "La imagen tiene que ser JPG, PNG o WebP.",
    ARCHIVO_DEMASIADO_GRANDE: "La imagen supera los 5 MB.",
    ERROR_AL_SUBIR: "No pudimos subir la imagen. Probá de nuevo.",
    ERROR_DE_RED:
      "No pudimos conectarnos. Revisá tu conexión y probá de nuevo.",
    ERROR_DESCONOCIDO: MENSAJE_ERROR_POR_DEFECTO,
  },
  tienda: {
    NO_ENCONTRADO:
      "No encontramos lo que buscabas. Puede que ya no esté disponible.",
  },
  login: {
    DATOS_INVALIDOS: "Completá el mail y la contraseña.",
    LIMITE_SUPERADO:
      "Demasiados intentos de ingreso. Esperá unos minutos y volvé a probar.",
    NO_AUTORIZADO: "Tu sesión terminó. Ingresá de nuevo.",
    TOKEN_INVALIDO: "Tu sesión terminó. Ingresá de nuevo.",
    TOKEN_EXPIRADO: "Tu sesión venció. Ingresá de nuevo.",
  },
  panel: {
    CONFLICTO_DE_DATOS: "Ese slug ya está en uso. Elegí otro.",
    NO_ENCONTRADO: "Ese registro ya no existe. Puede que lo hayan eliminado.",
    CATEGORIA_PADRE_INVALIDA:
      "Esa colección no puede ir ahí. Solo se puede poner dentro de una categoría del primer nivel.",
    CATEGORIA_CON_HIJAS:
      "Esta categoría agrupa otras colecciones, así que tiene que quedar en el primer nivel.",
    CATEGORIA_CON_PRODUCTOS:
      "Esa categoría tiene productos, así que no puede agrupar colecciones. Mové sus productos a otra antes.",
    PRODUCTO_CON_VENTAS:
      "Este producto ya se vendió, así que no se puede borrar. Despublicalo para que no aparezca en la tienda.",
  },
};

/**
 * @description Devuelve el mensaje legible para un código de dominio. Busca
 * primero en el contexto, después en `general`, y si el código no existe
 * devuelve el mensaje por defecto. Nunca devuelve el código crudo.
 * @param codigo Código recibido de la API. Puede ser uno que el frontend no conoce.
 * @param contexto Pantalla o flujo donde se muestra. Por defecto, `general`.
 * @returns El texto para mostrar al usuario.
 */
export const obtenerMensajeError = (
  codigo: string,
  contexto: ContextoError = "general",
): string => {
  return (
    buscarMensaje(MENSAJES_ERROR[contexto], codigo) ??
    buscarMensaje(MENSAJES_ERROR.general, codigo) ??
    MENSAJE_ERROR_POR_DEFECTO
  );
};

// hasOwn evita que un código como "constructor" devuelva algo del prototipo.
const buscarMensaje = (diccionario: DiccionarioErrores, codigo: string) =>
  Object.hasOwn(diccionario, codigo)
    ? diccionario[codigo as CodigoError]
    : undefined;

/**
 * @description Devuelve el mensaje legible para cualquier error capturado.
 * Solo los ErrorApi tienen código; el resto cae al mensaje por defecto.
 * @param error Lo que llegó al catch o al error boundary.
 * @param contexto Pantalla o flujo donde se muestra.
 * @returns El texto para mostrar al usuario.
 */
export const mensajeDeError = (
  error: unknown,
  contexto: ContextoError = "general",
): string =>
  error instanceof ErrorApi
    ? obtenerMensajeError(error.codigo, contexto)
    : MENSAJE_ERROR_POR_DEFECTO;
