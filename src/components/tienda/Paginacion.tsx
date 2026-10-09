import { Link } from "react-router-dom";

const claseEnlace =
  "text-sm font-bold tracking-[0.12em] text-dorado-texto uppercase underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta";

type PaginacionProps = {
  pagina: number;
  totalPaginas: number;
};

/**
 * @description Navegación entre páginas de un listado. Cambia `?pagina=` en la
 * URL, así que cada página se puede compartir y el botón "atrás" funciona. No
 * se muestra si hay una sola página.
 * @param props La página actual y la cantidad de páginas.
 * @returns La navegación, o nada si no hace falta.
 */
export function Paginacion({ pagina, totalPaginas }: PaginacionProps) {
  if (totalPaginas <= 1) return null;

  const hacia = (destino: number) => ({ search: destino > 1 ? `?pagina=${destino}` : "" });

  return (
    <nav aria-label="Paginación" className="mt-10 flex items-center justify-between gap-4">
      {pagina > 1 ? (
        <Link to={hacia(pagina - 1)} rel="prev" className={claseEnlace}>
          ← Anterior
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-texto-tenue">
        Página {pagina} de {totalPaginas}
      </p>
      {pagina < totalPaginas ? (
        <Link to={hacia(pagina + 1)} rel="next" className={claseEnlace}>
          Siguiente →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
