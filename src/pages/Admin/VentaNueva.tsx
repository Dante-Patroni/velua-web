import { useState } from "react";
import { Link, useFetcher, useLoaderData } from "react-router-dom";

import { RequireRol } from "@/auth/RequireRol";
import { LineasVenta } from "@/components/admin/LineasVenta";
import { SelectorVariante } from "@/components/admin/SelectorVariante";
import { OpcionMedioPago } from "@/components/tienda/OpcionMedioPago";
import { Button } from "@/components/ui/Button";
import { ErrorCampo } from "@/components/ui/ErrorCampo";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Precio } from "@/components/ui/Precio";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  ENTREGAS_VENTA,
  ETIQUETAS_ENTREGA,
  ETIQUETAS_ESTADO_PAGO,
  ETIQUETAS_MEDIO_PAGO,
  MEDIOS_VENTA,
  MENSAJES_AVISO_VENTA,
  TEXTOS_MEDIO_VENTA,
  obtenerMensajeError,
} from "@/lib/mappings";
import { formatearPrecio } from "@/lib/formato";
import { errorDeCampo } from "@/pages/Tienda/Checkout.utils";
import type { EntregaPanel, EstadoPago, MedioPagoPanel } from "@/types";

import type { ResultadoVenta, cargarVenta } from "./VentaNueva.action";
import {
  entradaCotizacion,
  debeRecalcular,
  fijarCantidad,
  nuevaClaveVenta,
  puedeRegistrar,
  quitarLinea,
  sumarLinea,
  totalDelMedio,
  type LineaVenta,
} from "./VentaNueva.utils";
import { useCotizacionVenta } from "./useCotizacionVenta";

/**
 * @description Sección con título, para separar las partes de la venta.
 * @param props Título y contenido.
 * @param props.titulo Título de la sección.
 * @param props.children Contenido.
 * @returns La sección.
 */
function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-borde bg-crema-clara p-4">
      <h2 className="font-display text-xl text-tinta">{titulo}</h2>
      {children}
    </section>
  );
}

/**
 * @description Campo de texto del formulario, con su etiqueta y el error que la
 * API informó para él.
 * @param props Nombre, etiqueta, opciones del input y error.
 * @returns El campo.
 */
function Campo({
  nombre,
  etiqueta,
  error,
  ...resto
}: { nombre: string; etiqueta: string; error?: string } & Omit<
  React.ComponentProps<typeof Input>,
  "name" | "id"
>) {
  return (
    <div>
      <Label htmlFor={`venta-${nombre}`}>{etiqueta}</Label>
      <Input
        id={`venta-${nombre}`}
        name={nombre}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `venta-${nombre}-error` : undefined}
        className="mt-1"
        {...resto}
      />
      <ErrorCampo id={`venta-${nombre}-error`} mensaje={error} />
    </div>
  );
}

type FormularioVentaProps = { onOtra: () => void };

/**
 * @description La venta en curso. Toda su información vive en este componente: al
 * registrar otra venta se lo vuelve a montar (con `key`) y arranca vacío, con una
 * clave de idempotencia nueva. La clave se genera una vez y se repite en cada
 * reintento de la misma venta. Nada se guarda en el navegador.
 * @param props `onOtra` empieza una venta nueva.
 * @returns El formulario, o la confirmación si la venta quedó registrada.
 */
