import { describe, expect, it } from "vitest";

import { destinoDePago, urlPagoSegura } from "@/lib/pagos";

describe("urlPagoSegura", () => {
  it.each([
    "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123-abc",
    "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=1",
    "https://mercadopago.com.ar/pago",
    "https://www.mercadopago.com/checkout/v1/redirect?pref_id=1",
  ])("acepta %s", (url) => {
    expect(urlPagoSegura(url)).toBe(new URL(url).href);
  });

  it.each([
    ["sin link", null],
    ["vacío", ""],
    ["http sin cifrar", "http://www.mercadopago.com.ar/checkout"],
    ["javascript:", "javascript:alert(1)"],
    ["otro dominio", "https://example.com/mercadopago.com.ar"],
    ["dominio que solo se parece", "https://mercadopago.com.ar.evil.com/pago"],
    ["dominio que termina igual", "https://evilmercadopago.com.ar/pago"],
    ["dominio terminado igual pero distinto", "https://notmercadopago.com.ar/pago"],
    ["con usuario que simula el dominio", "https://www.mercadopago.com.ar@evil.com/pago"],
    ["no es una URL", "esto no es una url"],
  ])("rechaza %s", (_nombre, url) => {
    expect(urlPagoSegura(url)).toBeNull();
  });
});

describe("destinoDePago", () => {
  it("con link seguro va a Mercado Pago", () => {
    expect(destinoDePago("VEL-4K7Q2X", "https://www.mercadopago.com.ar/checkout?pref_id=1")).toEqual({
      tipo: "externo",
      url: "https://www.mercadopago.com.ar/checkout?pref_id=1",
    });
  });

  it("sin link (Mercado Pago no respondió) va a la página del pedido", () => {
    expect(destinoDePago("VEL-4K7Q2X", null)).toEqual({ tipo: "interno", ruta: "/pedido/VEL-4K7Q2X" });
  });

  it("con un link que no es de Mercado Pago también va a la página del pedido", () => {
    expect(destinoDePago("VEL-4K7Q2X", "https://evil.com/pagar")).toEqual({
      tipo: "interno",
      ruta: "/pedido/VEL-4K7Q2X",
    });
  });
});
