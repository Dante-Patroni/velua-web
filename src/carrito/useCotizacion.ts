import { useCallback, useEffect, useRef, useState } from "react";

import { cotizarCarrito } from "@/lib/api/cotizacion.api";
import { ErrorApi } from "@/lib/apiFetch";
import type { AvisoCotizacion, Cotizacion } from "@/types";
import { coincideConCotizacion, itemsDeCotizacion } from "./cotizacion.utils";
import type { ItemCarrito } from "./types";

/** Espera antes de cotizar, para no pedir una cotización por cada toque en "+". */
const ESPERA_COTIZACION_MS = 300;

/** Lo que el hook deja disponible para la pantalla del carrito. */
export type EstadoCotizacion = {
  cotizacion: Cotizacion | null;
  /** Lo que cambió respecto de lo que la clienta tenía. Se muestra hasta que lo descarta. */
  avisos: AvisoCotizacion[];
  /** Código de error de la última cotización fallida, o null. */
  codigoError: string | null;
  /** true mientras se pide una cotización. */
  cargando: boolean;
  descartarAvisos: () => void;
};

/**
 * @description Mantiene el carrito sincronizado con `/cotizar`. Cada vez que el
 * carrito cambia pide la cotización (con una pequeña espera) y la deja lista
 * para mostrar: las líneas, los totales y los avisos. Si la API quitó productos
 * o bajó cantidades, reemplaza el carrito con lo que sí se puede comprar. Si
 * ninguno de los productos se puede vender, lo vacía. El carrito guarda solo
 * ids y cantidades: nunca copia datos de la cotización.
 * @param items Carrito actual.
 * @param reemplazar Reemplaza el carrito entero.
 * @param vaciar Vacía el carrito.
 * @returns La cotización, los avisos, el error y si está cargando.
 */
export function useCotizacion(
  items: ItemCarrito[],
  reemplazar: (items: ItemCarrito[]) => void,
  vaciar: () => void,
): EstadoCotizacion {
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [avisos, setAvisos] = useState<AvisoCotizacion[]>([]);
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const ultimaCotizacion = useRef<Cotizacion | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      // Al vaciarse, lo cotizado deja de valer: si vuelve a llenarse hay que cotizar de nuevo.
      ultimaCotizacion.current = null;
      return;
    }

    if (coincideConCotizacion(items, ultimaCotizacion.current)) return;

    const controlador = new AbortController();

    const espera = setTimeout(async () => {
      setCargando(true);

      try {
        const nueva = await cotizarCarrito(items, controlador.signal);

        ultimaCotizacion.current = nueva;
        setCotizacion(nueva);
        setCodigoError(null);
        if (nueva.avisos.length > 0) setAvisos(nueva.avisos);

        const cotizados = itemsDeCotizacion(nueva);
        if (!coincideConCotizacion(items, nueva)) reemplazar(cotizados);
      } catch (error) {
        if (controlador.signal.aborted) return;

        const codigo = error instanceof ErrorApi ? error.codigo : "ERROR_DESCONOCIDO";

        setCodigoError(codigo);
        if (codigo === "CARRITO_SIN_ITEMS_VALIDOS") {
          ultimaCotizacion.current = null;
          setCotizacion(null);
          vaciar();
        }
      } finally {
        if (!controlador.signal.aborted) setCargando(false);
      }
    }, ESPERA_COTIZACION_MS);

    return () => {
      clearTimeout(espera);
      controlador.abort();
    };
  }, [items, reemplazar, vaciar]);

  const descartarAvisos = useCallback(() => setAvisos([]), []);

  // Sin productos no hay nada que cotizar: se muestra el carrito vacío.
  if (items.length === 0) {
    return { cotizacion: null, avisos, codigoError, cargando: false, descartarAvisos };
  }

  return { cotizacion, avisos, codigoError, cargando, descartarAvisos };
}
