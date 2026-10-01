import { describe, expect, it } from "vitest";
import { calcularDescuento } from "@/components/admin/VistaPrevia.utils";

describe("calcularDescuento", () => {
  it("calcula el porcentaje cuando hay oferta real", () => {
    expect(calcularDescuento("8500", "9900")).toBe(14);
    expect(calcularDescuento("5000", "10000")).toBe(50);
  });

  it("acepta la coma decimal, que es como se escribe acá", () => {
    expect(calcularDescuento("8500,00", "9900,00")).toBe(14);
  });

  it("no muestra oferta si el precio anterior es igual", () => {
    // Es el bug del "0% OFF" que tienen las dos tiendas del rubro que miramos
    expect(calcularDescuento("8500", "8500")).toBeNull();
  });

  it("no muestra oferta si el precio anterior es menor", () => {
    expect(calcularDescuento("8500", "8000")).toBeNull();
  });

  it("no muestra oferta si falta el precio anterior", () => {
    expect(calcularDescuento("8500", "")).toBeNull();
  });

  it("no muestra oferta mientras se está escribiendo el precio", () => {
    // Un campo a medio escribir no tiene que hacer aparecer un badge raro
    expect(calcularDescuento("", "9900")).toBeNull();
    expect(calcularDescuento("abc", "9900")).toBeNull();
    expect(calcularDescuento("0", "9900")).toBeNull();
  });

  it("redondea al entero más cercano", () => {
    expect(calcularDescuento("6666", "10000")).toBe(33);
    expect(calcularDescuento("3334", "10000")).toBe(67);
  });
});
