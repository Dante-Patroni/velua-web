import { esEnteroPositivo } from "./carrito.utils";
import type { ItemCarrito } from "./types";

/** Clave del carrito en localStorage. Con versión, por si cambia la forma. */
export const CLAVE_CARRITO = "velua.carrito.v1";

/** Lo mínimo de Storage que se usa. Permite probar sin navegador. */
type Almacen = Pick<Storage, "getItem" | "setItem">;

/**
 * @description Devuelve el localStorage del navegador, o null si no está
 * disponible: modo privado de algunos navegadores, cookies bloqueadas o tests.
 * @returns El almacén, o null.
 */
const almacenPorDefecto = (): Almacen | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

/**
 * @description Convierte lo guardado en un carrito válido. Descarta todo lo que
 * no sea { varianteId, cantidad } con enteros positivos, y con eso también
 * cualquier precio o nombre que haya guardado una versión anterior. Si una
 * variante aparece dos veces, junta las cantidades.
 * @param crudo Texto leído del almacén.
 * @returns El carrito saneado. Vacío si el texto no sirve.
 */
export const interpretarCarrito = (crudo: string | null): ItemCarrito[] => {
  if (!crudo) return [];

  let datos: unknown;

  try {
    datos = JSON.parse(crudo);
  } catch {
    return [];
  }

  if (!Array.isArray(datos)) return [];

  const cantidades = new Map<number, number>();

  for (const item of datos) {
    const { varianteId, cantidad } = (item ?? {}) as Partial<ItemCarrito>;

    if (esEnteroPositivo(varianteId) && esEnteroPositivo(cantidad)) {
      cantidades.set(varianteId, (cantidades.get(varianteId) ?? 0) + cantidad);
    }
  }

  return [...cantidades].map(([varianteId, cantidad]) => ({ varianteId, cantidad }));
};

/**
 * @description Lee el carrito guardado. Nunca lanza: si no hay almacén o los
 * datos están rotos, devuelve un carrito vacío.
 * @param almacen Dónde leer. Por defecto, localStorage.
 * @returns El carrito guardado y saneado.
 */
export const leerCarrito = (almacen: Almacen | null = almacenPorDefecto()): ItemCarrito[] => {
  if (!almacen) return [];

  try {
    return interpretarCarrito(almacen.getItem(CLAVE_CARRITO));
  } catch {
    return [];
  }
};

/**
 * @description Guarda el carrito. Solo ids y cantidades, aunque reciba algo
 * más. Si el almacén falla, por ejemplo por cuota llena, el carrito sigue en
 * memoria durante la visita.
 * @param items Carrito a guardar.
 * @param almacen Dónde escribir. Por defecto, localStorage.
 */
export const guardarCarrito = (
  items: ItemCarrito[],
  almacen: Almacen | null = almacenPorDefecto(),
): void => {
  if (!almacen) return;

  const soloIds = items.map(({ varianteId, cantidad }) => ({ varianteId, cantidad }));

  try {
    almacen.setItem(CLAVE_CARRITO, JSON.stringify(soloIds));
  } catch {
    // Sin espacio o sin permiso: no hay nada útil que mostrarle a la clienta.
  }
};
