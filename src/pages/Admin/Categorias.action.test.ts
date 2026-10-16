import { beforeEach, describe, expect, it, vi } from "vitest";

import { crearCategoria } from "@/lib/api/catalogoAdmin.api";
import { accionCategorias } from "@/pages/Admin/Categorias.action";

vi.mock("@/lib/api/catalogoAdmin.api", () => ({
  actualizarCategoria: vi.fn(),
  cambiarEstadoCategoria: vi.fn(),
  crearCategoria: vi.fn(),
  listarCategoriasAdmin: vi.fn(),
  reordenarCategorias: vi.fn(),
}));

vi.mock("@/lib/api/imagenes.api", () => ({
  quitarImagenCategoria: vi.fn(),
  subirImagenCategoria: vi.fn(),
}));

/**
 * Ejecuta la action como lo haría el router, con los pares dados.
 */
const ejecutar = (pares: Array<[string, string]>) => {
  const cuerpo = new URLSearchParams(pares);
  const request = new Request("http://localhost/admin/categorias", {
    method: "POST",
    body: cuerpo,
  });
  return accionCategorias({ request, params: {}, context: undefined } as never);
};

describe("accionCategorias · crear", () => {
  beforeEach(() => vi.clearAllMocks());

  it("crea la categoría una sola vez, con el padre del formulario", async () => {
    await ejecutar([
      ["intencion", "crear"],
      ["nombre", "Sets"],
      ["descripcion", ""],
      ["padreId", "7"],
    ]);

    expect(crearCategoria).toHaveBeenCalledTimes(1);
    expect(crearCategoria).toHaveBeenCalledWith({
      nombre: "Sets",
      descripcion: null,
      padreId: 7,
    });
  });

  it("crea una sola vez de primer nivel cuando no se elige padre", async () => {
    await ejecutar([
      ["intencion", "crear"],
      ["nombre", "Sets"],
      ["padreId", ""],
    ]);

    expect(crearCategoria).toHaveBeenCalledTimes(1);
    expect(crearCategoria).toHaveBeenCalledWith(
      expect.objectContaining({ padreId: null })
    );
  });
});
