import { describe, expect, it } from "vitest";

import { varianteInicial } from "@/components/tienda/CompraProducto.utils";
import type { Variante } from "@/types";

const variante = (id: number, hayStock: boolean): Variante => ({
  id,
  nombre: `V${id}`,
  precio: "1000.00",
  hayStock,
});

describe("varianteInicial", () => {
  it("elige la primera con stock", () => {
    expect(varianteInicial([variante(1, false), variante(2, true), variante(3, true)])?.id).toBe(2);
  });

  it("si ninguna tiene stock, la primera", () => {
    expect(varianteInicial([variante(1, false), variante(2, false)])?.id).toBe(1);
  });

  it("sin variantes devuelve undefined", () => {
    expect(varianteInicial([])).toBeUndefined();
  });
});
