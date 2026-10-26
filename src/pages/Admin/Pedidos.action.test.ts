import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { listarPedidos } from "@/lib/api/pedidosAdmin.api";
import { ErrorApi } from "@/lib/apiFetch";

import { LIMITE, cargarPedidos, leerFiltros } from "./Pedidos.action";

vi.mock("@/lib/api/pedidosAdmin.api", () => ({ listarPedidos: vi.fn() }));

const LISTADO_VACIO = { datos: [], meta: { pagina: 1, limite: LIMITE, total: 0 } };

/** Arma los argumentos del loader para una URL. */
const argumentos = (url: string) =>
  ({ request: new Request(url), params: {}, context: {} }) as unknown as LoaderFunctionArgs;

describe("leerFiltros", () => {
  test("sin parámetros pide la primera página sin filtros", () => {
    expect(leerFiltros(new URLSearchParams())).toEqual({
      pagina: 1,
      limite: LIMITE,
      estadoPago: undefined,
      estadoPedido: undefined,
    });
  });

  test("pasa los estados y la página válidos", () => {
    const filtros = leerFiltros(
      new URLSearchParams("estadoPago=aprobado&estadoPedido=en_preparacion&pagina=3")
    );
    expect(filtros).toMatchObject({ pagina: 3, estadoPago: "aprobado", estadoPedido: "en_preparacion" });
  });

  test("descarta estados que no están en la lista", () => {
    for (const valor of ["<script>alert(1)</script>", "constructor", "__proto__", "APROBADO", ""]) {
      const filtros = leerFiltros(new URLSearchParams({ estadoPago: valor, estadoPedido: valor }));
      expect(filtros.estadoPago, valor).toBeUndefined();
      expect(filtros.estadoPedido, valor).toBeUndefined();
    }
  });

  test("vuelve a la página 1 si la página es inválida o pasa el máximo", () => {
    for (const valor of ["-5", "0", "abc", "2.5", "10001", ""]) {
      expect(leerFiltros(new URLSearchParams({ pagina: valor })).pagina, valor).toBe(1);
    }
  });
});

describe("cargarPedidos", () => {
  beforeEach(() => {
    vi.mocked(listarPedidos).mockReset();
  });

  test("pide a la API solo los filtros saneados", async () => {
    vi.mocked(listarPedidos).mockResolvedValue(LISTADO_VACIO);

    await cargarPedidos(argumentos("http://localhost/admin/pedidos?estadoPago=hackeado&pagina=2"));

    expect(listarPedidos).toHaveBeenCalledWith(
      { pagina: 2, limite: LIMITE, estadoPago: undefined, estadoPedido: undefined },
      expect.any(AbortSignal)
    );
  });

  test("deja subir el 401 para que el panel vuelva al login", async () => {
    vi.mocked(listarPedidos).mockRejectedValue(new ErrorApi("NO_AUTORIZADO", 401));

    await expect(cargarPedidos(argumentos("http://localhost/admin/pedidos"))).rejects.toMatchObject({
      status: 401,
    });
  });
});