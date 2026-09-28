import { Form, Link, useFetcher, useLoaderData, useSearchParams } from "react-router-dom";
import { AlertTriangle, ImageOff, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { formatearPrecio } from "@/lib/formato";
import type { ProductoAdminFila } from "@/types";
import type { DatosProductos } from "./Productos.action";
import { LIMITE } from "./Productos.action";

/**
 * @description Indica si un producto necesita atención de la dueña: sin fotos
 * cargadas o sin stock. Son las dos cosas que conviene ver de un vistazo.
 * @param p Fila del listado.
 * @returns Un aviso corto, o null si el producto está completo.
 */
function avisoDe(p: ProductoAdminFila): { texto: string; icono: typeof ImageOff } | null {
  if (p.cantidadImagenes === 0) return { texto: "Sin fotos", icono: ImageOff };
  if (p.stockTotal === 0) return { texto: "Sin stock", icono: AlertTriangle };
  return null;
}

/**
 * @description Franja de filtros. Envía por GET, así los filtros quedan en la
 * URL: el back del navegador no los pierde y el link se puede compartir.
 * @param props Categorías disponibles.
 * @param props.categorias Categorías para el selector.
 * @returns El formulario de filtros.
 */
function Filtros({ categorias }: { categorias: DatosProductos["categorias"] }) {
  const [parametros] = useSearchParams();

  return (
    <Form method="get" className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1">
        <Label htmlFor="q">Buscar</Label>
        <div className="relative mt-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-texto-tenue"
          />
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={parametros.get("q") ?? ""}
            placeholder="Nombre del producto"
            className="pl-9"
          />
        </div>
      </div>

      <div className="w-52">
        <Label htmlFor="categoriaId">Colección</Label>
        <Select
          id="categoriaId"
          name="categoriaId"
          defaultValue={parametros.get("categoriaId") ?? ""}
          className="mt-1"
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-40">
        <Label htmlFor="estado">Estado</Label>
        <Select
          id="estado"
          name="estado"
          defaultValue={parametros.get("estado") ?? ""}
          className="mt-1"
        >
          <option value="">Todos</option>
          <option value="activos">Publicados</option>
          <option value="inactivos">Despublicados</option>
        </Select>
      </div>

      <div className="w-48">
        <Label htmlFor="orden">Ordenar por</Label>
        <Select
          id="orden"
          name="orden"
          defaultValue={parametros.get("orden") ?? ""}
          className="mt-1"
        >
          <option value="">Más recientes</option>
          <option value="nombre">Nombre</option>
          <option value="stock">Menos stock primero</option>
        </Select>
      </div>

      <Button type="submit" className="w-auto">
        Filtrar
      </Button>
    </Form>
  );
}

/**
 * @description Botón que publica o despublica un producto sin salir de la tabla.
 * Usa fetcher y no Form: así el envío no cuenta como navegación, la página no
 * parpadea, y cada fila tiene su propio estado de envío.
 * @param props Datos del producto.
 * @param props.producto Fila del listado.
 * @returns El formulario con el botón.
 */
function BotonEstado({ producto }: { producto: ProductoAdminFila }) {
  const fetcher = useFetcher();
  const enviando = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="id" value={producto.id} />
      <input type="hidden" name="activo" value={String(!producto.activo)} />
      <button
        type="submit"
        disabled={enviando}
        className="flex items-center gap-2 rounded-sm px-2 py-1 text-sm text-texto-suave hover:bg-crema-calida disabled:opacity-50"
      >
        <span
          aria-hidden
          className={`size-2 rounded-full ${producto.activo ? "bg-salvia-hondo" : "bg-texto-tenue"}`}
        />
        {producto.activo ? "Publicado" : "Despublicado"}
      </button>
    </fetcher.Form>
  );
}

/**
 * @description Paginación del listado. Conserva los filtros de la URL.
 * @param props Datos de la paginación.
 * @param props.pagina Página actual.
 * @param props.total Total de productos que cumplen el filtro.
 * @returns Los links de página, o null si entra todo en una.
 */
function Paginacion({ pagina, total }: { pagina: number; total: number }) {
  const [parametros] = useSearchParams();
  const paginas = Math.ceil(total / LIMITE);

  if (paginas <= 1) return null;

  /**
   * @description Arma el link de una página conservando los filtros actuales.
   * @param n Número de página.
   * @returns La cadena de consulta con la página cambiada.
   */
  const linkA = (n: number) => {
    const siguientes = new URLSearchParams(parametros);
    siguientes.set("pagina", String(n));
    return `?${siguientes.toString()}`;
  };

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-2 py-6">
      {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          to={linkA(n)}
          aria-current={n === pagina ? "page" : undefined}
          className={
            n === pagina
              ? "flex size-10 items-center justify-center rounded-sm bg-tinta text-crema"
              : "flex size-10 items-center justify-center rounded-sm border border-borde text-tinta hover:bg-crema-calida"
          }
        >
          {n}
        </Link>
      ))}
    </nav>
  );
}

