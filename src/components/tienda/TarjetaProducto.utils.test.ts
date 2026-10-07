import { describe, expect, it } from "vitest";

import { hayOferta, mensajeAvisarme } from "@/components/tienda/TarjetaProducto.utils";

describe("hayOferta", () => {
  it("muestra la oferta si el precio anterior es mayor", () => {
    expect(hayOferta("8500.00", "9900.00")).toBe(true);
  });

  it("sin precio anterior no hay oferta", () => {
    expect(hayOferta("8500.00", null)).toBe(false);
    expect(hayOferta("8500.00", undefined)).toBe(false);
    expect(hayOferta("8500.00", "")).toBe(false);
  });

  it("con el mismo precio no hay oferta: sería un descuento de cero", () => {
    expect(hayOferta("8500.00", "8500.00")).toBe(false);
    expect(hayOferta("8500.00", "8500")).toBe(false);
  });

  it("si el anterior es menor no hay oferta", () => {
    expect(hayOferta("8500.00", "7000.00")).toBe(false);
  });

  it("con importes en cero o inválidos no hay oferta", () => {
    expect(hayOferta("0.00", "0.00")).toBe(false);
    expect(hayOferta("8500.00", "abc")).toBe(false);
    expect(hayOferta("", "9900.00")).toBe(false);
  });
});

describe("mensajeAvisarme", () => {
  it("nombra el producto agotado", () => {
    expect(mensajeAvisarme("Amande Sereine")).toBe(
      "Hola, quiero que me avisen cuando vuelva a haber Amande Sereine.",
    );
  });
});
