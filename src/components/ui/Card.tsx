import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * @description Contenedor de tarjeta: fondo crema clara y borde cálido.
 * @param props Propiedades del div.
 * @returns La tarjeta.
 */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-borde bg-crema-clara text-tinta",
        className,
      )}
      {...props}
    />
  );
}

/**
 * @description Encabezado de la tarjeta.
 * @param props Propiedades del div.
 * @returns El encabezado con el padding de la tarjeta.
 */
export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("px-5 pt-5", className)} {...props} />;
}

/**
 * @description Título de la tarjeta, en la tipografía display.
 * @param props Propiedades del h3.
 * @returns El título.
 */
export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-display text-xl leading-snug font-medium", className)}
      {...props}
    />
  );
}

/**
 * @description Contenido principal de la tarjeta.
 * @param props Propiedades del div.
 * @returns El contenido con el padding de la tarjeta.
 */
export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 py-4 text-texto-suave", className)}
      {...props}
    />
  );
}

/**
 * @description Pie de la tarjeta, para acciones.
 * @param props Propiedades del div.
 * @returns El pie con el padding de la tarjeta.
 */
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-3 px-5 pb-5", className)}
      {...props}
    />
  );
}
