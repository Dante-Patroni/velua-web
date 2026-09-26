import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * @description Etiqueta de formulario.
 * @param props Propiedades del label. Usar `htmlFor` con el id del control.
 * @returns El label con los estilos de la marca.
 */
export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-medium text-tinta", className)}
      {...props}
    />
  );
}
