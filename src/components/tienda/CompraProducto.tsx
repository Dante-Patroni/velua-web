import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Precio } from "@/components/ui/Precio";
import { puedeAgregarItem } from "@/carrito/carrito.utils";
import { useCarrito } from "@/carrito/useCarrito";
import type { Variante } from "@/types";
import { MENSAJE_CARRITO_LLENO, WHATSAPP_NUMERO } from "@/lib/mappings";
import { cn, enlaceWhatsApp } from "@/lib/utils";
import { varianteInicial } from "./CompraProducto.utils";
import {
  etiquetaProximamente,
  hayOferta,
  mensajeAvisarme,
  mensajeConsultar,
} from "./TarjetaProducto.utils";

const claseEnlaceAccion =
  "text-sm font-bold text-dorado-texto underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta";

type CompraProductoProps = {
  nombre: string;
  variantes: Variante[];
  /** Lo decide el servidor: si es true, el producto todavía no se puede comprar. */
  proximamente: boolean;
  disponibleDesde: string | null;
  diasRestantes: number | null;
};

/**
 * @description Bloque de compra de la ficha: selector de presentación, precio,
 * cantidad y "Agregar al carrito". El carrito guarda solo el id de la variante
 * y la cantidad; el precio que se ve acá es informativo y el total lo calcula
 * el cotizador. Sin stock no se puede agregar: ofrece "Avisarme" por WhatsApp.
 * Si el producto es próximamente no hay cantidad ni "Agregar al carrito": se
 * muestra cuándo sale y "Consultar" por WhatsApp. Ocultar el botón es solo
 * experiencia de usuario; la API rechaza igual el producto en `/cotizar`.
 * Hay que montarlo con `key` del producto, así al pasar de una ficha a otra el
 * estado vuelve a empezar.
 * @param props El nombre del producto, sus variantes activas y su estado de lanzamiento.
 * @returns El bloque de compra.
 */
export function CompraProducto({
  nombre,
  variantes,
  proximamente,
  disponibleDesde,
  diasRestantes,
}: CompraProductoProps) {
  const { items, agregar } = useCarrito();
  const [varianteId, setVarianteId] = useState(() => varianteInicial(variantes)?.id);
  const [cantidad, setCantidad] = useState(1);
  const [resultado, setResultado] = useState<"agregado" | "lleno" | null>(null);

  const variante = variantes.find(({ id }) => id === varianteId) ?? variantes[0];
  if (!variante) return null;

  const { precio, precioAnterior, hayStock } = variante;
  const enOferta = !proximamente && hayStock && hayOferta(precio, precioAnterior);
  const avisarme =
    proximamente || hayStock
      ? null
      : enlaceWhatsApp(WHATSAPP_NUMERO, mensajeAvisarme(`${nombre} (${variante.nombre})`));
  const consultar = proximamente
    ? enlaceWhatsApp(WHATSAPP_NUMERO, mensajeConsultar(nombre, disponibleDesde))
    : null;

  const elegirVariante = (id: number) => {
    setVarianteId(id);
    setCantidad(1);
    setResultado(null);
  };

  const cambiarCantidad = (nueva: number) => {
    setCantidad(Math.max(1, nueva));
    setResultado(null);
  };

  const agregarAlCarrito = () => {
    // Con el carrito en el máximo de líneas, agregar no hace nada: no se dice que se agregó.
    if (!puedeAgregarItem(items, variante.id)) {
      setResultado("lleno");
      return;
    }

    agregar(variante.id, cantidad);
    setResultado("agregado");
  };

  return (
    <div className="flex flex-col gap-6">
      {variantes.length > 1 && (
        <div role="group" aria-labelledby="etiqueta-presentacion" className="flex flex-col gap-3">
          <p id="etiqueta-presentacion" className="text-xs font-bold tracking-[0.18em] text-etiqueta uppercase">
            Presentación
          </p>
          <div className="flex flex-wrap gap-2">
            {variantes.map(({ id, nombre: nombreVariante, hayStock: disponible }) => (
              <Button
                key={id}
                variante="secundario"
                tamano="chico"
                aria-pressed={id === variante.id}
                className={cn(
                  id === variante.id && "border-tinta bg-tinta text-crema-clara hover:bg-tinta",
                  !disponible && id !== variante.id && "text-texto-tenue",
                )}
                onClick={() => elegirVariante(id)}
              >
                {nombreVariante}
                {!disponible && <span className="sr-only"> (sin stock)</span>}
              </Button>
            ))}
          </div>
        </div>
      )}

      {variantes.length === 1 && (
        <p className="text-sm text-texto-suave">Presentación: {variante.nombre}</p>
      )}

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <Precio valor={precio} className="text-4xl" />
        {enOferta && precioAnterior && (
          <s className="text-lg text-texto-tenue">
            <span className="sr-only">Antes </span>
            <Precio valor={precioAnterior} className="font-sans font-normal text-texto-tenue" />
          </s>
        )}
        {enOferta && (
          <span className="rounded-full bg-tinta px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-crema-clara uppercase">
            Oferta
          </span>
        )}
      </div>

      {proximamente ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="font-bold text-etiqueta">{etiquetaProximamente(disponibleDesde, diasRestantes)}</p>
          {consultar && (
            <a href={consultar} target="_blank" rel="noopener noreferrer" className={claseEnlaceAccion}>
              Consultar
            </a>
          )}
        </div>
      ) : hayStock ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span id="etiqueta-cantidad" className="text-sm text-texto-suave">
              Cantidad
            </span>
            <div role="group" aria-labelledby="etiqueta-cantidad" className="flex items-center gap-1">
              <Button
                variante="secundario"
                tamano="icono"
                aria-label="Quitar una unidad"
                disabled={cantidad <= 1}
                onClick={() => cambiarCantidad(cantidad - 1)}
              >
                <Minus aria-hidden />
              </Button>
              {/* Cifras alineadas: en las de estilo antiguo de la serif, el 1 se lee como una "I". */}
              <output
                aria-live="polite"
                className="w-10 text-center font-display text-2xl text-tinta lining-nums tabular-nums"
              >
                {cantidad}
              </output>
              <Button
                variante="secundario"
                tamano="icono"
                aria-label="Sumar una unidad"
                onClick={() => cambiarCantidad(cantidad + 1)}
              >
                <Plus aria-hidden />
              </Button>
            </div>
          </div>

          <Button className="h-13 w-full md:w-auto md:px-12" onClick={agregarAlCarrito}>
            Agregar al carrito
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="font-bold text-tinta">Sin stock</p>
          {avisarme && (
            <a href={avisarme} target="_blank" rel="noopener noreferrer" className={claseEnlaceAccion}>
              Avisarme
            </a>
          )}
        </div>
      )}

      {/* Siempre en el DOM, para que los lectores de pantalla anuncien el cambio. */}
      <p role="status" className={cn("min-h-6 text-sm", resultado === "lleno" ? "text-error" : "text-salvia-hondo")}>
        {resultado === "agregado" && "Lo agregamos a tu carrito. "}
        {resultado === "lleno" && `${MENSAJE_CARRITO_LLENO} `}
        {resultado && (
          <Link to="/carrito" className={claseEnlaceAccion}>
            Ver carrito
          </Link>
        )}
      </p>
    </div>
  );
}
