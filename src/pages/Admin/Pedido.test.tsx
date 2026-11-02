import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { AuthProvider } from "@/auth/AuthContext";
import { formatearPrecio } from "@/lib/formato";
import type { PedidoAdminDetalle, RolUsuario } from "@/types";

import { AccionesPedido, DetallePedido } from "./Pedido";

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

/**
 * Renderiza las acciones con la sesión del rol pedido, dentro de un router de
 * memoria: useFetcher lo necesita.
 */
const acciones = (pedido: PedidoAdminDetalle, rol: RolUsuario = "admin") => {
  const usuario = { id: 1, nombre: "Prueba", email: "prueba@example.com", rol, permisos: [] };
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <AuthProvider usuario={usuario}>
          <AccionesPedido pedido={pedido} />
        </AuthProvider>
      ),
    },
  ]);

  return renderToStaticMarkup(<RouterProvider router={router} />);
};

/** Pedido nuevo, pendiente de pago, sin link de Mercado Pago: se puede cancelar. */
const cancelable = (cambios: Partial<PedidoAdminDetalle> = {}) => {
  const base = detalle();
  return detalle({
    estadoPago: "pendiente",
    estadoPedido: "nuevo",
    pago: { ...base.pago, tieneLinkMercadoPago: false },
    ...cambios,
  });
};

describe("AccionesPedido", () => {
  test("en preparación con envío pide el seguimiento y ofrece marcar enviado", () => {
    const html = acciones(detalle());

    expect(html).toContain('name="intencion" value="enviar"');
    expect(html).toContain('name="seguimiento"');
    expect(html).toContain("Marcar como enviado");
  });

  test("un retiro no pide seguimiento", () => {
    const base = detalle();
    const html = acciones(detalle({ entrega: { ...base.entrega, metodo: "retiro" } }));

    expect(html).toContain('value="enviar"');
    expect(html).not.toContain('name="seguimiento"');
  });

  test("sin acciones posibles no muestra el bloque", () => {
    expect(acciones(detalle({ estadoPedido: "entregado" }))).toBe("");
  });

  test("un admin puede cancelar un pedido nuevo sin pagar", () => {
    const html = acciones(cancelable());

    expect(html).toContain('value="cancelar"');
    expect(html).toContain('name="motivo"');
    expect(html).not.toContain('name="confirmaSinPago"');
  });

  test("un operador no ve la cancelación", () => {
    expect(acciones(cancelable(), "operador")).toBe("");
  });

  test("con link de Mercado Pago el botón está deshabilitado y explica por qué", () => {
    const base = detalle();
    const html = acciones(cancelable({ pago: { ...base.pago, tieneLinkMercadoPago: true } }));

    expect(html).not.toContain('value="cancelar"');
    expect(html).toMatch(/<button[^>]*disabled[^>]*aria-describedby="aviso-mercado-pago"/);
    expect(html).toContain("puede haber un pago en proceso");
  });

  test("si la clienta avisó que transfirió, pide la confirmación", () => {
    const base = detalle();
    const html = acciones(
      cancelable({
        pago: { ...base.pago, tieneLinkMercadoPago: false, comprobanteInformadoEn: "2026-10-30T12:00:00.000Z" },
      }),
    );

    // React no respeta el orden de los atributos: se revisa cada uno.
    const casilla = html.match(/<input type="checkbox"[^>]*>/)?.[0] ?? "";
    expect(casilla).toContain('name="confirmaSinPago"');
    expect(casilla).toContain('value="true"');
    expect(casilla).toContain("required");
  });
});
