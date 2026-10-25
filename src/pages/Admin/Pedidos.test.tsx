import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { formatearPrecio } from "@/lib/formato";
import type { PedidoAdminFila } from "@/types";

import { ListaPedidos } from "./Pedidos";

/** Fila de ejemplo, con lo que se cambie en cada test. */
const fila = (cambios: Partial<PedidoAdminFila> = {}): PedidoAdminFila => ({
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
  ...cambios,
});

/** Renderiza dentro de un router de memoria: Link lo necesita. */
const render = (ui: React.ReactElement) => renderToStaticMarkup(<MemoryRouter>{ui}</MemoryRouter>);

describe("ListaPedidos", () => {
  test("muestra como texto un nombre con HTML, sin interpretarlo", () => {
    const html = render(
      <ListaPedidos datos={[fila({ clienteNombre: '<img src=x onerror="alert(1)">' })]} />
    );

    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  test("muestra el total formateado tal como viene de la API", () => {
    const html = render(<ListaPedidos datos={[fila()]} />);
    expect(html).toContain(formatearPrecio("39350.00"));
  });

  test("traduce los estados con sus etiquetas y no muestra el código crudo", () => {
    const html = render(<ListaPedidos datos={[fila()]} />);

    expect(html).toContain("Pagado");
    expect(html).toContain("En preparación");
    expect(html).not.toContain("en_preparacion");
  });

  test("el link del pedido usa el id, no el número comercial", () => {
    const html = render(<ListaPedidos datos={[fila()]} />);

    expect(html).toContain('href="/admin/pedidos/12"');
    expect(html).not.toContain('href="/admin/pedidos/VEL-');
  });
});