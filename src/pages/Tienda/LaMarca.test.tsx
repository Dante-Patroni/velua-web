import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { SECCIONES_MARCA } from "@/lib/mappings";
import { LaMarca } from "@/pages/Tienda/LaMarca";

const renderizar = () =>
  renderToStaticMarkup(
    <MemoryRouter>
      <LaMarca />
    </MemoryRouter>,
  );

describe("LaMarca", () => {
  it("tiene un solo h1 y un h2 por sección", () => {
    const html = renderizar();

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html.match(/<h2/g)).toHaveLength(SECCIONES_MARCA.length);
  });

  it("declara el título de la pestaña", () => {
    expect(renderizar()).toContain("<title>La marca · Veluá</title>");
  });

  it("enlaza al catálogo", () => {
    expect(renderizar()).toContain('href="/catalogo"');
  });

  it("las imágenes decorativas se ocultan a los lectores de pantalla", () => {
    const html = renderizar();

    expect(html.match(/aria-hidden="true"/g)).toHaveLength(SECCIONES_MARCA.length);
  });
});
