import { describe, expect, test } from "vitest";

import type { ErrorAccionPedido } from "./Pedido.action";
import {
  accionesDelPedido,
  erroresSinBoton,
  formulariosVisibles,
  type DatosAcciones,
  type FormularioAccion,
} from "./Pedido.utils";

/** Pedido nuevo, pagado, con envío y sin link de Mercado Pago. */
const pedido = (cambios: Partial<DatosAcciones> = {}): DatosAcciones => ({
  estadoPago: "aprobado",
  estadoPedido: "nuevo",
  medioPago: "mercadopago",
  entrega: { metodo: "envio" },
  pago: { tieneLinkMercadoPago: false, comprobanteInformadoEn: null },
  ...cambios,
});

describe("accionesDelPedido: preparación", () => {
  test.each([
    ["nuevo", "preparar"],
    ["en_preparacion", "enviar"],
    ["enviado", "entregar"],
    ["entregado", null],
    ["cancelado", null],
  ] as const)("pagado y %s ofrece %s", (estadoPedido, avance) => {
    expect(accionesDelPedido(pedido({ estadoPedido })).avance).toBe(avance);
  });

  test.each(["pendiente", "rechazado", "devuelto", "cancelado"] as const)(
    "sin pago aprobado (%s) no ofrece avanzar",
    (estadoPago) => {
      expect(accionesDelPedido(pedido({ estadoPago })).avance).toBeNull();
    },
  );

  test("pide seguimiento solo al enviar por correo", () => {
    expect(accionesDelPedido(pedido({ estadoPedido: "en_preparacion" })).pideSeguimiento).toBe(true);
    expect(
      accionesDelPedido(pedido({ estadoPedido: "en_preparacion", entrega: { metodo: "retiro" } }))
        .pideSeguimiento,
    ).toBe(false);
    expect(accionesDelPedido(pedido({ estadoPedido: "nuevo" })).pideSeguimiento).toBe(false);
  });
});

describe("accionesDelPedido: cancelación", () => {
  test.each(["pendiente", "rechazado"] as const)("nuevo y %s se puede cancelar", (estadoPago) => {
    expect(accionesDelPedido(pedido({ estadoPago })).cancelacion).toBe("disponible");
  });

  test.each(["aprobado", "devuelto", "cancelado"] as const)(
    "con el pago %s no se ofrece cancelar",
    (estadoPago) => {
      expect(accionesDelPedido(pedido({ estadoPago })).cancelacion).toBeNull();
    },
  );

  test("fuera de nuevo no se ofrece cancelar", () => {
    expect(
      accionesDelPedido(pedido({ estadoPago: "pendiente", estadoPedido: "cancelado" })).cancelacion,
    ).toBeNull();
  });

  test("con link de Mercado Pago el botón queda bloqueado", () => {
    const resultado = accionesDelPedido(
      pedido({ estadoPago: "pendiente", pago: { tieneLinkMercadoPago: true, comprobanteInformadoEn: null } }),
    );

    expect(resultado.cancelacion).toBe("mercado-pago");
  });

  test("si la clienta avisó que transfirió, pide confirmar que no llegó", () => {
    const conAviso = pedido({
      estadoPago: "pendiente",
      pago: { tieneLinkMercadoPago: false, comprobanteInformadoEn: "2026-10-30T12:00:00.000Z" },
    });

    expect(accionesDelPedido(conAviso).pideConfirmacionSinPago).toBe(true);
    expect(accionesDelPedido(pedido({ estadoPago: "pendiente" })).pideConfirmacionSinPago).toBe(false);
  });
});

