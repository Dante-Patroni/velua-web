import { formatearFechaHora, formatearPrecio, montoParaCopiar } from "@/lib/formato";
import type { DatosTransferencia as Datos } from "@/types";

import { DatoCopiable } from "./DatoCopiable";

type DatosTransferenciaProps = {
  numero: string;
  datos: Datos;
  /** Hasta cuándo se guarda el pedido, tal como lo informa la API. */
  expiraEn?: string | null;
};

/**
 * @description Los datos para transferir: alias, CBU, titular y monto, cada uno
 * con su botón de copiar, más el número del pedido para poner en el concepto y
 * hasta cuándo está reservado. Todo sale de la respuesta de la API y se muestra
 * como texto: nada de HTML ni de enlaces armados con estos datos.
 * @param props Número del pedido, datos y vencimiento de la reserva.
 * @returns El bloque con los datos.
 */
export function DatosTransferencia({ numero, datos, expiraEn }: DatosTransferenciaProps) {
  return (
    <div className="rounded-2xl border border-borde bg-crema-clara p-5 md:p-6">
      <h2 className="font-display text-2xl font-medium text-tinta">Datos para transferir</h2>

      <dl className="mt-2">
        <DatoCopiable etiqueta="Alias" mostrar={datos.alias} />
        <DatoCopiable etiqueta="CBU" mostrar={datos.cbu} />
        <DatoCopiable etiqueta="Titular" mostrar={datos.titular} />
        <DatoCopiable etiqueta="Monto" mostrar={formatearPrecio(datos.monto)} copiar={montoParaCopiar(datos.monto)} />
      </dl>

      <p className="mt-2 text-sm text-texto-suave">
        En el concepto, poné <strong className="font-medium text-tinta">{numero}</strong>.
      </p>
      {expiraEn && (
        <p className="mt-1 text-sm text-texto-suave">Guardamos tus productos hasta el {formatearFechaHora(expiraEn)}.</p>
      )}
    </div>
  );
}
