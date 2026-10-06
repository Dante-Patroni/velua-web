import { describe, expect, it } from "vitest";

import {
  agregarItem,
  cambiarCantidadItem,
  contarUnidades,
  quitarItem,
} from "@/carrito/carrito.utils";
import type { ItemCarrito } from "@/carrito/types";

const carrito: ItemCarrito[] = [
  { varianteId: 1, cantidad: 2 },
  { varianteId: 2, cantidad: 1 },
];

describe("agregarItem", () => {
  it("agrega una variante nueva con una unidad por defecto", () => {
    expect(agregarItem([], 5)).toEqual([{ varianteId: 5, cantidad: 1 }]);
  });

  it("suma a la línea existente en vez de duplicarla", () => {
    expect(agregarItem(carrito, 1, 3)).toEqual([
      { varianteId: 1, cantidad: 5 },
      { varianteId: 2, cantidad: 1 },
    ]);
  });

  it("no modifica el carrito original", () => {
    agregarItem(carrito, 1);
    expect(carrito[0].cantidad).toBe(2);
  });

  it("ignora ids o cantidades que no son enteros positivos", () => {
    expect(agregarItem(carrito, 0)).toBe(carrito);
    expect(agregarItem(carrito, 3, 0)).toBe(carrito);
    expect(agregarItem(carrito, 3, -2)).toBe(carrito);
    expect(agregarItem(carrito, 3, 1.5)).toBe(carrito);
  });
});

describe("quitarItem", () => {
  it("quita la variante pedida", () => {
    expect(quitarItem(carrito, 1)).toEqual([{ varianteId: 2, cantidad: 1 }]);
  });

  it("no falla si la variante no estaba", () => {
    expect(quitarItem(carrito, 99)).toEqual(carrito);
  });
});

describe("cambiarCantidadItem", () => {
  it("fija la cantidad nueva", () => {
    expect(cambiarCantidadItem(carrito, 2, 4)).toEqual([
      { varianteId: 1, cantidad: 2 },
      { varianteId: 2, cantidad: 4 },
    ]);
  });

  it("bajar a cero quita la línea", () => {
    expect(cambiarCantidadItem(carrito, 1, 0)).toEqual([{ varianteId: 2, cantidad: 1 }]);
  });

  it("ignora una cantidad que no es entera", () => {
    expect(cambiarCantidadItem(carrito, 1, 2.5)).toBe(carrito);
    expect(cambiarCantidadItem(carrito, 1, Number.NaN)).toBe(carrito);
  });
});

describe("contarUnidades", () => {
  it("suma las cantidades de todas las líneas", () => {
    expect(contarUnidades(carrito)).toBe(3);
  });

  it("un carrito vacío tiene cero unidades", () => {
    expect(contarUnidades([])).toBe(0);
  });
});
