import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { CarritoContext } from "@/carrito/useCarrito";
import type { ValorCarrito } from "@/carrito/types";
import { CompraProducto } from "@/components/tienda/CompraProducto";
import { TarjetaProducto } from "@/components/tienda/TarjetaProducto";
import type { ProductoListado, Variante } from "@/types";

vi.mock("@/lib/mappings", async (importarOriginal) => ({
  ...(await importarOriginal<typeof import("@/lib/mappings")>()),
  WHATSAPP_NUMERO: "5493586000000",
}));

const carrito: ValorCarrito = {
  items: [],
  unidades: 0,
  agregar: () => {},
  quitar: () => {},
  cambiarCantidad: () => {},
  reemplazar: () => {},
  vaciar: () => {},
};

const variante = { id: 16, nombre: "100 g", precio: "8500.00", hayStock: true } as Variante;

const producto = {
  id: 1,
  nombre: "Éclat Doré",
  slug: "eclat-dore",
  categoria: { id: 1, nombre: "Jabones", slug: "jabones" },
  imagen: null,
  precioDesde: "8500.00",
  precioAnteriorDesde: null,
  hayStock: true,
  destacado: false,
  disponibleDesde: "2026-11-05",
  proximamente: true,
  diasRestantes: 19,
} as ProductoListado;

const dibujarTarjeta = (p: ProductoListado) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <TarjetaProducto producto={p} />
    </MemoryRouter>,
  );

const dibujarCompra = (proximamente: boolean) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <CarritoContext.Provider value={carrito}>
        <CompraProducto
          nombre="Éclat Doré"
          variantes={[variante]}
          proximamente={proximamente}
          disponibleDesde="2026-11-05"
          diasRestantes={proximamente ? 19 : null}
        />
      </CarritoContext.Provider>
    </MemoryRouter>,
  );

describe("TarjetaProducto próximamente", () => {
  it("muestra la etiqueta y 'Consultar' con el mensaje codificado", () => {
    const html = dibujarTarjeta(producto);

    expect(html).toContain("Próximamente · listo el 05/11 (faltan 19 días)");
    expect(html).toContain("Consultar");
    expect(html).toContain(
      `href="https://wa.me/5493586000000?text=${encodeURIComponent("Hola, quiero consultar por Éclat Doré, que sale el 05/11.")}"`,
    );
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("manda la etiqueta de próximamente aunque no haya stock", () => {
    const html = dibujarTarjeta({ ...producto, hayStock: false });

    expect(html).toContain("Próximamente");
    expect(html).not.toContain("Sin stock");
    expect(html).not.toContain("Avisarme");
  });

  it("sin fecha válida muestra solo 'Próximamente'", () => {
    const html = dibujarTarjeta({ ...producto, disponibleDesde: null, diasRestantes: null });

    expect(html).toContain("Próximamente");
    expect(html).not.toContain("listo el");
  });
});

describe("CompraProducto próximamente", () => {
  it("no ofrece 'Agregar al carrito' y sí 'Consultar'", () => {
    const html = dibujarCompra(true);

    expect(html).not.toContain("Agregar al carrito");
    expect(html).toContain("Consultar");
    expect(html).toContain("Próximamente · listo el 05/11 (faltan 19 días)");
  });

  it("un producto a la venta sigue ofreciendo 'Agregar al carrito'", () => {
    const html = dibujarCompra(false);

    expect(html).toContain("Agregar al carrito");
    expect(html).not.toContain("Consultar");
  });
});
