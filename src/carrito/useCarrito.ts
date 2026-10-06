import { createContext, useContext } from "react";

import type { ValorCarrito } from "./types";

export const CarritoContext = createContext<ValorCarrito | null>(null);

/**
 * @description Devuelve el carrito y sus operaciones dentro de la tienda.
 * @returns El estado del carrito y las funciones para modificarlo.
 * @throws Si se usa fuera de CarritoProvider, es decir, fuera de la tienda.
 */
export function useCarrito(): ValorCarrito {
  const valor = useContext(CarritoContext);

  if (!valor) {
    throw new Error("useCarrito debe utilizarse dentro de CarritoProvider");
  }

  return valor;
}
