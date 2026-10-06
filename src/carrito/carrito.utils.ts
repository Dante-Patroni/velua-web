import type { ItemCarrito } from "./types";

/**
 * @description Indica si un valor sirve como id de variante o como cantidad:
 * un entero mayor que cero.
 * @param valor Valor a revisar.
 * @returns true si es un entero positivo.
 */
export const esEnteroPositivo = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isInteger(valor) && valor > 0;

/**
 * @description Agrega unidades de una variante. Si ya estaba en el carrito,
 * suma a la línea existente en vez de duplicarla. No aplica topes: el máximo
 * por compra y el stock los decide el backend al cotizar.
 * @param items Carrito actual.
 * @param varianteId Variante a agregar.
 * @param cantidad Unidades a sumar. Por defecto, una.
 * @returns Un carrito nuevo. Si los datos no sirven, el mismo carrito.
 */
export const agregarItem = (
  items: ItemCarrito[],
  varianteId: number,
  cantidad = 1,
): ItemCarrito[] => {
  if (!esEnteroPositivo(varianteId) || !esEnteroPositivo(cantidad)) return items;

  const existe = items.some((item) => item.varianteId === varianteId);

  if (!existe) return [...items, { varianteId, cantidad }];

  return items.map((item) =>
    item.varianteId === varianteId ? { ...item, cantidad: item.cantidad + cantidad } : item,
  );
};

/**
 * @description Quita una variante del carrito.
 * @param items Carrito actual.
 * @param varianteId Variante a quitar.
 * @returns Un carrito nuevo, sin esa variante.
 */
export const quitarItem = (items: ItemCarrito[], varianteId: number): ItemCarrito[] =>
  items.filter((item) => item.varianteId !== varianteId);

/**
 * @description Fija la cantidad de una variante que ya está en el carrito.
 * Una cantidad menor que uno la quita: es lo que espera quien baja el
 * contador hasta cero.
 * @param items Carrito actual.
 * @param varianteId Variante a modificar.
 * @param cantidad Cantidad nueva.
 * @returns Un carrito nuevo. Si la cantidad no es un entero, el mismo carrito.
 */
export const cambiarCantidadItem = (
  items: ItemCarrito[],
  varianteId: number,
  cantidad: number,
): ItemCarrito[] => {
  if (!Number.isInteger(cantidad)) return items;
  if (cantidad < 1) return quitarItem(items, varianteId);

  return items.map((item) => (item.varianteId === varianteId ? { ...item, cantidad } : item));
};

/**
 * @description Cuenta las unidades del carrito para el contador del
 * encabezado. Suma cantidades, no importes.
 * @param items Carrito actual.
 * @returns El total de unidades.
 */
export const contarUnidades = (items: ItemCarrito[]): number =>
  items.reduce((total, item) => total + item.cantidad, 0);
