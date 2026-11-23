import { useEffect, useState } from "react";

import { cotizarVentaPanel } from "@/lib/api/ventasPanel.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { VentaCotizacion, VentaCotizacionEntrada } from "@/types";

type Resultado = { clave: string; version: number; cotizacion: VentaCotizacion | null; error: string | null };

/** Lo que el hook le entrega a la pantalla. */
export type CotizacionVenta = {
  /** La cotización de lo que hay hoy en pantalla, o null si falta, está en curso o falló. */
  cotizacion: VentaCotizacion | null;
  /** Código del error de la API (o del cliente) si la cotización vigente falló. */
  error: string | null;
  /** true mientras lo cotizado todavía no es lo que hay en pantalla. */
  cargando: boolean;
};

/**
 * @description Cotiza la venta del panel cada vez que cambia lo que se cotiza
 * (líneas, entrega, zona). Cancela la petición anterior y descarta cualquier
 * respuesta que ya no corresponda a lo que hay en pantalla: una cotización vieja
 * nunca se muestra como vigente. Es solo lectura: no crea ni reserva nada.
 * @param entrada Cuerpo de la cotización, o null si todavía no hay nada que cotizar.
 * @param version Se incrementa para volver a cotizar lo mismo (por ejemplo, después de un TOTAL_CAMBIO).
 * @returns La cotización vigente, el error vigente y si está cargando.
 */
export function useCotizacionVenta(
  entrada: VentaCotizacionEntrada | null,
  version = 0,
): CotizacionVenta {
  // La clave serializada es la dependencia del efecto: un objeto nuevo con el
  // mismo contenido no vuelve a cotizar.
  const clave = entrada ? JSON.stringify(entrada) : null;
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    if (clave === null) return;

    const controlador = new AbortController();

    cotizarVentaPanel(JSON.parse(clave) as VentaCotizacionEntrada, controlador.signal)
      .then((cotizacion) => setResultado({ clave, version, cotizacion, error: null }))
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return;
        setResultado({
          clave,
          version,
          cotizacion: null,
          error: error instanceof ErrorApi ? error.codigo : "ERROR_DESCONOCIDO",
        });
      });

    return () => controlador.abort();
  }, [clave, version]);

  const vigente = resultado !== null && resultado.clave === clave && resultado.version === version ? resultado : null;

  return {
    cotizacion: vigente?.cotizacion ?? null,
    error: vigente?.error ?? null,
    cargando: clave !== null && vigente === null,
  };
}
