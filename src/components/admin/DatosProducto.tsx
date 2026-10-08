import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { CategoriaAdmin, ProductoAdmin } from "@/types";
import { OpcionesColeccion } from "./OpcionesColeccion";

/** Largo recomendado de la descripción corta, la que se ve en la grilla. */
const LARGO_DESCRIPCION_CORTA = 120;

type Props = {
  categorias: CategoriaAdmin[];
  /** Null cuando se está creando. */
  producto: ProductoAdmin | null;
  /** Avisa los cambios que la vista previa necesita reflejar. */
  alCambiar: (
    campo: "nombre" | "descripcionCorta" | "coleccion",
    valor: string,
  ) => void;
  details?: Record<string, string>;
};

/**
 * @description Muestra el mensaje de error de un campo, si la API devolvió uno.
 * @param props Datos del error.
 * @param props.details Errores por campo que devolvió la API.
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
 * @description Campos de un producto. Los mismos sirven para crear y para
 * editar: al crear van dentro del formulario grande y se envían junto con las
 * variantes; al editar, el formulario que los envuelve tiene su propio botón.
 *
 * Los inputs no están controlados: la action lee los valores del FormData. Solo
 * se avisa hacia afuera de los tres campos que alimentan la vista previa, para
 * no mantener un espejo completo del formulario en el estado.
 *
 * @param props Categorías, producto en edición, avisador de cambios y errores.
 * @returns Los campos del producto.
 */
export function DatosProducto({
  categorias,
  producto,
  alCambiar,
  details,
}: Props) {
  const [largoCorta, setLargoCorta] = useState(
    producto?.descripcionCorta?.length ?? 0,
  );
  const [verSlug, setVerSlug] = useState(false);

  const editando = producto !== null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label htmlFor="categoriaId">Colección</Label>
        <Select
          id="categoriaId"
          name="categoriaId"
          required
          defaultValue={producto?.categoria?.id ?? ""}
          className="mt-1"
          onChange={(e) =>
            alCambiar(
              "coleccion",
              e.target.selectedOptions[0]?.textContent ?? "",
            )
          }
        >
          <option value="" disabled>
            Elegí una colección
          </option>
          <OpcionesColeccion categorias={categorias} marcarDespublicadas />
        </Select>
        <ErrorCampo details={details} campo="categoriaId" />
      </div>

      <div>
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          required
          maxLength={140}
          defaultValue={producto?.nombre ?? ""}
          placeholder="Jabón Vegetal - Caléndula y Karité"
          className="mt-1"
          onChange={(e) => alCambiar("nombre", e.target.value)}
        />
        <ErrorCampo details={details} campo="nombre" />
      </div>

      <div>
        <Label htmlFor="descripcionCorta">Descripción corta</Label>
        <Input
          id="descripcionCorta"
          name="descripcionCorta"
          maxLength={300}
          defaultValue={producto?.descripcionCorta ?? ""}
          placeholder="Una línea, la que se ve en el catálogo"
          className="mt-1"
          onChange={(e) => {
            setLargoCorta(e.target.value.length);
            alCambiar("descripcionCorta", e.target.value);
          }}
        />
        <p
          className={`mt-1 text-xs ${
            largoCorta > LARGO_DESCRIPCION_CORTA
              ? "text-dorado-texto"
              : "text-texto-tenue"
          }`}
        >
          {largoCorta > LARGO_DESCRIPCION_CORTA
            ? `${largoCorta} caracteres: en la grilla puede quedar cortada`
            : `${largoCorta} de ${LARGO_DESCRIPCION_CORTA} recomendados`}
        </p>
        <ErrorCampo details={details} campo="descripcionCorta" />
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          rows={5}
          defaultValue={producto?.descripcion ?? ""}
          placeholder="El párrafo que aparece en la ficha del producto"
          className="mt-1"
        />
        <ErrorCampo details={details} campo="descripcion" />
      </div>

      <div>
        <Label htmlFor="ingredientes">Ingredientes</Label>
        <Textarea
          id="ingredientes"
          name="ingredientes"
          rows={3}
          defaultValue={producto?.ingredientes ?? ""}
          placeholder="La lista completa, como va en la etiqueta"
          className="mt-1"
        />
        <ErrorCampo details={details} campo="ingredientes" />
      </div>

      <div>
        <Label htmlFor="modoUso">Modo de uso</Label>
        <Textarea
          id="modoUso"
          name="modoUso"
          rows={3}
          defaultValue={producto?.modoUso ?? ""}
          placeholder="Dos o tres líneas"
          className="mt-1"
        />
        <ErrorCampo details={details} campo="modoUso" />
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-borde bg-crema-calida p-4">
        <input
          id="destacado"
          name="destacado"
          type="checkbox"
          value="true"
          defaultChecked={producto?.destacado ?? false}
          className="mt-0.5 size-5 accent-tinta"
        />
        <div>
          <Label htmlFor="destacado">Destacado</Label>
          <p className="text-sm text-texto-suave">
            Los destacados aparecen en la portada de la tienda.
          </p>
        </div>
      </div>

      {editando && (
        <div className="border-t border-borde pt-4">
          <button
            type="button"
            onClick={() => setVerSlug((v) => !v)}
            className="text-sm text-dorado-texto underline-offset-4 hover:underline"
          >
            {verSlug ? "Ocultar la dirección web" : "Cambiar la dirección web"}
          </button>

          {verSlug && (
            <div className="mt-3">
              <Label htmlFor="slug">Dirección en la tienda</Label>
              <Input
                id="slug"
                name="slug"
                maxLength={160}
                defaultValue={producto.slug}
                className="mt-1 font-mono text-sm"
              />
              <p className="mt-2 flex items-start gap-2 text-sm text-dorado-texto">
                <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
                <span>
                  Si cambiás esto, los links de este producto que ya compartiste
                  dejan de funcionar. Cambiar el nombre no cambia la dirección.
                </span>
              </p>
              <ErrorCampo details={details} campo="slug" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
