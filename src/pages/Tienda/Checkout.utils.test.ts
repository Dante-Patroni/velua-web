import { describe, expect, it } from "vitest";

import { debeCotizarDeNuevo, errorDeCampo } from "@/pages/Tienda/Checkout.utils";

describe("debeCotizarDeNuevo", () => {
  it.each(["CARRITO_DESACTUALIZADO", "TOTAL_CAMBIO", "STOCK_INSUFICIENTE"])(
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
