import { describe, expect, it } from "vitest";

import type { VentaCotizacion } from "@/types";

import {
  debeRecalcular,
  entradaCotizacion,
  esClaveVenta,
  fijarCantidad,
  lineasCoinciden,
  nuevaClaveVenta,
  puedeRegistrar,
  quitarLinea,
  sumarLinea,
  totalDelMedio,
} from "./VentaNueva.utils";

/** Una cotización con totales distintos por medio, como la de la API con descuento en efectivo. */
const cotizacion = (cambios: Partial<VentaCotizacion> = {}): VentaCotizacion => ({
  items: [{ varianteId: 5, cantidad: 2, imagen: null, precioUnitario: "8500.00", subtotal: "17000.00" }],
  avisos: [],
  // Sin medio elegido, totales.total no lleva descuento: no es el total de ninguna venta.
  totales: { subtotal: "17000.00", total: "17000.00" },
  envio: { modo: "retiro" },
  mediosPago: {
    efectivo: { disponible: true, total: "15300.00" },
    transferencia: { disponible: true, total: "16150.00" },
  },
  ...cambios,
});

describe("sumarLinea", () => {
  it("agrega una variante nueva", () => {
    expect(sumarLinea([{ varianteId: 1, cantidad: 1 }], 2, 3)).toEqual([
      { varianteId: 1, cantidad: 1 },
      { varianteId: 2, cantidad: 3 },
    ]);
  });

  it("si la variante ya está, suma las cantidades en una sola línea", () => {
    const lineas = sumarLinea([{ varianteId: 1, cantidad: 2 }], 1, 3);

    expect(lineas).toEqual([{ varianteId: 1, cantidad: 5 }]);
  });

  it.each([0, -1, 1.5, Number.NaN])("ignora la cantidad %s", (cantidad) => {
    expect(sumarLinea([], 1, cantidad)).toEqual([]);
  });

  it("no modifica el arreglo original", () => {
    const original = [{ varianteId: 1, cantidad: 1 }];

    sumarLinea(original, 1, 1);

    expect(original).toEqual([{ varianteId: 1, cantidad: 1 }]);
  });
});

describe("fijarCantidad y quitarLinea", () => {
  const lineas = [
    { varianteId: 1, cantidad: 2 },
    { varianteId: 2, cantidad: 1 },
  ];

  it("cambia la cantidad de la línea indicada", () => {
    expect(fijarCantidad(lineas, 2, 4)).toEqual([
      { varianteId: 1, cantidad: 2 },
      { varianteId: 2, cantidad: 4 },
    ]);
  });

  it("no acepta una cantidad que no sea un entero positivo", () => {
    expect(fijarCantidad(lineas, 2, 0)).toEqual(lineas);
  });

  it("quita una línea", () => {
    expect(quitarLinea(lineas, 1)).toEqual([{ varianteId: 2, cantidad: 1 }]);
  });
});

describe("entradaCotizacion", () => {
  const lineas = [{ varianteId: 5, cantidad: 2 }];

  it("sin líneas no hay nada que cotizar", () => {
    expect(entradaCotizacion([], "retiro", null)).toBeNull();
  });

  it.each(["retiro", "en_mano"] as const)("con %s no manda zona", (entrega) => {
    const entrada = entradaCotizacion(lineas, entrega, 3);

    expect(entrada).toEqual({ items: lineas, entrega: { metodo: entrega } });
  });

  it("con envío manda la zona", () => {
    expect(entradaCotizacion(lineas, "envio", 3)).toEqual({
      items: lineas,
      entrega: { metodo: "envio", zonaEnvioId: 3 },
    });
  });

  it("con envío y sin zona todavía no cotiza", () => {
    expect(entradaCotizacion(lineas, "envio", null)).toBeNull();
  });

  it("nunca manda medio de pago: así la API informa el total de cada medio", () => {
    const entrada = entradaCotizacion(lineas, "retiro", null);

    expect(entrada).not.toHaveProperty("medioPago");
  });
});