describe("accionesDelPedido: transferencia", () => {
  /** Transferencia sin pagar y sin aviso: el caso en que se ofrecen los dos botones. */
  const transferencia = (cambios: Partial<DatosAcciones> = {}) =>
    pedido({ medioPago: "transferencia", estadoPago: "pendiente", ...cambios });

  const AVISADO = { tieneLinkMercadoPago: false, comprobanteInformadoEn: "2026-11-03T12:00:00.000Z" };

  test.each(["pendiente", "rechazado"] as const)(
    "con el pago %s ofrece registrar el aviso y confirmar el pago",
    (estadoPago) => {
      const resultado = accionesDelPedido(transferencia({ estadoPago }));

      expect(resultado.registrarAviso).toBe(true);
      expect(resultado.confirmarPago).toBe(true);
    },
  );

  test("con el aviso ya registrado sigue ofreciendo confirmar, pero no avisar", () => {
    const resultado = accionesDelPedido(transferencia({ pago: AVISADO }));

    expect(resultado.registrarAviso).toBe(false);
    expect(resultado.confirmarPago).toBe(true);
  });

  test.each(["aprobado", "devuelto", "cancelado"] as const)(
    "con el pago %s no ofrece ninguno",
    (estadoPago) => {
      const resultado = accionesDelPedido(transferencia({ estadoPago }));

      expect(resultado.registrarAviso).toBe(false);
      expect(resultado.confirmarPago).toBe(false);
    },
  );

  test("con el pedido cancelado no ofrece ninguno, aunque el pago siga pendiente", () => {
    const resultado = accionesDelPedido(transferencia({ estadoPedido: "cancelado" }));

    expect(resultado.registrarAviso).toBe(false);
    expect(resultado.confirmarPago).toBe(false);
  });

  test("con Mercado Pago no ofrece ninguno", () => {
    const resultado = accionesDelPedido(pedido({ medioPago: "mercadopago", estadoPago: "pendiente" }));

    expect(resultado.registrarAviso).toBe(false);
    expect(resultado.confirmarPago).toBe(false);
  });
});

describe("formulariosVisibles", () => {
  const transferenciaPendiente = accionesDelPedido(
    pedido({ medioPago: "transferencia", estadoPago: "pendiente" }),
  );

  test("un admin ve cancelar, registrar el aviso y confirmar el pago", () => {
    expect(formulariosVisibles(transferenciaPendiente, true)).toEqual({
      avance: false,
      cancelacion: true,
      aviso: true,
      confirmacion: true,
    });
  });

  test("un operador no ve ninguno de los tres", () => {
    expect(formulariosVisibles(transferenciaPendiente, false)).toEqual({
      avance: false,
      cancelacion: false,
      aviso: false,
      confirmacion: false,
    });
  });

  test("con link de Mercado Pago no hay formulario de cancelar, solo el botón bloqueado", () => {
    const acciones = accionesDelPedido(
      pedido({ estadoPago: "pendiente", pago: { tieneLinkMercadoPago: true, comprobanteInformadoEn: null } }),
    );

    expect(formulariosVisibles(acciones, true).cancelacion).toBe(false);
  });

  test("el avance lo ve cualquier rol", () => {
    const pagado = accionesDelPedido(pedido());

    expect(formulariosVisibles(pagado, false).avance).toBe(true);
  });
});

describe("erroresSinBoton", () => {
  const error = (intencion: string, codigo: string): ErrorAccionPedido => ({ codigo, intencion });
  const ninguno: Record<FormularioAccion, boolean> = {
    avance: false,
    cancelacion: false,
    aviso: false,
    confirmacion: false,
  };

  test("el aviso rechazado desde una pestaña vieja se muestra aunque su botón ya no esté", () => {
    const yaPagado = error("registrarAviso", "PEDIDO_YA_PAGADO");

    expect(erroresSinBoton({ aviso: yaPagado }, { ...ninguno, avance: true })).toEqual([yaPagado]);
  });

  test("la cancelación rechazada desde una pestaña vieja también", () => {
    const pagado = error("cancelar", "PEDIDO_PAGADO");

    expect(erroresSinBoton({ cancelacion: pagado }, ninguno)).toEqual([pagado]);
  });

  test("si el botón sigue en la pantalla, el error va junto a él y no arriba", () => {
    expect(
      erroresSinBoton(
        { confirmacion: error("confirmarPago", "DATOS_INVALIDOS") },
        { ...ninguno, confirmacion: true },
      ),
    ).toEqual([]);
  });

  test("sin errores no muestra nada", () => {
    expect(erroresSinBoton({}, ninguno)).toEqual([]);
  });

  test("devuelve los errores siempre en el mismo orden", () => {
    const deAvance = error("preparar", "TRANSICION_INVALIDA");
    const deConfirmacion = error("confirmarPago", "PEDIDO_NO_PAGABLE");

    expect(erroresSinBoton({ confirmacion: deConfirmacion, avance: deAvance }, ninguno)).toEqual([
      deAvance,
      deConfirmacion,
    ]);
  });
});
