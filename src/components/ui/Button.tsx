import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const variantesBoton = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-sans font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-lavanda focus-visible:ring-offset-2 focus-visible:ring-offset-crema disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variante: {
        primario: "bg-tinta text-crema-clara hover:bg-texto-suave",
        secundario: "border border-lavanda bg-transparent text-tinta hover:bg-crema-calida",
        fantasma: "bg-transparent text-tinta hover:bg-crema-calida",
        enlace:
          "rounded-none text-dorado-texto underline decoration-2 underline-offset-4 hover:text-tinta",
      },
      tamano: {
        // 44 px de alto: el mínimo cómodo para tocar en el teléfono.
        normal: "h-11 px-6 text-base",
        chico: "h-9 px-4 text-sm",
        icono: "size-11",
      },
    },
    compoundVariants: [{ variante: "enlace", className: "h-auto px-0" }],
    defaultVariants: {
      variante: "primario",
      tamano: "normal",
    },
  },
);

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof variantesBoton>;

/**
 * @description Botón base de Velua, sobre el primitivo accesible de Base UI.
 * @param props Propiedades del botón, más `variante` y `tamano`.
 * @returns El botón con los estilos de la marca.
 */
export function Button({ className, variante, tamano, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(variantesBoton({ variante, tamano }), className)}
      {...props}
    />
  );
}
