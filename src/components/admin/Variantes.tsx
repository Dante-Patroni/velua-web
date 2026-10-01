import { useState } from "react";
import { useFetcher } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { CamposVariante } from "./CamposVariante";
import type { ProductoAdmin, VarianteAdmin } from "@/types";

/**
 * @description Lista de variantes mientras se crea un producto.
 *
 * Acá no hay llamadas a la API: las variantes son estado del navegador y viajan
 * todas juntas cuando se guarda el producto. El backend las crea en una
 * transacción con el producto, porque el esquema no admite un producto sin
 * ninguna.
 *
 * Las filas se identifican con una clave propia y no con su posición: si se
 * quita la del medio, usar el índice haría que React reutilice los campos mal y
 * los valores se corran de fila.
 *
 * @param props Errores devueltos por la API.
 * @param props.details Errores por campo, con la posición de cada variante.
 * @returns La lista de variantes con sus botones.
 */
export function VariantesNuevas({
  details,
  alCambiarPrecio,
}: {
  details?: Record<string, string>;
  alCambiarPrecio?: (precio: string, anterior: string) => void;
}) {
  const [claves, setClaves] = useState<number[]>([0]);
  const [proxima, setProxima] = useState(1);

  return (
    <div className="flex flex-col gap-4">
      {claves.map((clave, posicion) => (
        <article key={clave} className="rounded-lg border border-borde bg-crema-clara p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl text-tinta">
              Variante {posicion + 1}
            </h3>
            {claves.length > 1 && (
              <button
                type="button"
                onClick={() => setClaves((c) => c.filter((k) => k !== clave))}
                className="flex items-center gap-1.5 text-sm text-texto-suave hover:text-error"
              >
                <Trash2 aria-hidden className="size-4" />
                Quitar
              </button>
            )}
          </div>

          <CamposVariante
            prefijo={`variantes.${posicion}.`}
            details={details}
            alCambiarPrecio={posicion === 0 ? alCambiarPrecio : undefined}
          />
        </article>
      ))}

      <button
        type="button"
        onClick={() => {
          setClaves((c) => [...c, proxima]);
          setProxima((p) => p + 1);
        }}
        className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-lavanda py-4 text-sm text-tinta hover:bg-crema-calida"
      >
        <Plus aria-hidden className="size-4" />
        Agregar otra presentación
      </button>

      <p className="text-sm text-texto-suave">
        Cada presentación es un tamaño distinto del mismo producto, con su precio
        y su stock. Si el producto viene en uno solo, dejá una sola.
      </p>
    </div>
  );
}

/**
 * @description Una variante ya guardada, con su propio formulario.
 *
 * Al editar, cada variante tiene sus propios endpoints, así que cada una se
 * guarda por separado. Usa fetcher y no Form para que guardar una no recargue
 * la pantalla entera ni deshabilite las demás.
 *
 * @param props Datos de la variante y del producto.
 * @param props.variante Variante a editar.
 * @param props.esUnicaActiva Si es la única activa del producto.
 * @param props.alCambiarPrecio Avisa el precio para la vista previa. Solo la primera.
 * @returns La tarjeta con los campos y sus botones.
 */
function VarianteExistente({
  variante,
  esUnicaActiva,
  alCambiarPrecio,
}: {
  variante: VarianteAdmin;
  esUnicaActiva: boolean;
  alCambiarPrecio?: (precio: string, anterior: string) => void;
}) {
  const guardado = useFetcher();
  const estado = useFetcher();

  const guardando = guardado.state !== "idle";
  const cambiandoEstado = estado.state !== "idle";
  const error = guardado.data as { details?: Record<string, string> } | undefined;

  return (
    <article
      className={`rounded-lg border p-5 ${
        variante.activa
          ? "border-borde bg-crema-clara"
          : "border-borde bg-crema-calida opacity-75"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl text-tinta">
          {variante.nombre}
          {!variante.activa && (
            <span className="ml-2 text-sm font-normal text-texto-tenue">
              (desactivada)
            </span>
          )}
        </h3>

        <estado.Form method="post">
          <input type="hidden" name="intencion" value="estado-variante" />
          <input type="hidden" name="varianteId" value={variante.id} />
          <input type="hidden" name="activa" value={String(!variante.activa)} />
          <button
            type="submit"
            disabled={cambiandoEstado || (variante.activa && esUnicaActiva)}
            title={
              variante.activa && esUnicaActiva
                ? "No se puede desactivar la única presentación activa: el producto quedaría visible sin nada que comprar"
                : undefined
            }
            className="text-sm text-dorado-texto underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-texto-tenue disabled:no-underline"
          >
            {variante.activa ? "Desactivar" : "Activar"}
          </button>
        </estado.Form>
      </div>

      <guardado.Form method="post" className="flex flex-col gap-4">
        <input type="hidden" name="intencion" value="guardar-variante" />
        <input type="hidden" name="varianteId" value={variante.id} />

        <CamposVariante
          variante={variante}
          details={error?.details}
          alCambiarPrecio={alCambiarPrecio}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={guardando} className="w-auto">
            {guardando ? "Guardando…" : "Guardar presentación"}
          </Button>
          {guardado.data === null && !guardando && (
            <span role="status" className="text-sm text-salvia-hondo">
              Guardado
            </span>
          )}
        </div>
      </guardado.Form>
    </article>
  );
}

/**
 * @description Lista de variantes de un producto que ya existe. Cada una se
 * guarda por separado, y abajo hay un bloque para agregar una nueva.
 * @param props Producto en edición.
 * @param props.producto Producto con sus variantes.
 * @param props.alCambiarPrecio Avisa el precio para la vista previa. Solo la primera.
 * @returns Las variantes existentes y el formulario para agregar otra.
 */
export function VariantesExistentes({
  producto,
  alCambiarPrecio,
}: {
  producto: ProductoAdmin;
  alCambiarPrecio?: (precio: string, anterior: string) => void;
}) {
  const [agregando, setAgregando] = useState(false);
  const nueva = useFetcher();

  const activas = producto.variantes.filter((v) => v.activa).length;
  const error = nueva.data as { details?: Record<string, string> } | undefined;

  return (
    <div className="flex flex-col gap-4">
      {producto.variantes.map((v, i) => (
        <VarianteExistente
          key={v.id}
          variante={v}
          esUnicaActiva={activas === 1 && v.activa}
          alCambiarPrecio={i === 0 ? alCambiarPrecio : undefined}
        />
      ))}

      {agregando ? (
        <nueva.Form
          method="post"
          className="flex flex-col gap-4 rounded-lg border border-lavanda bg-crema-clara p-5"
        >
          <input type="hidden" name="intencion" value="agregar-variante" />
          <h3 className="font-display text-xl text-tinta">Presentación nueva</h3>

          <CamposVariante details={error?.details} />

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={nueva.state !== "idle"} className="w-auto">
              {nueva.state !== "idle" ? "Agregando…" : "Agregar"}
            </Button>
            <button
              type="button"
              onClick={() => setAgregando(false)}
              className="text-sm text-texto-suave hover:text-tinta"
            >
              Cancelar
            </button>
          </div>
        </nueva.Form>
      ) : (
        <button
          type="button"
          onClick={() => setAgregando(true)}
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-lavanda py-4 text-sm text-tinta hover:bg-crema-calida"
        >
          <Plus aria-hidden className="size-4" />
          Agregar otra presentación
        </button>
      )}

      <p className="text-sm text-texto-suave">
        Las presentaciones no se borran: se desactivan. Así desaparecen de la
        tienda pero los pedidos viejos siguen mostrando qué se vendió.
      </p>
    </div>
  );
}
