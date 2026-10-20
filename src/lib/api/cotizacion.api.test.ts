import { beforeEach, describe, expect, it, vi } from "vitest";

import { cotizarCarrito } from "@/lib/api/cotizacion.api";
import { apiFetch } from "@/lib/apiFetch";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

describe("cotizarCarrito", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("envía por POST solo ids y cantidades, sin precios", async () => {
    vi.mocked(apiFetch).mockResolvedValue({});
    const señal = new AbortController().signal;

    await cotizarCarrito([{ varianteId: 16, cantidad: 2 }], señal);

    expect(apiFetch).toHaveBeenCalledWith("/cotizar", {
      method: "POST",
      body: JSON.stringify({ items: [{ varianteId: 16, cantidad: 2 }] }),
      signal: señal,
    });
  });

  it("con zona y medio de pago los manda junto con el carrito, para el checkout", async () => {
    vi.mocked(apiFetch).mockResolvedValue({});

    await cotizarCarrito([{ varianteId: 16, cantidad: 1 }], undefined, {
      zonaEnvioId: 2,
      medioPago: "mercadopago",
    });

    expect(apiFetch).toHaveBeenCalledWith("/cotizar", {
      method: "POST",
      body: JSON.stringify({
        items: [{ varianteId: 16, cantidad: 1 }],
        zonaEnvioId: 2,
        medioPago: "mercadopago",
      }),
      signal: undefined,
    });
  });
});
