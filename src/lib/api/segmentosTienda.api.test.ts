import { beforeEach, describe, expect, test, vi } from "vitest";

import { obtenerProductoTienda } from "@/lib/api/catalogo.api";
import { iniciarPago, obtenerPedido } from "@/lib/api/pedidos.api";
import { apiFetch } from "@/lib/apiFetch";

// Solo se reemplaza apiFetch: ErrorApi tiene que ser el de verdad.
vi.mock("@/lib/apiFetch", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/apiFetch")>()),
  apiFetch: vi.fn(),
}));

describe("segmentos de URL de la tienda", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
    vi.mocked(apiFetch).mockResolvedValue({});
  });

  test.each(["", ".", ".."])("con %j no se pide nada a la API", async (valor) => {
    const noEncontrado = { codigo: "NO_ENCONTRADO", status: 404 };

    await expect(obtenerProductoTienda(valor)).rejects.toMatchObject(noEncontrado);
    await expect(obtenerPedido(valor)).rejects.toMatchObject(noEncontrado);
    await expect(iniciarPago(valor)).rejects.toMatchObject(noEncontrado);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  test("un valor normal arma la ruta de siempre", async () => {
    await obtenerProductoTienda("eclat-noir");
    await obtenerPedido("VEL-4K7Q2X");
    await iniciarPago("VEL-4K7Q2X");

    expect(apiFetch).toHaveBeenNthCalledWith(1, "/productos/eclat-noir", { signal: undefined });
    expect(apiFetch).toHaveBeenNthCalledWith(2, "/pedidos/VEL-4K7Q2X", { signal: undefined });
    expect(apiFetch).toHaveBeenNthCalledWith(3, "/pedidos/VEL-4K7Q2X/pago", { method: "POST" });
  });
});
