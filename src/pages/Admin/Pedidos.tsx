import { Form, Link, useLoaderData, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { formatearFechaHora, formatearPrecio } from "@/lib/formato";
import type { PedidoAdminFila } from "@/types";
import type { DatosPedidos } from "./Pedidos.action";
import { LIMITE, PAGINA_MAXIMA } from "./Pedidos.action";
import {
  ETIQUETAS_ENTREGA,
  ETIQUETAS_ESTADO_PAGO,
  ETIQUETAS_ESTADO_PEDIDO,
  ETIQUETAS_MEDIO_PAGO,
} from "./Pedidos.utils";

/**
 * @description Franja de filtros. Envía por GET, así los filtros quedan en la
 * URL. Al filtrar se vuelve a la primera página: la página no viaja en el form.
 * @returns El formulario de filtros.
 */
function Filtros() {
  const [parametros] = useSearchParams();

  return (
    <Form method="get" className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <Label htmlFor="estadoPago">Pago</Label>
        <Select
          id="estadoPago"
          name="estadoPago"
          defaultValue={parametros.get("estadoPago") ?? ""}
          className="mt-1"
        >
          <option value="">Todos</option>
          {Object.entries(ETIQUETAS_ESTADO_PAGO).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-48">
        <Label htmlFor="estadoPedido">Preparación</Label>
        <Select
          id="estadoPedido"
          name="estadoPedido"
          defaultValue={parametros.get("estadoPedido") ?? ""}
          className="mt-1"
        >
          <option value="">Todos</option>
          {Object.entries(ETIQUETAS_ESTADO_PEDIDO).map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </Select>
      </div>

      <Button type="submit" className="w-auto">
        Filtrar
      </Button>
    </Form>
  );
}

/**
 * @description Paginación acotada: siempre dibuja tres elementos, sin importar
 * cuántos pedidos haya. Conserva los filtros de la URL.
 * @param props Datos de la paginación.
 * @param props.pagina Página actual.
 * @param props.total Total de pedidos que cumplen el filtro.
 * @returns Anterior, página actual y siguiente, o null si entra todo en una.
 */
function Paginacion({ pagina, total }: { pagina: number; total: number }) {
  const [parametros] = useSearchParams();
  const paginas = Math.min(Math.ceil(total / LIMITE), PAGINA_MAXIMA);

  if (paginas <= 1) return null;

  /**
   * @description Arma el link de una página conservando los filtros actuales.
   * @param n Número de página.
   * @returns La cadena de consulta con la página cambiada.
   */
  const linkA = (n: number) => {
    const siguientes = new URLSearchParams(parametros);
    siguientes.set("pagina", String(n));
    return `?${siguientes.toString()}`;
  };

  const claseLink =
    "rounded-sm border border-borde px-3 py-2 text-tinta hover:bg-crema-calida";

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-4 py-6 text-sm">
      {pagina > 1 ? (
        <Link to={linkA(pagina - 1)} className={claseLink}>
          Anterior
        </Link>
      ) : (
        <span aria-hidden className={`${claseLink} invisible`}>
          Anterior
        </span>
      )}
      <span className="text-texto-suave">
        Página {pagina} de {paginas}
      </span>
      {pagina < paginas ? (
        <Link to={linkA(pagina + 1)} className={claseLink}>
          Siguiente
        </Link>
      ) : (
        <span aria-hidden className={`${claseLink} invisible`}>
          Siguiente
        </span>
      )}
    </nav>
  );
}

/**
 * @description Estado de pago con el medio y, si está pendiente, hasta cuándo
 * queda reservado. Solo muestra: si venció lo decide la API con estadoPago.
 * @param props Datos del pedido.
 * @param props.pedido Fila del listado.
 * @returns El bloque de pago.
 */
function Pago({ pedido }: { pedido: PedidoAdminFila }) {
  return (
    <>
      <span className="block text-sm text-tinta">{ETIQUETAS_ESTADO_PAGO[pedido.estadoPago]}</span>
      <span className="block text-xs text-texto-suave">{ETIQUETAS_MEDIO_PAGO[pedido.medioPago]}</span>
      {pedido.estadoPago === "pendiente" && pedido.expiraEn && (
        <span className="block text-xs text-dorado-texto">
          Reservado hasta {formatearFechaHora(pedido.expiraEn)}
        </span>
      )}
    </>
  );
}

/**
 * @description Lista de pedidos: tabla en escritorio y tarjetas en teléfono.
 * No usa hooks del router, así se puede probar sola. Todo lo que escribe la
 * clienta se muestra como texto: React lo escapa.
 * @param props Pedidos a mostrar.
 * @param props.datos Filas del listado.
 * @returns La tabla y las tarjetas.
 */
export function ListaPedidos({ datos }: { datos: PedidoAdminFila[] }) {
  return (
    <>
      {/* Escritorio: tabla */}
      <div className="hidden overflow-hidden rounded-lg border border-borde bg-crema-clara md:block">
        <table className="w-full text-left">
          <thead className="border-b border-borde text-sm text-etiqueta">
            <tr>
              <th className="px-4 py-3 font-semibold">Pedido</th>
              <th className="px-4 py-3 font-semibold">Clienta</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Pago</th>
              <th className="px-4 py-3 font-semibold">Preparación</th>
              <th className="px-4 py-3 font-semibold">Entrega</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((p) => (
              <tr key={p.id} className="border-b border-borde last:border-0">
                <td className="px-4 py-4">
                  <span className="block font-medium text-tinta">{p.numero}</span>
                  <span className="block text-xs text-texto-suave">
                    {formatearFechaHora(p.creadoEn)}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-tinta">{p.clienteNombre}</td>
                <td className="px-4 py-4 font-display text-lg text-tinta">
                  {formatearPrecio(p.total)}
                </td>
                <td className="px-4 py-4">
                  <Pago pedido={p} />
                </td>
                <td className="px-4 py-4 text-sm text-texto-suave">
                  {ETIQUETAS_ESTADO_PEDIDO[p.estadoPedido]}
                </td>
                <td className="px-4 py-4 text-sm text-texto-suave">
                  {ETIQUETAS_ENTREGA[p.metodoEntrega]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Teléfono: tarjetas */}
      <ul className="flex flex-col gap-3 md:hidden">
        {datos.map((p) => (
          <li key={p.id} className="rounded-lg border border-borde bg-crema-clara p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="block font-medium text-tinta">{p.numero}</span>
                <span className="block text-xs text-texto-suave">
                  {formatearFechaHora(p.creadoEn)}
                </span>
              </div>
              <span className="font-display text-lg text-tinta">{formatearPrecio(p.total)}</span>
            </div>
            <p className="mt-1 text-sm text-tinta">{p.clienteNombre}</p>
            <div className="mt-3 flex flex-wrap justify-between gap-3 border-t border-borde pt-3">
              <div>
                <Pago pedido={p} />
              </div>
              <p className="text-sm text-texto-suave">
                {ETIQUETAS_ESTADO_PEDIDO[p.estadoPedido]} · {ETIQUETAS_ENTREGA[p.metodoEntrega]}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * @description Listado de pedidos del panel. Es la primera pantalla al entrar:
 * desde acá la dueña ve qué hay que preparar.
 * @returns El listado con filtros y paginación.
 */
export function Pedidos() {
  const { listado, filtros } = useLoaderData() as DatosPedidos;
  const { datos, meta } = listado;
  const pagina = filtros.pagina ?? 1;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <header>
        <h1 className="font-display text-3xl font-medium text-tinta">Pedidos</h1>
        <p className="mt-1 text-sm text-texto-suave">
          {meta.total} {meta.total === 1 ? "pedido" : "pedidos"}
        </p>
      </header>

      <section className="rounded-lg border border-borde bg-crema-clara p-4">
        <Filtros />
      </section>

      {datos.length === 0 ? (
        <div className="rounded-lg border border-borde bg-crema-clara px-6 py-16 text-center text-texto-suave">
          <p>No hay pedidos que coincidan con el filtro.</p>
          {pagina > 1 && (
            <Link to="?" className="mt-3 inline-block text-tinta underline underline-offset-4">
              Volver a la primera página
            </Link>
          )}
        </div>
      ) : (
        <>
          <ListaPedidos datos={datos} />
          <Paginacion pagina={pagina} total={meta.total} />
        </>
      )}
    </div>
  );
}