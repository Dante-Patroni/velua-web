import { useCallback, useEffect, useRef, useState } from "react";

import { cotizarCarrito, type OpcionesCotizacion } from "@/lib/api/cotizacion.api";
import type { AvisoCotizacion, Cotizacion } from "@/types";
import { claveCotizacion, coincideConCotizacion, resolverCotizacion } from "./cotizacion.utils";
import type { ItemCarrito } from "./types";

/** Espera antes de cotizar, para no pedir una cotización por cada toque en "+". */
const ESPERA_COTIZACION_MS = 300;

/**
 * Por qué no hay una cotización al día. `sin_items_validos`: la API dijo que
 * nada se puede vender y el carrito se vació. `no_actualizado`: la cotización
 * falló (red, 500, límite de pedidos) y el carrito quedó como estaba.
 */
export type ErrorCarrito = "sin_items_validos" | "no_actualizado";

/** Lo que el hook deja disponible para la pantalla del carrito y el checkout. */
export type EstadoCotizacion = {
  cotizacion: Cotizacion | null;
  /** Lo que cambió respecto de lo que la clienta tenía. Se muestra hasta que lo descarta. */
  avisos: AvisoCotizacion[];
  error: ErrorCarrito | null;
  /** true mientras se pide una cotización. */
  cargando: boolean;
  /** true si la cotización guardada es la de la zona y el medio de pago actuales. */
  alDia: boolean;
  descartarAvisos: () => void;
  /** Vuelve a pedir la cotización, aunque el carrito no haya cambiado. */
  reintentar: () => void;
  /** Olvida la cotización, los avisos y el error. Se usa al vaciar el carrito. */
  reiniciar: () => void;
};

/**
 * @description Mantiene el carrito sincronizado con `/cotizar`. Cada vez que el
 * carrito, la zona o el medio de pago cambian pide la cotización (con una
 * pequeña espera) y la deja lista para mostrar. Si algo cambia mientras una
 * petición está en vuelo, esa respuesta se descarta: una respuesta vieja nunca
 * pisa el carrito. Solo se corrige el carrito cuando la API responde con
 * avisos; ante un error de red o un 500 queda como estaba. Guarda solo ids y
 * cantidades: nunca copia datos de la cotización.
 * @param items Carrito actual.
 * @param reemplazar Reemplaza el carrito entero.
 * @param vaciar Vacía el carrito.
 * @param opciones Zona de envío y medio de pago, en el checkout.
 * @returns La cotización, los avisos, el error y si está cargando.
 */
export function useCotizacion(
  items: ItemCarrito[],
  reemplazar: (items: ItemCarrito[]) => void,
  vaciar: () => void,
  opciones: OpcionesCotizacion = {},
): EstadoCotizacion {
  const clave = claveCotizacion(opciones);
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [claveCotizada, setClaveCotizada] = useState<string | null>(null);
  const [avisos, setAvisos] = useState<AvisoCotizacion[]>([]);
  const [error, setError] = useState<ErrorCarrito | null>(null);
  const [cargando, setCargando] = useState(false);
  const [intento, setIntento] = useState(0);
  const ultimaCotizacion = useRef<Cotizacion | null>(null);
  const ultimaClave = useRef<string | null>(null);
  const intentoResuelto = useRef(0);

  useEffect(() => {
    if (items.length === 0) {
      // Al vaciarse, lo cotizado deja de valer: si vuelve a llenarse hay que cotizar de nuevo.
      ultimaCotizacion.current = null;
      ultimaClave.current = null;
      return;
    }

    // Un "reintentar" pide cotizar aunque nada haya cambiado.
    const refrescar = intento !== intentoResuelto.current;

    if (
      !refrescar &&
      ultimaClave.current === clave &&
      coincideConCotizacion(items, ultimaCotizacion.current)
    ) {
      return;
    }

    const controlador = new AbortController();
    const enviadas = JSON.parse(clave) as OpcionesCotizacion;

    const espera = setTimeout(async () => {
      setCargando(true);

      const resultado = await resolverCotizacion(
        items,
        (itemsAEnviar, signal) => cotizarCarrito(itemsAEnviar, signal, enviadas),
        controlador.signal,
      );

      if (resultado.tipo === "obsoleta") return;

      intentoResuelto.current = intento;
      setCargando(false);

      if (resultado.tipo === "error") {
        setError("no_actualizado");
        return;
      }

      if (resultado.tipo === "sin_items_validos") {
        ultimaCotizacion.current = null;
        ultimaClave.current = null;
        setCotizacion(null);
        setClaveCotizada(null);
        setError("sin_items_validos");
        vaciar();
        return;
      }

      ultimaCotizacion.current = resultado.cotizacion;
      ultimaClave.current = clave;
      setCotizacion(resultado.cotizacion);
      setClaveCotizada(clave);
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
  }, [items, reemplazar, vaciar, clave, intento]);

  const descartarAvisos = useCallback(() => setAvisos([]), []);
  const reintentar = useCallback(() => setIntento((actual) => actual + 1), []);
  const reiniciar = useCallback(() => {
    ultimaCotizacion.current = null;
    ultimaClave.current = null;
    setCotizacion(null);
    setClaveCotizada(null);
    setAvisos([]);
    setError(null);
  }, []);

  const alDia = claveCotizada === clave;

  // Sin productos no hay nada que cotizar: se muestra el carrito vacío.
  if (items.length === 0) {
    return { cotizacion: null, avisos, error, cargando: false, alDia, descartarAvisos, reintentar, reiniciar };
  }

  return { cotizacion, avisos, error, cargando, alDia, descartarAvisos, reintentar, reiniciar };
}
