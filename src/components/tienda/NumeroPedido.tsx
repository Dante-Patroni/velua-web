import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { copiarAlPortapapeles } from "@/lib/portapapeles";

/** Cuánto tiempo se muestra "Copiado" antes de volver al botón normal. */
const DURACION_AVISO_MS = 2500;

type NumeroPedidoProps = {
  numero: string;
};

/**
 * @description Bloque con el número del pedido bien visible y un botón para
 * copiarlo. Es la llave para volver a ver el pedido, así que se muestra grande
 * y seleccionable de un toque. Si el navegador no deja copiar (por ejemplo, una
 * página sin https), lo dice y el número queda a mano para seleccionarlo.
 * @param props El número del pedido.
 * @returns El bloque del número.
 */
export function NumeroPedido({ numero }: NumeroPedidoProps) {
  const [estado, setEstado] = useState<"copiado" | "error" | null>(null);

  useEffect(() => {
    if (!estado) return;

    const temporizador = setTimeout(() => setEstado(null), DURACION_AVISO_MS);

    return () => clearTimeout(temporizador);
  }, [estado]);

  const copiar = async () => setEstado((await copiarAlPortapapeles(numero)) ? "copiado" : "error");

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-borde bg-crema-calida p-4 md:flex-row md:items-center md:justify-between md:p-5">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold tracking-[0.18em] text-etiqueta uppercase">Número de tu pedido</p>
        <p className="font-display text-3xl font-medium tracking-wide text-tinta lining-nums tabular-nums select-all md:text-4xl">
          {numero}
        </p>
        <p className="text-sm text-texto-suave">Guardalo: con este número volvés a ver el estado de tu pedido.</p>
      </div>

      <div className="flex flex-col items-start gap-1 md:items-end">
        <Button variante="secundario" tamano="chico" onClick={copiar}>
          {estado === "copiado" ? <Check aria-hidden /> : <Copy aria-hidden />}
          {estado === "copiado" ? "Copiado" : "Copiar número"}
        </Button>
        {/* Siempre en el DOM, para que los lectores de pantalla anuncien el resultado. */}
        <p role="status" className="min-h-5 text-sm text-texto-suave">
          {estado === "copiado" && "Número copiado."}
          {estado === "error" && "No pudimos copiarlo. Seleccionalo y copialo a mano."}
        </p>
      </div>
    </div>
  );
}
