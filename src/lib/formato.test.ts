import { describe, expect, it } from "vitest";

import {
  FECHA_NO_DISPONIBLE,
  PRECIO_NO_DISPONIBLE,
  formatearFechaHora,
  formatearPrecio,
} from "./formato";

// Intl separa el signo del número con un espacio duro (U+00A0).
const sinEspacioDuro = (texto: string) => texto.replace(/\u00A0/g, " ");

describe("formatearPrecio", () => {
  it("formatea una cadena decimal en pesos con separadores de es-AR", () => {
    expect(sinEspacioDuro(formatearPrecio("8500.00"))).toBe("$ 8.500");
  });

  it("omite los decimales cuando los centavos son cero", () => {
    expect(sinEspacioDuro(formatearPrecio("8500.00"))).toBe("$ 8.500");
    expect(sinEspacioDuro(formatearPrecio("8500"))).toBe("$ 8.500");
  });

  it("muestra los dos decimales cuando hay centavos", () => {
    expect(sinEspacioDuro(formatearPrecio("8500.50"))).toBe("$ 8.500,50");
    expect(sinEspacioDuro(formatearPrecio("12500.5"))).toBe("$ 12.500,50");
    expect(sinEspacioDuro(formatearPrecio("8500.05"))).toBe("$ 8.500,05");
  });

  it("formatea importes grandes con separador de miles", () => {
    expect(sinEspacioDuro(formatearPrecio("1234567.89"))).toBe("$ 1.234.567,89");
  });

  it("formatea cero como un importe válido", () => {
    expect(sinEspacioDuro(formatearPrecio("0.00"))).toBe("$ 0");
  });

  it.each(["", "   ", "abc", "12,50", "NaN", "Infinity"])(
    "devuelve el marcador de no disponible para %j",
    (valor) => {
      expect(formatearPrecio(valor)).toBe(PRECIO_NO_DISPONIBLE);
    },
  );

    it("muestra el guion cuando el precio no existe", () => {
    expect(formatearPrecio(null)).toBe("—");
    expect(formatearPrecio(undefined)).toBe("—");
  });
});

describe("formatearFechaHora", () => {
  it("muestra día, mes y hora en horario de Argentina", () => {
    // 19:30 UTC son las 16:30 en Buenos Aires (UTC-3, sin horario de verano).
    expect(sinEspacioDuro(formatearFechaHora("2026-10-20T19:30:00.000Z"))).toContain("20/10");
    expect(formatearFechaHora("2026-10-20T19:30:00.000Z")).toContain("16:30");
  });

  it("cruza el día según la zona: 01:00 UTC es la noche anterior en Argentina", () => {
    expect(formatearFechaHora("2026-10-21T01:00:00.000Z")).toContain("20/10");
  });

  it("sin fecha o con una fecha ilegible muestra el guion", () => {
    expect(formatearFechaHora(null)).toBe(FECHA_NO_DISPONIBLE);
    expect(formatearFechaHora(undefined)).toBe(FECHA_NO_DISPONIBLE);
    expect(formatearFechaHora("")).toBe(FECHA_NO_DISPONIBLE);
    expect(formatearFechaHora("mañana")).toBe(FECHA_NO_DISPONIBLE);
  });
});
