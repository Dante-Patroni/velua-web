import { renderToStaticMarkup } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import type { PedidoPublico } from "@/types";

import { Pedido } from "./Pedido";

const whatsapp = vi.hoisted(() => ({ numero: "5493584000000" }));

vi.mock("@/lib/mappings", async (original) => ({
  ...(await original<typeof import("@/lib/mappings")>()),
  get WHATSAPP_NUMERO() {
    return whatsapp.numero;
  },
}));

const datos = {
  alias: "velua.prueba.mp",
  cbu: "0000000000000000000000",
  titular: "Tienda de Prueba",
  monto: "23500.00",
};

const pedidoBase = {
  numero: "VEL-4K7Q2X",
  medioPago: "transferencia",
  estadoPago: "pendiente",
  estadoPedido: "nuevo",
  expiraEn: "2026-11-05T15:00:00.000Z",
  comprobanteInformado: false,
  transferencia: datos,
  totales: { subtotal: "23500.00", total: "23500.00" },
  items: [],
} as unknown as PedidoPublico;

/** Renderiza la página con el pedido que dejaría el loader, sin red. */
const renderizar = async (cambios: Partial<PedidoPublico>) => {
  const pedido = { ...pedidoBase, ...cambios };
  const rutas = [{ path: "/pedido/:numero", Component: Pedido, loader: () => ({ pedido, error: null }) }];
  const manejador = createStaticHandler(rutas);
  const contexto = await manejador.query(new Request("http://localhost/pedido/VEL-4K7Q2X"));

  if (contexto instanceof Response) throw new Error("redirección inesperada");

  const router = createStaticRouter(manejador.dataRoutes, contexto);

  return renderToStaticMarkup(<StaticRouterProvider router={router} context={contexto} />);
};

describe("página del pedido por transferencia", () => {
  it("muestra los datos y el botón si la API manda transferencia", async () => {
    const html = await renderizar({});

    expect(html).toContain("velua.prueba.mp");
    expect(html).toContain("0000000000000000000000");
    expect(html).toContain("Tienda de Prueba");
    expect(html).toContain("Ya transferí");
    expect(html).toContain("Datos para transferir");
  });

  it("no muestra los datos ni el botón si transferencia es null", async () => {
    const html = await renderizar({ transferencia: null });

    expect(html).not.toContain("velua.prueba.mp");
    expect(html).not.toContain("0000000000000000000000");
    expect(html).not.toContain("Ya transferí");
  });

  it("con el aviso hecho muestra el texto de aviso y no el botón", async () => {
    const html = await renderizar({ comprobanteInformado: true });

    expect(html).toContain("Avisaste que transferiste");
    expect(html).not.toContain(">Ya transferí<");
    expect(html).not.toMatch(/Recibimos tu pago|pago confirmado/i);
  });

  it("con el aviso hecho deja los datos plegados bajo 'Ver los datos otra vez'", async () => {
    const html = await renderizar({ comprobanteInformado: true });

    expect(html).toContain("<details");
    expect(html).toContain("Ver los datos otra vez");
  });

  it("el enlace de WhatsApp lleva solo el número del pedido", async () => {
    const html = await renderizar({ comprobanteInformado: true });
    const esperado = `href="https://wa.me/5493584000000?text=${encodeURIComponent("Hola, ya transferí el pedido VEL-4K7Q2X")}"`;

    expect(html).toContain(esperado);
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("sin número de WhatsApp no nombra WhatsApp ni arma un enlace, pero el aviso y los datos siguen", async () => {
    whatsapp.numero = "";

    try {
      const html = await renderizar({ comprobanteInformado: true });

      expect(html).toContain("Avisaste que transferiste");
      expect(html).toContain("Ver los datos otra vez");
      expect(html).not.toContain("wa.me");
      expect(html).not.toContain("comprobante por WhatsApp");
    } finally {
      whatsapp.numero = "5493584000000";
    }
  });

  it.each(["alias", "cbu", "titular"] as const)("muestra escapado un %s con HTML", async (campo) => {
    const html = await renderizar({ transferencia: { ...datos, [campo]: "<img src=x onerror=alert(1)>" } });

    // El payload no aparece sin escapar, y sí aparece escapado.
    expect(html).not.toContain("<img src=x onerror=");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("no arma enlaces con los datos bancarios", async () => {
    const html = await renderizar({});

    expect(html).not.toMatch(/href="[^"]*(velua\.prueba\.mp|0000000000000000000000)/);
  });

  it("no ofrece pagar con Mercado Pago un pedido por transferencia", async () => {
    const html = await renderizar({});

    expect(html).not.toContain("Pagar con Mercado Pago");
  });
});
