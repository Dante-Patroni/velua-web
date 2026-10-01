import { useState } from "react";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, Check, Trash2 } from "lucide-react";

import { DatosProducto } from "@/components/admin/DatosProducto";
import { VariantesExistentes, VariantesNuevas } from "@/components/admin/Variantes";
import { VistaPrevia } from "@/components/admin/VistaPrevia";
import type { DatosVistaPrevia } from "@/components/admin/VistaPrevia.utils";
import { Button } from "@/components/ui/Button";
import { obtenerMensajeError } from "@/lib/mappings";
import type { DatosFicha, ErrorFicha } from "./Producto.action";
import { Galeria } from "@/components/admin/Galeria";

/**
 * @description Arma el estado inicial de la vista previa a partir del producto,
 * o vacío si se está creando.
 * @param producto Producto en edición, o null.
 * @returns Los datos que la vista previa necesita.
 */
function vistaPreviaInicial(producto: DatosFicha["producto"]): DatosVistaPrevia {
  const primera = producto?.variantes.find((v) => v.activa) ?? producto?.variantes[0];

  return {
    nombre: producto?.nombre ?? "",
    descripcionCorta: producto?.descripcionCorta ?? "",
    precio: primera?.precio ?? "",
    precioAnterior: primera?.precioAnterior ?? "",
    coleccion: producto?.categoria?.nombre ?? "",
    imagenUrl: producto?.imagenes[0]?.url ?? null,
    hayStock: (producto?.variantes ?? []).some((v) => v.activa && v.stock > 0),
  };
}

/**
 * @description Aviso de error de una operación, con el mensaje del contexto panel.
 * @param props Datos del error.
 * @param props.error Error devuelto por la action.
 * @returns El aviso, o null si no hubo error.
 */
function AvisoError({ error }: { error?: ErrorFicha }) {
  if (!error) return null;

  return (
    <p
      role="alert"
      className="rounded-lg border border-error px-4 py-3 text-sm text-error"
    >
      {obtenerMensajeError(error.codigo, "panel")}
      {error.codigo === "PRODUCTO_CON_VENTAS" && (
        <>
          {" "}
          Para sacarlo de la tienda sin perder el historial, despublicalo con el
          botón de arriba.
        </>
      )}
    </p>
  );
}

/**
 * @description Ficha de un producto. Sirve para crear y para editar.
 *
 * Al crear es un solo formulario: los datos y las variantes viajan juntos,
 * porque el backend los guarda en una transacción y el esquema no admite un
 * producto sin variantes.
 *
 * Al editar son varios formularios independientes, cada uno con su botón: los
 * datos, cada variante, y más adelante las fotos. Cada cosa se guarda sola.
 *
 * @returns La pantalla completa.
 */
