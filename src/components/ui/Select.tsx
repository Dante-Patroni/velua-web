import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * @description Select nativo con los estilos de la marca. Se usa el nativo a
 * propósito: en el teléfono abre el selector del sistema, que es el más cómodo.
 * @param props Propiedades del select. `className` se aplica al contenedor.
 * @returns El select con su flecha.
 */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className={cn("relative w-full", className)}>
      <select
        data-slot="select"
        className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-lavanda bg-crema-clara pr-10 pl-3 text-base text-tinta outline-none focus-visible:border-tinta focus-visible:ring-2 focus-visible:ring-lavanda/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-tinta"
      />
    </div>
  );
}
