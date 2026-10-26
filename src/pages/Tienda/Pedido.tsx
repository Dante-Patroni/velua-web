import { useEffect, useState } from "react";
import { Form, Link, useActionData, useLoaderData, useNavigation, useRevalidator } from "react-router-dom";

import { NumeroPedido } from "@/components/tienda/NumeroPedido";
import { Button } from "@/components/ui/Button";
import { Precio } from "@/components/ui/Precio";
import { formatearFechaHora, hayImporte } from "@/lib/formato";
import {
  ETIQUETAS_ESTADO_PEDIDO,
  TEXTOS_ESTADO_PAGO,
  TEXTO_PEDIDO_VENCIDO,
  WHATSAPP_NUMERO,
  obtenerMensajeError,
} from "@/lib/mappings";
import { enlaceWhatsApp } from "@/lib/utils";
import type { ResultadoPago, cargarPedido } from "./Pedido.action";
import {
  INTERVALO_CONSULTA_PEDIDO_MS,
  debeConsultarPedido,
  falloPorVencimiento,
  intentosAgotados,
  puedePagarPedido,
} from "./Pedido.utils";

const claseEnlaceAccion =
  "font-bold text-dorado-texto underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta";

/**
 * @description Página del pedido (`/pedido/:numero`), adonde vuelve Mercado
 * Pago tras éxito, fallo o pago pendiente. El estado sale siempre de
 * `GET /pedidos/{numero}`: nada de lo que Mercado Pago agrega a la URL se lee ni
 * se muestra, porque cualquiera puede escribirlo a mano. Mientras el pago esté
 * pendiente vuelve a preguntar cada pocos segundos, un máximo de veces, y solo
 * con la pestaña a la vista. Con el pago pendiente o rechazado ofrece pagar de
 * nuevo.
 * @returns La página del pedido.
 */
