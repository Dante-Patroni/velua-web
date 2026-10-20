import { useCallback, useEffect, useRef, useState } from "react";

import { cotizarCarrito } from "@/lib/api/cotizacion.api";
import type { AvisoCotizacion, Cotizacion } from "@/types";
import { coincideConCotizacion, resolverCotizacion } from "./cotizacion.utils";
import type { ItemCarrito } from "./types";

/** Espera antes de cotizar, para no pedir una cotización por cada toque en "+". */
const ESPERA_COTIZACION_MS = 300;

/**
 * Por qué no hay una cotización al día. `sin_items_validos`: la API dijo que
 * nada se puede vender y el carrito se vació. `no_actualizado`: la cotización
 * falló (red, 500, límite de pedidos) y el carrito quedó como estaba.
 */
export type ErrorCarrito = "sin_items_validos" | "no_actualizado";

/** Lo que el hook deja disponible para la pantalla del carrito. */
export type EstadoCotizacion = {
  cotizacion: Cotizacion | null;
  /** Lo que cambió respecto de lo que la clienta tenía. Se muestra hasta que lo descarta. */
  avisos: AvisoCotizacion[];
  error: ErrorCarrito | null;
  /** true mientras se pide una cotización. */
  cargando: boolean;
  descartarAvisos: () => void;
  /** Vuelve a pedir la cotización después de un error. */
  reintentar: () => void;
  /** Olvida la cotización, los avisos y el error. Se usa al vaciar el carrito. */
  reiniciar: () => void;
};

/**
 * @description Mantiene el carrito sincronizado con `/cotizar`. Cada vez que el
 * carrito cambia pide la cotización (con una pequeña espera) y la deja lista
 * para mostrar. Si el carrito cambia mientras una petición está en vuelo, esa
 * respuesta se descarta: una respuesta vieja nunca pisa el carrito. Solo se
 * corrige el carrito cuando la API responde con avisos; ante un error de red o
 * un 500 queda como estaba. Guarda solo ids y cantidades: nunca copia datos de
 * la cotización.
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
  const [error, setError] = useState<ErrorCarrito | null>(null);
  const [cargando, setCargando] = useState(false);
  const [intento, setIntento] = useState(0);
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

      const resultado = await resolverCotizacion(items, cotizarCarrito, controlador.signal);

      if (resultado.tipo === "obsoleta") return;

      setCargando(false);

      if (resultado.tipo === "error") {
        setError("no_actualizado");
        return;
      }

      if (resultado.tipo === "sin_items_validos") {
        ultimaCotizacion.current = null;
        setCotizacion(null);
        setError("sin_items_validos");
        vaciar();
        return;
      }

      ultimaCotizacion.current = resultado.cotizacion;
      setCotizacion(resultado.cotizacion);
      setError(null);
      if (resultado.avisos.length > 0) setAvisos(resultado.avisos);
      if (resultado.items) reemplazar(resultado.items);
    }, ESPERA_COTIZACION_MS);

    return () => {
      clearTimeout(espera);
      controlador.abort();
      // Si la petición cancelada era la única en vuelo, no queda nada cargando.
      setCargando(false);
    };
  }, [items, reemplazar, vaciar, intento]);

  const descartarAvisos = useCallback(() => setAvisos([]), []);
  const reintentar = useCallback(() => setIntento((actual) => actual + 1), []);
  const reiniciar = useCallback(() => {
    ultimaCotizacion.current = null;
    setCotizacion(null);
    setAvisos([]);
    setError(null);
  }, []);

  // Sin productos no hay nada que cotizar: se muestra el carrito vacío.
  if (items.length === 0) {
    return { cotizacion: null, avisos, error, cargando: false, descartarAvisos, reintentar, reiniciar };
  }

  return { cotizacion, avisos, error, cargando, descartarAvisos, reintentar, reiniciar };
}
