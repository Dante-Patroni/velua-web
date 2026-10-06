/**
 * Una línea del carrito tal como se guarda. Solo el id y la cantidad: el
 * nombre, el precio y la imagen se piden al backend al cotizar, para no
 * mostrar nunca datos viejos.
 */
export type ItemCarrito = { varianteId: number; cantidad: number };

/** Lo que el CarritoContext expone a la tienda. */
export type ValorCarrito = {
  items: ItemCarrito[];
  /** Unidades en total, para el contador del encabezado. No es un importe. */
  unidades: number;
  agregar: (varianteId: number, cantidad?: number) => void;
  quitar: (varianteId: number) => void;
  cambiarCantidad: (varianteId: number, cantidad: number) => void;
  /** Reemplaza el carrito entero, por ejemplo con lo que devolvió la cotización. */
  reemplazar: (items: ItemCarrito[]) => void;
  vaciar: () => void;
};
