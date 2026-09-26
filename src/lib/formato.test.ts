import { describe, expect, it } from "vitest";

import { PRECIO_NO_DISPONIBLE, formatearPrecio } from "./formato";

// Intl separa el signo del número con un espacio duro (U+00A0).
const sinEspacioDuro = (texto: string) => texto.replace(/\u00A0/g, " ");

describe("formatearPrecio", () => {
  it("formatea una cadena decimal en pesos con separadores de es-AR", () => {
    expect(sinEspacioDuro(formatearPrecio("8500.00"))).toBe("$ 8.500,00");
  });

  it("respeta los centavos", () => {
    expect(sinEspacioDuro(formatearPrecio("12500.5"))).toBe("$ 12.500,50");
  });

  it("formatea importes grandes con separador de miles", () => {
    expect(sinEspacioDuro(formatearPrecio("1234567.89"))).toBe("$ 1.234.567,89");
  });

  it("formatea cero como un importe válido", () => {
    expect(sinEspacioDuro(formatearPrecio("0.00"))).toBe("$ 0,00");
  });

  it.each(["", "   ", "abc", "12,50", "NaN", "Infinity"])(
    "devuelve el marcador de no disponible para %j",
    (valor) => {
      expect(formatearPrecio(valor)).toBe(PRECIO_NO_DISPONIBLE);
    },
  );
});
