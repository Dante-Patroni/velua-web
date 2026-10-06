import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  agregarItem,
  cambiarCantidadItem,
  contarUnidades,
  quitarItem,
} from "./carrito.utils";
import { guardarCarrito, leerCarrito } from "./carritoStorage";
import type { ItemCarrito, ValorCarrito } from "./types";
import { CarritoContext } from "./useCarrito";

/**
 * @description Estado del carrito de la tienda. Lee lo guardado al montar y lo
 * persiste en cada cambio. Guarda solo ids y cantidades: los datos actuales de
 * cada variante se piden al backend al cotizar.
 * @param props Los hijos que acceden al carrito.
 * @returns El proveedor del contexto.
 */
export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>(() => leerCarrito());

  useEffect(() => {
    guardarCarrito(items);
  }, [items]);

  const agregar = useCallback(
    (varianteId: number, cantidad = 1) =>
      setItems((actual) => agregarItem(actual, varianteId, cantidad)),
    [],
  );
  const quitar = useCallback(
    (varianteId: number) => setItems((actual) => quitarItem(actual, varianteId)),
    [],
  );
  const cambiarCantidad = useCallback(
    (varianteId: number, cantidad: number) =>
      setItems((actual) => cambiarCantidadItem(actual, varianteId, cantidad)),
    [],
  );
  const reemplazar = useCallback((nuevos: ItemCarrito[]) => setItems(nuevos), []);
  const vaciar = useCallback(() => setItems([]), []);

  const valor = useMemo<ValorCarrito>(
    () => ({
      items,
      unidades: contarUnidades(items),
      agregar,
      quitar,
      cambiarCantidad,
      reemplazar,
      vaciar,
    }),
    [items, agregar, quitar, cambiarCantidad, reemplazar, vaciar],
  );

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}
