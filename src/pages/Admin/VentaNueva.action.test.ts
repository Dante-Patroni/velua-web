import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listarProductos } from "@/lib/api/catalogoAdmin.api";
import { listarZonasEnvio } from "@/lib/api/pedidos.api";
import { registrarVentaPanel } from "@/lib/api/ventasPanel.api";
import { ErrorApi } from "@/lib/apiFetch";

import { accionVenta, cargarVenta, LIMITE_PRODUCTOS, leerVenta } from "./VentaNueva.action";

vi.mock("@/lib/api/catalogoAdmin.api", () => ({ listarProductos: vi.fn() }));
vi.mock("@/lib/api/pedidos.api", () => ({ listarZonasEnvio: vi.fn() }));
vi.mock("@/lib/api/ventasPanel.api", () => ({ registrarVentaPanel: vi.fn() }));

const CLAVE = "3f1c2a9e-5b7d-4e8a-9c21-7d4e5f6a8b90";

/** Un formulario válido de una venta en mano, en efectivo. */
const BASE = {
  claveVenta: CLAVE,
  items: JSON.stringify([{ varianteId: 5, cantidad: 2 }]),
  entrega: "en_mano",
  medioPago: "efectivo",
  totalEsperado: "15300.00",
  nombre: "Lucía Fernández",
  telefono: "358 412-3344",
};

const formulario = (campos: Record<string, string>) => {
  const datos = new FormData();
  for (const [clave, valor] of Object.entries({ ...BASE, ...campos })) datos.append(clave, valor);
  return datos;
};

const envio = (campos: Record<string, string> = {}) =>
  ({
    request: new Request("http://localhost/admin/ventas/nueva", {
      method: "POST",
      body: formulario(campos),
    }),
    params: {},
    context: {},
  }) as unknown as ActionFunctionArgs;

describe("cargarVenta", () => {
  beforeEach(() => {
    vi.mocked(listarZonasEnvio).mockReset();
    vi.mocked(listarProductos).mockReset();
  });

  it("trae las zonas y los productos activos, con el tope de la API", async () => {
    vi.mocked(listarZonasEnvio).mockResolvedValue({ datos: [] });
    vi.mocked(listarProductos).mockResolvedValue({ datos: [], meta: { pagina: 1, limite: 50, total: 0 } });

    const datos = await cargarVenta({ request: new Request("http://localhost/") } as LoaderFunctionArgs);

    expect(listarProductos).toHaveBeenCalledWith(
      { estado: "activos", orden: "nombre", limite: LIMITE_PRODUCTOS },
      expect.any(AbortSignal),
    );
    expect(datos.hayMasProductos).toBe(false);
  });

  it("avisa si hay más productos activos de los que entran en el selector", async () => {
    vi.mocked(listarZonasEnvio).mockResolvedValue({ datos: [] });
    vi.mocked(listarProductos).mockResolvedValue({
      datos: [],
      meta: { pagina: 1, limite: 50, total: 51 },
    });

    const datos = await cargarVenta({ request: new Request("http://localhost/") } as LoaderFunctionArgs);

    expect(datos.hayMasProductos).toBe(true);
  });
});

