import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router-dom";
import { AlertTriangle, ChevronDown, ChevronUp, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { obtenerMensajeError } from "@/lib/mappings";
import type { CategoriaAdmin } from "@/types";
import type { DatosCategorias, ErrorCategorias } from "./Categorias.action";
import { ImagenCategoria } from "@/components/admin/ImagenCategoria";

/**
 * @description Muestra el error de un campo, si la API devolvió uno.
 * @param props Datos del error.
 * @param props.details Errores por campo.
 * @param props.campo Nombre del campo.
 * @returns El mensaje, o null si ese campo no tiene error.
 */
function ErrorCampo({
  details,
  campo,
}: {
  details?: Record<string, string>;
  campo: string;
}) {
  const mensaje = details?.[campo];
  if (!mensaje) return null;

  return (
    <p role="alert" className="mt-1 text-sm text-error">
      {mensaje}
    </p>
  );
}

/**
 * @description Una categoría del menú, editable en el lugar.
 *
 * Con tres o cuatro categorías, navegar a otra pantalla para cambiar un nombre
 * sería de más: cada fila se despliega y se guarda sola.
 *
 * @param props Datos de la categoría y su posición.
 * @param props.categoria Categoría a mostrar.
 * @param props.posicion Posición en el menú.
 * @param props.total Cantidad de categorías.
 * @param props.alMover Pide mover la categoría a otra posición.
 * @returns La fila con su formulario.
 */
function Fila({
  categoria,
  posicion,
  total,
  alMover,
}: {
  categoria: CategoriaAdmin;
  posicion: number;
  total: number;
  alMover: (desde: number, hasta: number) => void;
}) {
  const [abierta, setAbierta] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const guardado = useFetcher();
  const estado = useFetcher();

  const error = guardado.data as ErrorCategorias | undefined;
  const guardando = guardado.state !== "idle";

  return (
    <li
      className={`rounded-lg border bg-crema-clara ${
        categoria.activa ? "border-borde" : "border-borde opacity-75"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => alMover(posicion, posicion - 1)}
            disabled={posicion === 0}
            aria-label={`Subir ${categoria.nombre} en el menú`}
            className="flex size-7 items-center justify-center rounded-sm text-tinta hover:bg-crema-calida disabled:opacity-30"
          >
            <ChevronUp aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => alMover(posicion, posicion + 1)}
            disabled={posicion === total - 1}
            aria-label={`Bajar ${categoria.nombre} en el menú`}
            className="flex size-7 items-center justify-center rounded-sm text-tinta hover:bg-crema-calida disabled:opacity-30"
          >
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </div>

        <div className="min-w-48 flex-1">
          <p className="font-display text-xl text-tinta">
            {categoria.nombre}
            {!categoria.activa && (
              <span className="ml-2 text-sm font-normal text-texto-tenue">
                (despublicada)
              </span>
            )}
          </p>
          <p className="text-sm text-texto-suave">
            {categoria.cantidadProductos}{" "}
            {categoria.cantidadProductos === 1 ? "producto" : "productos"} ·{" "}
            <span className="font-mono text-xs">{categoria.slug}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAbierta((a) => !a)}
          className="text-sm text-dorado-texto underline-offset-4 hover:underline"
        >
          {abierta ? "Cerrar" : "Editar"}
        </button>
      </div>

      {abierta && (
        <div className="flex flex-col gap-5 border-t border-borde p-4">
          <guardado.Form method="post" className="flex flex-col gap-4">
            <input type="hidden" name="intencion" value="guardar" />
            <input type="hidden" name="id" value={categoria.id} />

            <div>
              <Label htmlFor={`nombre-${categoria.id}`}>Nombre</Label>
              <Input
                id={`nombre-${categoria.id}`}
                name="nombre"
                required
                maxLength={80}
                defaultValue={categoria.nombre}
                className="mt-1"
              />
              <ErrorCampo details={error?.details} campo="nombre" />
            </div>

            <div>
              <Label htmlFor={`descripcion-${categoria.id}`}>Descripción</Label>
              <Textarea
                id={`descripcion-${categoria.id}`}
                name="descripcion"
                rows={2}
                maxLength={300}
                defaultValue={categoria.descripcion ?? ""}
                placeholder="Una línea, aparece arriba de la colección"
                className="mt-1"
              />
              <ErrorCampo details={error?.details} campo="descripcion" />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={guardando} className="w-auto">
                {guardando ? "Guardando…" : "Guardar"}
              </Button>
              {guardado.data === null && !guardando && (
                <span role="status" className="text-sm text-salvia-hondo">
                  Guardado
                </span>
              )}
              {error && !error.details && (
                <span role="alert" className="text-sm text-error">
                  {obtenerMensajeError(error.codigo, "panel")}
                </span>
              )}
            </div>
          </guardado.Form>

          <ImagenCategoria categoria={categoria} />

          <div className="border-t border-borde pt-4">
            {confirmando ? (
              <div className="flex flex-col gap-3">
                {categoria.activa && categoria.cantidadProductos > 0 && (
                  <p className="flex items-start gap-2 text-sm text-dorado-texto">
                    <AlertTriangle
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <span>
                      Esto va a ocultar de la tienda los{" "}
                      {categoria.cantidadProductos} productos de esta colección,
                      aunque cada uno siga publicado.
                    </span>
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <estado.Form method="post">
                    <input type="hidden" name="intencion" value="estado" />
                    <input type="hidden" name="id" value={categoria.id} />
                    <input
                      type="hidden"
                      name="activa"
                      value={String(!categoria.activa)}
                    />
                    <Button
                      type="submit"
                      disabled={estado.state !== "idle"}
                      className="w-auto"
                    >
                      {categoria.activa ? "Sí, despublicar" : "Sí, publicar"}
                    </Button>
                  </estado.Form>
                  <button
                    type="button"
                    onClick={() => setConfirmando(false)}
                    className="text-sm text-texto-suave hover:text-tinta"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmando(true)}
                className="text-sm text-dorado-texto underline-offset-4 hover:underline"
              >
                {categoria.activa
                  ? "Despublicar colección"
                  : "Publicar colección"}
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * @description Pantalla de colecciones del panel. Lista, edita, reordena y
 * publica o despublica.
 * @returns La lista de categorías y el formulario para agregar una.
 */
export function Categorias() {
  const { categorias } = useLoaderData() as DatosCategorias;
  const [agregando, setAgregando] = useState(false);
  const nueva = useFetcher();
  const orden = useFetcher();

  const errorNueva = nueva.data as ErrorCategorias | undefined;

  /**
   * @description Reordena el menú. Manda la lista completa de ids: un orden
   * parcial dejaría dos categorías en la misma posición.
   * @param desde Posición actual.
   * @param hasta Posición destino.
   * @returns Nada.
   */
  const mover = (desde: number, hasta: number) => {
    if (hasta < 0 || hasta >= categorias.length) return;

    const ids = categorias.map((c) => c.id);
    const [movido] = ids.splice(desde, 1);
    ids.splice(hasta, 0, movido);

    orden.submit(
      { intencion: "orden", ids: ids.join(",") },
      { method: "post" },
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="font-display text-3xl font-medium text-tinta">
          Colecciones
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          El orden de esta lista es el orden del menú de la tienda.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {categorias.map((c, i) => (
          <Fila
            key={c.id}
            categoria={c}
            posicion={i}
            total={categorias.length}
            alMover={mover}
          />
        ))}
      </ul>

      {agregando ? (
        <nueva.Form
          method="post"
          className="flex flex-col gap-4 rounded-lg border border-lavanda bg-crema-clara p-5"
        >
          <input type="hidden" name="intencion" value="crear" />
          <h2 className="font-display text-2xl text-tinta">Colección nueva</h2>

          <div>
            <Label htmlFor="nombre-nueva">Nombre</Label>
            <Input
              id="nombre-nueva"
              name="nombre"
              required
              autoFocus
              maxLength={80}
              placeholder="Shampoo Sólido"
              className="mt-1"
            />
            <ErrorCampo details={errorNueva?.details} campo="nombre" />
          </div>

          <div>
            <Label htmlFor="descripcion-nueva">Descripción</Label>
            <Textarea
              id="descripcion-nueva"
              name="descripcion"
              rows={2}
              maxLength={300}
              placeholder="Una línea, aparece arriba de la colección"
              className="mt-1"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={nueva.state !== "idle"}
              className="w-auto"
            >
              {nueva.state !== "idle" ? "Creando…" : "Crear colección"}
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
          Agregar una colección
        </button>
      )}

      <p className="text-sm text-texto-suave">
        Las colecciones no se borran: se despublican. Despublicar una esconde de
        la tienda todos sus productos, aunque cada uno siga publicado.
      </p>
    </div>
  );
}
