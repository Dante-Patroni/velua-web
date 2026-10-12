import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Precio } from "@/components/ui/Precio";
import { useCarrito } from "@/carrito/useCarrito";
import type { Variante } from "@/types";
import { WHATSAPP_NUMERO } from "@/lib/mappings";
import { cn, enlaceWhatsApp } from "@/lib/utils";
import { varianteInicial } from "./CompraProducto.utils";
import { hayOferta, mensajeAvisarme } from "./TarjetaProducto.utils";

const claseEnlaceAccion =
  "text-sm font-bold text-dorado-texto underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta";

type CompraProductoProps = {
  nombre: string;
  variantes: Variante[];
};

/**
 * @description Bloque de compra de la ficha: selector de presentación, precio,
 * cantidad y "Agregar al carrito". El carrito guarda solo el id de la variante
 * y la cantidad; el precio que se ve acá es informativo y el total lo calcula
 * el cotizador. Sin stock no se puede agregar: ofrece "Avisarme" por WhatsApp.
 * Hay que montarlo con `key` del producto, así al pasar de una ficha a otra el
 * estado vuelve a empezar.
 * @param props El nombre del producto y sus variantes activas.
 * @returns El bloque de compra.
 */
export function CompraProducto({ nombre, variantes }: CompraProductoProps) {
  const { agregar } = useCarrito();
  const [varianteId, setVarianteId] = useState(() => varianteInicial(variantes)?.id);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const variante = variantes.find(({ id }) => id === varianteId) ?? variantes[0];
  if (!variante) return null;

  const { precio, precioAnterior, hayStock } = variante;
  const enOferta = hayStock && hayOferta(precio, precioAnterior);
  const avisarme = hayStock
    ? null
    : enlaceWhatsApp(WHATSAPP_NUMERO, mensajeAvisarme(`${nombre} (${variante.nombre})`));

  const elegirVariante = (id: number) => {
    setVarianteId(id);
    setCantidad(1);
    setAgregado(false);
  };

  const cambiarCantidad = (nueva: number) => {
    setCantidad(Math.max(1, nueva));
    setAgregado(false);
  };

  const agregarAlCarrito = () => {
    agregar(variante.id, cantidad);
    setAgregado(true);
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

      {hayStock ? (
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
              <output aria-live="polite" className="w-10 text-center font-display text-2xl text-tinta">
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
      <p role="status" className="min-h-6 text-sm text-salvia-hondo">
        {agregado && (
          <>
            Lo agregamos a tu carrito.{" "}
            <Link to="/carrito" className={claseEnlaceAccion}>
              Ver carrito
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
