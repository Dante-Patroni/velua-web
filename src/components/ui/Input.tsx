import type { ComponentProps } from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

/**
 * @description Campo de texto base. Usa 16 px de fuente para que iOS no haga
 * zoom al enfocar, y marca el error con `aria-invalid`.
 * @param props Propiedades del input de Base UI.
 * @returns El input con los estilos de la marca.
 */
export function Input({ className, ...props }: ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-lavanda bg-crema-clara px-3 text-base text-tinta transition-colors outline-none placeholder:text-texto-tenue focus-visible:border-tinta focus-visible:ring-2 focus-visible:ring-lavanda/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20",
        className,
      )}
      {...props}
    />
  );
}
