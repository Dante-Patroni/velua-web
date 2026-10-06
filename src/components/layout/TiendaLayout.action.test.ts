import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { cargarTiendaLayout } from "@/components/layout/TiendaLayout.action";
import { listarCategorias } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";

vi.mock("@/lib/api/catalogo.api", () => ({ listarCategorias: vi.fn() }));

const argumentos = () =>
  ({ request: new Request("http://localhost/"), params: {}, context: {} }) as LoaderFunctionArgs;

describe("cargarTiendaLayout", () => {
  // Con llaves: si devolviera el mock, Vitest lo llamaría como limpieza.
  beforeEach(() => {
    vi.mocked(listarCategorias).mockReset();
  });

  it("devuelve las categorías de la API", async () => {
    const categorias = [{ id: 1, nombre: "Combos", slug: "combos" }];
    vi.mocked(listarCategorias).mockResolvedValue({ datos: categorias });

    await expect(cargarTiendaLayout(argumentos())).resolves.toEqual({ categorias });
  });

  it("si la API falla, la tienda sigue con el menú vacío", async () => {
    vi.mocked(listarCategorias).mockRejectedValue(new ErrorApi("ERROR_DE_RED", 0));

    await expect(cargarTiendaLayout(argumentos())).resolves.toEqual({ categorias: [] });
  });

  it("deja pasar una navegación cancelada", async () => {
    const cancelada = new DOMException("cancelada", "AbortError");
    vi.mocked(listarCategorias).mockRejectedValue(cancelada);

    await expect(cargarTiendaLayout(argumentos())).rejects.toBe(cancelada);
  });
});
