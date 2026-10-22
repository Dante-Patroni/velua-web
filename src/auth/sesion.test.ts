import { describe, expect, it } from "vitest";

import { destinoSiSinSesion, urlLogin } from "@/auth/authService";
import { ErrorApi } from "@/lib/apiFetch";

describe("urlLogin", () => {
  it("recuerda a dónde volver, codificado", () => {
    expect(urlLogin("/admin/productos?pagina=2")).toBe(
      "/admin/login?volver=%2Fadmin%2Fproductos%3Fpagina%3D2",
    );
  });

  it("agrega el motivo solo si la sesión fue revocada", () => {
    expect(urlLogin("/admin", "SESION_REVOCADA")).toBe(
      "/admin/login?volver=%2Fadmin&motivo=revocada",
    );
    expect(urlLogin("/admin", "TOKEN_EXPIRADO")).toBe("/admin/login?volver=%2Fadmin");
  });
});

describe("destinoSiSinSesion", () => {
  it("con una sesión revocada, manda al login con el motivo", () => {
    expect(destinoSiSinSesion(new ErrorApi("SESION_REVOCADA", 401), "/admin/categorias")).toBe(
      "/admin/login?volver=%2Fadmin%2Fcategorias&motivo=revocada",
    );
  });

  it("con una sesión vencida, manda al login sin motivo", () => {
    expect(destinoSiSinSesion(new ErrorApi("TOKEN_EXPIRADO", 401), "/admin")).toBe(
      "/admin/login?volver=%2Fadmin",
    );
  });

  it("un 403 no es falta de sesión: se queda en la página de error", () => {
    expect(destinoSiSinSesion(new ErrorApi("SIN_PERMISO", 403), "/admin")).toBeNull();
  });

  it("un error que no es de la API se queda en la página de error", () => {
    expect(destinoSiSinSesion(new Error("algo"), "/admin")).toBeNull();
  });
});