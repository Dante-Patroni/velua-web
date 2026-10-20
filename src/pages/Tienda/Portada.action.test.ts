import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarProductosTienda } from "@/lib/api/catalogo.api";
import { ErrorApi } from "@/lib/apiFetch";
import {
  CANTIDAD_DESTACADOS,
  CANTIDAD_PROXIMOS,
  cargarPortada,
  ordenarPorLanzamiento,
} from "@/pages/Tienda/Portada.action";
import type { ListadoProductos, ProductoListado } from "@/types";

vi.mock("@/lib/api/catalogo.api", () => ({ listarProductosTienda: vi.fn() }));

const argumentos = () =>
  ({ request: new Request("http://localhost/"), params: {}, context: {} }) as LoaderFunctionArgs;

const lanzamiento = (id: number, disponibleDesde: string | null) =>
  ({ id, disponibleDesde, proximamente: true }) as ProductoListado;

const listado = (datos: ProductoListado[]) =>
  ({ datos, meta: { pagina: 1, limite: 50, total: datos.length } }) as unknown as ListadoProductos;

describe("ordenarPorLanzamiento", () => {
  it("ordena por fecha comparando el texto, del más cercano al más lejano", () => {
    const ordenados = ordenarPorLanzamiento([
      lanzamiento(1, "2026-12-01"),
      lanzamiento(2, "2026-11-05"),
      lanzamiento(3, "2027-01-02"),
    ]);

    expect(ordenados.map(({ id }) => id)).toEqual([2, 1, 3]);
  });

  it("deja al final los que no tienen fecha y no modifica la lista original", () => {
    const original = [lanzamiento(1, null), lanzamiento(2, "2026-11-05")];

    expect(ordenarPorLanzamiento(original).map(({ id }) => id)).toEqual([2, 1]);
    expect(original.map(({ id }) => id)).toEqual([1, 2]);
  });
});

describe("cargarPortada", () => {
  beforeEach(() => {
    vi.mocked(listarProductosTienda).mockReset();
  });

  it("pide solo los destacados, con el límite de la portada", async () => {
    vi.mocked(listarProductosTienda).mockResolvedValue(listado([]));

    await cargarPortada(argumentos());

    expect(listarProductosTienda).toHaveBeenCalledWith(
      { destacados: true, limite: CANTIDAD_DESTACADOS },
      expect.any(AbortSignal),
    );
  });

  it("si la API falla, la portada sigue sin destacados", async () => {
    vi.mocked(listarProductosTienda).mockRejectedValue(new ErrorApi("ERROR_DE_RED", 0));

    await expect(cargarPortada(argumentos())).resolves.toEqual({ destacados: [], proximos: [] });
  });

  it("pide los lanzamientos con proximamente=true", async () => {
    vi.mocked(listarProductosTienda).mockResolvedValue(listado([]));

    await cargarPortada(argumentos());

    expect(listarProductosTienda).toHaveBeenCalledWith(
      expect.objectContaining({ proximamente: true }),
      expect.any(AbortSignal),
    );
  });

  it("muestra los lanzamientos más cercanos primero y respeta el tope de la portada", async () => {
    const fechas = ["2026-12-09", "2026-11-05", "2026-11-20", "2027-01-10", "2026-11-01", "2026-12-24"];
    vi.mocked(listarProductosTienda).mockImplementation(async (filtros) =>
      filtros?.proximamente
        ? listado(fechas.map((fecha, indice) => lanzamiento(indice, fecha)))
        : listado([]),
    );

    const { proximos } = await cargarPortada(argumentos());

    expect(proximos).toHaveLength(CANTIDAD_PROXIMOS);
    expect(proximos.map(({ disponibleDesde }) => disponibleDesde)).toEqual([
      "2026-11-01",
      "2026-11-05",
      "2026-11-20",
      "2026-12-09",
    ]);
  });

  it("si fallan solo los lanzamientos, los destacados siguen apareciendo", async () => {
    const destacado = { id: 9 } as ProductoListado;
    vi.mocked(listarProductosTienda).mockImplementation(async (filtros) => {
      if (filtros?.proximamente) throw new ErrorApi("ERROR_DE_RED", 0);
      return listado([destacado]);
    });

    await expect(cargarPortada(argumentos())).resolves.toEqual({
      destacados: [destacado],
      proximos: [],
    });
  });

  it("deja pasar una navegación cancelada", async () => {
    const cancelada = new DOMException("cancelada", "AbortError");
    vi.mocked(listarProductosTienda).mockRejectedValue(cancelada);

    await expect(cargarPortada(argumentos())).rejects.toBe(cancelada);
  });
});
