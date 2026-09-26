import type { RespuestaError } from "@/types";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Error de una llamada a la API. Expone el código de dominio para mapearlo a
 * un mensaje con `obtenerMensajeError`; nunca se muestra `message` al usuario.
 */
export class ErrorApi extends Error {
  readonly codigo: string;
  readonly status: number;
  readonly details?: RespuestaError["details"];

  /**
   * @description Crea un error de API a partir del código de dominio.
   * @param codigo Código de dominio devuelto por la API, o uno propio del cliente.
   * @param status Estado HTTP. 0 cuando no hubo respuesta.
   * @param details Mensajes por campo, solo en DATOS_INVALIDOS.
   */
  constructor(codigo: string, status: number, details?: RespuestaError["details"]) {
    super(codigo);
    this.name = "ErrorApi";
    this.codigo = codigo;
    this.status = status;
    this.details = details;
  }
}

/**
 * @description Lee el cuerpo de una respuesta fallida y lo convierte en ErrorApi.
 * Si el cuerpo no respeta el contrato, devuelve ERROR_DESCONOCIDO.
 * @param respuesta Respuesta con estado no exitoso.
 * @returns El error tipado, listo para lanzar.
 */
const leerError = async (respuesta: Response): Promise<ErrorApi> => {
  try {
    const cuerpo = (await respuesta.json()) as Partial<RespuestaError>;

    if (typeof cuerpo.error === "string") {
      return new ErrorApi(cuerpo.error, respuesta.status, cuerpo.details);
    }
  } catch {
    // Cuerpo vacío o no JSON: cae al código genérico.
  }

  return new ErrorApi("ERROR_DESCONOCIDO", respuesta.status);
};

/**
 * @description Único punto de red del frontend. Antepone la base de la API,
 * envía la cookie de sesión y convierte las respuestas de error en ErrorApi.
 * No lee ni escribe tokens: la sesión viaja en la cookie httpOnly `velua_sesion`.
 * @param ruta Ruta relativa a la base, con barra inicial. Ej: "/productos".
 * @param opciones Opciones de fetch. Si hay body que no es FormData, se envía como JSON.
 * @returns El cuerpo de la respuesta ya parseado, o undefined si es 204.
 * @throws {ErrorApi} Si la API responde con error o no hay conexión.
 */
export const apiFetch = async <T>(ruta: string, opciones: RequestInit = {}): Promise<T> => {
  const headers = new Headers(opciones.headers);

  if (opciones.body && !(opciones.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers,
      credentials: "include",
    });
  } catch (causa) {
    // Una navegación cancelada no es un error de red: react-router la maneja.
    if (causa instanceof DOMException && causa.name === "AbortError") throw causa;
    throw new ErrorApi("ERROR_DE_RED", 0);
  }

  if (!respuesta.ok) throw await leerError(respuesta);

  if (respuesta.status === 204) return undefined as T;

  return (await respuesta.json()) as T;
};
