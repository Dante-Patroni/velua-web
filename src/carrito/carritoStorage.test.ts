import { describe, expect, it } from "vitest";

import {
  CLAVE_CARRITO,
  guardarCarrito,
  interpretarCarrito,
  leerCarrito,
} from "@/carrito/carritoStorage";

/**
 * Almacén en memoria con la misma interfaz que localStorage.
 */
const crearAlmacen = (inicial: Record<string, string> = {}) => {
  const datos = new Map(Object.entries(inicial));

  return {
    getItem: (clave: string) => datos.get(clave) ?? null,
    setItem: (clave: string, valor: string) => void datos.set(clave, valor),
    datos,
  };
};

describe("interpretarCarrito", () => {
  it("sin datos devuelve un carrito vacío", () => {
    expect(interpretarCarrito(null)).toEqual([]);
    expect(interpretarCarrito("")).toEqual([]);
  });

  it("con JSON roto devuelve un carrito vacío", () => {
    expect(interpretarCarrito("{no es json")).toEqual([]);
    expect(interpretarCarrito('{"varianteId":1}')).toEqual([]);
  });

  it("descarta precios, nombres e imágenes de una versión anterior", () => {
    const viejo = JSON.stringify([
      { varianteId: 3, cantidad: 2, precio: "8500.00", nombre: "Éclat Noir", imagen: "x.jpg" },
    ]);

    expect(interpretarCarrito(viejo)).toEqual([{ varianteId: 3, cantidad: 2 }]);
  });

  it("descarta líneas con ids o cantidades inválidas", () => {
    const sucio = JSON.stringify([
      { varianteId: 1, cantidad: 1 },
      { varianteId: "2", cantidad: 1 },
      { varianteId: 3, cantidad: 0 },
      { varianteId: 4, cantidad: 1.5 },
      null,
      "texto",
    ]);

    expect(interpretarCarrito(sucio)).toEqual([{ varianteId: 1, cantidad: 1 }]);
  });

  it("junta una variante repetida en una sola línea", () => {
    const repetido = JSON.stringify([
      { varianteId: 7, cantidad: 1 },
      { varianteId: 7, cantidad: 2 },
    ]);

    expect(interpretarCarrito(repetido)).toEqual([{ varianteId: 7, cantidad: 3 }]);
  });
});

describe("leerCarrito y guardarCarrito", () => {
  it("lo guardado se rehidrata igual", () => {
    const almacen = crearAlmacen();
    const items = [
      { varianteId: 1, cantidad: 2 },
      { varianteId: 5, cantidad: 1 },
    ];

    guardarCarrito(items, almacen);

    expect(leerCarrito(almacen)).toEqual(items);
  });

  it("guarda solo ids y cantidades aunque reciba más datos", () => {
    const almacen = crearAlmacen();
    const conPrecio = [{ varianteId: 1, cantidad: 2, precio: "8500.00" }];

    guardarCarrito(conPrecio, almacen);

    expect(almacen.datos.get(CLAVE_CARRITO)).toBe('[{"varianteId":1,"cantidad":2}]');
  });

  it("sin almacén disponible lee vacío y no lanza al guardar", () => {
    expect(leerCarrito(null)).toEqual([]);
    expect(() => guardarCarrito([{ varianteId: 1, cantidad: 1 }], null)).not.toThrow();
  });

  it("si el almacén falla, no lanza", () => {
    const roto = {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("cuota llena");
      },
    };

    expect(leerCarrito(roto)).toEqual([]);
    expect(() => guardarCarrito([{ varianteId: 1, cantidad: 1 }], roto)).not.toThrow();
  });
});
