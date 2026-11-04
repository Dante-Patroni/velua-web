import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { copiarAlPortapapeles } from "@/lib/portapapeles";

/** Cuánto tiempo se muestra "Copiado" antes de volver al botón normal. */
const DURACION_AVISO_MS = 2500;

type DatoCopiableProps = {
  etiqueta: string;
  /** Lo que se ve en pantalla. Siempre se muestra como texto. */
  mostrar: string;
  /** Lo que se copia. Por defecto, lo mismo que se ve. */
  copiar?: string;
};

/**
 * @description Una fila de datos (por ejemplo, el alias) con un botón para
 * copiarla. El valor es texto de la API: se imprime como texto de React, nunca
 * como HTML ni como enlace. Si el navegador no deja copiar, lo dice y el dato
 * queda a la vista para seleccionarlo.
 * @param props Etiqueta, valor a mostrar y valor a copiar.
 * @returns La fila con su botón.
 */
export function DatoCopiable({ etiqueta, mostrar, copiar }: DatoCopiableProps) {
  const [estado, setEstado] = useState<"copiado" | "error" | null>(null);

  useEffect(() => {
    if (!estado) return;

    const temporizador = setTimeout(() => setEstado(null), DURACION_AVISO_MS);

    return () => clearTimeout(temporizador);
  }, [estado]);

  const alCopiar = async () => setEstado((await copiarAlPortapapeles(copiar ?? mostrar)) ? "copiado" : "error");

  return (
    <div className="flex items-center justify-between gap-3 border-t border-borde py-3 first:border-t-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-xs font-bold tracking-[0.18em] text-etiqueta uppercase">{etiqueta}</dt>
        <dd className="font-display text-2xl font-medium break-all text-tinta lining-nums tabular-nums select-all">
          {mostrar}
        </dd>
        {/* Siempre en el DOM, para que los lectores de pantalla anuncien el resultado. */}
        <p role="status" className="min-h-5 text-sm text-texto-suave">
          {estado === "copiado" && "Copiado."}
          {estado === "error" && "No pudimos copiarlo. Seleccionalo y copialo a mano."}
        </p>
      </div>
      <Button variante="secundario" tamano="chico" onClick={alCopiar} aria-label={`Copiar ${etiqueta.toLowerCase()}`}>
        {estado === "copiado" ? <Check aria-hidden /> : <Copy aria-hidden />}
        {estado === "copiado" ? "Copiado" : "Copiar"}
      </Button>
    </div>
  );
}
