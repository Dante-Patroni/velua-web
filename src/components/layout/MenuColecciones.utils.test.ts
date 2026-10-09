import { describe, expect, it } from "vitest";

import { itemsMenu } from "@/components/layout/MenuColecciones.utils";
import type { Categoria } from "@/types";

const fijos = [{ ruta: "/la-marca", texto: "La marca" }];

describe("itemsMenu", () => {
  it("una categoría con hijas lleva sus colecciones, con URLs planas", () => {
    const categorias: Categoria[] = [
      {
        id: 1,
        nombre: "Jabones",
        slug: "jabones",
        hijas: [
          { id: 10, nombre: "Essence Botanique", slug: "essence-botanique", padreId: 1 },
          { id: 11, nombre: "Art du Savon", slug: "art-du-savon", padreId: 1 },
        ],
      },
    ];

    expect(itemsMenu(categorias, [])).toEqual([
      {
        ruta: "/jabones",
        texto: "Jabones",
        hijas: [
          { ruta: "/essence-botanique", texto: "Essence Botanique" },
          { ruta: "/art-du-savon", texto: "Art du Savon" },
        ],
      },
    ]);
  });

  it("una categoría sin hijas queda como enlace directo", () => {
    const categorias: Categoria[] = [
      { id: 2, nombre: "Combos", slug: "combos", hijas: [] },
      { id: 3, nombre: "Aceites", slug: "aceites" },
    ];

    const items = itemsMenu(categorias, []);

    expect(items.map((item) => item.hijas)).toEqual([[], []]);
  });

  it("respeta el orden de la API y deja los enlaces fijos al final", () => {
    const categorias: Categoria[] = [
      { id: 2, nombre: "B", slug: "b", hijas: [] },
      { id: 1, nombre: "A", slug: "a", hijas: [] },
    ];

    expect(itemsMenu(categorias, fijos).map((item) => item.ruta)).toEqual([
      "/b",
      "/a",
      "/la-marca",
    ]);
  });

  it("sin categorías (si la API falló) el menú conserva los enlaces fijos", () => {
    expect(itemsMenu([], fijos)).toEqual([{ ruta: "/la-marca", texto: "La marca", hijas: [] }]);
  });
});
