import { describe, expect, it } from "vitest";

import { debeCotizarDeNuevo, errorDeCampo, mediosOfrecidos, resolverMedioPago } from "@/pages/Tienda/Checkout.utils";

const cotizacionCon = (mercadopago: boolean, transferencia: boolean) => ({
  mediosPago: {
    mercadopago: { disponible: mercadopago, total: mercadopago ? "39350.00" : null },
    transferencia: { disponible: transferencia, total: transferencia ? "32850.00" : null },
  },
});

describe("mediosOfrecidos", () => {
  it("ofrece los dos medios con el total que informa la API", () => {
    expect(mediosOfrecidos(cotizacionCon(true, true))).toEqual([
      { medio: "mercadopago", total: "39350.00" },
      { medio: "transferencia", total: "32850.00" },
    ]);
  });

  it("no ofrece el que la API marca como no disponible", () => {
    expect(mediosOfrecidos(cotizacionCon(true, false))).toEqual([{ medio: "mercadopago", total: "39350.00" }]);
    expect(mediosOfrecidos(cotizacionCon(false, false))).toEqual([]);
  });

  it("no ofrece un medio disponible que viene sin total", () => {
    const rara = { mediosPago: { ...cotizacionCon(true, true).mediosPago, transferencia: { disponible: true, total: null } } };

    expect(mediosOfrecidos(rara).map(({ medio }) => medio)).toEqual(["mercadopago"]);
  });

  it("sin cotización no ofrece nada", () => {
    expect(mediosOfrecidos(null)).toEqual([]);
  });
});

describe("resolverMedioPago", () => {
  it("respeta lo elegido si la API lo ofrece", () => {
    expect(resolverMedioPago("transferencia", cotizacionCon(true, true))).toBe("transferencia");
  });

  it("pasa al que sí se ofrece si el elegido dejó de estar disponible", () => {
    expect(resolverMedioPago("transferencia", cotizacionCon(true, false))).toBe("mercadopago");
    expect(resolverMedioPago("mercadopago", cotizacionCon(false, true))).toBe("transferencia");
  });

  it("devuelve null si no se ofrece ninguno", () => {
    expect(resolverMedioPago("mercadopago", cotizacionCon(false, false))).toBeNull();
  });

  it("sin cotización respeta lo elegido", () => {
    expect(resolverMedioPago("transferencia", null)).toBe("transferencia");
  });
});

describe("debeCotizarDeNuevo", () => {
  it.each(["CARRITO_DESACTUALIZADO", "TOTAL_CAMBIO", "STOCK_INSUFICIENTE", "MEDIO_PAGO_NO_DISPONIBLE"])(
    "%s: el estado cambió, hay que volver a cotizar",
    (codigo) => {
      expect(debeCotizarDeNuevo(codigo)).toBe(true);
    },
  );

  it.each(["DATOS_INVALIDOS", "ZONA_INVALIDA", "LIMITE_SUPERADO", "ERROR_INTERNO", "ALGO_NUEVO"])(
    "%s no es un cambio del carrito",
    (codigo) => {
      expect(debeCotizarDeNuevo(codigo)).toBe(false);
    },
  );
});

describe("errorDeCampo", () => {
  const details = {
    "cliente.email": "Email inválido",
    "entrega.direccion.calle": "Falta la calle",
    telefono: "Falta el teléfono",
  };

  it("encuentra el campo por su ruta completa o por su nombre", () => {
    expect(errorDeCampo(details, "email")).toBe("Email inválido");
    expect(errorDeCampo(details, "calle")).toBe("Falta la calle");
    expect(errorDeCampo(details, "telefono")).toBe("Falta el teléfono");
    expect(errorDeCampo(details, "cliente.email")).toBe("Email inválido");
  });

  it("no confunde un campo con otro que solo termina parecido", () => {
    expect(errorDeCampo({ "cliente.nombre": "Falta" }, "ombre")).toBeUndefined();
  });

  it("sin errores o sin ese campo devuelve undefined", () => {
    expect(errorDeCampo(undefined, "email")).toBeUndefined();
    expect(errorDeCampo({}, "email")).toBeUndefined();
    expect(errorDeCampo(details, "cp")).toBeUndefined();
  });
});
