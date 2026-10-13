import { useLoaderData } from "react-router-dom";

import { CompraProducto } from "@/components/tienda/CompraProducto";
import { GaleriaProducto } from "@/components/tienda/GaleriaProducto";
import { MigaDePan } from "@/components/tienda/MigaDePan";
import { urlCloudinary } from "@/lib/utils";
import type { cargarProducto } from "./Producto.action";
import { descripcionMeta, tramosMigaProducto } from "./Producto.utils";

/** Ancho de la imagen para compartir en redes, a densidad normal. */
const ANCHO_OG = 1200;

/**
 * @description Sección de texto de la ficha. No se muestra si el producto no
 * tiene ese dato. Respeta los saltos de línea que cargó la marca.
 * @param props El título y el texto.
 * @returns La sección, o nada si no hay texto.
 */
function SeccionTexto({ titulo, texto }: { titulo: string; texto?: string | null }) {
  if (!texto?.trim()) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-medium text-tinta">{titulo}</h2>
      <p className="whitespace-pre-line text-texto-suave">{texto}</p>
    </section>
  );
}

/**
 * @description Ficha de producto de `/productos/:slug`: fotos, presentaciones,
 * precio y "Agregar al carrito", más descripción, ingredientes y modo de uso.
 * Define su título, su descripción y su `og:image` para los links compartidos.
 * @returns La ficha.
 */
export function Producto() {
  const { producto, padre } = useLoaderData<typeof cargarProducto>();
  const { nombre, descripcionCorta, descripcion, ingredientes, modoUso, categoria, imagenes, variantes } =
    producto;

  const descripcionPagina = descripcionMeta(producto);
  const imagenPrincipal = imagenes[0];

  return (
    <>
      <title>{`${nombre} · Veluá`}</title>
      {descripcionPagina && <meta name="description" content={descripcionPagina} />}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={`${nombre} · Veluá`} />
      {descripcionPagina && <meta property="og:description" content={descripcionPagina} />}
      {imagenPrincipal && (
        <meta property="og:image" content={urlCloudinary(imagenPrincipal.url, ANCHO_OG)} />
      )}

      <div className="mx-auto max-w-6xl px-4 pt-6 pb-14 md:px-8 md:pt-10 md:pb-24">
        <MigaDePan tramos={tramosMigaProducto(producto, padre)} />

        <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-2 md:gap-14">
          <GaleriaProducto key={producto.id} imagenes={imagenes} nombre={nombre} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold tracking-[0.18em] text-etiqueta uppercase">{categoria.nombre}</p>
              <h1 className="text-4xl leading-[1.02] font-medium text-tinta md:text-5xl">{nombre}</h1>
              {descripcionCorta && (
                <p className="font-display text-xl leading-relaxed text-texto-suave italic">{descripcionCorta}</p>
              )}
            </div>

            <CompraProducto key={producto.id} nombre={nombre} variantes={variantes} />
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-borde pt-10 md:mt-16 md:grid-cols-3 md:gap-12">
          <SeccionTexto titulo="Descripción" texto={descripcion} />
          <SeccionTexto titulo="Ingredientes" texto={ingredientes} />
          <SeccionTexto titulo="Modo de uso" texto={modoUso} />
        </div>
      </div>
    </>
  );
}
