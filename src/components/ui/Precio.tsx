import type { ComponentProps } from "react";

import { formatearPrecio } from "@/lib/formato";
import { cn } from "@/lib/utils";

type PrecioProps = Omit<ComponentProps<"data">, "value" | "children"> & {
  /** Importe como cadena decimal, tal como lo manda la API. */
  valor: string;
};

/**
 * @description Muestra un importe en la tipografía display, que es lo que lo
 * integra a la marca. Recibe la cadena de la API y solo la formatea.
 * @param props `valor` como cadena decimal, más las propiedades del elemento.
 * @returns El precio formateado, con el valor original en el atributo `value`.
 */
export function Precio({ valor, className, ...props }: PrecioProps) {
  return (
    <data
      value={valor}
      className={cn("font-display font-medium whitespace-nowrap text-tinta", className)}
      {...props}
    >
      {formatearPrecio(valor)}
    </data>
  );
}
