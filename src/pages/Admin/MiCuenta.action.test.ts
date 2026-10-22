import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionFunctionArgs } from "react-router-dom";

import { cambiarContrasena } from "@/lib/api/auth.api";
import { ErrorApi } from "@/lib/apiFetch";
import { accionMiCuenta } from "@/pages/Admin/MiCuenta.action";

vi.mock("@/lib/api/auth.api", () => ({ cambiarContrasena: vi.fn() }));

/**
 * @description Arma los argumentos de la action con los campos del formulario.
 * @param campos Campos del formulario.
 * @returns Argumentos para la action.
 */
const enviar = (campos: Record<string, string>) => {
  const formulario = new FormData();
  Object.entries(campos).forEach(([clave, valor]) => formulario.set(clave, valor));
  return {
    request: new Request("http://localhost/admin/mi-cuenta", { method: "POST", body: formulario }),
    params: {},
    context: {},
  } as unknown as ActionFunctionArgs;
};

const COMPLETO = {
  contrasenaActual: "la-actual-de-siempre",
  contrasenaNueva: "lavanda en el patio de atras",
  repetirContrasena: "lavanda en el patio de atras",
};

describe("accionMiCuenta", () => {
  beforeEach(() => {
    vi.mocked(cambiarContrasena).mockReset();
  });

  it("pide los campos vacíos sin llamar a la API", async () => {
    const resultado = await accionMiCuenta(enviar({ repetirContrasena: "" }));

    expect(resultado).toMatchObject({
      ok: false,
      codigo: "DATOS_INVALIDOS",
      details: { contrasenaActual: expect.any(String), contrasenaNueva: expect.any(String) },
    });
    expect(cambiarContrasena).not.toHaveBeenCalled();
  });

  it("avisa si la nueva no se repitió igual, sin llamar a la API", async () => {
    const resultado = await accionMiCuenta(enviar({ ...COMPLETO, repetirContrasena: "otra cosa" }));

    expect(resultado).toMatchObject({ ok: false, details: { repetirContrasena: expect.any(String) } });
    expect(cambiarContrasena).not.toHaveBeenCalled();
  });

  it("manda la actual y la nueva, nunca la repetición", async () => {
    vi.mocked(cambiarContrasena).mockResolvedValue(undefined);

    const resultado = await accionMiCuenta(enviar(COMPLETO));

    expect(resultado).toEqual({ ok: true });
    expect(cambiarContrasena).toHaveBeenCalledWith(
      "la-actual-de-siempre",
      "lavanda en el patio de atras",
    );
  });

  it("no recorta los espacios de las contraseñas", async () => {
    vi.mocked(cambiarContrasena).mockResolvedValue(undefined);

    await accionMiCuenta(
      enviar({
        contrasenaActual: " con espacios ",
        contrasenaNueva: " una frase con espacios ",
        repetirContrasena: " una frase con espacios ",
      }),
    );

    expect(cambiarContrasena).toHaveBeenCalledWith(" con espacios ", " una frase con espacios ");
  });

  it("devuelve el error de la API con su detalle por campo", async () => {
    vi.mocked(cambiarContrasena).mockRejectedValue(
      new ErrorApi("CONTRASENA_ACTUAL_INCORRECTA", 400, {
        contrasenaActual: "La contraseña actual no es correcta.",
      }),
    );

    const resultado = await accionMiCuenta(enviar(COMPLETO));

    expect(resultado).toEqual({
      ok: false,
      codigo: "CONTRASENA_ACTUAL_INCORRECTA",
      details: { contrasenaActual: "La contraseña actual no es correcta." },
    });
  });

  it("si la sesión fue revocada, manda al login con el motivo", async () => {
    vi.mocked(cambiarContrasena).mockRejectedValue(new ErrorApi("SESION_REVOCADA", 401));

    const respuesta = await accionMiCuenta(enviar(COMPLETO)).catch((r: unknown) => r);

    expect(respuesta).toBeInstanceOf(Response);
    expect((respuesta as Response).headers.get("Location")).toBe(
      "/admin/login?volver=%2Fadmin%2Fmi-cuenta&motivo=revocada",
    );
  });
});