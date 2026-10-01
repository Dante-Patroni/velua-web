import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * @description Área de texto para los campos largos. Comparte los estilos del
 * Input salvo la altura fija, que acá la define `rows`, y el padding vertical,
 * que el Input resuelve centrando el texto en su alto.
 *
 * Va sobre el elemento nativo porque Base UI no expone un primitivo de textarea.
 *
 * @param props Propiedades del textarea nativo.
 * @returns El área de texto con los estilos de la marca.
 */
export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(
        "w-full min-w-0 resize-y rounded-lg border border-lavanda bg-crema-clara px-3 py-2 text-base text-tinta transition-colors outline-none placeholder:text-texto-tenue focus-visible:border-tinta focus-visible:ring-2 focus-visible:ring-lavanda/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20",
        className,
      )}
      {...props}
    />
  );
}
