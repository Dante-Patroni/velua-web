import { Link, useLoaderData } from "react-router-dom";
import { formatearFechaHora, formatearPrecio } from "@/lib/formato";
import type { PedidoAdminDetalle } from "@/types";
import type { DatosPedido } from "./Pedido.action";
import {
  ETIQUETAS_CAMPO_EVENTO,
  ETIQUETAS_ENTREGA,
  ETIQUETAS_ESTADO_PAGO,
  ETIQUETAS_ESTADO_PEDIDO,
  ETIQUETAS_MEDIO_PAGO,
  ETIQUETAS_ORIGEN_EVENTO,
} from "@/lib/mappings";
import { etiquetaEstadoEvento } from "./Pedidos.utils";

/**
 * @description Texto para mostrar, o un guion si viene vacío o null. La base no
 * exige todos los campos de la dirección: mejor un guion que un hueco.
 * @param valor Texto de la API.
 * @returns El texto, o "—".
 */
const oGuion = (valor: string | null | undefined): string =>
  valor && valor.trim() !== "" ? valor : "—";

/**
 * @description Bloque con título, para separar las partes del detalle.
 * @param props Título y contenido.
 * @param props.titulo Título del bloque.
 * @param props.children Contenido.
 * @returns La sección.
 */
function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-borde bg-crema-clara p-4">
      <h2 className="mb-3 font-display text-xl text-tinta">{titulo}</h2>
      {children}
    </section>
  );
}

/**
 * @description Par etiqueta y valor dentro de un bloque.
 * @param props Etiqueta y valor.
 * @param props.etiqueta Qué es el dato.
 * @param props.valor El dato, siempre como texto.
 * @returns La fila.
 */
function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 py-1 text-sm">
      <dt className="text-texto-suave">{etiqueta}</dt>
      <dd className="text-right text-tinta">{valor}</dd>
    </div>
  );
}

/**
 * @description Detalle completo de un pedido. No usa hooks del router, así se
 * puede probar solo. Todo lo que escribió la clienta (nombre, contacto,
 * dirección, notas) se muestra como texto: React lo escapa. No arma links con
 * esos datos.
 * @param props Pedido a mostrar.
 * @param props.pedido Detalle de la API.
 * @returns Los bloques del detalle.
 */
