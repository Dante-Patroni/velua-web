import { describe, expect, it } from "vitest";

import {
  MAX_CONSULTAS_PEDIDO,
  debeConsultarPedido,
  intentosAgotados,
  pedidoVencido,
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

describe("pedidoVencido", () => {
  const LIMITE = "2026-10-26T20:00:00.000Z";
  const limite = Date.parse(LIMITE);

  it("no venció antes del límite", () => {
    expect(pedidoVencido(LIMITE, limite - 1)).toBe(false);
  });

  it("venció en el instante del límite y después", () => {
    expect(pedidoVencido(LIMITE, limite)).toBe(true);
    expect(pedidoVencido(LIMITE, limite + 60_000)).toBe(true);
  });

  it("sin fecha no vence", () => {
    expect(pedidoVencido(null, limite)).toBe(false);
    expect(pedidoVencido(undefined, limite)).toBe(false);
    expect(pedidoVencido("", limite)).toBe(false);
  });

  it("con una fecha ilegible no se declara vencido: lo decide la API", () => {
    expect(pedidoVencido("mañana", limite)).toBe(false);
  });
});

describe("puedePagarPedido", () => {
  const LIMITE = "2026-10-26T20:00:00.000Z";
  const limite = Date.parse(LIMITE);
  const base = { medioPago: "mercadopago", estadoPago: "pendiente", expiraEn: LIMITE } as const;

  it("ofrece pagar un pedido pendiente con la reserva vigente", () => {
    expect(puedePagarPedido(base, limite - 1)).toBe(true);
  });

  it("ofrece pagar de nuevo un pedido rechazado con la reserva vigente", () => {
    expect(puedePagarPedido({ ...base, estadoPago: "rechazado" }, limite - 1)).toBe(true);
  });

  it("no ofrece pagar si el pedido venció, esté pendiente o rechazado", () => {
    expect(puedePagarPedido(base, limite)).toBe(false);
    expect(puedePagarPedido({ ...base, estadoPago: "rechazado" }, limite + 1)).toBe(false);
  });

  it("no ofrece pagar un pedido ya pagado, devuelto o cancelado", () => {
    for (const estadoPago of ["aprobado", "devuelto", "cancelado"] as const) {
      expect(puedePagarPedido({ ...base, estadoPago }, limite - 1)).toBe(false);
    }
  });

  it("no ofrece pagar un pedido de transferencia", () => {
    expect(puedePagarPedido({ ...base, medioPago: "transferencia" }, limite - 1)).toBe(false);
  });

  it("sin fecha de vencimiento ofrece pagar: no hay con qué declararlo vencido", () => {
    expect(puedePagarPedido({ ...base, expiraEn: null }, limite + 1_000_000)).toBe(true);
  });
});
