import { describe, expect, it } from "vitest";

import {
  MAX_CONSULTAS_PEDIDO,
  debeConsultarPedido,
  falloPorVencimiento,
  botonAvisoDeshabilitado,
  intentosAgotados,
  mensajeTransferencia,
  mostrarDatosTransferencia,
  puedeAvisarTransferencia,
  puedePagarPedido,
  textosDelPedido,
  transferenciaAvisada,
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

const cuenta = { alias: "velua.prueba.mp", cbu: "0000000000000000000000", titular: "Tienda de Prueba", monto: "23500.00" };

describe("mostrarDatosTransferencia", () => {
  it("muestra los datos solo si la API manda transferencia", () => {
    expect(mostrarDatosTransferencia({ transferencia: cuenta })).toBe(true);
    expect(mostrarDatosTransferencia({ transferencia: null })).toBe(false);
    expect(mostrarDatosTransferencia({})).toBe(false);
  });
});

describe("puedeAvisarTransferencia", () => {
  it("ofrece el botón con datos y sin aviso", () => {
    expect(puedeAvisarTransferencia({ transferencia: cuenta, comprobanteInformado: false })).toBe(true);
    expect(puedeAvisarTransferencia({ transferencia: cuenta })).toBe(true);
  });

  it("no lo ofrece con el aviso hecho", () => {
    expect(puedeAvisarTransferencia({ transferencia: cuenta, comprobanteInformado: true })).toBe(false);
  });

  it("no lo ofrece sin datos para transferir", () => {
    expect(puedeAvisarTransferencia({ transferencia: null, comprobanteInformado: false })).toBe(false);
  });
});

describe("transferenciaAvisada", () => {
  it("solo un true explícito cuenta como avisado", () => {
    expect(transferenciaAvisada({ comprobanteInformado: true })).toBe(true);
    expect(transferenciaAvisada({ comprobanteInformado: false })).toBe(false);
    expect(transferenciaAvisada({})).toBe(false);
  });
});

describe("botonAvisoDeshabilitado", () => {
  it("queda deshabilitado mientras viaja el aviso o se recarga la página", () => {
    expect(botonAvisoDeshabilitado("submitting")).toBe(true);
    expect(botonAvisoDeshabilitado("loading")).toBe(true);
  });

  it("se habilita cuando no hay navegación en curso", () => {
    expect(botonAvisoDeshabilitado("idle")).toBe(false);
  });
});

describe("textosDelPedido", () => {
  const transferencia = { medioPago: "transferencia", estadoPago: "pendiente" } as const;

  it("pide transferir si hay datos y no se avisó", () => {
    expect(textosDelPedido({ ...transferencia, transferencia: cuenta, comprobanteInformado: false }, false).titulo).toBe(
      "Falta tu transferencia",
    );
  });

  it("tras el aviso dice que se revisa el banco, nunca que el pago está confirmado", () => {
    const textos = textosDelPedido({ ...transferencia, transferencia: cuenta, comprobanteInformado: true }, false);

    expect(textos.titulo).toBe("Avisaste que transferiste");
    expect(`${textos.titulo} ${textos.detalle}`).not.toMatch(/confirmad|recibimos tu pago|acreditad/i);
  });

  it("sin datos no inventa instrucciones: manda a WhatsApp", () => {
    expect(textosDelPedido({ ...transferencia, transferencia: null, comprobanteInformado: false }, false).detalle).toMatch(
      /WhatsApp/,
    );
  });

  it("un vencimiento que informó la API pisa lo demás", () => {
    expect(textosDelPedido({ ...transferencia, transferencia: cuenta, comprobanteInformado: false }, true).titulo).toBe(
      "Tu pedido venció",
    );
  });

  it("un pedido de Mercado Pago sigue con sus textos", () => {
    expect(
      textosDelPedido({ medioPago: "mercadopago", estadoPago: "pendiente", transferencia: null }, false).titulo,
    ).toBe("Estamos esperando tu pago");
  });

  it("el pago aprobado se dice solo cuando la API lo aprobó", () => {
    expect(textosDelPedido({ ...transferencia, estadoPago: "aprobado", transferencia: null }, false).titulo).toBe(
      "¡Recibimos tu pago!",
    );
  });
});

describe("mensajeTransferencia", () => {
  it("lleva solo el número del pedido", () => {
    expect(mensajeTransferencia("VEL-4K7Q2X")).toBe("Hola, ya transferí el pedido VEL-4K7Q2X");
  });
});