describe("leerVenta", () => {
  it("arma la venta campo por campo", () => {
    expect(leerVenta(formulario({}))).toEqual({
      clave: CLAVE,
      entrada: {
        items: [{ varianteId: 5, cantidad: 2 }],
        cliente: { nombre: "Lucía Fernández", telefono: "358 412-3344", email: null, documento: null },
        entrega: { metodo: "en_mano" },
        medioPago: "efectivo",
        totalEsperado: "15300.00",
        notas: null,
      },
    });
  });

  it("un campo agregado a mano no viaja", () => {
    const venta = leerVenta(formulario({ usuarioId: "1", canal: "tienda", precio: "1.00", total: "1.00" }));

    expect(Object.keys(venta?.entrada ?? {}).sort()).toEqual(
      ["cliente", "entrega", "items", "medioPago", "notas", "totalEsperado"].sort(),
    );
  });

  it("manda como totalEsperado el texto del formulario, sin tocarlo", () => {
    expect(leerVenta(formulario({ totalEsperado: "16150.00" }))?.entrada.totalEsperado).toBe("16150.00");
  });

  it.each(["", "abc", "15300,00", "-5", "15300.001", "1e5"])("rechaza el total %j", (total) => {
    expect(leerVenta(formulario({ totalEsperado: total }))).toBeNull();
  });

  it.each(["", "no-es-un-uuid"])("rechaza la clave %j", (clave) => {
    expect(leerVenta(formulario({ claveVenta: clave }))).toBeNull();
  });

  it.each(["mercadopago", "", "cheque"])("rechaza el medio de pago %j", (medio) => {
    expect(leerVenta(formulario({ medioPago: medio }))).toBeNull();
  });

  it("rechaza una entrega desconocida", () => {
    expect(leerVenta(formulario({ entrega: "dron" }))).toBeNull();
  });

  it("rechaza una venta sin líneas", () => {
    expect(leerVenta(formulario({ items: "[]" }))).toBeNull();
    expect(leerVenta(formulario({ items: "no es json" }))).toBeNull();
  });

  it("suma las cantidades de una variante repetida: una línea por variante", () => {
    const items = JSON.stringify([
      { varianteId: 5, cantidad: 1 },
      { varianteId: 5, cantidad: 2 },
    ]);

    expect(leerVenta(formulario({ items }))?.entrada.items).toEqual([{ varianteId: 5, cantidad: 3 }]);
  });

  it("el email vacío viaja como null y uno escrito se manda", () => {
    expect(leerVenta(formulario({ email: "  " }))?.entrada.cliente.email).toBeNull();
    expect(leerVenta(formulario({ email: "lucia@correo.com" }))?.entrada.cliente.email).toBe("lucia@correo.com");
  });

  describe("entrega", () => {
    const DIRECCION = {
      calle: "Belgrano",
      numero: "123",
      extra: "",
      ciudad: "Río Cuarto",
      provincia: "Córdoba",
      cp: "5800",
    };

    it.each(["retiro", "en_mano"])("con %s omite la zona y la dirección enteras", (entrega) => {
      // El formulario trae los campos de dirección, pero con retiro o en mano no viajan.
      const venta = leerVenta(formulario({ entrega, zonaEnvioId: "3", ...DIRECCION }));

      expect(venta?.entrada.entrega).toEqual({ metodo: entrega });
      expect(venta?.entrada.entrega).not.toHaveProperty("direccion");
      expect(venta?.entrada.entrega).not.toHaveProperty("zonaEnvioId");
    });

    it("con envío manda la zona y la dirección", () => {
      const venta = leerVenta(formulario({ entrega: "envio", zonaEnvioId: "3", ...DIRECCION }));

      expect(venta?.entrada.entrega).toEqual({
        metodo: "envio",
        zonaEnvioId: 3,
        direccion: { ...DIRECCION, extra: null },
      });
    });

    it.each(["", "0", "-1", "abc", "1.5"])("con envío rechaza la zona %j", (zona) => {
      expect(leerVenta(formulario({ entrega: "envio", zonaEnvioId: zona, ...DIRECCION }))).toBeNull();
    });
  });

  describe("cobradoEnEfectivo", () => {
    it("viaja en true solo con efectivo y la casilla marcada", () => {
      expect(leerVenta(formulario({ cobradoEnEfectivo: "true" }))?.entrada.cobradoEnEfectivo).toBe(true);
    });

    it("sin la casilla, no viaja", () => {
      expect(leerVenta(formulario({}))?.entrada).not.toHaveProperty("cobradoEnEfectivo");
    });

    it("con transferencia no viaja aunque llegue en el formulario", () => {
      const venta = leerVenta(formulario({ medioPago: "transferencia", cobradoEnEfectivo: "true" }));

      expect(venta?.entrada).not.toHaveProperty("cobradoEnEfectivo");
    });

    it.each(["1", "si", "TRUE", "false"])("%j no cuenta como true", (valor) => {
      expect(leerVenta(formulario({ cobradoEnEfectivo: valor }))?.entrada).not.toHaveProperty(
        "cobradoEnEfectivo",
      );
    });
  });
});

describe("accionVenta", () => {
  beforeEach(() => {
    vi.mocked(registrarVentaPanel).mockReset();
  });

  it("registra la venta con la clave del formulario", async () => {
    const venta = { id: 1, numero: "VEL-4K7Q2X", total: "15300.00", estadoPago: "pendiente", medioPago: "efectivo" } as const;
    vi.mocked(registrarVentaPanel).mockResolvedValue(venta);

    await expect(accionVenta(envio())).resolves.toEqual({ ok: true, venta });
    expect(registrarVentaPanel).toHaveBeenCalledWith(expect.objectContaining({ totalEsperado: "15300.00" }), CLAVE);
  });

  it("un reintento manda la misma clave", async () => {
    vi.mocked(registrarVentaPanel).mockRejectedValueOnce(new ErrorApi("ERROR_DE_RED", 0));
    vi.mocked(registrarVentaPanel).mockResolvedValueOnce({
      id: 1, numero: "VEL-4K7Q2X", total: "15300.00", estadoPago: "pendiente", medioPago: "efectivo",
    });

    await accionVenta(envio());
    await accionVenta(envio());

    const claves = vi.mocked(registrarVentaPanel).mock.calls.map(([, clave]) => clave);
    expect(claves).toEqual([CLAVE, CLAVE]);
  });

  it("devuelve el código y los detalles de un error de la API", async () => {
    vi.mocked(registrarVentaPanel).mockRejectedValue(
      new ErrorApi("DATOS_INVALIDOS", 400, { "cliente.nombre": "Escribí el nombre" }),
    );

    await expect(accionVenta(envio())).resolves.toEqual({
      ok: false,
      codigo: "DATOS_INVALIDOS",
      details: { "cliente.nombre": "Escribí el nombre" },
    });
  });

  it.each(["TOTAL_CAMBIO", "CLAVE_REUTILIZADA", "MEDIO_PAGO_NO_DISPONIBLE", "CARRITO_DESACTUALIZADO"])(
    "devuelve %s como código, no como texto",
    async (codigo) => {
      vi.mocked(registrarVentaPanel).mockRejectedValue(new ErrorApi(codigo, 409));

      await expect(accionVenta(envio())).resolves.toEqual({ ok: false, codigo, details: undefined });
    },
  );

  it("un error que no es de la API no se muestra: queda como desconocido", async () => {
    vi.mocked(registrarVentaPanel).mockRejectedValue(new Error("Cannot read properties of undefined"));

    await expect(accionVenta(envio())).resolves.toEqual({ ok: false, codigo: "ERROR_DESCONOCIDO" });
  });

  it("un formulario sin la forma esperada no llega a la API", async () => {
    await expect(accionVenta(envio({ totalEsperado: "mucho" }))).resolves.toEqual({
      ok: false,
      codigo: "DATOS_INVALIDOS",
    });
    expect(registrarVentaPanel).not.toHaveBeenCalled();
  });
});
