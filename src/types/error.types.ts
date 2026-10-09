/**
 * Códigos de dominio que la API ya devuelve. El contrato declara `error` como
 * string libre, así que esta lista es la referencia del frontend: si la API
 * suma uno nuevo, se muestra el mensaje por defecto hasta agregarlo acá.
 */
export type CodigoErrorApi =
  | "DATOS_INVALIDOS"
  | "JSON_INVALIDO"
  | "NO_ENCONTRADO"
  | "NO_AUTORIZADO"
  | "TOKEN_INVALIDO"
  | "TOKEN_EXPIRADO"
  | "CREDENCIALES_INVALIDAS"
  | "USUARIO_INACTIVO"
  | "SIN_PERMISO"
  | "CONFLICTO_DE_DATOS"
  | "LIMITE_SUPERADO"
  | "TRANSICION_INVALIDA"
  | "PAGO_NO_APROBADO"
  | "SEGUIMIENTO_REQUERIDO"
  | "SIN_VARIANTES"
  | "ULTIMA_VARIANTE_ACTIVA"
  | "LIMITE_IMAGENES"
  | "ARCHIVO_REQUERIDO"
  | "TIPO_ARCHIVO_INVALIDO"
  | "ARCHIVO_DEMASIADO_GRANDE"
  | "ERROR_AL_SUBIR"
  | "CATEGORIA_PADRE_INVALIDA"
  | "CATEGORIA_CON_HIJAS"
  | "CATEGORIA_CON_PRODUCTOS"
  | "PRODUCTO_CON_VENTAS";

/**
 * Códigos propios del frontend, para fallas que no traen respuesta de la API:
 * sin conexión, o una respuesta de error sin el cuerpo del contrato (un 502
 * del proxy, por ejemplo). No existen en el backend.
 */
export type CodigoErrorCliente = "ERROR_DE_RED" | "ERROR_DESCONOCIDO";

export type CodigoError = CodigoErrorApi | CodigoErrorCliente;

/** Pantalla o flujo donde se muestra el error. Define el tono del mensaje. */
export type ContextoError = "general" | "tienda" | "login" | "panel";
