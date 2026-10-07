import { Link } from "react-router-dom";

import { Precio } from "@/components/ui/Precio";
import type { ProductoListado } from "@/types";
import { cn, enlaceWhatsApp, srcsetCloudinary, urlCloudinary } from "@/lib/utils";
import { WHATSAPP_NUMERO } from "@/lib/mappings";
import { TexturaBotanica } from "./TexturaBotanica";
import { hayOferta, mensajeAvisarme } from "./TarjetaProducto.utils";

/** Ancho de la imagen en la grilla, a densidad normal. */
const ANCHO_GRILLA = 400;

const claseEtiqueta = "rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase";

type TarjetaProductoProps = {
  producto: ProductoListado;
  /** Muestra el nombre de la colección arriba del producto. */
  mostrarCategoria?: boolean;
  /** Carga la imagen sin esperar: solo para la primera tarjeta visible. */
  prioridad?: boolean;
};

/**
 * @description Tarjeta de producto de la grilla, con sus tres estados: normal,
 * en oferta y agotado. Sin foto muestra la textura botánica con el nombre: es
 * un estado normal del catálogo. Toda la tarjeta lleva a la ficha; "Avisarme"
 * queda por encima y abre WhatsApp.
 * @param props El producto, si se muestra la colección y si la imagen es prioritaria.
 * @returns La tarjeta.
 */
export function TarjetaProducto({ producto, mostrarCategoria, prioridad }: TarjetaProductoProps) {
  const { nombre, slug, imagen, precioDesde, precioAnteriorDesde, hayStock, destacado } = producto;

  const enOferta = hayStock && hayOferta(precioDesde, precioAnteriorDesde);
  const avisarme = hayStock ? null : enlaceWhatsApp(WHATSAPP_NUMERO, mensajeAvisarme(nombre));

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-borde bg-crema-clara">
      <div className="relative aspect-square overflow-hidden">
        {imagen ? (
          <img
            src={urlCloudinary(imagen.url, ANCHO_GRILLA)}
            srcSet={srcsetCloudinary(imagen.url, ANCHO_GRILLA)}
            alt={imagen.alt || nombre}
            width={ANCHO_GRILLA}
            height={ANCHO_GRILLA}
            loading={prioridad ? "eager" : "lazy"}
            className={cn("size-full object-cover", !hayStock && "opacity-60")}
          />
        ) : (
          <TexturaBotanica
            className={cn("flex size-full items-end justify-center p-4", !hayStock && "opacity-60")}
          >
            <span className="rounded-full bg-crema-clara/90 px-4 py-1.5 text-center font-display text-lg text-tinta">
              {nombre}
            </span>
          </TexturaBotanica>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {!hayStock && <span className={cn(claseEtiqueta, "bg-crema-clara text-tinta")}>Sin stock</span>}
          {enOferta && <span className={cn(claseEtiqueta, "bg-tinta text-crema-clara")}>Oferta</span>}
          {destacado && hayStock && !enOferta && (
            <span className={cn(claseEtiqueta, "bg-crema-clara text-etiqueta")}>Destacado</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        {mostrarCategoria && (
          <p className="text-[11px] font-bold tracking-[0.14em] text-etiqueta uppercase">
            {producto.categoria.nombre}
          </p>
        )}
        <h3 className="font-display text-xl leading-snug font-medium text-tinta">
          {/* El ::after estira el enlace sobre toda la tarjeta. */}
          <Link to={`/productos/${slug}`} className="after:absolute after:inset-0 group-hover:text-dorado-texto">
            {nombre}
          </Link>
        </h3>
        {producto.descripcionCorta && (
          <p className="line-clamp-2 text-sm text-texto-suave">{producto.descripcionCorta}</p>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-2">
          <Precio valor={precioDesde} className="text-xl" />
          {enOferta && precioAnteriorDesde && (
            <s className="text-sm text-texto-tenue">
              <span className="sr-only">Antes </span>
              <Precio valor={precioAnteriorDesde} className="font-sans font-normal text-texto-tenue" />
            </s>
          )}
          {avisarme && (
            <a
              href={avisarme}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 ml-auto text-sm font-bold text-dorado-texto underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta"
            >
              Avisarme
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
