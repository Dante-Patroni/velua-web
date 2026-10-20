import { describe, expect, it } from "vitest";

import {
  MAX_CONSULTAS_PEDIDO,
  debeConsultarPedido,
  intentosAgotados,
} from "@/pages/Tienda/Pedido.utils";

const base = {
  intentos: 0,
  estadoPago: "pendiente",
  medioPago: "mercadopago",
  visibilidad: "visible",
} as const;

describe("debeConsultarPedido", () => {
  it("consulta mientras el pago está pendiente, la pestaña está a la vista y quedan intentos", () => {
    expect(debeConsultarPedido(base)).toBe(true);
    expect(debeConsultarPedido({ ...base, intentos: MAX_CONSULTAS_PEDIDO - 1 })).toBe(true);
  });

  it("para cuando el pago deja de estar pendiente", () => {
    for (const estadoPago of ["aprobado", "rechazado", "devuelto", "cancelado"] as const) {
      expect(debeConsultarPedido({ ...base, estadoPago })).toBe(false);
    }
  });

  it("no consulta con la pestaña oculta", () => {
    expect(debeConsultarPedido({ ...base, visibilidad: "hidden" })).toBe(false);
  });

  it("se corta al llegar al máximo de intentos", () => {
    expect(debeConsultarPedido({ ...base, intentos: MAX_CONSULTAS_PEDIDO })).toBe(false);
    expect(debeConsultarPedido({ ...base, intentos: MAX_CONSULTAS_PEDIDO + 5 })).toBe(false);
  });

  it("sin pedido (error o 404) no consulta", () => {
    expect(debeConsultarPedido({ ...base, estadoPago: undefined, medioPago: undefined })).toBe(false);
  });

  it("una transferencia no se confirma sola: no consulta", () => {
    expect(debeConsultarPedido({ ...base, medioPago: "transferencia" })).toBe(false);
  });

  it("el máximo son diez intentos", () => {
    expect(MAX_CONSULTAS_PEDIDO).toBe(10);
  });
});

describe("intentosAgotados", () => {
  it("solo si se agotaron los intentos con el pago todavía pendiente", () => {
    expect(intentosAgotados(MAX_CONSULTAS_PEDIDO, "pendiente")).toBe(true);
    expect(intentosAgotados(MAX_CONSULTAS_PEDIDO - 1, "pendiente")).toBe(false);
    expect(intentosAgotados(MAX_CONSULTAS_PEDIDO, "aprobado")).toBe(false);
    expect(intentosAgotados(MAX_CONSULTAS_PEDIDO, undefined)).toBe(false);
  });
});
