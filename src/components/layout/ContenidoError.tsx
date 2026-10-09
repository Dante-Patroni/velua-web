import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

import { mensajeDeError } from "@/lib/mappings";

/**
 * @description Contenido de una pantalla de error: título, mensaje legible y
 * enlace al inicio. Lee el error de la ruta y lo muestra desde el diccionario;
 * nunca el código crudo ni el mensaje técnico. No incluye `<main>`: lo pone
 * quien lo usa, según esté dentro del layout de la tienda o a pantalla completa.
 * @returns La sección con el mensaje de error.
 */
export function ContenidoError() {
  const error = useRouteError();
  const noEncontrada = isRouteErrorResponse(error) && error.status === 404;

  return (
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
  );
}
