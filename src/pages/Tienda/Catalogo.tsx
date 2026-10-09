import { useLoaderData } from "react-router-dom";

import { GrillaProductos } from "@/components/tienda/GrillaProductos";
import { MigaDePan } from "@/components/tienda/MigaDePan";
import type { cargarCatalogo } from "./Catalogo.action";
import type { TramoMiga } from "./Categoria.utils";

const MIGA: TramoMiga[] = [{ texto: "Inicio", ruta: "/" }, { texto: "Catálogo" }];

/**
 * @description Página de `/catalogo`: todos los productos publicados, en la
 * misma grilla paginada que las colecciones. Cada tarjeta muestra a qué
 * colección pertenece.
 * @returns La página del catálogo.
 */
export function Catalogo() {
  const { datos, meta } = useLoaderData<typeof cargarCatalogo>();

  return (
    <>
      <title>Catálogo · Veluá</title>

      <section className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
        <MigaDePan tramos={MIGA} />
        <h1 className="mt-5 text-5xl leading-[0.98] font-medium text-tinta md:text-6xl">Catálogo</h1>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-16">
        <GrillaProductos
          productos={datos}
          meta={meta}
          mostrarCategoria
          mensajeVacio="Estamos preparando el catálogo. Volvé a visitarnos en unos días."
        />
      </section>
    </>
  );
}
