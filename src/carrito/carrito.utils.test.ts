import { describe, expect, it } from "vitest";

import {
  MAX_ITEMS_CARRITO,
  agregarItem,
  cambiarCantidadItem,
  contarUnidades,
  puedeAgregarItem,
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

describe("máximo de líneas del carrito", () => {
  const lleno: ItemCarrito[] = Array.from({ length: MAX_ITEMS_CARRITO }, (_, i) => ({
    varianteId: i + 1,
    cantidad: 1,
  }));

  it("no agrega una variante nueva si ya hay 30 líneas", () => {
    expect(agregarItem(lleno, 999)).toBe(lleno);
  });

  it("sí suma unidades a una variante que ya está, aunque el carrito esté lleno", () => {
    expect(agregarItem(lleno, 1, 2)[0]).toEqual({ varianteId: 1, cantidad: 3 });
  });

  it("no acepta cantidades que no son enteros seguros", () => {
    expect(agregarItem([], 1, 1e21)).toEqual([]);
  });
});

describe("puedeAgregarItem", () => {
  const lleno: ItemCarrito[] = Array.from({ length: MAX_ITEMS_CARRITO }, (_, i) => ({
    varianteId: i + 1,
    cantidad: 1,
  }));

  it("hay lugar mientras el carrito tenga menos de 30 líneas", () => {
    expect(puedeAgregarItem([], 1)).toBe(true);
    expect(puedeAgregarItem(lleno.slice(0, MAX_ITEMS_CARRITO - 1), 999)).toBe(true);
  });

  it("con 30 líneas, una variante nueva no entra", () => {
    expect(puedeAgregarItem(lleno, 999)).toBe(false);
  });

  it("con 30 líneas, una variante que ya está sí se puede agregar: suma unidades", () => {
    expect(puedeAgregarItem(lleno, 5)).toBe(true);
  });

  it("coincide con lo que hace agregarItem: no agrega justo cuando dice que no se puede", () => {
    expect(agregarItem(lleno, 999)).toBe(lleno);
    expect(agregarItem(lleno, 5)).not.toBe(lleno);
  });
});
