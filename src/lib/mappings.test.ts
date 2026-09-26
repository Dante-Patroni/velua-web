import { describe, expect, it } from "vitest";

import { ErrorApi } from "./apiFetch";
import {
  MENSAJES_ERROR,
  MENSAJE_ERROR_POR_DEFECTO,
  mensajeDeError,
  obtenerMensajeError,
} from "./mappings";

// Lista de AGENTS.md §5.4. Se repite acá a propósito: si alguien borra un
// código del diccionario y del tipo a la vez, este test lo detecta.
const CODIGOS_DE_LA_API = [
  "DATOS_INVALIDOS", "JSON_INVALIDO", "NO_ENCONTRADO",
  "NO_AUTORIZADO", "TOKEN_INVALIDO", "TOKEN_EXPIRADO",
  "CREDENCIALES_INVALIDAS", "USUARIO_INACTIVO", "SIN_PERMISO",
  "CONFLICTO_DE_DATOS", "LIMITE_SUPERADO", "TRANSICION_INVALIDA",
  "PAGO_NO_APROBADO", "SEGUIMIENTO_REQUERIDO", "SIN_VARIANTES",
  "ULTIMA_VARIANTE_ACTIVA", "LIMITE_IMAGENES", "ARCHIVO_REQUERIDO",
  "TIPO_ARCHIVO_INVALIDO", "ARCHIVO_DEMASIADO_GRANDE", "ERROR_AL_SUBIR",
];

describe("obtenerMensajeError", () => {
  it.each(CODIGOS_DE_LA_API)("%s tiene mensaje propio en el contexto general", (codigo) => {
    const mensaje = obtenerMensajeError(codigo);

    expect(mensaje).not.toBe(MENSAJE_ERROR_POR_DEFECTO);
    expect(mensaje).not.toContain(codigo);
  });

  it("usa el mensaje del contexto cuando existe", () => {
    expect(obtenerMensajeError("CONFLICTO_DE_DATOS", "panel")).toBe(
      MENSAJES_ERROR.panel.CONFLICTO_DE_DATOS,
    );
    expect(obtenerMensajeError("CONFLICTO_DE_DATOS", "panel")).not.toBe(
      MENSAJES_ERROR.general.CONFLICTO_DE_DATOS,
    );
  });

  it("cae al contexto general si el contexto no define el código", () => {
    expect(obtenerMensajeError("SIN_PERMISO", "login")).toBe(MENSAJES_ERROR.general.SIN_PERMISO);
  });

  it("devuelve el mensaje por defecto para un código desconocido", () => {
    expect(obtenerMensajeError("CODIGO_QUE_LA_API_SUMO_AYER")).toBe(MENSAJE_ERROR_POR_DEFECTO);
    expect(obtenerMensajeError("CODIGO_QUE_LA_API_SUMO_AYER", "panel")).toBe(
      MENSAJE_ERROR_POR_DEFECTO,
    );
  });

  it.each(["constructor", "toString", "__proto__", ""])(
    "no devuelve propiedades del prototipo para %j",
    (codigo) => {
      expect(obtenerMensajeError(codigo)).toBe(MENSAJE_ERROR_POR_DEFECTO);
    },
  );
});

describe("mensajeDeError", () => {
  it("traduce un ErrorApi por su código y contexto", () => {
    const error = new ErrorApi("CREDENCIALES_INVALIDAS", 401);

    expect(mensajeDeError(error, "login")).toBe(MENSAJES_ERROR.general.CREDENCIALES_INVALIDAS);
  });

  it("no expone el mensaje de un Error cualquiera", () => {
    const error = new Error("Cannot read properties of undefined");

    expect(mensajeDeError(error)).toBe(MENSAJE_ERROR_POR_DEFECTO);
  });
});
