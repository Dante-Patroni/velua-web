import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

import { mensajeDeError } from "@/lib/mappings";

/**
 * @description Error boundary de las rutas. Muestra un mensaje legible desde
 * el diccionario; nunca el código crudo ni el mensaje técnico del error.
 * @returns La pantalla de error con un enlace al inicio.
 */
export function ErrorPage() {
  const error = useRouteError();
  const noEncontrada = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="flex min-h-dvh items-center bg-crema">
      <section className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-4xl font-medium text-tinta">
          {noEncontrada ? "No encontramos esta página" : "Algo salió mal"}
        </h1>
        <p className="mt-3 text-texto-suave">
          {noEncontrada
            ? "Puede que el enlace esté mal escrito o que la página ya no exista."
            : mensajeDeError(error)}
        </p>
        <Link
          to="/"
          className="mt-8 inline-block text-dorado-texto underline decoration-2 underline-offset-4 hover:text-tinta"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