export function DetallePedido({ pedido }: { pedido: PedidoAdminDetalle }) {
  const { cliente, entrega, totales, pago } = pedido;
  const direccion = entrega.direccion;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Bloque titulo="Clienta">
        <dl>
          <Dato etiqueta="Nombre" valor={cliente.nombre} />
          <Dato etiqueta="Email" valor={cliente.email} />
          <Dato etiqueta="Teléfono" valor={cliente.telefono} />
          <Dato etiqueta="DNI" valor={oGuion(cliente.documento)} />
        </dl>
      </Bloque>

      <Bloque titulo="Entrega">
        <dl>
          <Dato etiqueta="Método" valor={ETIQUETAS_ENTREGA[entrega.metodo]} />
          {entrega.metodo === "envio" && (
            <>
              <Dato etiqueta="Zona" valor={oGuion(entrega.zona)} />
              <Dato
                etiqueta="Dirección"
                valor={`${oGuion(direccion?.calle)} ${oGuion(direccion?.numero)}`}
              />
              <Dato etiqueta="Piso / depto" valor={oGuion(direccion?.extra)} />
              <Dato
                etiqueta="Localidad"
                valor={`${oGuion(direccion?.ciudad)}, ${oGuion(direccion?.provincia)}`}
              />
              <Dato etiqueta="Código postal" valor={oGuion(direccion?.cp)} />
            </>
          )}
          <Dato etiqueta="Seguimiento" valor={oGuion(entrega.seguimiento)} />
        </dl>
      </Bloque>

      <Bloque titulo="Productos">
        <ul className="divide-y divide-borde">
          {pedido.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-3 py-2 text-sm">
              <div>
                <span className="block text-tinta">{item.producto}</span>
                <span className="block text-xs text-texto-suave">
                  {item.variante} · {oGuion(item.sku)} · {item.cantidad} ×{" "}
                  {formatearPrecio(item.precioUnitario)}
                </span>
              </div>
              <span className="text-tinta">{formatearPrecio(item.subtotal)}</span>
            </li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="Totales">
        <dl>
          <Dato etiqueta="Subtotal" valor={formatearPrecio(totales.subtotal)} />
          <Dato etiqueta="Descuento por cupón" valor={`− ${formatearPrecio(totales.descuentoCupon)}`} />
          <Dato
            etiqueta="Descuento por medio de pago"
            valor={`− ${formatearPrecio(totales.ajusteMedioPago)}`}
          />
          <Dato etiqueta="Envío" valor={formatearPrecio(totales.costoEnvio)} />
          <Dato etiqueta="Total" valor={formatearPrecio(totales.total)} />
        </dl>
      </Bloque>

      <Bloque titulo="Pago">
        <dl>
          <Dato etiqueta="Estado" valor={ETIQUETAS_ESTADO_PAGO[pedido.estadoPago]} />
          <Dato etiqueta="Medio" valor={ETIQUETAS_MEDIO_PAGO[pedido.medioPago]} />
          {pedido.estadoPago === "pendiente" && pedido.expiraEn && (
            <Dato etiqueta="Reservado hasta" valor={formatearFechaHora(pedido.expiraEn)} />
          )}
          <Dato etiqueta="Id del pago" valor={oGuion(pago.pagoId)} />
          <Dato etiqueta="Método" valor={oGuion(pago.metodo)} />
          <Dato
            etiqueta="Avisó que transfirió"
            valor={formatearFechaHora(pago.comprobanteInformadoEn)}
          />
        </dl>
      </Bloque>

      <Bloque titulo="Notas">
        <h3 className="text-sm text-texto-suave">De la clienta</h3>
        <p className="mt-1 text-sm whitespace-pre-line text-tinta">{oGuion(pedido.notasCliente)}</p>
        <h3 className="mt-3 text-sm text-texto-suave">Internas</h3>
        <p className="mt-1 text-sm whitespace-pre-line text-tinta">{oGuion(pedido.notasInternas)}</p>
      </Bloque>

      <div className="lg:col-span-2">
        <Bloque titulo="Historial">
          {pedido.eventos.length === 0 ? (
            <p className="text-sm text-texto-suave">Sin movimientos.</p>
          ) : (
            <ol className="divide-y divide-borde">
              {pedido.eventos.map((e, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span className="text-texto-suave">{formatearFechaHora(e.creadoEn)}</span>
                  <span className="text-tinta">
                    {ETIQUETAS_CAMPO_EVENTO[e.campo]}: {etiquetaEstadoEvento(e.campo, e.estadoAnterior)} →{" "}
                    {etiquetaEstadoEvento(e.campo, e.estadoNuevo)}
                    {e.detalle && <span className="block text-xs text-texto-suave">{e.detalle}</span>}
                  </span>
                  <span className="text-texto-suave">Origen: {ETIQUETAS_ORIGEN_EVENTO[e.origen]}</span>
                </li>
              ))}
            </ol>
          )}
        </Bloque>
      </div>
    </div>
  );
}

/**
 * @description Pantalla del detalle de un pedido en el panel.
 * @returns El encabezado con los estados y el detalle completo.
 */
export function Pedido() {
  const { pedido } = useLoaderData() as DatosPedido;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* El historial del navegador guarda los títulos: va el número, nunca el nombre. */}
      <title>{`Pedido ${pedido.numero} · Panel Velua`}</title>
      <header>
        <Link to="/admin" className="text-sm text-texto-suave underline underline-offset-4">
          ← Pedidos
        </Link>
        <h1 className="mt-2 font-display text-3xl font-medium text-tinta">{pedido.numero}</h1>
        <p className="mt-1 text-sm text-texto-suave">
          {formatearFechaHora(pedido.creadoEn)} · {ETIQUETAS_ESTADO_PAGO[pedido.estadoPago]} ·{" "}
          {ETIQUETAS_ESTADO_PEDIDO[pedido.estadoPedido]}
        </p>
      </header>

      <DetallePedido pedido={pedido} />
    </div>
  );
}