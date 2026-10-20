import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Precio } from "@/components/ui/Precio";
import type { ItemCotizado } from "@/types";
import { cn } from "@/lib/utils";
import { TexturaBotanica } from "./TexturaBotanica";

type LineaCarritoProps = {
  /** La línea tal como la devolvió la cotización. */
  linea: ItemCotizado;
  /** Cantidad que la clienta tiene ahora. Puede ir por delante de la cotización. */
  cantidad: number;
  /** true si la cantidad cambió y falta que la cotización responda. */
  actualizando: boolean;
  onCambiarCantidad: (cantidad: number) => void;
  onQuitar: () => void;
};

/**
 * @description Una línea del carrito: producto, presentación, precio unitario,
 * cantidad y subtotal de la línea. Todos los importes vienen de la cotización
 * y solo se formatean. Sin foto, porque la cotización todavía no la trae: va la
 * textura botánica, que es un estado normal. Mientras la cantidad cambió y la
 * cotización no respondió, el subtotal se atenúa para no mostrarlo como vigente.
 * @param props La línea cotizada, la cantidad actual y los manejadores.
 * @returns La línea del carrito.
 */
export function LineaCarrito({
  linea,
  cantidad,
  actualizando,
  onCambiarCantidad,
  onQuitar,
}: LineaCarritoProps) {
  const { productoNombre, productoSlug, varianteNombre, precioUnitario, subtotal } = linea;
  const nombre = productoNombre ?? "Producto";

  return (
    <article className="flex gap-4 border-b border-borde py-5 first:pt-0 md:gap-6">
      <TexturaBotanica aria-hidden className="size-24 shrink-0 rounded-xl border border-borde md:size-32" />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-xl leading-snug font-medium text-tinta">
            {productoSlug ? (
              <Link to={`/productos/${productoSlug}`} className="hover:text-dorado-texto">
                {nombre}
              </Link>
            ) : (
              nombre
            )}
          </h2>
          {varianteNombre && <p className="text-sm text-texto-suave">{varianteNombre}</p>}
          <p className="text-sm text-texto-suave">
            <Precio valor={precioUnitario} className="font-sans font-normal text-texto-suave" /> c/u
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div role="group" aria-label={`Cantidad de ${nombre}`} className="flex items-center gap-1">
            <Button
              variante="secundario"
              tamano="icono"
              aria-label={`Quitar una unidad de ${nombre}`}
              onClick={() => onCambiarCantidad(cantidad - 1)}
            >
              <Minus aria-hidden />
            </Button>
            {/* Cifras alineadas: en las de estilo antiguo de la serif, el 1 se lee como una "I". */}
            <output
              aria-live="polite"
              className="w-10 text-center font-display text-2xl text-tinta lining-nums tabular-nums"
            >
              {cantidad}
            </output>
            <Button
              variante="secundario"
              tamano="icono"
              aria-label={`Sumar una unidad de ${nombre}`}
              onClick={() => onCambiarCantidad(cantidad + 1)}
            >
              <Plus aria-hidden />
            </Button>
          </div>

          <Precio valor={subtotal} className={cn("text-2xl", actualizando && "opacity-50")} />
        </div>

        <Button
          variante="enlace"
          className="self-start text-sm"
          aria-label={`Quitar ${nombre} del carrito`}
          onClick={onQuitar}
        >
          Quitar
        </Button>
      </div>
    </article>
  );
}
