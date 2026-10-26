import { describe, expect, it } from "vitest";

import {
  MAX_CONSULTAS_PEDIDO,
  debeConsultarPedido,
  falloPorVencimiento,
  intentosAgotados,
  puedePagarPedido,
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

describe("puedePagarPedido", () => {
  const base = { medioPago: "mercadopago", estadoPago: "pendiente" } as const;

  it("ofrece pagar un pedido pendiente", () => {
    expect(puedePagarPedido(base)).toBe(true);
  });

  it("ofrece pagar de nuevo un pedido rechazado", () => {
    expect(puedePagarPedido({ ...base, estadoPago: "rechazado" })).toBe(true);
  });

  it("no ofrece pagar un pedido ya pagado, devuelto o cancelado", () => {
    for (const estadoPago of ["aprobado", "devuelto", "cancelado"] as const) {
      expect(puedePagarPedido({ ...base, estadoPago })).toBe(false);
    }
  });

  it("no ofrece pagar un pedido de transferencia", () => {
    expect(puedePagarPedido({ ...base, medioPago: "transferencia" })).toBe(false);
  });

  it("no vuelve a ofrecer pagar si la API respondió PEDIDO_VENCIDO", () => {
    expect(puedePagarPedido(base, "PEDIDO_VENCIDO")).toBe(false);
    expect(puedePagarPedido({ ...base, estadoPago: "rechazado" }, "PEDIDO_VENCIDO")).toBe(false);
  });

  it("sigue ofreciendo pagar tras otro fallo, como un procesador caído", () => {
    expect(puedePagarPedido(base, "PROCESADOR_NO_DISPONIBLE")).toBe(true);
    expect(puedePagarPedido(base, undefined)).toBe(true);
  });
});

describe("falloPorVencimiento", () => {
  it("solo con el código PEDIDO_VENCIDO", () => {
    expect(falloPorVencimiento("PEDIDO_VENCIDO")).toBe(true);
    expect(falloPorVencimiento("PEDIDO_YA_PAGADO")).toBe(false);
    expect(falloPorVencimiento(undefined)).toBe(false);
  });
});
