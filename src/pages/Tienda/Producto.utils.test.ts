import { describe, expect, it } from "vitest";

import type { Categoria } from "@/types";
import { descripcionMeta, tramosMigaProducto } from "@/pages/Tienda/Producto.utils";

describe("descripcionMeta", () => {
  it("prefiere la descripción corta", () => {
    expect(descripcionMeta({ descripcionCorta: " Corta ", descripcion: "Larga" })).toBe("Corta");
  });

  it("sin corta, usa la larga", () => {
    expect(descripcionMeta({ descripcionCorta: null, descripcion: "Una\n\nlarga  descripción" })).toBe(
      "Una larga descripción",
    );
  });

  it("recorta la larga sin cortar una palabra", () => {
    const larga = "palabra ".repeat(40);
    const resultado = descripcionMeta({ descripcion: larga })!;

    expect(resultado.length).toBeLessThanOrEqual(161);
    expect(resultado.endsWith("palabra…")).toBe(true);
  });

  it("sin ninguna descripción devuelve null", () => {
    expect(descripcionMeta({ descripcionCorta: "  ", descripcion: null })).toBeNull();
    expect(descripcionMeta({})).toBeNull();
  });
});

describe("tramosMigaProducto", () => {
  const coleccion: Categoria = { id: 10, nombre: "Essence Botanique", slug: "essence-botanique", padreId: 1 };
  const padre: Categoria = { id: 1, nombre: "Jabones", slug: "jabones" };

  it("con padre incluye el nivel intermedio y enlaza la colección", () => {
    expect(tramosMigaProducto({ nombre: "Calma", categoria: coleccion }, padre)).toEqual([
      { texto: "Inicio", ruta: "/" },
      { texto: "Jabones", ruta: "/jabones" },
      { texto: "Essence Botanique", ruta: "/essence-botanique" },
      { texto: "Calma" },
    ]);
  });

  it("sin padre salta el nivel intermedio", () => {
    expect(tramosMigaProducto({ nombre: "Calma", categoria: { ...coleccion, padreId: null } }, null)).toEqual([
      { texto: "Inicio", ruta: "/" },
      { texto: "Essence Botanique", ruta: "/essence-botanique" },
      { texto: "Calma" },
    ]);
  });
});
