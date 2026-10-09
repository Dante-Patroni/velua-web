import { describe, expect, it } from "vitest";

import type { Categoria } from "@/types";
import {
  buscarEnArbol,
  paginaDesdeUrl,
  totalPaginas,
  tramosMiga,
} from "@/pages/Tienda/Categoria.utils";

const hija = (id: number, slug: string, padreId: number): Categoria => ({
  id,
  nombre: `Hija ${slug}`,
  slug,
  padreId,
});

const arbol: Categoria[] = [
  {
    id: 1,
    nombre: "Jabones",
    slug: "jabones",
    hijas: [hija(10, "essence-botanique", 1), hija(11, "l-art-du-savon", 1)],
  },
  { id: 2, nombre: "Aceites", slug: "aceites", hijas: [] },
];

describe("buscarEnArbol", () => {
  it("encuentra un slug de primer nivel, sin padre", () => {
    const resultado = buscarEnArbol(arbol, "aceites");

    expect(resultado?.categoria.id).toBe(2);
    expect(resultado?.padre).toBeNull();
  });

  it("encuentra un slug de primer nivel que tiene hijas", () => {
    const resultado = buscarEnArbol(arbol, "jabones");

    expect(resultado?.categoria.hijas).toHaveLength(2);
    expect(resultado?.padre).toBeNull();
  });

  it("encuentra un slug de hija y devuelve su padre", () => {
    const resultado = buscarEnArbol(arbol, "l-art-du-savon");

    expect(resultado?.categoria.id).toBe(11);
    expect(resultado?.padre?.slug).toBe("jabones");
  });

  it("devuelve null si el slug no existe", () => {
    expect(buscarEnArbol(arbol, "no-existe")).toBeNull();
  });

  it("devuelve null con el árbol vacío", () => {
    expect(buscarEnArbol([], "jabones")).toBeNull();
  });

  it("tolera categorías de primer nivel sin el campo hijas", () => {
    expect(buscarEnArbol([{ id: 3, nombre: "Combos", slug: "combos" }], "otra")).toBeNull();
  });
});

describe("tramosMiga", () => {
  it("con padre incluye el nivel intermedio", () => {
    const { categoria, padre } = buscarEnArbol(arbol, "l-art-du-savon")!;

    expect(tramosMiga(categoria, padre)).toEqual([
      { texto: "Inicio", ruta: "/" },
      { texto: "Jabones", ruta: "/jabones" },
      { texto: "Hija l-art-du-savon" },
    ]);
  });

  it("sin padre salta el nivel intermedio", () => {
    const { categoria, padre } = buscarEnArbol(arbol, "aceites")!;

    expect(tramosMiga(categoria, padre)).toEqual([
      { texto: "Inicio", ruta: "/" },
      { texto: "Aceites" },
    ]);
  });
});

describe("paginaDesdeUrl", () => {
  it("lee un entero positivo", () => {
    expect(paginaDesdeUrl("3")).toBe(3);
  });

  it("cae en la primera página con valores inválidos", () => {
    for (const valor of [null, "", "0", "-2", "1.5", "abc"]) {
      expect(paginaDesdeUrl(valor)).toBe(1);
    }
  });
});

describe("totalPaginas", () => {
  it("redondea hacia arriba", () => {
    expect(totalPaginas(25, 12)).toBe(3);
    expect(totalPaginas(24, 12)).toBe(2);
  });

  it("sin productos hay una página", () => {
    expect(totalPaginas(0, 12)).toBe(1);
  });

  it("un límite inválido no rompe la cuenta", () => {
    expect(totalPaginas(10, 0)).toBe(1);
  });
});