describe("totalDelMedio", () => {
  it("devuelve el total del medio elegido, tal como lo informa la API", () => {
    expect(totalDelMedio(cotizacion(), "efectivo")).toBe("15300.00");
    expect(totalDelMedio(cotizacion(), "transferencia")).toBe("16150.00");
  });

  it("nunca devuelve totales.total", () => {
    const total = totalDelMedio(cotizacion(), "efectivo");

    expect(total).not.toBe(cotizacion().totales.total);
  });

  it("sin medio elegido no hay total de venta", () => {
    expect(totalDelMedio(cotizacion(), null)).toBeNull();
  });

  it("sin cotización no hay total", () => {
    expect(totalDelMedio(null, "efectivo")).toBeNull();
  });

  it("un medio no disponible no tiene total", () => {
    const sinEfectivo = cotizacion({
      mediosPago: {
        efectivo: { disponible: false, total: null },
        transferencia: { disponible: true, total: "16150.00" },
      },
    });

    expect(totalDelMedio(sinEfectivo, "efectivo")).toBeNull();
    expect(totalDelMedio(sinEfectivo, "transferencia")).toBe("16150.00");
  });
});

describe("lineasCoinciden", () => {
  it("coinciden con las mismas variantes y cantidades, en cualquier orden", () => {
    const cotizada = cotizacion({
      items: [
        { varianteId: 5, cantidad: 2, imagen: null, precioUnitario: "1.00", subtotal: "2.00" },
        { varianteId: 6, cantidad: 1, imagen: null, precioUnitario: "1.00", subtotal: "1.00" },
      ],
    });

    expect(
      lineasCoinciden(
        [
          { varianteId: 6, cantidad: 1 },
          { varianteId: 5, cantidad: 2 },
        ],
        cotizada,
      ),
    ).toBe(true);
  });

  it("no coinciden si la API bajó una cantidad", () => {
    expect(lineasCoinciden([{ varianteId: 5, cantidad: 9 }], cotizacion())).toBe(false);
  });

  it("no coinciden si la API quitó una variante", () => {
    expect(
      lineasCoinciden(
        [
          { varianteId: 5, cantidad: 2 },
          { varianteId: 7, cantidad: 1 },
        ],
        cotizacion(),
      ),
    ).toBe(false);
  });
});

describe("puedeRegistrar", () => {
  const lineas = [{ varianteId: 5, cantidad: 2 }];

  it("con cotización vigente, sin avisos y con medio disponible, sí", () => {
    expect(puedeRegistrar(cotizacion(), lineas, "efectivo")).toBe(true);
  });

  it("sin medio elegido, no", () => {
    expect(puedeRegistrar(cotizacion(), lineas, null)).toBe(false);
  });

  it("sin cotización vigente, no", () => {
    expect(puedeRegistrar(null, lineas, "efectivo")).toBe(false);
  });

  it("con un aviso, no: hay que corregir la venta antes", () => {
    const conAviso = cotizacion({ avisos: [{ varianteId: 5, motivo: "SIN_STOCK" }] });

    expect(puedeRegistrar(conAviso, lineas, "efectivo")).toBe(false);
  });

  it("si lo cotizado no es lo que hay en pantalla, no", () => {
    expect(puedeRegistrar(cotizacion(), [{ varianteId: 5, cantidad: 3 }], "efectivo")).toBe(false);
  });

  it("con el medio deshabilitado, no", () => {
    const sinEfectivo = cotizacion({
      mediosPago: {
        efectivo: { disponible: false, total: null },
        transferencia: { disponible: true, total: "16150.00" },
      },
    });

    expect(puedeRegistrar(sinEfectivo, lineas, "efectivo")).toBe(false);
  });
});

describe("debeRecalcular", () => {
  it.each(["TOTAL_CAMBIO", "CARRITO_DESACTUALIZADO", "STOCK_INSUFICIENTE"])("%s pide volver a calcular", (codigo) => {
    expect(debeRecalcular(codigo)).toBe(true);
  });

  it.each(["CLAVE_REUTILIZADA", "DATOS_INVALIDOS", "ERROR_DE_RED", "constructor"])("%s no", (codigo) => {
    expect(debeRecalcular(codigo)).toBe(false);
  });
});

describe("clave de idempotencia", () => {
  it("genera un UUID válido", () => {
    expect(esClaveVenta(nuevaClaveVenta())).toBe(true);
  });

  it("genera una clave distinta cada vez", () => {
    expect(nuevaClaveVenta()).not.toBe(nuevaClaveVenta());
  });

  it.each(["", "abc", "3f1c2a9e-5b7d-4e8a-9c21-7d4e5f6a8b9", "3f1c2a9e-5b7d-4e8a-9c21-7d4e5f6a8b90x"])(
    "rechaza %j",
    (valor) => {
      expect(esClaveVenta(valor)).toBe(false);
    },
  );
});
