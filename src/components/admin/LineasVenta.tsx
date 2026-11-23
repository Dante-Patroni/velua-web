import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Precio } from "@/components/ui/Precio";
import type { LineaVenta } from "@/pages/Admin/VentaNueva.utils";
import type { VentaCotizacion } from "@/types";

type LineasVentaProps = {
  lineas: readonly LineaVenta[];
  /** Cómo nombrar cada variante mientras no hay cotización: lo que se vio al elegirla. */
  etiquetas: Readonly<Record<number, string>>;
  /** Cotización vigente, de donde salen el nombre y los importes de cada línea. */
  cotizacion: VentaCotizacion | null;
  onCantidad: (varianteId: number, cantidad: number) => void;
  onQuitar: (varianteId: number) => void;
};

/**
 * @description Las líneas de la venta, con sus cantidades. Los importes de cada
 * línea (precio unitario y subtotal) son los que devuelve la cotización: acá no
 * se calcula nada. Sin cotización vigente se muestra solo el nombre y la
 * cantidad.
 * @param props Líneas, nombres, cotización y qué hacer al cambiar o quitar.
 * @returns La lista, o null si todavía no hay líneas.
 */
export function LineasVenta({ lineas, etiquetas, cotizacion, onCantidad, onQuitar }: LineasVentaProps) {
  if (lineas.length === 0) return null;

  return (
    <ul className="flex flex-col divide-y divide-borde rounded-lg border border-borde bg-crema-clara">
      {lineas.map(({ varianteId, cantidad }) => {
        const cotizada = cotizacion?.items.find((item) => item.varianteId === varianteId);
        const nombre = cotizada?.productoNombre
          ? `${cotizada.productoNombre} · ${cotizada.varianteNombre ?? ""}`
          : (etiquetas[varianteId] ?? "Producto");

        return (
          <li key={varianteId} className="flex flex-col gap-2 p-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-tinta">{nombre}</p>
              <Button
                type="button"
                variante="fantasma"
                tamano="icono"
                aria-label={`Quitar ${nombre}`}
                onClick={() => onQuitar(varianteId)}
              >
                <Trash2 aria-hidden />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variante="secundario"
                  tamano="icono"
                  aria-label={`Una unidad menos de ${nombre}`}
                  disabled={cantidad <= 1}
                  onClick={() => onCantidad(varianteId, cantidad - 1)}
                >
                  <Minus aria-hidden />
                </Button>
                <span className="w-8 text-center text-base lining-nums tabular-nums text-tinta">
                  {cantidad}
                </span>
                <Button
                  type="button"
                  variante="secundario"
                  tamano="icono"
                  aria-label={`Una unidad más de ${nombre}`}
                  onClick={() => onCantidad(varianteId, cantidad + 1)}
                >
                  <Plus aria-hidden />
                </Button>
              </div>

              {cotizada && (
                <p className="text-right text-sm text-texto-suave">
                  <Precio valor={cotizada.precioUnitario} className="text-base" /> c/u ·{" "}
                  <Precio valor={cotizada.subtotal} className="text-base" />
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
