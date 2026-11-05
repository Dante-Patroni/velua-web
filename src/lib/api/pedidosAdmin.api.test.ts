import { beforeEach, describe, expect, it, vi } from "vitest";

import { confirmarPago, registrarAviso } from "@/lib/api/pedidosAdmin.api";
import { apiFetch } from "@/lib/apiFetch";
import type { ConfirmacionPagoEntrada } from "@/types";

vi.mock("@/lib/apiFetch", () => ({ apiFetch: vi.fn() }));

describe("pago por transferencia desde el panel", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue({});
  });

  it("registrarAviso hace POST a la ruta del aviso, sin cuerpo", async () => {
    await registrarAviso(12);

    expect(apiFetch).toHaveBeenCalledWith("/admin/pedidos/12/aviso", { method: "POST" });
  });

  it("confirmarPago hace POST con verificadoEnBanco y nada más", async () => {
    // Un objeto con campos de más, como si alguien los agregara al formulario.
    const entrada = {
      verificadoEnBanco: true,
      usuarioId: 999999,
      estadoPago: "aprobado",
    } as unknown as ConfirmacionPagoEntrada;

    await confirmarPago(12, entrada);

    expect(apiFetch).toHaveBeenCalledWith("/admin/pedidos/12/pago-confirmado", {
      method: "POST",
      body: JSON.stringify({ verificadoEnBanco: true }),
    });
  });
});
