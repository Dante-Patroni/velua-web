import { isRouteErrorResponse, useRouteError } from "react-router-dom";

/**
 * Renderiza un mensaje para errores de rutas y excepciones inesperadas.
 */
export const ErrorPage = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-red-600">
          Error {error.status}
        </h1>

        <p className="mt-2 text-gray-600">{error.statusText}</p>

        {error.data && (
          <pre className="mt-4 overflow-auto rounded bg-gray-100 p-4">
            {String(error.data)}
          </pre>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-red-600">
        Error inesperado
      </h1>

      <p className="mt-2 text-gray-600">
        {error instanceof Error ? error.message : "Algo salió mal"}
      </p>
    </main>
  );
};