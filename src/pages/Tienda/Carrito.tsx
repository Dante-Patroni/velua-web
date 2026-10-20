import { Link } from "react-router-dom";

import { useCarrito } from "@/carrito/useCarrito";
import { useCotizacion } from "@/carrito/useCotizacion";
import { mensajeMasUnidades } from "@/carrito/cotizacion.utils";
import { LineaCarrito } from "@/components/tienda/LineaCarrito";
import { Button } from "@/components/ui/Button";
import { Precio } from "@/components/ui/Precio";
import { MENSAJES_AVISO, WHATSAPP_NUMERO, obtenerMensajeError } from "@/lib/mappings";
import { enlaceWhatsApp } from "@/lib/utils";

const claseEnlaceAccion =
  "font-bold text-dorado-texto underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta";

/**
 * @description Pantalla del carrito. El carrito guarda solo ids y cantidades;
 * todo lo que se ve (nombres, precios, subtotales, avisos) viene de `/cotizar`.
 * El frontend no suma ni calcula: muestra el subtotal que devuelve la API. El
 * envío todavía no se conoce, porque depende de la zona que se elige al
 * finalizar la compra.
 * @returns La página del carrito.
 */
export function Carrito() {
  const { items, cambiarCantidad, quitar, reemplazar, vaciar } = useCarrito();
  const { cotizacion, avisos, codigoError, cargando, descartarAvisos } = useCotizacion(
    items,
    reemplazar,
    vaciar,
  );

  const cantidadActual = new Map(items.map(({ varianteId, cantidad }) => [varianteId, cantidad]));
  // Mientras se cotiza un cambio, la lista sigue mostrando lo último que respondió la API.
  const lineas = (cotizacion?.items ?? []).filter(({ varianteId }) => cantidadActual.has(varianteId));
  const sincronizado = !cargando && lineas.length === items.length;

  return (
    <>
      <title>Tu carrito · Veluá</title>

      <section className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-14">
        <h1 className="text-5xl leading-[0.98] font-medium text-tinta md:text-6xl">Tu carrito</h1>

        {avisos.length > 0 && (
          <div
            role="status"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-borde bg-crema-calida p-4 md:p-5"
          >
            <ul className="flex flex-col gap-2 text-tinta">
              {avisos.map((aviso, indice) => {
                const enlaceTope =
                  aviso.motivo === "AJUSTADO_POR_TOPE"
                    ? enlaceWhatsApp(WHATSAPP_NUMERO, mensajeMasUnidades(aviso.producto))
                    : null;

                return (
                  <li key={`${aviso.varianteId}-${aviso.motivo}-${indice}`}>
                    {MENSAJES_AVISO[aviso.motivo](aviso)}
                    {enlaceTope && (
                      <>
                        {" "}
                        <a
                          href={enlaceTope}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={claseEnlaceAccion}
                        >
                          Escribinos por WhatsApp
                        </a>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
            <Button variante="enlace" className="self-start text-sm" onClick={descartarAvisos}>
              Entendido
            </Button>
          </div>
        )}

        {codigoError && (
          <p role="alert" className="mt-6 rounded-2xl border border-borde bg-crema-calida p-4 text-error md:p-5">
            {obtenerMensajeError(codigoError)}
          </p>
        )}

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-borde bg-crema-calida px-6 py-14 text-center">
            <p className="font-display text-3xl font-medium text-tinta">Tu carrito está vacío</p>
            <p className="mt-2 text-texto-suave">Cuando agregues algo, lo vas a ver acá.</p>
            <Button nativeButton={false} render={<Link to="/catalogo" />} className="mt-6 h-13 px-9">
              Ver el catálogo
            </Button>
          </div>
        ) : !cotizacion ? (
          <p role="status" className="mt-8 text-texto-suave">
            {codigoError ? "No pudimos cargar tu carrito." : "Armando tu carrito…"}
          </p>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_20rem] md:gap-12" aria-busy={cargando}>
            <div>
              {lineas.map((linea) => (
                <LineaCarrito
                  key={linea.varianteId}
                  linea={linea}
                  cantidad={cantidadActual.get(linea.varianteId) ?? linea.cantidad}
                  actualizando={cantidadActual.get(linea.varianteId) !== linea.cantidad}
                  onCambiarCantidad={(cantidad) => cambiarCantidad(linea.varianteId, cantidad)}
                  onQuitar={() => quitar(linea.varianteId)}
                />
              ))}
            </div>

            <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-borde bg-crema-clara p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-texto-suave">Subtotal</span>
                <Precio valor={cotizacion.totales.subtotal} className="text-3xl" />
              </div>
              <p className="text-sm text-texto-suave">
                El envío se calcula al finalizar la compra, según tu zona.
              </p>
              {sincronizado ? (
                <Button nativeButton={false} render={<Link to="/checkout" />} className="h-13 w-full">
                  Continuar con la compra
                </Button>
              ) : (
                <Button disabled className="h-13 w-full">
                  Actualizando…
                </Button>
              )}
              <Link to="/catalogo" className={`${claseEnlaceAccion} text-center text-sm`}>
                Seguir mirando
              </Link>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
