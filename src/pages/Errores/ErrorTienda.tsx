import { ContenidoError } from "@/components/layout/ContenidoError";

/**
 * @description Error boundary de las páginas de la tienda. Se dibuja dentro del
 * layout, así que la clienta conserva el encabezado, el menú y el carrito y
 * puede seguir navegando.
 * @returns El mensaje de error, para el hueco que deja el Outlet.
 */
export function ErrorTienda() {
  return <ContenidoError />;
}
