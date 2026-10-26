import { Link } from "react-router-dom";

import { TexturaBotanica } from "@/components/tienda/TexturaBotanica";
import { Button } from "@/components/ui/Button";
import { INTRODUCCION_MARCA, SECCIONES_MARCA } from "@/lib/mappings";
import { cn } from "@/lib/utils";

const claseEyebrow = "text-xs font-bold tracking-[0.18em] text-etiqueta uppercase";

/**
 * @description Página institucional de la marca (`/la-marca`): la historia, el
 * proceso y los ingredientes. Los textos viven en `lib/mappings.ts`; las fotos
 * se ven como la textura botánica hasta que la marca las cargue (un espacio sin
 * foto es un estado normal, no un error). En pantalla angosta cada parte va en
 * una columna; desde `md` el texto y la imagen se alternan de lado.
 * @returns La página de la marca.
 */
export function LaMarca() {
  const secciones = SECCIONES_MARCA.filter((seccion) => seccion.parrafos.length > 0);

  return (
    <>
      <title>La marca · Veluá</title>
      <meta name="description" content="La historia, el proceso y los ingredientes de Veluá, cosmética natural artesanal de Río Cuarto." />

      <header className="mx-auto max-w-3xl px-4 pt-10 text-center md:px-8 md:pt-20">
        <p className={claseEyebrow}>Cosmética natural · Río Cuarto</p>
        <h1 className="mt-3 text-5xl leading-[0.98] font-medium text-tinta md:text-7xl">La marca</h1>
        <p className="mt-5 font-display text-xl leading-relaxed text-texto-suave italic md:text-2xl">
          {INTRODUCCION_MARCA}
        </p>
      </header>

      {secciones.map((seccion, indice) => (
        <section
          key={seccion.id}
          aria-labelledby={`marca-${seccion.id}`}
          className="mx-auto grid max-w-6xl items-center gap-6 px-4 pt-14 md:grid-cols-2 md:gap-14 md:px-8 md:pt-24"
        >
          <TexturaBotanica
            aria-hidden
            className={cn("aspect-[4/3] w-full rounded-2xl border border-borde", indice % 2 === 1 && "md:order-2")}
          />
          <div className="flex flex-col gap-4">
            <p className={claseEyebrow}>{seccion.etiqueta}</p>
            <h2 id={`marca-${seccion.id}`} className="text-4xl font-medium text-tinta md:text-5xl">
              {seccion.titulo}
            </h2>
            {seccion.parrafos.map((parrafo, i) => (
              <p key={i} className="text-lg leading-relaxed text-texto-suave">
                {parrafo}
              </p>
            ))}
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-3xl px-4 py-14 text-center md:px-8 md:py-24">
        <Button nativeButton={false} render={<Link to="/catalogo" />} className="h-13 px-9">
          Ver el catálogo
        </Button>
      </section>
    </>
  );
}
