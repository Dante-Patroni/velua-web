import type { ReactNode } from "react";

import { Precio } from "@/components/ui/Precio";

type OpcionMedioPagoProps = {
  /** Valor que viaja en el formulario (`mercadopago` o `transferencia`). */
  valor: string;
  titulo: string;
  detalle: string;
  /** Total que informa la API para este medio, como cadena decimal. */
  total: string;
  elegido: boolean;
  onElegir: () => void;
  /** Contenido extra bajo el detalle, por ejemplo la aclaración del descuento. */
  children?: ReactNode;
};

/**
 * @description Una opción de medio de pago: un radio con el título, el detalle y
 * el total que informa la API. El total solo se formatea: no se calcula acá. El
 * radio es nativo y está dentro del formulario, así que el valor elegido viaja
 * con el pedido.
 * @param props Valor, textos, total, si está elegida y qué hacer al elegirla.
 * @returns La opción como etiqueta tocable en toda su superficie.
 */
export function OpcionMedioPago({ valor, titulo, detalle, total, elegido, onElegir, children }: OpcionMedioPagoProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lavanda ${
        elegido ? "border-tinta bg-crema-clara" : "border-borde bg-crema-calida"
      }`}
    >
      <input
        type="radio"
        name="medioPago"
        value={valor}
        checked={elegido}
        onChange={onElegir}
        className="mt-1 size-4 accent-tinta"
      />
      <span className="flex flex-1 flex-col gap-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-medium text-tinta">{titulo}</span>
          <Precio valor={total} className="text-xl" />
        </span>
        <span className="text-sm text-texto-suave">{detalle}</span>
        {children}
      </span>
    </label>
  );
}
