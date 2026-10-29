import type { LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/lib/api/catalogoAdmin.api";
import {
  accionFicha,
  cargarFicha,
  leerCambiosProducto,
  leerProductoNuevo,
  leerVariante,
} from "@/pages/Admin/Producto.action";
import type { ProductoAdmin } from "@/types";

vi.mock("@/lib/api/catalogoAdmin.api", () => ({
  actualizarProducto: vi.fn(),
  actualizarVariante: vi.fn(),
  agregarVariante: vi.fn(),
  borrarProducto: vi.fn(),
  cambiarEstadoProducto: vi.fn(),
  cambiarEstadoVariante: vi.fn(),
  crearProducto: vi.fn(),
  listarCategoriasAdmin: vi.fn(async () => ({ datos: [] })),
  obtenerProducto: vi.fn(),
}));

/**
 * Atajo para armar un FormData a partir de pares clave y valor.
 */
const form = (pares: Array<[string, string]>) => {
  const datos = new FormData();
  for (const [clave, valor] of pares) datos.append(clave, valor);
  return datos;
};

describe("leerVariante", () => {
  it("deja el precio como texto, sin convertirlo a número", () => {
    // Convertirlo seria exactamente lo que la regla del proyecto prohibe
    const v = leerVariante(form([["nombre", "100 g"], ["precio", "8500,50"]]));

    expect(v.precio).toBe("8500,50");
    expect(typeof v.precio).toBe("string");
  });

  it("recorta los espacios de los textos", () => {
    const v = leerVariante(form([["nombre", "  100 g  "], ["precio", " 8500 "]]));

    expect(v.nombre).toBe("100 g");
    expect(v.precio).toBe("8500");
  });

  it("manda null cuando el SKU viene vacío", () => {
    const v = leerVariante(form([["nombre", "A"], ["precio", "1"], ["sku", "   "]]));

    expect(v.sku).toBeNull();
  });

  it("manda null cuando no se cargó precio anterior", () => {
    const v = leerVariante(form([["nombre", "A"], ["precio", "1"], ["precioAnterior", ""]]));

    expect(v.precioAnterior).toBeNull();
  });

  it("usa cero si no se indicó stock", () => {
    const v = leerVariante(form([["nombre", "A"], ["precio", "1"]]));

    expect(v.stock).toBe(0);
  });

  it("lee los campos con prefijo, para las variantes de la creación", () => {
    const datos = form([
      ["variantes.2.nombre", "60 g"],
      ["variantes.2.precio", "5500"],
      ["variantes.2.stock", "3"],
    ]);

    const v = leerVariante(datos, "variantes.2.");

    expect(v.nombre).toBe("60 g");
    expect(v.precio).toBe("5500");
    expect(v.stock).toBe(3);
  });
});

describe("leerProductoNuevo", () => {
  const base: Array<[string, string]> = [
    ["categoriaId", "4"],
    ["nombre", "Jabón de prueba"],
    ["variantes.0.nombre", "100 g"],
    ["variantes.0.precio", "8500"],
    ["variantes.0.stock", "5"],
  ];

  it("arma el producto con su variante", () => {
    const p = leerProductoNuevo(form(base));

    expect(p.categoriaId).toBe(4);
    expect(p.nombre).toBe("Jabón de prueba");
    expect(p.variantes).toHaveLength(1);
    expect(p.variantes[0].precio).toBe("8500");
  });

  it("junta varias variantes en orden", () => {
    const p = leerProductoNuevo(
      form([
        ...base,
        ["variantes.1.nombre", "60 g"],
        ["variantes.1.precio", "5500"],
        ["variantes.1.stock", "3"],
      ])
    );

    expect(p.variantes).toHaveLength(2);
    expect(p.variantes[1].nombre).toBe("60 g");
  });

  it("no se pierde si los índices tienen huecos", () => {
    // Pasa al agregar tres variantes y quitar la del medio antes de guardar
    const p = leerProductoNuevo(
      form([
        ["categoriaId", "4"],
        ["nombre", "X"],
        ["variantes.0.nombre", "A"],
        ["variantes.0.precio", "1"],
        ["variantes.2.nombre", "C"],
        ["variantes.2.precio", "3"],
      ])
    );

    expect(p.variantes).toHaveLength(2);
    expect(p.variantes.map((v) => v.nombre)).toEqual(["A", "C"]);
  });

  it("manda null en los textos que quedaron vacíos", () => {
    const p = leerProductoNuevo(form([...base, ["descripcion", "   "], ["slug", ""]]));

    expect(p.descripcion).toBeNull();
    expect(p.slug).toBeNull();
  });

  it("lee destacado como booleano", () => {
    expect(leerProductoNuevo(form(base)).destacado).toBe(false);
    expect(leerProductoNuevo(form([...base, ["destacado", "true"]])).destacado).toBe(true);
  });

  it("manda la fecha de lanzamiento como texto, sin convertirla", () => {
    const p = leerProductoNuevo(form([...base, ["disponibleDesde", "2026-11-05"]]));

    expect(p.disponibleDesde).toBe("2026-11-05");
  });

  it("sin fecha de lanzamiento manda null", () => {
    expect(leerProductoNuevo(form(base)).disponibleDesde).toBeNull();
    expect(leerProductoNuevo(form([...base, ["disponibleDesde", ""]])).disponibleDesde).toBeNull();
  });
});

describe("leerCambiosProducto", () => {
  it("solo incluye los campos que vinieron en el formulario", () => {
    // El backend deja sin tocar lo que no llega: mandar todo pisaria datos
    const cambios = leerCambiosProducto(form([["nombre", "Nombre nuevo"]]));

    expect(cambios).toEqual({ nombre: "Nombre nuevo" });
    expect(cambios).not.toHaveProperty("descripcion");
    expect(cambios).not.toHaveProperty("slug");
  });

  it("distingue un campo vacío de uno ausente", () => {
    // Vacio significa borrar el dato; ausente significa no tocarlo
    const cambios = leerCambiosProducto(form([["descripcion", ""]]));

    expect(cambios).toHaveProperty("descripcion");
    expect(cambios.descripcion).toBeNull();
  });

  it("convierte la categoría a número", () => {
    expect(leerCambiosProducto(form([["categoriaId", "7"]])).categoriaId).toBe(7);
  });

  it("manda null si se vació la fecha, para quitarla", () => {
    const cambios = leerCambiosProducto(form([["disponibleDesde", ""]]));

    expect(cambios).toHaveProperty("disponibleDesde");
    expect(cambios.disponibleDesde).toBeNull();
  });

  it("no toca la fecha si el campo no vino", () => {
    expect(leerCambiosProducto(form([["nombre", "X"]]))).not.toHaveProperty("disponibleDesde");
  });
});

/** Ids que llegan de la URL ya decodificados por react-router. */
const IDS_INVALIDOS = ["../categorias", "1/../../categorias", "..%2Fcategorias", "12abc", "0", "1e2"];

/** Operaciones de la ficha que trabajan sobre un producto existente. */
const INTENCIONES_CON_ID = [
  "guardar",
  "estado-producto",
  "borrar",
  "agregar-variante",
  "guardar-variante",
  "estado-variante",
];

/** Arma los argumentos del loader, con o sin id. */
const argumentosCarga = (id?: string) =>
  ({
    request: new Request("http://localhost/admin/productos/x"),
    params: id === undefined ? {} : { id },
    context: {},
  }) as unknown as LoaderFunctionArgs;

/** Ejecuta la action como lo haría el router, con el id de la ruta y los campos dados. */
const ejecutar = (id: string | undefined, pares: Array<[string, string]>) => {
  const request = new Request("http://localhost/admin/productos/x", {
    method: "POST",
    body: new URLSearchParams(pares),
  });
  return accionFicha({ request, params: id === undefined ? {} : { id }, context: undefined } as never);
};

describe("cargarFicha", () => {
  beforeEach(() => vi.clearAllMocks());

  it("con un id válido pide ese producto, como número", async () => {
    vi.mocked(api.obtenerProducto).mockResolvedValue({ id: 12 } as ProductoAdmin);

    await cargarFicha(argumentosCarga("12"));

    expect(api.obtenerProducto).toHaveBeenCalledWith(12, expect.any(AbortSignal));
  });

  it("con un id inválido responde no encontrado sin pedir el producto", async () => {
    for (const id of IDS_INVALIDOS) {
      await expect(cargarFicha(argumentosCarga(id)), id).rejects.toMatchObject({
        codigo: "NO_ENCONTRADO",
        status: 404,
      });
    }
    expect(api.obtenerProducto).not.toHaveBeenCalled();
  });

  it("sin id es un producto nuevo: no pide ninguno", async () => {
    await expect(cargarFicha(argumentosCarga())).resolves.toMatchObject({ producto: null });
    expect(api.obtenerProducto).not.toHaveBeenCalled();
  });
});

describe("accionFicha", () => {
  beforeEach(() => vi.clearAllMocks());

  it("con un id inválido, ninguna operación llama a la API", async () => {
    for (const id of IDS_INVALIDOS) {
      for (const intencion of INTENCIONES_CON_ID) {
        const resultado = await ejecutar(id, [
          ["intencion", intencion],
          ["varianteId", "5"],
        ]);
        expect(resultado, `${intencion} con ${id}`).toMatchObject({ codigo: "NO_ENCONTRADO" });
      }
    }

    for (const escritura of [
      api.actualizarProducto,
      api.cambiarEstadoProducto,
      api.borrarProducto,
      api.agregarVariante,
      api.actualizarVariante,
      api.cambiarEstadoVariante,
    ]) {
      expect(escritura).not.toHaveBeenCalled();
    }
  });

  it("borrar con un id válido manda el número", async () => {
    await ejecutar("12", [["intencion", "borrar"]]);

    expect(api.borrarProducto).toHaveBeenCalledWith(12);
  });

  it("una variante con id inválido no se toca", async () => {
    for (const intencion of ["guardar-variante", "estado-variante"]) {
      const resultado = await ejecutar("12", [
        ["intencion", intencion],
        ["varianteId", "../5"],
      ]);
      expect(resultado, intencion).toMatchObject({ codigo: "DATOS_INVALIDOS" });
    }

    expect(api.actualizarVariante).not.toHaveBeenCalled();
    expect(api.cambiarEstadoVariante).not.toHaveBeenCalled();
  });

  it("una variante con id válido se actualiza con los dos números", async () => {
    await ejecutar("12", [
      ["intencion", "guardar-variante"],
      ["varianteId", "5"],
      ["nombre", "100 g"],
    ]);

    expect(api.actualizarVariante).toHaveBeenCalledWith(12, 5, expect.anything());
  });

  it("crear no necesita id", async () => {
    vi.mocked(api.crearProducto).mockResolvedValue({ id: 30 } as ProductoAdmin);

    await ejecutar(undefined, [
      ["intencion", "crear"],
      ["nombre", "Nuevo"],
    ]);

    expect(api.crearProducto).toHaveBeenCalledTimes(1);
  });
});
