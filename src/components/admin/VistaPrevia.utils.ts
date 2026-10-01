/** Lo que la vista previa necesita saber del producto. */
export type DatosVistaPrevia = {
  nombre: string;
  descripcionCorta: string;
  precio: string;
  precioAnterior: string;
  coleccion: string;
  /** Primera imagen cargada, si ya hay alguna. */
  imagenUrl?: string | null;
  hayStock: boolean;
};

/**
 * @description Calcula el porcentaje de descuento, solo si corresponde mostrarlo.
 *
 * El badge aparece únicamente cuando el precio anterior existe y es mayor que el
 * actual. Sin esa condición se ven ofertas del cero por ciento, que es el error
 * que tienen en producción las dos tiendas del rubro que miramos.
 *
 * @param precio Precio actual, como lo escribió la usuaria.
 * @param anterior Precio anterior.
 * @returns El porcentaje entero, o null si no hay oferta válida.
 */
export function calcularDescuento(precio: string, anterior: string): number | null {
  const actual = Number(precio.replace(",", "."));
  const previo = Number(anterior.replace(",", "."));

  if (!Number.isFinite(actual) || !Number.isFinite(previo)) return null;
  if (actual <= 0 || previo <= actual) return null;

  return Math.round(((previo - actual) / previo) * 100);
}