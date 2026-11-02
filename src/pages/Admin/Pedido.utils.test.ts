import { describe, expect, test } from "vitest";

import { accionesDelPedido, type DatosAcciones } from "./Pedido.utils";

/** Pedido nuevo, pagado, con envío y sin link de Mercado Pago. */
const pedido = (cambios: Partial<DatosAcciones> = {}): DatosAcciones => ({
  estadoPago: "aprobado",
  estadoPedido: "nuevo",
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