export function Pedido() {
  const { pedido, error } = useLoaderData<typeof cargarPedido>();
  // react-router serializa el tipo y pierde el discriminante `ok`; se vuelve a afirmar el tipo real.
  const resultadoPago = useActionData() as ResultadoPago | undefined;
  const navegacion = useNavigation();
  const { revalidate } = useRevalidator();
  const [intentos, setIntentos] = useState(0);

  const estadoPago = pedido?.estadoPago;
  const medioPago = pedido?.medioPago;
  const sigueConsultando = debeConsultarPedido({ intentos, estadoPago, medioPago, visibilidad: "visible" });

  useEffect(() => {
    if (!sigueConsultando) return;

    const temporizador = setInterval(() => {
      // Con la pestaña oculta no se pregunta y el intento no se gasta.
      if (!debeConsultarPedido({ intentos, estadoPago, medioPago, visibilidad: document.visibilityState })) return;

      setIntentos((actual) => actual + 1);
      revalidate();
    }, INTERVALO_CONSULTA_PEDIDO_MS);

    return () => clearInterval(temporizador);
  }, [sigueConsultando, intentos, estadoPago, medioPago, revalidate]);

  useEffect(() => {
    if (resultadoPago?.ok === true && resultadoPago.destino.tipo === "externo") {
      window.location.assign(resultadoPago.destino.url);
    }
  }, [resultadoPago]);

  const enviando = navegacion.state === "submitting";
  const falloPago = resultadoPago?.ok === false ? resultadoPago : null;

  if (!pedido) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 md:px-8">
        <h1 className="text-4xl font-medium text-tinta">Tu pedido</h1>
        <p role="alert" className="mt-3 text-error">
          {obtenerMensajeError(error ?? "ERROR_DESCONOCIDO")}
        </p>
        <Button variante="enlace" className="mt-4" onClick={() => revalidate()}>
          Reintentar
        </Button>
      </section>
    );
  }

  // La reserva vencida la informa la API al intentar pagar: no se adivina con el reloj del navegador.
  const vencido = falloPorVencimiento(falloPago?.codigo);
  const textos = vencido ? TEXTO_PEDIDO_VENCIDO : TEXTOS_ESTADO_PAGO[pedido.estadoPago];
  const puedePagar = puedePagarPedido(pedido, falloPago?.codigo);
  const enlaceAyuda = enlaceWhatsApp(WHATSAPP_NUMERO, `Hola, tengo una consulta por mi pedido ${pedido.numero}.`);

  return (
    <>
      <title>{`Pedido ${pedido.numero} · Veluá`}</title>

      <section className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-14">
        <h1 className="text-5xl leading-[0.98] font-medium text-tinta md:text-6xl">{textos.titulo}</h1>
        <p role="status" className="mt-4 text-lg text-texto-suave">
          {textos.detalle}
        </p>

        <NumeroPedido numero={pedido.numero} />

        {pedido.estadoPago === "pendiente" && pedido.expiraEn && !vencido && (
          <p className="mt-2 text-sm text-texto-suave">
            Guardamos tus productos hasta el {formatearFechaHora(pedido.expiraEn)}.
          </p>
        )}

        {intentosAgotados(intentos, pedido.estadoPago) && (
          <div className="mt-4 flex flex-col items-start gap-2 rounded-2xl border border-borde bg-crema-calida p-4">
            <p className="text-tinta">
              Todavía no vemos tu pago acreditado. Si ya pagaste, puede tardar unos minutos más.
            </p>
            <Button variante="enlace" className="text-sm" onClick={() => revalidate()}>
              Actualizar
            </Button>
          </div>
        )}

        {falloPago && !vencido && (
          <p role="alert" className="mt-4 rounded-2xl border border-borde bg-crema-calida p-4 text-error">
            {obtenerMensajeError(falloPago.codigo, "checkout")}
          </p>
        )}

        {puedePagar && (
          <Form method="post" className="mt-6">
            <Button type="submit" disabled={enviando} className="h-13 w-full md:w-auto md:px-12">
              {enviando
                ? "Preparando tu pago…"
                : pedido.estadoPago === "rechazado"
                  ? "Intentar pagar de nuevo"
                  : "Pagar con Mercado Pago"}
            </Button>
          </Form>
        )}

        <dl className="mt-8 flex flex-col gap-1 text-sm text-texto-suave">
          <div className="flex gap-2">
            <dt>Estado del pedido:</dt>
            <dd className="font-medium text-tinta">{ETIQUETAS_ESTADO_PEDIDO[pedido.estadoPedido]}</dd>
          </div>
          {pedido.seguimiento && (
            <div className="flex gap-2">
              <dt>Código de seguimiento:</dt>
              <dd className="font-medium text-tinta">{pedido.seguimiento}</dd>
            </div>
          )}
        </dl>

        <div className="mt-8 rounded-2xl border border-borde bg-crema-clara p-5 md:p-6">
          <h2 className="font-display text-2xl font-medium text-tinta">Tu pedido</h2>

          <ul className="mt-4 flex flex-col gap-3">
            {pedido.items?.map((linea, indice) => (
              <li key={`${linea.producto}-${linea.variante}-${indice}`} className="flex items-baseline justify-between gap-3">
                <span className="text-texto-suave">
                  {linea.producto}
                  {linea.variante ? ` · ${linea.variante}` : ""} ×{" "}
                  <span className="lining-nums tabular-nums">{linea.cantidad}</span>
                </span>
                {linea.subtotal && <Precio valor={linea.subtotal} className="font-sans text-base font-normal" />}
              </li>
            ))}
          </ul>

          <dl className="mt-4 flex flex-col gap-2 border-t border-borde pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-texto-suave">Subtotal</dt>
              <dd>
                <Precio valor={pedido.totales.subtotal} className="text-xl" />
              </dd>
            </div>
            {hayImporte(pedido.totales.descuentoCupon) && pedido.totales.descuentoCupon && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-texto-suave">Descuento por cupón</dt>
                <dd className="flex items-baseline gap-1">
                  <span aria-hidden>−</span>
                  <span className="sr-only">Menos </span>
                  <Precio valor={pedido.totales.descuentoCupon} className="text-xl text-salvia-hondo" />
                </dd>
              </div>
            )}
            {hayImporte(pedido.totales.ajusteMedioPago) && pedido.totales.ajusteMedioPago && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-texto-suave">Descuento por medio de pago</dt>
                <dd className="flex items-baseline gap-1">
                  <span aria-hidden>−</span>
                  <span className="sr-only">Menos </span>
                  <Precio valor={pedido.totales.ajusteMedioPago} className="text-xl text-salvia-hondo" />
                </dd>
              </div>
            )}
            {pedido.totales.costoEnvio && (
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-texto-suave">Envío</dt>
                <dd>
                  <Precio valor={pedido.totales.costoEnvio} className="text-xl" />
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 border-t border-borde pt-3">
              <dt className="font-medium text-tinta">Total</dt>
              <dd>
                <Precio valor={pedido.totales.total} className="text-3xl" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          {enlaceAyuda && (
            <a href={enlaceAyuda} target="_blank" rel="noopener noreferrer" className={claseEnlaceAccion}>
              Escribinos por WhatsApp
            </a>
          )}
          <Link to="/catalogo" className={claseEnlaceAccion}>
            Seguir mirando
          </Link>
        </div>
      </section>
    </>
  );
}
