/**
 * @description Contenido provisorio de una página cuya sección todavía no se
 * construyó. Sin datos simulados: solo el título de la sección.
 * @param props Título de la página.
 * @returns El bloque con el título y un aviso.
 */
export function EnConstruccion({ titulo }: { titulo: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-medium text-tinta">{titulo}</h1>
      <p className="mt-3 text-texto-suave">Esta sección está en preparación.</p>
    </section>
  );
}
