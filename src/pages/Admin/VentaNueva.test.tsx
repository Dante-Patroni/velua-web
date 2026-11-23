import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, test } from "vitest";

import { AuthProvider } from "@/auth/AuthContext";
import type { ProductoAdminFila, RolUsuario } from "@/types";

import type { DatosVenta } from "./VentaNueva.action";
import { VentaNueva } from "./VentaNueva";

const producto = (id: number, nombre: string): ProductoAdminFila => ({
  id,
  nombre,
  slug: nombre.toLowerCase(),
  activo: true,
  destacado: false,
  cantidadVariantes: 1,
  stockTotal: 5,
  cantidadImagenes: 0,
});

/**
 * Renderiza la pantalla con los datos del loader ya cargados (hydrationData) y
 * un router en memoria: useFetcher y useLoaderData lo necesitan. Es el estado
 * inicial: los efectos (la cotización) no corren en un render estático.
 */
const pantalla = (rol: RolUsuario, datos: Partial<DatosVenta> = {}) => {
  const usuario = { id: 1, nombre: "Prueba", email: "prueba@example.com", rol, permisos: [] };
  const router = createMemoryRouter(
    [
      {
        id: "venta",
        path: "/",
        loader: () => null,
        element: (
          <AuthProvider usuario={usuario}>
            <VentaNueva />
          </AuthProvider>
        ),
      },
    ],
    {
      hydrationData: {
        loaderData: {
          venta: {
            zonas: [],
            productos: [producto(7, "Éclat Noir")],
            hayMasProductos: false,
            ...datos,
          },
        },
      },
    },
  );

  return renderToStaticMarkup(<RouterProvider router={router} />);
};

describe("VentaNueva", () => {
  test("al abrirla no muestra ningún total: todavía no hay medio elegido", () => {
    const html = pantalla("admin");

    expect(html).not.toContain("Total a cobrar");
    expect(html).toContain("Elegí cómo se cobra para ver el total de la venta.");
    expect(html).not.toContain("<data");
  });

  test("el botón de registrar arranca deshabilitado", () => {
    const html = pantalla("admin");
    const boton = html.match(/<button[^>]*type="submit"[^>]*>/)?.[0] ?? "";

    expect(boton).toContain("disabled");
  });

  test("lleva una clave de idempotencia UUID en un campo oculto", () => {
    const html = pantalla("admin");
    const clave = html.match(/name="claveVenta" value="([^"]+)"/)?.[1] ?? "";

    expect(clave).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test("ofrece los productos que trajo el loader", () => {
    expect(pantalla("admin")).toContain("Éclat Noir");
  });

  test("en mano (lo de arranque) no pide zona ni dirección", () => {
    const html = pantalla("admin");

    expect(html).not.toContain('name="zonaEnvioId"');
    expect(html).not.toContain('name="calle"');
  });

  test("no ofrece 'Ya cobré en efectivo' hasta elegir efectivo", () => {
    expect(pantalla("admin")).not.toContain('name="cobradoEnEfectivo"');
  });

  test("avisa si hay más productos de los que entran en la lista", () => {
    expect(pantalla("admin", { hayMasProductos: true })).toContain("Hay más productos activos");
    expect(pantalla("admin", { hayMasProductos: false })).not.toContain("Hay más productos activos");
  });

  test("un operador no ve el formulario: solo el aviso de permiso", () => {
    const html = pantalla("operador");

    expect(html).toContain("Solo el administrador puede registrar ventas.");
    expect(html).not.toContain("<form");
    expect(html).not.toContain('name="claveVenta"');
  });
});
