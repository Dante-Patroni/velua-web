import { describe, expect, it } from "vitest";

import {
  coincideConCotizacion,
  itemsDeCotizacion,
  mensajeMasUnidades,
} from "@/carrito/cotizacion.utils";
import type { ItemCarrito } from "@/carrito/types";
import type { Cotizacion } from "@/types";

const linea = (varianteId: number, cantidad: number) => ({
  varianteId,
  cantidad,
  productoNombre: "Éclat Noir",
  precioUnitario: "8500.00",
  subtotal: "17000.00",
});

const cotizacionCon = (lineas: ReturnType<typeof linea>[]) =>
  ({ items: lineas, avisos: [], totales: { subtotal: "0.00", total: "0.00" } }) as unknown as Cotizacion;

describe("itemsDeCotizacion", () => {
  it("deja solo ids y cantidades, nunca precios ni nombres", () => {
    expect(itemsDeCotizacion(cotizacionCon([linea(1, 2), linea(2, 1)]))).toEqual([
      { varianteId: 1, cantidad: 2 },
      { varianteId: 2, cantidad: 1 },
    ]);
  });

  it("si una variante desapareció, el carrito rehidratado ya no la tiene", () => {
    const guardado: ItemCarrito[] = [
      { varianteId: 1, cantidad: 2 },
      { varianteId: 9, cantidad: 1 },
    ];
    const cotizacion = cotizacionCon([linea(1, 2)]);

    expect(itemsDeCotizacion(cotizacion)).toEqual([{ varianteId: 1, cantidad: 2 }]);
    expect(coincideConCotizacion(guardado, cotizacion)).toBe(false);
  });

  it("si la API bajó una cantidad por stock, el carrito queda con la cantidad real", () => {
    expect(itemsDeCotizacion(cotizacionCon([linea(1, 3)]))).toEqual([{ varianteId: 1, cantidad: 3 }]);
  });
});

describe("coincideConCotizacion", () => {
  const cotizacion = cotizacionCon([linea(1, 2), linea(2, 1)]);

  it("coincide con las mismas variantes y cantidades, en cualquier orden", () => {
    expect(
      coincideConCotizacion(
        [
          { varianteId: 2, cantidad: 1 },
          { varianteId: 1, cantidad: 2 },
        ],
        cotizacion,
      ),
    ).toBe(true);
  });

  it("no coincide si cambió una cantidad", () => {
    expect(
      coincideConCotizacion(
        [
          { varianteId: 1, cantidad: 3 },
          { varianteId: 2, cantidad: 1 },
        ],
        cotizacion,
      ),
    ).toBe(false);
  });

  it("no coincide si se agregó una variante que no está cotizada", () => {
    expect(
      coincideConCotizacion(
        [
          { varianteId: 1, cantidad: 2 },
          { varianteId: 2, cantidad: 1 },
          { varianteId: 3, cantidad: 1 },
        ],
        cotizacion,
      ),
    ).toBe(false);
  });

  it("sin cotización previa no coincide: hay que cotizar", () => {
    expect(coincideConCotizacion([{ varianteId: 1, cantidad: 1 }], null)).toBe(false);
  });
});

describe("mensajeMasUnidades", () => {
  it("nombra el producto", () => {
    expect(mensajeMasUnidades("Éclat Noir")).toBe("Hola, quiero comprar más unidades de Éclat Noir.");
  });

  it("sin nombre usa un texto genérico", () => {
    expect(mensajeMasUnidades(undefined)).toBe("Hola, quiero comprar más unidades de un producto.");
  });
});
