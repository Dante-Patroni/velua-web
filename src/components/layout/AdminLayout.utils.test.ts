import { describe, expect, it } from "vitest";

import { ENLACES_ADMIN } from "@/lib/mappings";

import { enlacesParaRol } from "./AdminLayout.utils";

const RUTA_VENTA = "/admin/ventas/nueva";

describe("enlacesParaRol", () => {
  it("el admin ve Registrar venta", () => {
    expect(enlacesParaRol(ENLACES_ADMIN, "admin").map((e) => e.ruta)).toContain(RUTA_VENTA);
  });

  it("el operador no ve Registrar venta, pero sí el resto del panel", () => {
    const rutas = enlacesParaRol(ENLACES_ADMIN, "operador").map((e) => e.ruta);

    expect(rutas).not.toContain(RUTA_VENTA);
    expect(rutas).toContain("/admin");
  });
});
