import { useEffect, useRef } from "react";
import { Form, useActionData, useNavigation } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { InputContrasena } from "@/components/ui/InputContrasena";
import { Label } from "@/components/ui/Label";
import { obtenerMensajeError } from "@/lib/mappings";
import type { ErrorMiCuenta, ResultadoMiCuenta } from "./MiCuenta.action";

/**
 * @description Pantalla "Mi cuenta": cambio de contraseña. Al cambiarla, la API
 * cierra todas las demás sesiones y esta sigue abierta.
 * @returns El formulario de cambio de contraseña.
 */
export function MiCuenta() {
  const resultado = useActionData() as ResultadoMiCuenta | undefined;
  const navegacion = useNavigation();
  const formulario = useRef<HTMLFormElement>(null);

  const enviando = navegacion.state === "submitting";
    const error: ErrorMiCuenta | undefined = resultado?.ok === false ? resultado : undefined;
  const detalle = (campo: string) => error?.details?.[campo];

  // Después de un cambio exitoso, los campos quedan vacíos.
  useEffect(() => {
    if (resultado?.ok) formulario.current?.reset();
  }, [resultado]);

  return (
    <section className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="font-display text-3xl font-medium text-tinta">Mi cuenta</h1>
      <h2 className="mt-6 text-lg font-medium text-tinta">Cambiar la contraseña</h2>
      <p className="mt-1 text-sm text-texto-suave">
        Al cambiarla se cierran todas las demás sesiones abiertas.
      </p>

      {resultado?.ok && (
        <p
          role="status"
          className="mt-4 rounded-sm border border-borde bg-crema-calida px-4 py-3 text-sm text-tinta"
        >
          Listo: cambiaste tu contraseña y cerramos las demás sesiones.
        </p>
      )}

      {error && !error.details && (
        <p role="alert" className="mt-4 rounded-sm border border-error px-4 py-3 text-sm text-error">
          {obtenerMensajeError(error.codigo, "cuenta")}
        </p>
      )}

      <Form ref={formulario} method="post" className="mt-6 flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contrasenaActual">Contraseña actual</Label>
          <InputContrasena
            id="contrasenaActual"
            name="contrasenaActual"
            autoComplete="current-password"
            required
            aria-invalid={detalle("contrasenaActual") ? true : undefined}
            aria-describedby={detalle("contrasenaActual") ? "error-contrasenaActual" : undefined}
          />
          {detalle("contrasenaActual") && (
            <p id="error-contrasenaActual" className="text-sm text-error">
              {detalle("contrasenaActual")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contrasenaNueva">Contraseña nueva</Label>
          <InputContrasena
            id="contrasenaNueva"
            name="contrasenaNueva"
            autoComplete="new-password"
            required
            aria-invalid={detalle("contrasenaNueva") ? true : undefined}
            aria-describedby={
              detalle("contrasenaNueva") ? "ayuda-contrasena error-contrasenaNueva" : "ayuda-contrasena"
            }
          />
          <p id="ayuda-contrasena" className="text-sm text-texto-suave">
            Mínimo 12 caracteres. Podés usar una frase. No uses tu mail ni el nombre de la marca.
          </p>
          {detalle("contrasenaNueva") && (
            <p id="error-contrasenaNueva" className="text-sm text-error">
              {detalle("contrasenaNueva")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="repetirContrasena">Repetí la contraseña nueva</Label>
          <InputContrasena
            id="repetirContrasena"
            name="repetirContrasena"
            autoComplete="new-password"
            required
            aria-invalid={detalle("repetirContrasena") ? true : undefined}
            aria-describedby={detalle("repetirContrasena") ? "error-repetirContrasena" : undefined}
          />
          {detalle("repetirContrasena") && (
            <p id="error-repetirContrasena" className="text-sm text-error">
              {detalle("repetirContrasena")}
            </p>
          )}
        </div>

        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : "Cambiar la contraseña"}
        </Button>
      </Form>
    </section>
  );
}