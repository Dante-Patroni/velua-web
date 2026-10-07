import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import ilustracion from "@/assets/ilustracion-calendulas.webp";

/**
 * @description Ilustración botánica de la caja, usada como textura donde
 * todavía no hay foto: tarjetas de producto y colecciones. Un producto sin
 * fotos es un estado normal del catálogo, no un error. Es el único lugar que
 * conoce el archivo: si la marca manda otra ilustración, se cambia acá.
 * @param props Propiedades del div. Los hijos se dibujan encima.
 * @returns La zona con la textura de fondo.
 */
export function TexturaBotanica({ className, style, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-crema-calida bg-cover bg-center", className)}
      style={{ backgroundImage: `url(${ilustracion})`, ...style }}
      {...props}
    />
  );
}
