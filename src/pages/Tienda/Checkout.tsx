import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Form, Link, useActionData, useLoaderData, useNavigate, useNavigation } from "react-router-dom";

import { vaciarCarrito } from "@/carrito/carritoStorage";
import { carritoConfirmado } from "@/carrito/cotizacion.utils";
import { useCarrito } from "@/carrito/useCarrito";
import { useCotizacion } from "@/carrito/useCotizacion";
import { AvisosCarrito } from "@/components/tienda/AvisosCarrito";
import { Button } from "@/components/ui/Button";
import { ErrorCampo } from "@/components/ui/ErrorCampo";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Precio } from "@/components/ui/Precio";
import { Select } from "@/components/ui/Select";
import { MENSAJE_CARRITO_NO_ACTUALIZADO, obtenerMensajeError } from "@/lib/mappings";
import type { ResultadoCheckout, cargarCheckout } from "./Checkout.action";
import { debeCotizarDeNuevo, errorDeCampo } from "./Checkout.utils";

type Metodo = "envio" | "retiro";

const claseSeccion = "flex flex-col gap-4";
const claseTituloSeccion = "font-display text-2xl font-medium text-tinta";

type CampoProps = {
  id: string;
  etiqueta: string;
  error?: string;
  children: ReactNode;
};

/**
 * Etiqueta, control y error de un campo. Es local: solo el checkout lo usa.
 */
function Campo({ id, etiqueta, error, children }: CampoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      <ErrorCampo id={`${id}-error`} mensaje={error} />
    </div>
  );
}

/**
 * @description Pantalla de finalizar la compra, solo con Mercado Pago. Pide los
 * datos de la clienta y la entrega, cotiza el carrito con la zona elegida y, al
 * confirmar, crea el pedido con el total que se vio en pantalla. Todo importe
 * sale de `/cotizar`: no se suma ni se calcula acá. Los datos personales viajan
 * una sola vez hacia la API: no se guardan en el navegador ni se escriben en la
 * consola. El carrito se vacía al crear el pedido, así que volver atrás desde
 * Mercado Pago no permite crear uno duplicado.
 * @returns La página del checkout.
 */