/**
 * @description Listado de productos del panel. Es la pantalla desde la que se
 * administra el catálogo todos los días.
 * @returns La tabla en escritorio y las tarjetas en teléfono.
 */
export function Productos() {
  const { listado, categorias, filtros } = useLoaderData() as DatosProductos;
  const { datos, meta } = listado;

  const sinFotos = datos.filter((p) => p.cantidadImagenes === 0).length;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-tinta">Productos</h1>
          <p className="mt-1 text-sm text-texto-suave">
            {meta.total} {meta.total === 1 ? "producto" : "productos"} en el catálogo
            {sinFotos > 0 && (
              <>
                {" · "}
                <span className="text-dorado-texto">
                  {sinFotos} sin fotos en esta página
                </span>
              </>
            )}
          </p>
        </div>

        <Link
          to="/admin/productos/nuevo"
          className="inline-flex w-auto items-center justify-center rounded-md bg-tinta px-4 py-2 text-sm font-medium text-crema-clara hover:bg-texto-suave"
        >
          Agregar producto
        </Link>

      </header>

      <section className="rounded-lg border border-borde bg-crema-clara p-4">
        <Filtros categorias={categorias} />
      </section>

      {datos.length === 0 ? (
        <p className="rounded-lg border border-borde bg-crema-clara px-6 py-16 text-center text-texto-suave">
          No hay productos que coincidan con el filtro.
        </p>
      ) : (
        <>
          {/* Escritorio: tabla */}
          <div className="hidden overflow-hidden rounded-lg border border-borde bg-crema-clara md:block">
            <table className="w-full text-left">
              <thead className="border-b border-borde text-sm text-etiqueta">
                <tr>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Colección</th>
                  <th className="px-4 py-3 font-semibold">Desde</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Fotos</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((p) => {
                  const aviso = avisoDe(p);
                  const Icono = aviso?.icono;

                  return (
                    <tr key={p.id} className="border-b border-borde last:border-0">
                      <td className="px-4 py-4">
                        <Link
                          to={`/admin/productos/${p.id}`}
                          className="font-medium text-tinta underline-offset-4 hover:text-dorado-texto hover:underline"
                        >
                          {p.nombre}
                        </Link>
                        {aviso && Icono && (
                          <span className="mt-1 flex items-center gap-1.5 text-xs text-dorado-texto">
                            <Icono aria-hidden className="size-3.5" />
                            {aviso.texto}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-texto-suave">
                        {p.categoria?.nombre ?? "—"}
                      </td>
                      <td className="px-4 py-4 font-display text-lg text-tinta">
                        {formatearPrecio(p.precioDesde)}
                      </td>
                      <td className="px-4 py-4 text-sm text-texto-suave">
                        {p.stockTotal} en {p.cantidadVariantes}{" "}
                        {p.cantidadVariantes === 1 ? "variante" : "variantes"}
                      </td>
                      <td className="px-4 py-4 text-sm text-texto-suave">
                        {p.cantidadImagenes}
                      </td>
                      <td className="px-4 py-4">
                        <BotonEstado producto={p} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Teléfono: tarjetas */}
          <ul className="flex flex-col gap-3 md:hidden">
            {datos.map((p) => {
              const aviso = avisoDe(p);
              const Icono = aviso?.icono;

              return (
                <li
                  key={p.id}
                  className="rounded-lg border border-borde bg-crema-clara p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/admin/productos/${p.id}`}
                      className="font-medium text-tinta underline-offset-4 hover:underline"
                    >
                      {p.nombre}
                    </Link>
                    <span className="font-display text-lg text-tinta">
                      {formatearPrecio(p.precioDesde)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-texto-suave">
                    {p.categoria?.nombre ?? "—"} · {p.stockTotal} en stock ·{" "}
                    {p.cantidadImagenes} {p.cantidadImagenes === 1 ? "foto" : "fotos"}
                  </p>

                  {aviso && Icono && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-dorado-texto">
                      <Icono aria-hidden className="size-3.5" />
                      {aviso.texto}
                    </p>
                  )}

                  <div className="mt-3 border-t border-borde pt-3">
                    <BotonEstado producto={p} />
                  </div>
                </li>
              );
            })}
          </ul>

          <Paginacion pagina={filtros.pagina ?? 1} total={meta.total} />
        </>
      )}
    </div>
  );
}
