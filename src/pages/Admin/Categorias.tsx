import { useState } from "react";
import { useFetcher, useLoaderData } from "react-router-dom";
import { AlertTriangle, ChevronDown, ChevronUp, Plus } from "lucide-react";

import { ImagenCategoria } from "@/components/admin/ImagenCategoria";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { obtenerMensajeError } from "@/lib/mappings";
import type { CategoriaAdmin } from "@/types";
import type { DatosCategorias, ErrorCategorias } from "./Categorias.action";
import { aplanarArbol, ordenTrasMover, posiblesPadres } from "./Categorias.utils";

/** Clases del selector, iguales a las del Input. */
const CLASES_SELECT =
  "mt-1 w-full rounded-md border border-borde bg-crema-clara px-3 py-2 text-tinta disabled:opacity-60";

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
 * @description Selector "Dentro de": elige la categoría padre, o ninguna para
 * dejarla en el primer nivel.
 * @param props Datos del selector.
 * @param props.id Id del elemento, para el label.
 * @param props.categorias Todas las categorías.
 * @param props.propia La categoría que se edita, o null si se está creando.
 * @returns El selector con su ayuda.
 */
function SelectorPadre({
  id,
  categorias,
  propia,
}: {
  id: string;
  categorias: CategoriaAdmin[];
  propia: CategoriaAdmin | null;
}) {
  const opciones = posiblesPadres(categorias, propia);
  // Con hijas no puede ir debajo de otra: quedarían tres niveles
  const bloqueado = (propia?.cantidadHijas ?? 0) > 0;

  return (
    <div>
      <Label htmlFor={id}>Dentro de</Label>
      <select
        id={id}
        name="padreId"
        defaultValue={propia?.padreId ?? ""}
        disabled={bloqueado}
        className={CLASES_SELECT}
      >
        <option value="">Ninguna (primer nivel del menú)</option>
        {opciones.map((o) => (
          <option key={o.id} value={o.id} disabled={!o.disponible}>
            {o.nombre}
            {!o.disponible ? " (tiene productos)" : ""}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-texto-tenue">
        {bloqueado
          ? "Agrupa otras colecciones, así que tiene que quedar en el primer nivel."
          : "Por ejemplo, las colecciones de jabones van dentro de “Jabones”."}
      </p>
    </div>
  );
}

/**
 * @description Una categoría del menú, editable en el lugar.
 *
 * Con pocas categorías, navegar a otra pantalla para cambiar un nombre sería
 * de más: cada fila se despliega y se guarda sola. Las hijas se muestran con
 * sangría, debajo de su categoría padre.
 *
 * @param props Datos de la categoría y su posición.
 * @param props.categoria Categoría a mostrar.
 * @param props.nivel 0 si es de primer nivel, 1 si es hija.
 * @param props.categorias Todas las categorías, para el selector de padre.
 * @param props.puedeSubir Si se puede subir entre sus hermanas.
 * @param props.puedeBajar Si se puede bajar entre sus hermanas.
 * @param props.alMover Pide moverla un lugar: -1 sube, 1 baja.
 * @returns La fila con su formulario.
 */
function Fila({
  categoria,
  nivel,
  categorias,
  puedeSubir,
  puedeBajar,
  alMover,
}: {
  categoria: CategoriaAdmin;
  nivel: 0 | 1;
  categorias: CategoriaAdmin[];
  puedeSubir: boolean;
  puedeBajar: boolean;
  alMover: (direccion: -1 | 1) => void;
}) {
  const [abierta, setAbierta] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const guardado = useFetcher();
  const estado = useFetcher();

  const error = guardado.data as ErrorCategorias | undefined;
  const guardando = guardado.state !== "idle";
  const tieneHijas = categoria.cantidadHijas > 0;

  return (
    <li
      className={`rounded-lg border bg-crema-clara ${nivel === 1 ? "ml-8" : ""} ${
        categoria.activa ? "border-borde" : "border-borde opacity-75"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => alMover(-1)}
            disabled={!puedeSubir}
            aria-label={`Subir ${categoria.nombre} en el menú`}
            className="flex size-7 items-center justify-center rounded-sm text-tinta hover:bg-crema-calida disabled:opacity-30"
          >
            <ChevronUp aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => alMover(1)}
            disabled={!puedeBajar}
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
            {tieneHijas
              ? `Agrupa ${categoria.cantidadHijas} ${
                  categoria.cantidadHijas === 1 ? "colección" : "colecciones"
                }`
              : `${categoria.cantidadProductos} ${
                  categoria.cantidadProductos === 1 ? "producto" : "productos"
                }`}{" "}
            · <span className="font-mono text-xs">{categoria.slug}</span>
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

            <SelectorPadre
              id={`padre-${categoria.id}`}
              categorias={categorias}
              propia={categoria}
            />

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
                {categoria.activa && (tieneHijas || categoria.cantidadProductos > 0) && (
                  <p className="flex items-start gap-2 text-sm text-dorado-texto">
                    <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {tieneHijas
                        ? `Esto va a ocultar de la tienda sus ${categoria.cantidadHijas} colecciones y todos sus productos.`
                        : `Esto va a ocultar de la tienda los ${categoria.cantidadProductos} productos de esta colección, aunque cada uno siga publicado.`}
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
                {categoria.activa ? "Despublicar colección" : "Publicar colección"}
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * @description Pantalla de colecciones del panel. Lista el árbol, edita,
 * reordena, agrupa y publica o despublica.
 * @returns La lista de categorías y el formulario para agregar una.
 */
export function Categorias() {
  const { categorias } = useLoaderData() as DatosCategorias;
  const [agregando, setAgregando] = useState(false);
  const nueva = useFetcher();
  const orden = useFetcher();

  const errorNueva = nueva.data as ErrorCategorias | undefined;
  const filas = aplanarArbol(categorias);

  /**
   * @description Mueve una categoría entre sus hermanas. Manda la lista
   * completa de ids: un orden parcial dejaría dos en la misma posición.
   * @param id Id de la categoría.
   * @param direccion -1 sube, 1 baja.
   * @returns Nada.
   */
  const mover = (id: number, direccion: -1 | 1) => {
    const ids = ordenTrasMover(filas, id, direccion);
    if (!ids) return;
    orden.submit({ intencion: "orden", ids: ids.join(",") }, { method: "post" });
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="font-display text-3xl font-medium text-tinta">Colecciones</h1>
        <p className="mt-1 text-sm text-texto-suave">
          El orden de esta lista es el orden del menú de la tienda. Las que están
          con sangría aparecen dentro de la de arriba.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {filas.map(({ categoria, nivel }) => (
          <Fila
            key={categoria.id}
            categoria={categoria}
            nivel={nivel}
            categorias={categorias}
            puedeSubir={ordenTrasMover(filas, categoria.id, -1) !== null}
            puedeBajar={ordenTrasMover(filas, categoria.id, 1) !== null}
            alMover={(direccion) => mover(categoria.id, direccion)}
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
              placeholder="Cuidado capilar"
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

          <SelectorPadre id="padre-nueva" categorias={categorias} propia={null} />

          {errorNueva && !errorNueva.details && (
            <p role="alert" className="text-sm text-error">
              {obtenerMensajeError(errorNueva.codigo, "panel")}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={nueva.state !== "idle"} className="w-auto">
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
        la tienda todos sus productos, aunque cada uno siga publicado. Si agrupa
        otras, también las esconde a ellas.
      </p>
    </div>
  );
}
