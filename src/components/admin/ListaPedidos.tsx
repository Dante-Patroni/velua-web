import { Link } from "react-router-dom";

import { formatearFechaHora, formatearPrecio } from "@/lib/formato";
import {
  ETIQUETAS_ENTREGA,
  ETIQUETAS_ESTADO_PAGO,
  ETIQUETAS_ESTADO_PEDIDO,
  ETIQUETAS_MEDIO_PAGO,
} from "@/lib/mappings";
import type { PedidoAdminFila } from "@/types";

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
 * Usa Link: en los tests se renderiza dentro de un MemoryRouter.
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
                  <Link
                    to={`/admin/pedidos/${p.id}`}
                    className="block font-medium text-tinta underline-offset-4 hover:text-dorado-texto hover:underline"
                  >
                    {p.numero}
                  </Link>
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
                <Link
                  to={`/admin/pedidos/${p.id}`}
                  className="block font-medium text-tinta underline-offset-4 hover:text-dorado-texto hover:underline"
                >
                  {p.numero}
                </Link>
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