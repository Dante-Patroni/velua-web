import { Form, useActionData, useNavigation, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { obtenerMensajeError } from "@/lib/mappings";
import type { ErrorLogin } from "./Login.action";

/**
 * @description Pantalla de ingreso al panel de administración.
 * @returns El formulario de login.
 */
export function Login() {
  const error = useActionData() as ErrorLogin | undefined;
  const navegacion = useNavigation();
  const [parametros] = useSearchParams();

  const enviando = navegacion.state === "submitting";
  const expiro = parametros.get("volver") !== null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-crema px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-medium text-tinta">Panel de Velua</h1>
          <p className="mt-2 text-sm text-texto-suave">Ingresá para administrar el catálogo</p>
        </div>

        {expiro && !error && (
          <p
            className="mb-4 rounded-sm border border-borde bg-crema-calida px-4 py-3 text-sm text-texto-suave"
            role="status"
          >
            Tu sesión venció. Ingresá de nuevo para continuar.
          </p>
        )}

        <Form method="post" className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              placeholder="nombre@veluanature.com.ar"
              aria-describedby={error ? "error-login" : undefined}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-describedby={error ? "error-login" : undefined}
            />
          </div>

          {error && (
            <p
              id="error-login"
              role="alert"
              className="rounded-sm border border-error px-4 py-3 text-sm text-error"
            >
              {obtenerMensajeError(error.codigo, "login")}
            </p>
          )}

          <Button type="submit" disabled={enviando}>
            {enviando ? "Ingresando…" : "Ingresar"}
          </Button>
        </Form>
      </div>
    </main>
  );
}
