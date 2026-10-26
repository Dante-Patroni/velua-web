import { beforeEach, describe, expect, it, vi } from "vitest";

import { cerrarSesion } from "@/lib/api/auth.api";
import { ErrorApi } from "@/lib/apiFetch";
import { accionSalir, cargarSalir } from "@/pages/Admin/Salir.action";

vi.mock("@/lib/api/auth.api", () => ({ cerrarSesion: vi.fn() }));

const DESTINO = "/admin/login?motivo=salio";

describe("accionSalir", () => {
  beforeEach(() => {
    vi.mocked(cerrarSesion).mockReset();
  });

  it("cierra la sesión en la API y manda al login", async () => {
    vi.mocked(cerrarSesion).mockResolvedValue(undefined as never);

    const respuesta = await accionSalir();

    expect(cerrarSesion).toHaveBeenCalledTimes(1);
    expect(respuesta.headers.get("Location")).toBe(DESTINO);
  });

  it("si la API falla, igual manda al login: quien quiere salir tiene que poder salir", async () => {
    vi.mocked(cerrarSesion).mockRejectedValue(new ErrorApi("ERROR_DE_RED", 0));

    const respuesta = await accionSalir();

    expect(respuesta.headers.get("Location")).toBe(DESTINO);
  });
});

describe("cargarSalir", () => {
  it("entrar con un enlace (GET) no cierra la sesión: vuelve al panel", () => {
    const respuesta = cargarSalir();

    expect(cerrarSesion).not.toHaveBeenCalled();
    expect(respuesta.headers.get("Location")).toBe("/admin");
  });
});
