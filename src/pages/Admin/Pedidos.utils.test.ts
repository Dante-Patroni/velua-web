import { describe, expect, test } from "vitest";

import { etiquetaEstadoEvento } from "./Pedidos.utils";

describe("etiquetaEstadoEvento", () => {
  test("traduce pago y preparación, y deja el resto como texto", () => {
    expect(etiquetaEstadoEvento("pago", "aprobado")).toBe("Pagado");
    expect(etiquetaEstadoEvento("preparacion", "en_preparacion")).toBe("En preparación");
    expect(etiquetaEstadoEvento("pago", null)).toBe("—");
    expect(etiquetaEstadoEvento("pago", "constructor")).toBe("constructor");
    expect(etiquetaEstadoEvento("aviso", "comprobante")).toBe("comprobante");
  });
});