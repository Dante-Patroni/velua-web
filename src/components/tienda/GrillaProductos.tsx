import { Paginacion } from "@/components/tienda/Paginacion";
import { TarjetaProducto } from "@/components/tienda/TarjetaProducto";
import { totalPaginas } from "@/pages/Tienda/Categoria.utils";
import type { Meta, ProductoListado } from "@/types";

type GrillaProductosProps = {
  productos: ProductoListado[];
  meta: Meta;
  /** Muestra el nombre de la colección arriba de cada producto. */
  mostrarCategoria?: boolean;
  /** Texto del aviso cuando no hay productos. */
  mensajeVacio: string;
};

/**
 * @description Grilla paginada de productos de la tienda: dos por fila en el
 * teléfono y tres desde md. Si no hay productos muestra un aviso amable en vez
 * de una grilla vacía. Las dos primeras tarjetas cargan sin esperar, porque son
 * lo primero visible.
 * @param props Los productos, la meta de paginación y el texto del aviso vacío.
 * @returns La grilla con su paginación, o el aviso.
 */
export function GrillaProductos({
  productos,
  meta,
  mostrarCategoria,
  mensajeVacio,
}: GrillaProductosProps) {
  if (productos.length === 0) {
    return (
      <div className="rounded-2xl border border-borde bg-crema-calida px-6 py-14 text-center">
        <p className="font-display text-3xl font-medium text-tinta">Muy pronto…</p>
        <p className="mt-2 text-texto-suave">{mensajeVacio}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6">
        {productos.map((producto, indice) => (
          <li key={producto.id} className="flex">
            <TarjetaProducto
              producto={producto}
              mostrarCategoria={mostrarCategoria}
              prioridad={indice < 2}
              mostrarDestacado={false}
            />
          </li>
        ))}
      </ul>
      <Paginacion pagina={meta.pagina} totalPaginas={totalPaginas(meta.total, meta.limite)} />
    </>
  );
}
