import { Link } from "react-router-dom";

import { useCarrito } from "@/carrito/useCarrito";
import { useCotizacion } from "@/carrito/useCotizacion";
import { carritoConfirmado } from "@/carrito/cotizacion.utils";
import { AvisosCarrito } from "@/components/tienda/AvisosCarrito";
import { LineaCarrito } from "@/components/tienda/LineaCarrito";
import { VaciarCarrito } from "@/components/tienda/VaciarCarrito";
import { Button } from "@/components/ui/Button";
import { Precio } from "@/components/ui/Precio";
import {
  MENSAJE_CARRITO_NO_ACTUALIZADO,
  obtenerMensajeError,
} from "@/lib/mappings";
import { cn } from "@/lib/utils";

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
  const { cotizacion, avisos, error, cargando, descartarAvisos, reintentar, reiniciar } = useCotizacion(
    items,
    reemplazar,
    vaciar,
  );

  const cantidadActual = new Map(items.map(({ varianteId, cantidad }) => [varianteId, cantidad]));
  // Mientras se cotiza un cambio, la lista sigue mostrando lo último que respondió la API.
  const lineas = (cotizacion?.items ?? []).filter(({ varianteId }) => cantidadActual.has(varianteId));
  const confirmado = carritoConfirmado(items, cotizacion, cargando);

  const vaciarTodo = () => {
    vaciar();
    reiniciar();
  };

  return (
    <>
      <title>Tu carrito · Veluá</title>

      <section className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-14">
        <h1 className="text-5xl leading-[0.98] font-medium text-tinta md:text-6xl">Tu carrito</h1>

        <AvisosCarrito avisos={avisos} onDescartar={descartarAvisos} />

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-borde bg-crema-calida p-4 text-error md:p-5"
          >
            <p>
              {error === "sin_items_validos"
                ? obtenerMensajeError("CARRITO_SIN_ITEMS_VALIDOS")
                : MENSAJE_CARRITO_NO_ACTUALIZADO}
            </p>
            {error === "no_actualizado" && (
              <Button variante="enlace" className="self-start text-sm" onClick={reintentar}>
                Reintentar
              </Button>
            )}
          </div>
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
          <div className="mt-8 flex flex-col items-start gap-4">
            <p role="status" className="text-texto-suave">
              {error ? "No pudimos cargar tu carrito." : "Armando tu carrito…"}
            </p>
            {error && <VaciarCarrito onVaciar={vaciarTodo} />}
          </div>
        ) : (
          <div className="mt-8 grid gap-8 md:grid-cols-[1fr_20rem] md:gap-12" aria-busy={cargando}>
            <div>
              {lineas.map((linea, indice) => (
                <LineaCarrito
                  key={linea.varianteId}
                  linea={linea}
                  prioridad={indice === 0}
                  cantidad={cantidadActual.get(linea.varianteId) ?? linea.cantidad}
                  actualizando={cantidadActual.get(linea.varianteId) !== linea.cantidad}
                  onCambiarCantidad={(cantidad) => cambiarCantidad(linea.varianteId, cantidad)}
                  onQuitar={() => quitar(linea.varianteId)}
                />
              ))}
              <div className="pt-4">
                <VaciarCarrito onVaciar={vaciarTodo} />
              </div>
            </div>

            <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-borde bg-crema-clara p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-texto-suave">Subtotal</span>
                <Precio valor={cotizacion.totales.subtotal} className={cn("text-3xl", !confirmado && "opacity-50")} />
              </div>
              <p className="text-sm text-texto-suave">
                El envío se calcula al finalizar la compra, según tu zona.
              </p>
              {confirmado ? (
                <Button nativeButton={false} render={<Link to="/checkout" />} className="h-13 w-full">
                  Continuar con la compra
                </Button>
              ) : (
                <>
                  <Button disabled className="h-13 w-full">
                    {cargando || !error ? "Actualizando tu carrito…" : "Continuar con la compra"}
                  </Button>
                  {!cargando && error && (
                    <p className="text-sm text-texto-suave">
                      Tu carrito no está al día. Reintentá para poder continuar.
                    </p>
                  )}
                </>
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
