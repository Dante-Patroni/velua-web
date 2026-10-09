import { ContenidoError } from "@/components/layout/ContenidoError";

/**
 * @description Error boundary de la raíz, a pantalla completa. Atrapa lo que no
 * resuelve un boundary más cercano: el panel y los errores del layout de la
 * tienda. Dentro de la tienda se usa `ErrorTienda`, que conserva el menú.
 * @returns La pantalla de error con un enlace al inicio.
 */
export function ErrorPage() {
  return (
    <main className="flex min-h-dvh items-center bg-crema">
      <ContenidoError />
    </main>
  );
}
