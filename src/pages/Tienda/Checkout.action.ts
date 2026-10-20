import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";

import { interpretarCarrito } from "@/carrito/carritoStorage";
import { esEnteroPositivo } from "@/carrito/carrito.utils";
import { crearPedido, listarZonasEnvio } from "@/lib/api/pedidos.api";
import { ErrorApi } from "@/lib/apiFetch";
import { destinoDePago, type DestinoPago } from "@/lib/pagos";
import type { PedidoEntrada, ZonaEnvio } from "@/types";

/** Lo que el loader deja disponible para el checkout. */
export type DatosCheckout = { zonas: ZonaEnvio[] };

/** Resultado de enviar el formulario del checkout. */
export type ResultadoCheckout =
  | { ok: true; numero: string; destino: DestinoPago }
  | { ok: false; codigo: string; details?: Record<string, string> };

/**
 * @description Loader de `/checkout`. Trae las zonas de envío, que se eligen en
 * el formulario. Un error de la API sube al error boundary de la tienda.
 * @param args Argumentos del loader de react-router.
 * @returns Las zonas de envío.
 */
export async function cargarCheckout({ request }: LoaderFunctionArgs): Promise<DatosCheckout> {
  const { datos } = await listarZonasEnvio(request.signal);

  return { zonas: datos };
}

const texto = (datos: FormData, campo: string): string => {
  const valor = datos.get(campo);

  return typeof valor === "string" ? valor.trim() : "";
};

/**
 * @description Arma el pedido a partir del formulario del checkout. El carrito
 * viaja en un campo oculto con solo ids y cantidades (se vuelve a sanear), y el
 * total esperado es el que la clienta vio en pantalla. Solo Mercado Pago: la
 * transferencia espera su propio desarrollo. La validación de los datos de la
 * clienta la hace la API, que responde por campo.
 * @param datos Campos del formulario.
 * @returns El pedido listo para enviar, o null si el formulario no tiene la forma esperada.
 */
export const leerPedido = (datos: FormData): PedidoEntrada | null => {
  const items = interpretarCarrito(texto(datos, "items") || null);
  const totalEsperado = texto(datos, "totalEsperado");
  const metodo = texto(datos, "metodo");

  if (items.length === 0) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(totalEsperado)) return null;
  if (texto(datos, "medioPago") !== "mercadopago") return null;

  const cliente = {
    nombre: texto(datos, "nombre"),
    email: texto(datos, "email"),
    telefono: texto(datos, "telefono"),
    documento: texto(datos, "documento") || null,
  };

  if (metodo === "retiro") {
    return { items, cliente, entrega: { metodo }, medioPago: "mercadopago", totalEsperado };
  }

  const zonaEnvioId = Number(texto(datos, "zonaEnvioId"));

  if (metodo !== "envio" || !esEnteroPositivo(zonaEnvioId)) return null;

  return {
    items,
    cliente,
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
    medioPago: "mercadopago",
    totalEsperado,
  };
};

/**
 * @description Action de `/checkout`. Crea el pedido y decide adónde sigue la
 * clienta: a Mercado Pago, o a la página del pedido si no hubo link de pago.
 * Los datos personales solo pasan por acá hacia la API: no se guardan ni se
 * escriben en la consola. Un error de la API vuelve como código, que la página
 * traduce al mensaje del checkout.
 * @param args Argumentos del action de react-router.
 * @returns El número del pedido y el destino, o el código de error.
 */
export async function enviarPedido({ request }: ActionFunctionArgs): Promise<ResultadoCheckout> {
  const entrada = leerPedido(await request.formData());

  if (!entrada) return { ok: false, codigo: "DATOS_INVALIDOS" };

  try {
    const pedido = await crearPedido(entrada);

    return { ok: true, numero: pedido.numero, destino: destinoDePago(pedido.numero, pedido.urlPago) };
  } catch (error) {
    if (error instanceof ErrorApi) return { ok: false, codigo: error.codigo, details: error.details };

    return { ok: false, codigo: "ERROR_DESCONOCIDO" };
  }
}
