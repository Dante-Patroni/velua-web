import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  actualizarCategoria,
  cambiarEstadoCategoria,
  crearCategoria,
  reordenarCategorias,
} from "@/lib/api/catalogoAdmin.api";
import { quitarImagenCategoria, subirImagenCategoria } from "@/lib/api/imagenes.api";
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

describe("accionCategorias · id del formulario", () => {
  beforeEach(() => vi.clearAllMocks());

  /** Operaciones que trabajan sobre una categoría existente. */
  const CON_ID = ["guardar", "estado", "subir-imagen", "quitar-imagen"];

  it("con un id inválido, ninguna operación sobre una categoría llama a la API", async () => {
    for (const id of ["abc", "", "0", "-1", "1.5", "1e2", "NaN", "../5"]) {
      for (const intencion of CON_ID) {
        const resultado = await ejecutar([
          ["intencion", intencion],
          ["id", id],
        ]);
        expect(resultado, `${intencion} con "${id}"`).toMatchObject({ codigo: "DATOS_INVALIDOS" });
      }
    }

    expect(actualizarCategoria).not.toHaveBeenCalled();
    expect(cambiarEstadoCategoria).not.toHaveBeenCalled();
    expect(subirImagenCategoria).not.toHaveBeenCalled();
    expect(quitarImagenCategoria).not.toHaveBeenCalled();
  });

  it("sin id tampoco llama a la API", async () => {
    for (const intencion of CON_ID) {
      const resultado = await ejecutar([["intencion", intencion]]);
      expect(resultado, intencion).toMatchObject({ codigo: "DATOS_INVALIDOS" });
    }

    expect(actualizarCategoria).not.toHaveBeenCalled();
    expect(quitarImagenCategoria).not.toHaveBeenCalled();
  });

  it("con un id válido manda el número", async () => {
    await ejecutar([
      ["intencion", "guardar"],
      ["id", "7"],
      ["nombre", "Sets"],
    ]);
    await ejecutar([
      ["intencion", "estado"],
      ["id", "7"],
      ["activa", "true"],
    ]);

    expect(actualizarCategoria).toHaveBeenCalledWith(7, expect.anything());
    expect(cambiarEstadoCategoria).toHaveBeenCalledWith(7, true);
  });

  it("ordenar no necesita id", async () => {
    await ejecutar([
      ["intencion", "orden"],
      ["ids", "3,1,2"],
    ]);

    expect(reordenarCategorias).toHaveBeenCalledWith([3, 1, 2]);
  });
});
