import { beforeEach, describe, expect, it, vi } from "vitest";

import { cotizarVentaPanel, registrarVentaPanel } from "@/lib/api/ventasPanel.api";
import { apiFetch } from "@/lib/apiFetch";
import type { VentaPanelEntrada } from "@/types";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

const CLAVE = "3f1c2a9e-5b7d-4e8a-9c21-7d4e5f6a8b90";

describe("cotizarVentaPanel", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("envía por POST el carrito y la entrega, sin precios", async () => {
    vi.mocked(apiFetch).mockResolvedValue({});
    const señal = new AbortController().signal;
    const entrada = { items: [{ varianteId: 16, cantidad: 2 }], entrega: { metodo: "retiro" as const } };

    await cotizarVentaPanel(entrada, señal);

    expect(apiFetch).toHaveBeenCalledWith("/admin/ventas/cotizacion", {
      method: "POST",
      body: JSON.stringify(entrada),
      signal: señal,
    });
  });
});

describe("registrarVentaPanel", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  const venta: VentaPanelEntrada = {
    items: [{ varianteId: 16, cantidad: 1 }],
    cliente: { nombre: "Lucía Fernández", telefono: "358 412-3344" },
    entrega: { metodo: "en_mano" },
    medioPago: "efectivo",
    totalEsperado: "7650.00",
  };

  it("manda la clave en el encabezado Idempotency-Key y no en el cuerpo", async () => {
    vi.mocked(apiFetch).mockResolvedValue({});

    await registrarVentaPanel(venta, CLAVE);

    expect(apiFetch).toHaveBeenCalledWith("/admin/ventas", {
      method: "POST",
      headers: { "Idempotency-Key": CLAVE },
      body: JSON.stringify(venta),
    });
    expect(JSON.stringify(venta)).not.toContain(CLAVE);
  });

  it("un reintento manda la misma clave", async () => {
    vi.mocked(apiFetch).mockResolvedValue({});

    await registrarVentaPanel(venta, CLAVE);
    await registrarVentaPanel(venta, CLAVE);

    const claves = vi.mocked(apiFetch).mock.calls.map(([, opciones]) => opciones?.headers);
    expect(claves[0]).toEqual(claves[1]);
  });
});
