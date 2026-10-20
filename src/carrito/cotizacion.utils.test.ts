import { describe, expect, it } from "vitest";

import {
  carritoConfirmado,
  claveCotizacion,
  coincideConCotizacion,
  itemsDeCotizacion,
  mensajeMasUnidades,
  resolverCotizacion,
} from "@/carrito/cotizacion.utils";
import type { ItemCarrito } from "@/carrito/types";
import { ErrorApi } from "@/lib/apiFetch";
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

describe("resolverCotizacion", () => {
  const items: ItemCarrito[] = [{ varianteId: 1, cantidad: 2 }];
  const conAvisos = (lineas: ReturnType<typeof linea>[]) =>
    ({
      ...cotizacionCon(lineas),
      avisos: [{ varianteId: 1, motivo: "AJUSTADO_POR_STOCK", disponible: 1 }],
    }) as unknown as Cotizacion;

  it("una respuesta que llega después de cancelar la petición se descarta", async () => {
    const controlador = new AbortController();
    // La respuesta se resuelve igual (el fetch ya había terminado), pero el carrito cambió antes.
    const cotizar = async () => {
      controlador.abort();
      return conAvisos([linea(1, 1)]);
    };

    await expect(resolverCotizacion(items, cotizar, controlador.signal)).resolves.toEqual({
      tipo: "obsoleta",
    });
  });

  it("con dos cotizaciones seguidas, la vieja no pisa a la nueva", async () => {
    const primera = new AbortController();
    const segunda = new AbortController();
    let resolverPrimera: (c: Cotizacion) => void = () => {};
    const lenta = new Promise<Cotizacion>((resolver) => (resolverPrimera = resolver));

    const vieja = resolverCotizacion(items, () => lenta, primera.signal);
    const nueva = await resolverCotizacion(
      [{ varianteId: 1, cantidad: 3 }],
      async () => cotizacionCon([linea(1, 3)]),
      segunda.signal,
    );

    // El carrito cambió: la petición vieja se cancela y recién después responde.
    primera.abort();
    resolverPrimera(conAvisos([linea(1, 1)]));

    expect(nueva.tipo).toBe("cotizado");
    await expect(vieja).resolves.toEqual({ tipo: "obsoleta" });
  });

  it("una petición cancelada que falla tampoco es un error para la pantalla", async () => {
    const controlador = new AbortController();
    const cotizar = async () => {
      controlador.abort();
      throw new DOMException("cancelada", "AbortError");
    };

    await expect(resolverCotizacion(items, cotizar, controlador.signal)).resolves.toEqual({
      tipo: "obsoleta",
    });
  });

  it("si la API responde con avisos que cambian el carrito, devuelve el carrito corregido", async () => {
    const resultado = await resolverCotizacion(
      items,
      async () => conAvisos([linea(1, 1)]),
      new AbortController().signal,
    );

    expect(resultado).toMatchObject({ tipo: "cotizado", items: [{ varianteId: 1, cantidad: 1 }] });
  });

  it("sin avisos no toca el carrito, aunque las líneas difieran", async () => {
    const resultado = await resolverCotizacion(
      items,
      async () => cotizacionCon([linea(1, 1)]),
      new AbortController().signal,
    );

    expect(resultado).toMatchObject({ tipo: "cotizado", items: null });
  });

  it("si coincide con lo enviado, no hay nada que corregir", async () => {
    const resultado = await resolverCotizacion(
      items,
      async () => ({ ...cotizacionCon([linea(1, 2)]), avisos: [] }) as unknown as Cotizacion,
      new AbortController().signal,
    );

    expect(resultado).toMatchObject({ tipo: "cotizado", items: null });
  });

  it.each([
    ["error de red", new ErrorApi("ERROR_DE_RED", 0)],
    ["un 500", new ErrorApi("ERROR_INTERNO", 500)],
    ["demasiados pedidos", new ErrorApi("LIMITE_SUPERADO", 429)],
    ["algo que no es ErrorApi", new Error("boom")],
  ])("%s: el carrito queda como estaba", async (_nombre, error) => {
    const resultado = await resolverCotizacion(
      items,
      async () => {
        throw error;
      },
      new AbortController().signal,
    );

    expect(resultado.tipo).toBe("error");
    expect(resultado).not.toHaveProperty("items");
  });

  it("CARRITO_SIN_ITEMS_VALIDOS se distingue de un error de red", async () => {
    const resultado = await resolverCotizacion(
      items,
      async () => {
        throw new ErrorApi("CARRITO_SIN_ITEMS_VALIDOS", 400);
      },
      new AbortController().signal,
    );

    expect(resultado).toEqual({ tipo: "sin_items_validos" });
  });
});

describe("carritoConfirmado", () => {
  const cotizacion = cotizacionCon([linea(1, 8)]);

  it("está confirmado cuando el carrito es lo que cotizó la API y no hay nada en curso", () => {
    expect(carritoConfirmado([{ varianteId: 1, cantidad: 8 }], cotizacion, false)).toBe(true);
  });

  it("con la cantidad en 9 y el total cotizado en 8, no está confirmado", () => {
    expect(carritoConfirmado([{ varianteId: 1, cantidad: 9 }], cotizacion, false)).toBe(false);
  });

  it("no está confirmado mientras hay una cotización en curso", () => {
    expect(carritoConfirmado([{ varianteId: 1, cantidad: 8 }], cotizacion, true)).toBe(false);
  });

  it("no está confirmado si se agregó o se quitó una línea", () => {
    expect(
      carritoConfirmado(
        [
          { varianteId: 1, cantidad: 8 },
          { varianteId: 2, cantidad: 1 },
        ],
        cotizacion,
        false,
      ),
    ).toBe(false);
    expect(carritoConfirmado([], cotizacion, false)).toBe(false);
  });

  it("sin cotización no está confirmado", () => {
    expect(carritoConfirmado([{ varianteId: 1, cantidad: 8 }], null, false)).toBe(false);
  });
});

describe("claveCotizacion", () => {
  it("la misma zona y medio de pago dan la misma clave", () => {
    expect(claveCotizacion({ zonaEnvioId: 2, medioPago: "mercadopago" })).toBe(
      claveCotizacion({ medioPago: "mercadopago", zonaEnvioId: 2 }),
    );
  });

  it("otra zona o otro medio de pago dan otra clave: el total cambia", () => {
    const base = claveCotizacion({ zonaEnvioId: 2, medioPago: "mercadopago" });

    expect(claveCotizacion({ zonaEnvioId: 3, medioPago: "mercadopago" })).not.toBe(base);
    expect(claveCotizacion({ zonaEnvioId: 2, medioPago: "transferencia" })).not.toBe(base);
  });

  it("sin opciones y con valores nulos son lo mismo: retiro, sin medio de pago", () => {
    expect(claveCotizacion()).toBe(claveCotizacion({ zonaEnvioId: null, medioPago: null }));
    expect(claveCotizacion()).not.toBe(claveCotizacion({ zonaEnvioId: 2 }));
  });
});
