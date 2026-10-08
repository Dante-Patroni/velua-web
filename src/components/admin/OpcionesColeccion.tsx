import type { CategoriaAdmin } from "@/types";
import { entradasColeccion } from "./OpcionesColeccion.utils";

type Props = {
  categorias: CategoriaAdmin[];
  /** Agrega "(despublicada)" a las inactivas. */
  marcarDespublicadas?: boolean;
};

/**
 * Opciones de un `<select>` de colección: las que agrupan otras van como
 * `<optgroup>`, así no se pueden elegir para un producto.
 * @param props Categorías y opciones de presentación.
 * @returns Los `<option>` y `<optgroup>`, sin el `<select>`.
 */
export function OpcionesColeccion({
  categorias,
  marcarDespublicadas = false,
}: Props) {
  const etiqueta = (c: CategoriaAdmin) =>
    c.nombre + (marcarDespublicadas && !c.activa ? " (despublicada)" : "");

  return (
    <>
      {entradasColeccion(categorias).map((e) =>
        e.tipo === "opcion" ? (
          <option key={e.categoria.id} value={e.categoria.id}>
            {etiqueta(e.categoria)}
          </option>
        ) : (
          <optgroup key={e.padre.id} label={etiqueta(e.padre)}>
            {e.hijas.map((h) => (
              <option key={h.id} value={h.id}>
                {etiqueta(h)}
              </option>
            ))}
          </optgroup>
        ),
      )}
    </>
  );
}