function FormularioVenta({ onOtra }: FormularioVentaProps) {
  const { zonas, productos, hayMasProductos } = useLoaderData<typeof cargarVenta>();
  const fetcher = useFetcher<ResultadoVenta>();

  const [claveVenta] = useState(nuevaClaveVenta);
  const [lineas, setLineas] = useState<LineaVenta[]>([]);
  const [etiquetas, setEtiquetas] = useState<Record<number, string>>({});
  const [entrega, setEntrega] = useState<EntregaPanel>("en_mano");
  const [zona, setZona] = useState("");
  const [medio, setMedio] = useState<MedioPagoPanel | null>(null);
  const [recotizaciones, setRecotizaciones] = useState(0);

  const zonaEnvioId = zona === "" ? null : Number(zona);
  const { cotizacion, error: errorCotizacion, cargando } = useCotizacionVenta(
    entradaCotizacion(lineas, entrega, zonaEnvioId),
    recotizaciones,
  );

  const enviando = fetcher.state !== "idle";
  const resultado = fetcher.data;
  const total = totalDelMedio(cotizacion, medio);
  const puede = puedeRegistrar(cotizacion, lineas, medio);
  const fallo = resultado?.ok === false ? resultado : null;
  const campo = (nombre: string) => errorDeCampo(fallo?.details, nombre);

  const agregar = (varianteId: number, cantidad: number, etiqueta: string) => {
    setLineas((actuales) => sumarLinea(actuales, varianteId, cantidad));
    setEtiquetas((actuales) => ({ ...actuales, [varianteId]: etiqueta }));
  };

  if (resultado?.ok) {
    const { venta } = resultado;
    const estado = ETIQUETAS_ESTADO_PAGO[venta.estadoPago as EstadoPago] as string | undefined;

    return (
      <section role="status" className="flex flex-col gap-3 rounded-lg border border-borde bg-crema-clara p-4">
        <h2 className="font-display text-2xl text-tinta">Venta registrada</h2>
        <p className="text-tinta">
          Número <strong>{venta.numero}</strong> · {ETIQUETAS_MEDIO_PAGO[venta.medioPago]}
          {estado ? ` · ${estado}` : ""}
        </p>
        <p className="text-tinta">
          Total <Precio valor={venta.total} className="text-xl" />
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to={`/admin/pedidos/${venta.id}`} className="inline-flex h-11 items-center text-dorado-texto underline decoration-2 underline-offset-4">
            Ver el pedido
          </Link>
          <Button type="button" onClick={onOtra}>
            Registrar otra venta
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Seccion titulo="Productos">
        <SelectorVariante productos={productos} onAgregar={agregar} />
        {hayMasProductos && (
          <p className="text-sm text-texto-tenue">
            Hay más productos activos de los que entran en esta lista: si no encontrás uno, todavía no se puede cargar desde acá.
          </p>
        )}
        <LineasVenta
          lineas={lineas}
          etiquetas={etiquetas}
          cotizacion={cotizacion}
          onCantidad={(id, cantidad) => setLineas((actuales) => fijarCantidad(actuales, id, cantidad))}
          onQuitar={(id) => setLineas((actuales) => quitarLinea(actuales, id))}
        />
        {errorCotizacion && (
          <p role="alert" className="text-sm text-error">
            {obtenerMensajeError(errorCotizacion, "venta")}
          </p>
        )}
        {cotizacion && cotizacion.avisos.length > 0 && (
          <ul role="alert" className="flex flex-col gap-1 text-sm text-error">
            {cotizacion.avisos.map((aviso, indice) => (
              <li key={`${aviso.varianteId}-${aviso.motivo}-${indice}`}>
                {MENSAJES_AVISO_VENTA[aviso.motivo](aviso)}
              </li>
            ))}
          </ul>
        )}
        {cotizacion && cotizacion.avisos.length === 0 && (
          <p className="text-sm text-texto-suave">
            Subtotal de los productos: <Precio valor={cotizacion.totales.subtotal} className="text-base" />
          </p>
        )}
      </Seccion>

      <fetcher.Form method="post" className="flex flex-col gap-4">
        <input type="hidden" name="claveVenta" value={claveVenta} />
        <input type="hidden" name="items" value={JSON.stringify(lineas)} />
        <input type="hidden" name="totalEsperado" value={total ?? ""} />

        <Seccion titulo="Entrega">
          <div>
            <Label htmlFor="venta-entrega">Cómo se entrega</Label>
            <Select
              id="venta-entrega"
              name="entrega"
              value={entrega}
              onChange={(evento) => setEntrega(evento.target.value as EntregaPanel)}
              className="mt-1"
            >
              {ENTREGAS_VENTA.map((valor) => (
                <option key={valor} value={valor}>
                  {ETIQUETAS_ENTREGA[valor]}
                </option>
              ))}
            </Select>
          </div>

          {entrega === "envio" && (
            <>
              <div>
                <Label htmlFor="venta-zonaEnvioId">Zona de envío</Label>
                <Select
                  id="venta-zonaEnvioId"
                  name="zonaEnvioId"
                  value={zona}
                  onChange={(evento) => setZona(evento.target.value)}
                  required
                  className="mt-1"
                >
                  <option value="">Elegí la zona</option>
                  {zonas.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre}
                      {z.demora ? ` · ${z.demora}` : ""} · {formatearPrecio(z.costo)}
                    </option>
                  ))}
                </Select>
                <ErrorCampo mensaje={campo("zonaEnvioId")} />
              </div>
              <Campo nombre="calle" etiqueta="Calle" required error={campo("calle")} autoComplete="off" />
              <Campo nombre="numero" etiqueta="Número" required error={campo("numero")} autoComplete="off" />
              <Campo nombre="extra" etiqueta="Piso, depto u otra aclaración (opcional)" error={campo("extra")} autoComplete="off" />
              <Campo nombre="ciudad" etiqueta="Ciudad" required error={campo("ciudad")} autoComplete="off" />
              <Campo nombre="provincia" etiqueta="Provincia" required error={campo("provincia")} autoComplete="off" />
              <Campo nombre="cp" etiqueta="Código postal" required error={campo("cp")} autoComplete="off" />
            </>
          )}
        </Seccion>

        <Seccion titulo="Clienta">
          <Campo nombre="nombre" etiqueta="Nombre" required error={campo("nombre")} autoComplete="off" />
          <Campo nombre="telefono" etiqueta="Teléfono" type="tel" required error={campo("telefono")} autoComplete="off" />
          <Campo nombre="email" etiqueta="Email (opcional)" type="email" error={campo("email")} autoComplete="off" />
          <p className="-mt-2 text-sm text-texto-tenue">Sin email, no se le manda ningún mail.</p>
          <Campo nombre="documento" etiqueta="DNI (opcional)" error={campo("documento")} autoComplete="off" />
        </Seccion>

        <Seccion titulo="Cobro">
          {cotizacion && cotizacion.avisos.length === 0 ? (
            <div className="flex flex-col gap-3" role="radiogroup" aria-label="Medio de cobro">
              {MEDIOS_VENTA.map((valor) => {
                const totalMedio = totalDelMedio(cotizacion, valor);

                // Un medio deshabilitado se avisa y no se ofrece: la API respondería 503.
                if (totalMedio === null) {
                  return (
                    <p key={valor} className="text-sm text-texto-tenue">
                      {TEXTOS_MEDIO_VENTA[valor].titulo} no está disponible por ahora.
                    </p>
                  );
                }

                return (
                  <OpcionMedioPago
                    key={valor}
                    valor={valor}
                    titulo={TEXTOS_MEDIO_VENTA[valor].titulo}
                    detalle={TEXTOS_MEDIO_VENTA[valor].detalle}
                    total={totalMedio}
                    elegido={medio === valor}
                    onElegir={() => setMedio(valor)}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-texto-suave">
              {cargando
                ? "Calculando…"
                : "Agregá los productos (y la zona, si es envío) para ver el total de cada medio."}
            </p>
          )}

          {medio === "efectivo" && total !== null && (
            <div className="flex items-start gap-3 rounded-lg border border-borde bg-crema-calida p-4">
              <input
                id="venta-cobradoEnEfectivo"
                name="cobradoEnEfectivo"
                type="checkbox"
                value="true"
                className="mt-0.5 size-5 accent-tinta"
              />
              <div>
                <Label htmlFor="venta-cobradoEnEfectivo">Ya cobré en efectivo</Label>
                <p className="text-sm text-texto-suave">
                  El pago queda aprobado y la venta ya no se puede cancelar sin devolver el dinero.
                </p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="venta-notas">Notas (opcional)</Label>
            <Textarea id="venta-notas" name="notas" rows={2} maxLength={500} className="mt-1" />
            <ErrorCampo mensaje={campo("notas")} />
          </div>
        </Seccion>

        <div className="flex flex-col gap-3 rounded-lg border border-borde bg-crema-calida p-4">
          {total !== null ? (
            <p className="flex items-baseline justify-between gap-3 text-tinta">
              <span>Total a cobrar</span>
              <Precio valor={total} className="text-2xl" />
            </p>
          ) : (
            <p className="text-sm text-texto-suave">Elegí cómo se cobra para ver el total de la venta.</p>
          )}

          {fallo && (
            <p role="alert" className="text-sm text-error">
              {obtenerMensajeError(fallo.codigo, "venta")}
            </p>
          )}
          {fallo && debeRecalcular(fallo.codigo) && (
            <Button
              type="button"
              variante="secundario"
              onClick={() => setRecotizaciones((n) => n + 1)}
              disabled={cargando}
            >
              Volver a calcular el total
            </Button>
          )}

          <Button type="submit" disabled={enviando || !puede}>
            {enviando ? "Registrando…" : "Registrar venta"}
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}

/**
 * @description Pantalla "Registrar venta" del panel: la dueña carga desde el
 * celular una venta hecha fuera de la tienda (productos, entrega, clienta y
 * cobro). El total lo calcula la API (`/admin/ventas/cotizacion`) y se manda tal
 * cual al registrar. Solo el admin la ve; el permiso real lo valida la API.
 * @returns La pantalla.
 */
export function VentaNueva() {
  const [venta, setVenta] = useState(0);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="font-display text-3xl font-medium text-tinta">Registrar venta</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Para una venta hecha en persona o por teléfono. Descuenta el stock al registrarla.
        </p>
      </header>

      <RequireRol
        roles={["admin"]}
        fallback={<p role="alert" className="text-tinta">{obtenerMensajeError("SIN_PERMISO", "venta")}</p>}
      >
        <FormularioVenta key={venta} onOtra={() => setVenta((n) => n + 1)} />
      </RequireRol>
    </div>
  );
}