export function Checkout() {
  const { zonas } = useLoaderData<typeof cargarCheckout>();
  // react-router serializa el tipo y pierde el discriminante `ok`; se vuelve a afirmar el tipo real.
  const resultado = useActionData() as ResultadoCheckout | undefined;
  const navegacion = useNavigation();
  const navigate = useNavigate();
  const { items, reemplazar, vaciar } = useCarrito();

  const [metodo, setMetodo] = useState<Metodo>("envio");
  const [zonaId, setZonaId] = useState<number | null>(null);

  const opciones = useMemo(
    () => ({ zonaEnvioId: metodo === "envio" ? zonaId : null, medioPago: "mercadopago" as const }),
    [metodo, zonaId],
  );
  const { cotizacion, avisos, error, cargando, alDia, descartarAvisos, reintentar } = useCotizacion(
    items,
    reemplazar,
    vaciar,
    opciones,
  );

  const enviando = navegacion.state === "submitting";
  const fallo = resultado?.ok === false ? resultado : null;

  useEffect(() => {
    if (!resultado) return;

    if (resultado.ok === true) {
      // El pedido ya está creado y el stock apartado. Se borra el carrito del almacén antes de
      // salir: la página puede descargarse antes de que el estado se persista.
      vaciarCarrito();
      vaciar();

      if (resultado.destino.tipo === "externo") window.location.assign(resultado.destino.url);
      else navigate(resultado.destino.ruta, { replace: true });
    } else if (debeCotizarDeNuevo(resultado.codigo)) {
      reintentar();
    }
  }, [resultado, vaciar, navigate, reintentar]);

  const confirmado = carritoConfirmado(items, cotizacion, cargando) && alDia;
  const faltaZona = metodo === "envio" && zonaId === null;
  const puedePagar = confirmado && !faltaZona && !enviando;
  const campo = (nombre: string) => errorDeCampo(fallo?.details, nombre);

  if (resultado?.ok === true) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <h1 className="text-4xl font-medium text-tinta">Ya casi está</h1>
        <p role="status" className="mt-3 text-texto-suave">
          {resultado.destino.tipo === "externo"
            ? "Te llevamos a Mercado Pago para completar el pago…"
            : "Creamos tu pedido. Te llevamos a su página para completar el pago…"}
        </p>
      </section>
    );
  }

  return (
    <>
      <title>Finalizar compra · Veluá</title>

      <section className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-14">
        <h1 className="text-5xl leading-[0.98] font-medium text-tinta md:text-6xl">Finalizar compra</h1>

        <AvisosCarrito avisos={avisos} onDescartar={descartarAvisos} />

        {fallo && (
          <p role="alert" className="mt-6 rounded-2xl border border-borde bg-crema-calida p-4 text-error md:p-5">
            {obtenerMensajeError(fallo.codigo, "checkout")}
          </p>
        )}

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
            <p className="mt-2 text-texto-suave">Agregá algo para poder finalizar la compra.</p>
            <Button nativeButton={false} render={<Link to="/catalogo" />} className="mt-6 h-13 px-9">
              Ver el catálogo
            </Button>
          </div>
        ) : (
          <Form method="post" className="mt-8 grid gap-10 md:grid-cols-[1fr_22rem] md:gap-12" noValidate={false}>
            {/* El carrito viaja con solo ids y cantidades; el total esperado es el que se ve en pantalla. */}
            <input type="hidden" name="items" value={JSON.stringify(items)} />
            <input type="hidden" name="medioPago" value="mercadopago" />
            <input type="hidden" name="totalEsperado" value={cotizacion?.totales.total ?? ""} />

            <div className="flex flex-col gap-10">
              <fieldset className={claseSeccion}>
                <legend className={claseTituloSeccion}>Tus datos</legend>
                <Campo id="nombre" etiqueta="Nombre y apellido" error={campo("nombre")}>
                  <Input
                    id="nombre"
                    name="nombre"
                    autoComplete="name"
                    required
                    maxLength={140}
                    aria-invalid={Boolean(campo("nombre"))}
                    aria-describedby="nombre-error"
                  />
                </Campo>
                <Campo id="email" etiqueta="Email" error={campo("email")}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={180}
                    aria-invalid={Boolean(campo("email"))}
                    aria-describedby="email-error"
                  />
                </Campo>
                <Campo id="telefono" etiqueta="Teléfono" error={campo("telefono")}>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={40}
                    aria-invalid={Boolean(campo("telefono"))}
                    aria-describedby="telefono-error"
                  />
                </Campo>
                <Campo id="documento" etiqueta="DNI (opcional)" error={campo("documento")}>
                  <Input
                    id="documento"
                    name="documento"
                    autoComplete="off"
                    inputMode="numeric"
                    maxLength={20}
                    aria-invalid={Boolean(campo("documento"))}
                    aria-describedby="documento-error"
                  />
                </Campo>
              </fieldset>

              <fieldset className={claseSeccion}>
                <legend className={claseTituloSeccion}>Entrega</legend>
                <Campo id="metodo" etiqueta="Cómo querés recibirlo">
                  <Select
                    id="metodo"
                    name="metodo"
                    value={metodo}
                    onChange={(evento) => setMetodo(evento.target.value === "retiro" ? "retiro" : "envio")}
                  >
                    <option value="envio">Envío a domicilio</option>
                    <option value="retiro">Retiro en persona</option>
                  </Select>
                </Campo>

                {metodo === "envio" && (
                  <>
                    <Campo id="zonaEnvioId" etiqueta="Zona de envío" error={campo("zonaEnvioId")}>
                      <Select
                        id="zonaEnvioId"
                        name="zonaEnvioId"
                        required
                        value={zonaId ?? ""}
                        onChange={(evento) =>
                          setZonaId(evento.target.value ? Number(evento.target.value) : null)
                        }
                      >
                        <option value="">Elegí tu zona</option>
                        {zonas.map((zona) => (
                          <option key={zona.id} value={zona.id}>
                            {zona.demora ? `${zona.nombre} · ${zona.demora}` : zona.nombre}
                          </option>
                        ))}
                      </Select>
                    </Campo>
                    <Campo id="calle" etiqueta="Calle" error={campo("calle")}>
                      <Input
                        id="calle"
                        name="calle"
                        autoComplete="address-line1"
                        required
                        maxLength={180}
                        aria-invalid={Boolean(campo("calle"))}
                        aria-describedby="calle-error"
                      />
                    </Campo>
                    <div className="grid grid-cols-2 gap-4">
                      <Campo id="numero" etiqueta="Número" error={campo("numero")}>
                        {/* No existe un valor de autocompletado para el número de la calle por separado. */}
                        <Input
                          id="numero"
                          name="numero"
                          autoComplete="off"
                          required
                          maxLength={20}
                          aria-invalid={Boolean(campo("numero"))}
                          aria-describedby="numero-error"
                        />
                      </Campo>
                      <Campo id="extra" etiqueta="Piso / depto (opcional)" error={campo("extra")}>
                        <Input
                          id="extra"
                          name="extra"
                          autoComplete="address-line2"
                          maxLength={120}
                          aria-invalid={Boolean(campo("extra"))}
                          aria-describedby="extra-error"
                        />
                      </Campo>
                    </div>
                    <Campo id="ciudad" etiqueta="Ciudad" error={campo("ciudad")}>
                      <Input
                        id="ciudad"
                        name="ciudad"
                        autoComplete="address-level2"
                        required
                        maxLength={120}
                        aria-invalid={Boolean(campo("ciudad"))}
                        aria-describedby="ciudad-error"
                      />
                    </Campo>
                    <div className="grid grid-cols-2 gap-4">
                      <Campo id="provincia" etiqueta="Provincia" error={campo("provincia")}>
                        <Input
                          id="provincia"
                          name="provincia"
                          autoComplete="address-level1"
                          required
                          maxLength={80}
                          aria-invalid={Boolean(campo("provincia"))}
                          aria-describedby="provincia-error"
                        />
                      </Campo>
                      <Campo id="cp" etiqueta="Código postal" error={campo("cp")}>
                        <Input
                          id="cp"
                          name="cp"
                          autoComplete="postal-code"
                          inputMode="numeric"
                          required
                          maxLength={20}
                          aria-invalid={Boolean(campo("cp"))}
                          aria-describedby="cp-error"
                        />
                      </Campo>
                    </div>
                  </>
                )}
              </fieldset>

              <section className={claseSeccion}>
                <h2 className={claseTituloSeccion}>Pago</h2>
                <p className="text-texto-suave">
                  Pagás con Mercado Pago: tarjeta, débito o dinero en cuenta. Al confirmar te llevamos
                  ahí, y guardamos tus productos durante una hora para que completes el pago.
                </p>
              </section>
            </div>

            <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-borde bg-crema-clara p-5 md:p-6">
              <h2 className={claseTituloSeccion}>Tu pedido</h2>

              {cotizacion ? (
                <>
                  <ul className="flex flex-col gap-3">
                    {cotizacion.items.map((linea) => (
                      <li key={linea.varianteId} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-texto-suave">
                          {linea.productoNombre ?? "Producto"}
                          {linea.varianteNombre ? ` · ${linea.varianteNombre}` : ""} ×{" "}
                          <span className="lining-nums tabular-nums">{linea.cantidad}</span>
                        </span>
                        <Precio valor={linea.subtotal} className="font-sans text-sm font-normal" />
                      </li>
                    ))}
                  </ul>

                  <dl className="flex flex-col gap-2 border-t border-borde pt-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-texto-suave">Subtotal</dt>
                      <dd>
                        <Precio valor={cotizacion.totales.subtotal} className="text-xl" />
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-texto-suave">Envío</dt>
                      <dd>
                        {faltaZona ? (
                          <span className="text-sm text-texto-suave">Elegí tu zona</span>
                        ) : cotizacion.envio.gratis ? (
                          <span className="font-medium text-salvia-hondo">Gratis</span>
                        ) : (
                          <Precio valor={cotizacion.totales.costoEnvio ?? "0.00"} className="text-xl" />
                        )}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4 border-t border-borde pt-3">
                      <dt className="font-medium text-tinta">Total</dt>
                      <dd>
                        <Precio
                          valor={cotizacion.totales.total}
                          className={confirmado && !faltaZona ? "text-3xl" : "text-3xl opacity-50"}
                        />
                      </dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p role="status" className="text-texto-suave">
                  {error ? "No pudimos cargar tu pedido." : "Armando tu pedido…"}
                </p>
              )}

              <Button type="submit" disabled={!puedePagar} className="h-13 w-full">
                {enviando
                  ? "Creando tu pedido…"
                  : cargando || !confirmado
                    ? "Actualizando tu pedido…"
                    : "Pagar con Mercado Pago"}
              </Button>
              {faltaZona && (
                <p className="text-sm text-texto-suave">Elegí tu zona de envío para ver el total.</p>
              )}
              <Link
                to="/carrito"
                className="text-center text-sm font-bold text-dorado-texto underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta"
              >
                Volver al carrito
              </Link>
            </aside>
          </Form>
        )}
      </section>
    </>
  );
}
