import { describe, expect, it } from "vitest";
import type { CategoriaAdmin } from "@/types";
import { entradasColeccion } from "./OpcionesColeccion.utils";

const cat = (id: number, cambios: Partial<CategoriaAdmin> = {}) =>
  ({
    id,
    nombre: `C${id}`,
    activa: true,
    padreId: null,
    cantidadHijas: 0,
    ...cambios,
  }) as CategoriaAdmin;

describe("entradasColeccion", () => {
  it("las categorías sin hijas quedan como opciones", () => {
    const r = entradasColeccion([cat(1), cat(2)]);

    expect(r).toEqual([
      { tipo: "opcion", categoria: cat(1) },
      { tipo: "opcion", categoria: cat(2) },
    ]);
  });

  it("una categoría con hijas es un grupo con sus hijas en orden", () => {
    const padre = cat(1, { cantidadHijas: 2 });
    const r = entradasColeccion([
      padre,
      cat(2, { padreId: 1 }),
      cat(3, { padreId: 1 }),
    ]);

    expect(r).toEqual([
      {
        tipo: "grupo",
        padre,
        hijas: [cat(2, { padreId: 1 }), cat(3, { padreId: 1 })],
      },
    ]);
  });

  it("las hijas no aparecen sueltas", () => {
    const r = entradasColeccion([
      cat(1, { cantidadHijas: 1 }),
      cat(2, { padreId: 1 }),
    ]);

    expect(r.filter((e) => e.tipo === "opcion")).toHaveLength(0);
  });

  it("respeta el orden mezclando grupos y opciones", () => {
    const r = entradasColeccion([
      cat(1, { cantidadHijas: 1 }),
      cat(2, { padreId: 1 }),
      cat(3),
    ]);

    expect(r.map((e) => e.tipo)).toEqual(["grupo", "opcion"]);
  });

  it("un padre cuyas hijas no vinieron queda como grupo vacío, nunca como opción", () => {
    const r = entradasColeccion([cat(1, { cantidadHijas: 2 })]);

    expect(r).toEqual([
      { tipo: "grupo", padre: cat(1, { cantidadHijas: 2 }), hijas: [] },
    ]);
  });
});
