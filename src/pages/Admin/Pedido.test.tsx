import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { formatearPrecio } from "@/lib/formato";
import type { PedidoAdminDetalle } from "@/types";

import { DetallePedido } from "./Pedido";

const ATAQUE = '<img src=x onerror="alert(1)">';
const ATAQUE_ESCAPADO = "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;";

/** Pedido con envío, con lo que se cambie en cada test. */
const detalle = (cambios: Partial<PedidoAdminDetalle> = {}): PedidoAdminDetalle => ({
  id: 12,
  numero: "VEL-4K7Q2X",
  creadoEn: "2026-10-20T15:00:00.000Z",
  clienteNombre: "Lucía Fernández",
  total: "39350.00",
  medioPago: "mercadopago",
  estadoPago: "aprobado",
  estadoPedido: "en_preparacion",
  metodoEntrega: "envio",
  expiraEn: null,
  cliente: {
    nombre: "Lucía Fernández",
    email: "lucia@example.com",
    telefono: "358 412-3344",
    documento: null,
  },
  entrega: {
    metodo: "envio",
    zona: "Provincia de Córdoba",
    direccion: {
      calle: "San Martín",
      numero: "123",
      extra: null,
      ciudad: "Río Cuarto",
      provincia: "Córdoba",
      cp: "5800",
    },
    seguimiento: null,
  },
  totales: {
    subtotal: "36500.00",
    descuentoCupon: "0.00",
    ajusteMedioPago: "3650.00",
    costoEnvio: "6500.00",
    total: "39350.00",
  },
  pago: { pagoId: "987654", metodo: "visa", comprobanteInformadoEn: null, tieneLinkMercadoPago: true },
  notasCliente: null,
  notasInternas: null,
  items: [
    {
      producto: "Éclat Noir",
      variante: "100 g",
      sku: "VEL-ECLAT-NOIR",
      precioUnitario: "8500.00",
      cantidad: 2,
      subtotal: "17000.00",
    },
  ],
  eventos: [
    {
      campo: "pago",
      estadoAnterior: "pendiente",
      estadoNuevo: "aprobado",
      origen: "webhook",
      usuarioId: null,
      detalle: null,
      creadoEn: "2026-10-20T15:10:00.000Z",
    },
  ],
  ...cambios,
});

describe("DetallePedido", () => {
  test("muestra como texto el HTML de cada campo que escribe la clienta", () => {
    const base = detalle();
    const html = renderToStaticMarkup(
      <DetallePedido
        pedido={detalle({
          cliente: { ...base.cliente, nombre: ATAQUE },
          entrega: { ...base.entrega, direccion: { ...base.entrega.direccion!, calle: ATAQUE } },
          notasCliente: ATAQUE,
        })}
      />
    );

    expect(html).not.toContain("<img");
    expect(html.split(ATAQUE_ESCAPADO).length - 1).toBe(3);
  });

  test("muestra los totales tal como vienen, sin recalcularlos", () => {
    // Total incoherente a propósito: si la pantalla sumara, no aparecería.
    const base = detalle();
    const html = renderToStaticMarkup(
      <DetallePedido pedido={detalle({ totales: { ...base.totales, total: "99999.00" } })} />
    );

    expect(html).toContain(formatearPrecio("99999.00"));
  });

  test("un retiro con los opcionales en null no muestra null ni undefined", () => {
    const base = detalle();
    const html = renderToStaticMarkup(
      <DetallePedido
        pedido={detalle({
          metodoEntrega: "retiro",
          entrega: { metodo: "retiro", zona: null, direccion: null, seguimiento: null },
          pago: { pagoId: null, metodo: null, comprobanteInformadoEn: null, tieneLinkMercadoPago: false },
          items: [{ ...base.items[0], sku: null }],
          eventos: [],
        })}
      />
    );

    expect(html).not.toMatch(/null|undefined/);
    expect(html).toContain("Retiro");
    expect(html).toContain("Sin movimientos.");
  });

  test("el historial traduce el origen y los estados", () => {
    const html = renderToStaticMarkup(<DetallePedido pedido={detalle()} />);

    expect(html).toContain("Origen: Mercado Pago");
    expect(html).toContain("Pago: Pendiente → Pagado");
    expect(html).not.toContain("webhook");
  });
});