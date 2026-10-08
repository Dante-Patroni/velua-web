import { describe, expect, it } from "vitest";

import { aplanarArbol, ordenTrasMover, posiblesPadres } from "@/pages/Admin/Categorias.utils";
import type { CategoriaAdmin } from "@/types";

/**
 * Categoría del panel con valores por defecto.
 */
const cat = (id: number, nombre: string, orden: number, cambios: Partial<CategoriaAdmin> = {}) =>
  ({
    id,
    nombre,
    slug: nombre.toLowerCase(),
    descripcion: null,
    imagenUrl: null,
    padreId: null,
    orden,
    activa: true,
    cantidadProductos: 0,
    cantidadHijas: 0,
    ...cambios,
  }) as CategoriaAdmin;

// Jabones ▸ Essence, Art · Capilar · Combos
const ARBOL = [
  cat(4, "Essence", 1, { padreId: 1, cantidadProductos: 5 }),
  cat(3, "Combos", 9, { cantidadProductos: 2 }),
  cat(1, "Jabones", 2, { cantidadHijas: 2 }),
  cat(5, "Art", 3, { padreId: 1, cantidadProductos: 4 }),
  cat(2, "Capilar", 5, { cantidadProductos: 6 }),
];

const nombres = (ids: number[]) =>
  ids.map((id) => ARBOL.find((c) => c.id === id)!.nombre);

describe("aplanarArbol", () => {
  it("pone cada padre seguido de sus hijas, en el orden de cada nivel", () => {
    const filas = aplanarArbol(ARBOL);

    expect(filas.map((f) => f.categoria.nombre)).toEqual([
      "Jabones",
      "Essence",
      "Art",
      "Capilar",
      "Combos",
    ]);
    expect(filas.map((f) => f.nivel)).toEqual([0, 1, 1, 0, 0]);
  });

  it("una hija cuyo padre no vino queda arriba, para no perderla", () => {
    const filas = aplanarArbol([cat(4, "Essence", 1, { padreId: 99 })]);

    expect(filas).toEqual([{ categoria: expect.objectContaining({ id: 4 }), nivel: 0 }]);
  });
});

describe("ordenTrasMover", () => {
  const filas = aplanarArbol(ARBOL);

  it("baja una categoría de primer nivel y arrastra a sus hijas", () => {
    expect(nombres(ordenTrasMover(filas, 1, 1)!)).toEqual([
      "Capilar",
      "Jabones",
      "Essence",
      "Art",
      "Combos",
    ]);
  });

  it("mueve una hija solo entre sus hermanas", () => {
    expect(nombres(ordenTrasMover(filas, 5, -1)!)).toEqual([
      "Jabones",
      "Art",
      "Essence",
      "Capilar",
      "Combos",
    ]);
  });

  it("devuelve null si ya es la primera o la última de sus hermanas", () => {
    expect(ordenTrasMover(filas, 1, -1)).toBeNull();
    expect(ordenTrasMover(filas, 3, 1)).toBeNull();
    expect(ordenTrasMover(filas, 4, -1)).toBeNull();
    expect(ordenTrasMover(filas, 5, 1)).toBeNull();
  });

  it("siempre devuelve todas las categorías, sin repetir", () => {
    const ids = ordenTrasMover(filas, 2, 1)!;

    expect([...ids].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("posiblesPadres", () => {
  it("ofrece solo las de primer nivel, en su orden", () => {
    expect(posiblesPadres(ARBOL, null).map((o) => o.nombre)).toEqual([
      "Jabones",
      "Capilar",
      "Combos",
    ]);
  });

  it("no se ofrece a sí misma", () => {
    const jabones = ARBOL.find((c) => c.id === 1)!;

    expect(posiblesPadres(ARBOL, jabones).map((o) => o.id)).not.toContain(1);
  });

  it("marca como no disponibles las que tienen productos", () => {
    const opciones = posiblesPadres(ARBOL, null);

    expect(opciones.find((o) => o.nombre === "Jabones")!.disponible).toBe(true);
    expect(opciones.find((o) => o.nombre === "Capilar")!.disponible).toBe(false);
  });
});
