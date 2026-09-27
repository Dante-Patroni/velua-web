import { describe, expect, it } from "vitest";

import { rutaSegura } from "@/pages/Admin/Login.action";

describe("rutaSegura", () => {
  it("devuelve el panel si no hay parámetro", () => {
    expect(rutaSegura(null)).toBe("/admin");
    expect(rutaSegura("")).toBe("/admin");
  });

  it("acepta una ruta interna del panel", () => {
    expect(rutaSegura("/admin/productos")).toBe("/admin/productos");
    expect(rutaSegura("/admin/productos?pagina=2")).toBe("/admin/productos?pagina=2");
  });

  it("rechaza una URL a otro sitio", () => {
    // Sin esto, un link con volver=<sitio falso> llevaria ahi despues del login
    expect(rutaSegura("https://sitio-falso.com")).toBe("/admin");
    expect(rutaSegura("http://sitio-falso.com/velua")).toBe("/admin");
  });

  it("rechaza una ruta que empieza con doble barra", () => {
    // //sitio-falso.com es una URL hacia otro host, no una ruta relativa
    expect(rutaSegura("//sitio-falso.com")).toBe("/admin");
    expect(rutaSegura("//sitio-falso.com/admin")).toBe("/admin");
  });

  it("rechaza contrabarras, que algunos navegadores tratan como barras", () => {
    expect(rutaSegura("/admin\\@sitio-falso.com")).toBe("/admin");
    expect(rutaSegura("\\\\sitio-falso.com")).toBe("/admin");
  });

  it("rechaza rutas del sitio que no son del panel", () => {
    expect(rutaSegura("/carrito")).toBe("/admin");
    expect(rutaSegura("/productos/eclat-noir")).toBe("/admin");
  });

  it("rechaza un intento de escapar del prefijo", () => {
    expect(rutaSegura("javascript:alert(1)")).toBe("/admin");
  });
});
