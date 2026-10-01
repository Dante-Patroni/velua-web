import { describe, expect, it } from "vitest";

import {
  leerCambiosProducto,
  leerProductoNuevo,
  leerVariante,
} from "@/pages/Admin/Producto.action";

/**
 * Atajo para armar un FormData a partir de pares clave y valor.
 */
const form = (pares: Array<[string, string]>) => {
  const datos = new FormData();
  for (const [clave, valor] of pares) datos.append(clave, valor);
  return datos;
};

describe("leerVariante", () => {
  it("deja el precio como texto, sin convertirlo a número", () => {
    // Convertirlo seria exactamente lo que la regla del proyecto prohibe
    const v = leerVariante(form([["nombre", "100 g"], ["precio", "8500,50"]]));

    expect(v.precio).toBe("8500,50");
    expect(typeof v.precio).toBe("string");
  });

  it("recorta los espacios de los textos", () => {
    const v = leerVariante(form([["nombre", "  100 g  "], ["precio", " 8500 "]]));

    expect(v.nombre).toBe("100 g");
    expect(v.precio).toBe("8500");
  });

  it("manda null cuando el SKU viene vacío", () => {
    const v = leerVariante(form([["nombre", "A"], ["precio", "1"], ["sku", "   "]]));

    expect(v.sku).toBeNull();
  });

  it("manda null cuando no se cargó precio anterior", () => {
    const v = leerVariante(form([["nombre", "A"], ["precio", "1"], ["precioAnterior", ""]]));

    expect(v.precioAnterior).toBeNull();
  });

  it("usa cero si no se indicó stock", () => {
    const v = leerVariante(form([["nombre", "A"], ["precio", "1"]]));

    expect(v.stock).toBe(0);
  });

  it("lee los campos con prefijo, para las variantes de la creación", () => {
    const datos = form([
      ["variantes.2.nombre", "60 g"],
      ["variantes.2.precio", "5500"],
      ["variantes.2.stock", "3"],
    ]);

    const v = leerVariante(datos, "variantes.2.");

    expect(v.nombre).toBe("60 g");
    expect(v.precio).toBe("5500");
    expect(v.stock).toBe(3);
  });
});

describe("leerProductoNuevo", () => {
  const base: Array<[string, string]> = [
    ["categoriaId", "4"],
    ["nombre", "Jabón de prueba"],
    ["variantes.0.nombre", "100 g"],
    ["variantes.0.precio", "8500"],
    ["variantes.0.stock", "5"],
  ];

  it("arma el producto con su variante", () => {
    const p = leerProductoNuevo(form(base));

    expect(p.categoriaId).toBe(4);
    expect(p.nombre).toBe("Jabón de prueba");
    expect(p.variantes).toHaveLength(1);
    expect(p.variantes[0].precio).toBe("8500");
  });

  it("junta varias variantes en orden", () => {
    const p = leerProductoNuevo(
      form([
        ...base,
        ["variantes.1.nombre", "60 g"],
        ["variantes.1.precio", "5500"],
        ["variantes.1.stock", "3"],
      ])
    );

    expect(p.variantes).toHaveLength(2);
    expect(p.variantes[1].nombre).toBe("60 g");
  });

  it("no se pierde si los índices tienen huecos", () => {
    // Pasa al agregar tres variantes y quitar la del medio antes de guardar
    const p = leerProductoNuevo(
      form([
        ["categoriaId", "4"],
        ["nombre", "X"],
        ["variantes.0.nombre", "A"],
        ["variantes.0.precio", "1"],
        ["variantes.2.nombre", "C"],
        ["variantes.2.precio", "3"],
      ])
    );

    expect(p.variantes).toHaveLength(2);
    expect(p.variantes.map((v) => v.nombre)).toEqual(["A", "C"]);
  });

  it("manda null en los textos que quedaron vacíos", () => {
    const p = leerProductoNuevo(form([...base, ["descripcion", "   "], ["slug", ""]]));

    expect(p.descripcion).toBeNull();
    expect(p.slug).toBeNull();
  });

  it("lee destacado como booleano", () => {
    expect(leerProductoNuevo(form(base)).destacado).toBe(false);
    expect(leerProductoNuevo(form([...base, ["destacado", "true"]])).destacado).toBe(true);
  });
});

describe("leerCambiosProducto", () => {
  it("solo incluye los campos que vinieron en el formulario", () => {
    // El backend deja sin tocar lo que no llega: mandar todo pisaria datos
    const cambios = leerCambiosProducto(form([["nombre", "Nombre nuevo"]]));

    expect(cambios).toEqual({ nombre: "Nombre nuevo" });
    expect(cambios).not.toHaveProperty("descripcion");
    expect(cambios).not.toHaveProperty("slug");
  });

  it("distingue un campo vacío de uno ausente", () => {
    // Vacio significa borrar el dato; ausente significa no tocarlo
    const cambios = leerCambiosProducto(form([["descripcion", ""]]));

    expect(cambios).toHaveProperty("descripcion");
    expect(cambios.descripcion).toBeNull();
  });

  it("convierte la categoría a número", () => {
    expect(leerCambiosProducto(form([["categoriaId", "7"]])).categoriaId).toBe(7);
  });
});
