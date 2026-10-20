import { describe, expect, it } from "vitest";

import {
  etiquetaProximamente,
  hayOferta,
  mensajeAvisarme,
  mensajeConsultar,
} from "@/components/tienda/TarjetaProducto.utils";

describe("hayOferta", () => {
  it("muestra la oferta si el precio anterior es mayor", () => {
    expect(hayOferta("8500.00", "9900.00")).toBe(true);
  });

  it("sin precio anterior no hay oferta", () => {
    expect(hayOferta("8500.00", null)).toBe(false);
    expect(hayOferta("8500.00", undefined)).toBe(false);
    expect(hayOferta("8500.00", "")).toBe(false);
  });

  it("con el mismo precio no hay oferta: sería un descuento de cero", () => {
    expect(hayOferta("8500.00", "8500.00")).toBe(false);
    expect(hayOferta("8500.00", "8500")).toBe(false);
  });

  it("si el anterior es menor no hay oferta", () => {
    expect(hayOferta("8500.00", "7000.00")).toBe(false);
  });

  it("con importes en cero o inválidos no hay oferta", () => {
    expect(hayOferta("0.00", "0.00")).toBe(false);
    expect(hayOferta("8500.00", "abc")).toBe(false);
    expect(hayOferta("", "9900.00")).toBe(false);
  });
});

describe("mensajeAvisarme", () => {
  it("nombra el producto agotado", () => {
    expect(mensajeAvisarme("Amande Sereine")).toBe(
      "Hola, quiero que me avisen cuando vuelva a haber Amande Sereine.",
    );
  });
});

describe("etiquetaProximamente", () => {
  it("muestra la fecha y los días que faltan", () => {
    expect(etiquetaProximamente("2026-11-05", 19)).toBe(
      "Próximamente · listo el 05/11 (faltan 19 días)",
    );
  });

  it("usa el singular cuando falta un día", () => {
    expect(etiquetaProximamente("2026-11-05", 1)).toBe(
      "Próximamente · listo el 05/11 (falta 1 día)",
    );
  });

  it("sin días o sin fecha válida muestra solo Próximamente", () => {
    expect(etiquetaProximamente("2026-11-05", null)).toBe("Próximamente");
    expect(etiquetaProximamente(null, null)).toBe("Próximamente");
    expect(etiquetaProximamente("fecha-rota", 3)).toBe("Próximamente");
  });
});

describe("mensajeConsultar", () => {
  it("nombra el producto y la fecha de salida", () => {
    expect(mensajeConsultar("Éclat Doré", "2026-11-05")).toBe(
      "Hola, quiero consultar por Éclat Doré, que sale el 05/11.",
    );
  });

  it("sin fecha válida nombra solo el producto", () => {
    expect(mensajeConsultar("Éclat Doré", null)).toBe("Hola, quiero consultar por Éclat Doré.");
    expect(mensajeConsultar("Éclat Doré", "2026-13-45")).toBe(
      "Hola, quiero consultar por Éclat Doré.",
    );
  });
});
