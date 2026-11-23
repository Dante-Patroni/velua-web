import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";

import { esEnteroPositivo } from "@/carrito/carrito.utils";
import { interpretarCarrito } from "@/carrito/carritoStorage";
import { listarProductos } from "@/lib/api/catalogoAdmin.api";
import { listarZonasEnvio } from "@/lib/api/pedidos.api";
import { registrarVentaPanel } from "@/lib/api/ventasPanel.api";
import { ErrorApi } from "@/lib/apiFetch";
import { ENTREGAS_VENTA, MEDIOS_VENTA } from "@/lib/mappings";
import type {
  EntregaPanel,
  MedioPagoPanel,
  ProductoAdminFila,
  VentaPanelEntrada,
  VentaPanelResultado,
  ZonaEnvio,
} from "@/types";

import { esClaveVenta } from "./VentaNueva.utils";

/** Cuántos productos se ofrecen en el selector. Es el máximo que acepta la API por página. */
export const LIMITE_PRODUCTOS = 50;

/** Lo que el loader deja disponible para la pantalla. */
export type DatosVenta = {
  zonas: ZonaEnvio[];
  productos: ProductoAdminFila[];
  /** true si hay más productos activos de los que entran en el selector. */
  hayMasProductos: boolean;
};

/** Resultado de enviar el formulario de la venta. */
export type ResultadoVenta =
  | { ok: true; venta: VentaPanelResultado }
  | { ok: false; codigo: string; details?: Record<string, string> };

/**
 * @description Loader de "Registrar venta". Trae las zonas de envío y los
 * productos activos que se ofrecen en el selector. Un error de la API (sin
 * sesión, por ejemplo) sube al error boundary del panel.
 * @param args Argumentos del loader de react-router.
 * @returns Las zonas y los productos.
 */
export async function cargarVenta({ request }: LoaderFunctionArgs): Promise<DatosVenta> {
  const [zonas, productos] = await Promise.all([
    listarZonasEnvio(request.signal),
    listarProductos({ estado: "activos", orden: "nombre", limite: LIMITE_PRODUCTOS }, request.signal),
  ]);

  return {
    zonas: zonas.datos,
    productos: productos.datos,
    hayMasProductos: productos.meta.total > productos.datos.length,
  };
}

const texto = (datos: FormData, campo: string): string => {
  const valor = datos.get(campo);

  return typeof valor === "string" ? valor.trim() : "";
};

const leerMedio = (valor: string): MedioPagoPanel | null =>
  MEDIOS_VENTA.find((medio) => medio === valor) ?? null;

const leerEntrega = (valor: string): EntregaPanel | null =>
  ENTREGAS_VENTA.find((entrega) => entrega === valor) ?? null;

/**
 * @description Arma la venta a partir del formulario, campo por campo: un campo
 * agregado a mano no viaja. Las líneas se vuelven a sanear (ids y cantidades,
 * sin repetidas); el total esperado es el del medio elegido, tal como lo mostró
 * la cotización, y solo se acepta con forma de importe. La dirección viaja solo
 * con envío; con retiro o en mano se omite el objeto entero, porque uno con
 * textos vacíos cuenta como dirección presente y la API lo rechaza. El email
 * vacío viaja como null. `cobradoEnEfectivo` solo viaja en true y con efectivo.
 * La validación del resto la hace la API, que responde por campo.
 * @param datos Campos del formulario.
 * @returns La venta y su clave de idempotencia, o null si el formulario no tiene
 *   la forma esperada.
 */
export const leerVenta = (
  datos: FormData,
): { entrada: VentaPanelEntrada; clave: string } | null => {
  const clave = texto(datos, "claveVenta");
  const items = interpretarCarrito(texto(datos, "items") || null);
  const totalEsperado = texto(datos, "totalEsperado");
  const medioPago = leerMedio(texto(datos, "medioPago"));
  const metodo = leerEntrega(texto(datos, "entrega"));

  if (!esClaveVenta(clave)) return null;
  if (items.length === 0) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(totalEsperado)) return null;
  if (medioPago === null || metodo === null) return null;

  const base = {
    items,
    cliente: {
      nombre: texto(datos, "nombre"),
      telefono: texto(datos, "telefono"),
      email: texto(datos, "email") || null,
      documento: texto(datos, "documento") || null,
    },
    medioPago,
    totalEsperado,
    notas: texto(datos, "notas") || null,
    ...(medioPago === "efectivo" && texto(datos, "cobradoEnEfectivo") === "true"
      ? { cobradoEnEfectivo: true }
      : {}),
  };

  if (metodo !== "envio") return { clave, entrada: { ...base, entrega: { metodo } } };

  const zonaEnvioId = Number(texto(datos, "zonaEnvioId"));

  if (!esEnteroPositivo(zonaEnvioId)) return null;

  return {
    clave,
    entrada: {
      ...base,
      entrega: {
        metodo,
        zonaEnvioId,
        direccion: {
          calle: texto(datos, "calle"),
          numero: texto(datos, "numero"),
          extra: texto(datos, "extra") || null,
          ciudad: texto(datos, "ciudad"),
          provincia: texto(datos, "provincia"),
          cp: texto(datos, "cp"),
        },
      },
    },
  };
};

/**
 * @description Action de "Registrar venta". Registra la venta con la clave de
 * idempotencia del formulario: un reintento con la misma clave devuelve la venta
 * original sin descontar stock de nuevo. El usuario sale de la sesión, en la
 * API. Los datos de la clienta solo pasan por acá hacia la API: no se guardan ni
 * se escriben en la consola. Un error de la API vuelve como código, que la
 * pantalla traduce al mensaje de la venta.
 * @param args Argumentos de la action de react-router.
 * @returns La venta registrada, o el código de error.
 */
export async function accionVenta({ request }: ActionFunctionArgs): Promise<ResultadoVenta> {
  const venta = leerVenta(await request.formData());

  if (!venta) return { ok: false, codigo: "DATOS_INVALIDOS" };

  try {
    return { ok: true, venta: await registrarVentaPanel(venta.entrada, venta.clave) };
  } catch (error) {
    if (error instanceof ErrorApi) return { ok: false, codigo: error.codigo, details: error.details };

    return { ok: false, codigo: "ERROR_DESCONOCIDO" };
  }
}