export function Producto() {
  const { producto, categorias } = useLoaderData() as DatosFicha;
  const error = useActionData() as ErrorFicha | undefined;
  const navegacion = useNavigation();
  const [parametros] = useSearchParams();
  const borrado = useFetcher();

  const [previa, setPrevia] = useState(() => vistaPreviaInicial(producto));
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

  const editando = producto !== null;
  const enviando = navegacion.state === "submitting";
  const reciénCreado = parametros.get("creado") === "1";

  /**
   * @description Actualiza los campos que la vista previa refleja.
   * @param campo Campo que cambió.
   * @param valor Valor nuevo.
   * @returns Nada.
   */
  const alCambiar = (campo: "nombre" | "descripcionCorta" | "coleccion", valor: string) =>
    setPrevia((p) => ({ ...p, [campo]: valor }));

  /**
   * @description Actualiza los precios de la vista previa.
   * @param precio Precio actual.
   * @param precioAnterior Precio anterior.
   * @returns Nada.
   */
  const alCambiarPrecio = (precio: string, precioAnterior: string) =>
    setPrevia((p) => ({ ...p, precio, precioAnterior }));

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <Link
        to="/admin/productos"
        className="flex w-fit items-center gap-2 text-sm text-texto-suave hover:text-tinta"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Volver al listado
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-tinta">
            {editando ? producto.nombre : "Producto nuevo"}
          </h1>
          {editando && (
            <p className="mt-1 text-sm text-texto-suave">
              {producto.activo ? "Publicado en la tienda" : "Despublicado"}
            </p>
          )}
        </div>

        {editando && (
          <Form method="post">
            <input type="hidden" name="intencion" value="estado-producto" />
            <input type="hidden" name="activo" value={String(!producto.activo)} />
            <Button type="submit" className="w-auto">
              {producto.activo ? "Despublicar" : "Publicar"}
            </Button>
          </Form>
        )}
      </header>

      {reciénCreado && (
        <div
          role="status"
          className="flex items-start gap-4 rounded-lg border-2 border-salvia-hondo bg-crema-calida p-5"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-salvia-hondo">
            <Check aria-hidden className="size-6 text-crema" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-salvia-hondo">
              {producto?.nombre} se creó correctamente
            </p>
            <p className="mt-1 text-sm text-texto-suave">
              Ya está {producto?.activo ? "publicado en la tienda" : "guardado"}. El
              paso que falta son las fotos: sin ellas, en el catálogo se ve un
              recuadro en lugar del jabón.
            </p>
          </div>
        </div>
      )}

      <AvisoError error={error} />
      <AvisoError error={borrado.data as ErrorFicha | undefined} />

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          {editando ? (
            <>
              <section>
                <h2 className="mb-4 font-display text-2xl text-tinta">Datos</h2>
                <Form method="post" className="flex flex-col gap-5">
                  <input type="hidden" name="intencion" value="guardar" />
                  <DatosProducto
                    categorias={categorias}
                    producto={producto}
                    alCambiar={alCambiar}
                    details={error?.intencion === "guardar" ? error.details : undefined}
                  />
                  <Button type="submit" disabled={enviando} className="w-auto">
                    {enviando ? "Guardando…" : "Guardar datos"}
                  </Button>
                </Form>
              </section>

              <section>
                <h2 className="mb-4 font-display text-2xl text-tinta">Presentaciones</h2>
                <VariantesExistentes producto={producto} alCambiarPrecio={alCambiarPrecio} />
              </section>

              <section>
                <h2 className="mb-4 font-display text-2xl text-tinta">Fotos</h2>
                <Galeria productoId={producto.id} iniciales={producto.imagenes} />
              </section>

              <section className="rounded-lg border border-borde p-5">
                <h2 className="font-display text-2xl text-tinta">Borrar</h2>
                <p className="mt-2 text-sm text-texto-suave">
                  Solo se puede borrar un producto que nunca se vendió. Si ya tuvo
                  ventas, despublicalo: así sale de la tienda y los pedidos viejos
                  siguen mostrando qué se compró.
                </p>

                {confirmandoBorrado ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <borrado.Form method="post">
                      <input type="hidden" name="intencion" value="borrar" />
                      <button
                        type="submit"
                        disabled={borrado.state !== "idle"}
                        className="flex h-11 items-center gap-2 rounded-lg bg-error px-5 text-crema disabled:opacity-50"
                      >
                        <Trash2 aria-hidden className="size-4" />
                        {borrado.state !== "idle"
                          ? "Borrando…"
                          : `Sí, borrar ${producto.nombre}`}
                      </button>
                    </borrado.Form>
                    <button
                      type="button"
                      onClick={() => setConfirmandoBorrado(false)}
                      className="text-sm text-texto-suave hover:text-tinta"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmandoBorrado(true)}
                    className="mt-4 flex items-center gap-2 text-sm text-error underline-offset-4 hover:underline"
                  >
                    <Trash2 aria-hidden className="size-4" />
                    Borrar este producto
                  </button>
                )}
              </section>
            </>
          ) : (
            <Form method="post" className="flex flex-col gap-8">
              <input type="hidden" name="intencion" value="crear" />

              <section>
                <h2 className="mb-4 font-display text-2xl text-tinta">Datos</h2>
                <DatosProducto
                  categorias={categorias}
                  producto={null}
                  alCambiar={alCambiar}
                  details={error?.details}
                />
              </section>

              <section>
                <h2 className="mb-2 font-display text-2xl text-tinta">Presentaciones</h2>
                <p className="mb-4 text-sm text-texto-suave">
                  Todo producto necesita al menos una. Se guardan junto con el
                  producto.
                </p>
                <VariantesNuevas details={error?.details} alCambiarPrecio={alCambiarPrecio} />
              </section>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={enviando} className="w-auto">
                  {enviando ? "Creando…" : "Crear producto"}
                </Button>
                <Link
                  to="/admin/productos"
                  className="text-sm text-texto-suave hover:text-tinta"
                >
                  Cancelar
                </Link>
              </div>
            </Form>
          )}
        </div>

        <VistaPrevia datos={previa} />
      </div>
    </div>
  );
}
