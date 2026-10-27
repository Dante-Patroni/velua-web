import { describe, expect, it } from "vitest";

import { ErrorApi } from "./apiFetch";
import {
  ETIQUETAS_ESTADO_PEDIDO,
  MENSAJES_AVISO,
  MENSAJES_ERROR,
  TEXTOS_ESTADO_PAGO,
  MENSAJE_ERROR_POR_DEFECTO,
  mensajeDeError,
  obtenerMensajeError,
  AYUDA_OLVIDE_CONTRASENA,
} from "./mappings";

// Lista de códigos de la API (OpenAPI y errorMapper.js). Se repite acá a propósito: si alguien borra un
// código del diccionario y del tipo a la vez, este test lo detecta.
const CODIGOS_DE_LA_API = [
  "DATOS_INVALIDOS", "JSON_INVALIDO", "NO_ENCONTRADO",
  "NO_AUTORIZADO", "TOKEN_INVALIDO", "TOKEN_EXPIRADO",
  "CREDENCIALES_INVALIDAS", "USUARIO_INACTIVO", "SIN_PERMISO",
  "CONFLICTO_DE_DATOS", "LIMITE_SUPERADO", "TRANSICION_INVALIDA",
  "PAGO_NO_APROBADO", "SEGUIMIENTO_REQUERIDO", "SIN_VARIANTES",
  "ULTIMA_VARIANTE_ACTIVA", "LIMITE_IMAGENES", "ARCHIVO_REQUERIDO",
  "TIPO_ARCHIVO_INVALIDO", "ARCHIVO_DEMASIADO_GRANDE", "ERROR_AL_SUBIR",
  "CATEGORIA_PADRE_INVALIDA", "CATEGORIA_CON_HIJAS", "CATEGORIA_CON_PRODUCTOS", "PRODUCTO_CON_VENTAS",
  "CARRITO_DESACTUALIZADO", "CARRITO_SIN_ITEMS_VALIDOS", "ERROR_INTERNO", "ORIGEN_NO_PERMITIDO", "PEDIDO_NO_PAGABLE", "PEDIDO_VENCIDO", "PEDIDO_YA_PAGADO", "PAGO_EN_PROCESO", "PEDIDO_EN_REVISION", "PROCESADOR_NO_CONFIGURADO", "PROCESADOR_NO_DISPONIBLE", "STOCK_INSUFICIENTE", "TOTAL_CAMBIO", "ZONA_INVALIDA",
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

  it("dice cosas distintas del stock según la pantalla", () => {
    expect(obtenerMensajeError("STOCK_INSUFICIENTE", "ficha")).toBe(
      MENSAJES_ERROR.ficha.STOCK_INSUFICIENTE,
    );
    expect(obtenerMensajeError("STOCK_INSUFICIENTE", "checkout")).toBe(
      MENSAJES_ERROR.checkout.STOCK_INSUFICIENTE,
    );
    expect(obtenerMensajeError("STOCK_INSUFICIENTE")).toBe(
      MENSAJES_ERROR.general.STOCK_INSUFICIENTE,
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

describe("MENSAJES_AVISO", () => {
  // Se repite acá a propósito: el Record garantiza la cobertura al compilar, y este
  // test avisa si alguien saca un motivo del mapa y del contrato a la vez.
  const MOTIVOS = [
    "VARIANTE_INEXISTENTE",
    "VARIANTE_INACTIVA",
    "PRODUCTO_INACTIVO",
    "PROXIMAMENTE",
    "SIN_STOCK",
    "AJUSTADO_POR_STOCK",
    "AJUSTADO_POR_TOPE",
  ] as const;

  it("tiene un mensaje para cada motivo del contrato", () => {
    expect(Object.keys(MENSAJES_AVISO).sort()).toEqual([...MOTIVOS].sort());
  });

  it.each(MOTIVOS)("%s da un texto legible, sin mostrar el código", (motivo) => {
    const texto = MENSAJES_AVISO[motivo]({ varianteId: 1, motivo, producto: "Éclat Doré" });

    expect(texto.length).toBeGreaterThan(10);
    expect(texto).not.toContain(motivo);
  });

  it("PROXIMAMENTE nombra el producto y la fecha de salida", () => {
    expect(
      MENSAJES_AVISO.PROXIMAMENTE({
        varianteId: 16,
        motivo: "PROXIMAMENTE",
        producto: "Éclat Doré",
        disponibleDesde: "2026-11-05",
      }),
    ).toBe("Éclat Doré sale el 05/11. Lo quitamos de tu canasta.");
  });

  it("PROXIMAMENTE sin fecha válida no inventa una", () => {
    const texto = MENSAJES_AVISO.PROXIMAMENTE({
      varianteId: 16,
      motivo: "PROXIMAMENTE",
      producto: "Éclat Doré",
      disponibleDesde: "2026-13-45",
    });

    expect(texto).toBe("Éclat Doré todavía no salió a la venta. Lo quitamos de tu canasta.");
  });

  it("sin nombre de producto usa uno genérico", () => {
    expect(MENSAJES_AVISO.SIN_STOCK({ varianteId: 1, motivo: "SIN_STOCK" })).toBe(
      "Un producto se quedó sin stock. Lo quitamos de tu canasta.",
    );
  });

  it("AJUSTADO_POR_STOCK usa el singular cuando queda una unidad", () => {
    const aviso = { varianteId: 1, motivo: "AJUSTADO_POR_STOCK", producto: "Éclat Noir" } as const;

    expect(MENSAJES_AVISO.AJUSTADO_POR_STOCK({ ...aviso, disponible: 1 })).toBe(
      "Nos queda 1 unidad de Éclat Noir. Ajustamos la cantidad.",
    );
    expect(MENSAJES_AVISO.AJUSTADO_POR_STOCK({ ...aviso, disponible: 3 })).toBe(
      "Nos quedan 3 unidades de Éclat Noir. Ajustamos la cantidad.",
    );
  });

  it("AJUSTADO_POR_TOPE dice el máximo por compra", () => {
    expect(
      MENSAJES_AVISO.AJUSTADO_POR_TOPE({
        varianteId: 1,
        motivo: "AJUSTADO_POR_TOPE",
        producto: "Éclat Noir",
        maximo: 5,
      }),
    ).toBe("Podés llevar hasta 5 de Éclat Noir por compra. Ajustamos la cantidad.");
  });
});

describe("estados del pedido", () => {
  it("cada estado de pago tiene título y detalle, sin mostrar el código", () => {
    for (const [estado, { titulo, detalle }] of Object.entries(TEXTOS_ESTADO_PAGO)) {
      expect(titulo.length).toBeGreaterThan(5);
      expect(detalle.length).toBeGreaterThan(10);
      expect(titulo).not.toContain(estado.toUpperCase());
    }
    expect(Object.keys(TEXTOS_ESTADO_PAGO).sort()).toEqual([
      "aprobado",
      "cancelado",
      "devuelto",
      "pendiente",
      "rechazado",
    ]);
  });

  it("cada estado del pedido tiene su etiqueta", () => {
    expect(Object.keys(ETIQUETAS_ESTADO_PEDIDO).sort()).toEqual([
      "cancelado",
      "en_preparacion",
      "entregado",
      "enviado",
      "nuevo",
    ]);
    expect(ETIQUETAS_ESTADO_PEDIDO.en_preparacion).toBe("En preparación");
  });

  describe("AYUDA_OLVIDE_CONTRASENA", () => {
  it("nombra un rol, no a una persona: el login es público", () => {
    expect(AYUDA_OLVIDE_CONTRASENA).toMatch(/administrador/);
    expect(AYUDA_OLVIDE_CONTRASENA).not.toMatch(/Dante|Pablo|Veronica/i);
  });
});
});
