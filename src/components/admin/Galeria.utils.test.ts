import { describe, expect, it } from "vitest";

import {
  mover,
  tamanoLegible,
  validarArchivo,
} from "@/components/admin/Galeria.utils";
import { TOPE_BYTES } from "@/lib/api/imagenes.api";

/**
 * Archivo falso, con lo único que la validación mira.
 */
const archivo = (type: string, size: number) => ({ type, size }) as File;

describe("validarArchivo", () => {
  it("acepta los tres formatos del backend", () => {
    expect(validarArchivo(archivo("image/jpeg", 200_000), 0).valido).toBe(true);
    expect(validarArchivo(archivo("image/png", 200_000), 0).valido).toBe(true);
    expect(validarArchivo(archivo("image/webp", 200_000), 0).valido).toBe(true);
  });

  it("rechaza otros formatos", () => {
    const r = validarArchivo(archivo("image/gif", 1000), 0);

    expect(r.valido).toBe(false);
    if (!r.valido) expect(r.motivo).toContain("JPG");
  });

  it("rechaza un archivo que no es imagen", () => {
    expect(validarArchivo(archivo("application/pdf", 1000), 0).valido).toBe(false);
  });

  it("rechaza las fotos de más de 5 MB", () => {
    // Esperar a que suban cuatro megas para recibir el error es peor que cortar antes
    const r = validarArchivo(archivo("image/jpeg", 6_000_000), 0);

    expect(r.valido).toBe(false);
    if (!r.valido) expect(r.motivo).toContain("5,0 MB");
  });

  it("acepta una de exactamente 5 MB", () => {
    expect(validarArchivo(archivo("image/jpeg", TOPE_BYTES), 0).valido).toBe(true);
  });

  it("rechaza cuando el producto llegó al máximo", () => {
    const r = validarArchivo(archivo("image/jpeg", 1000), 8);

    expect(r.valido).toBe(false);
    if (!r.valido) expect(r.motivo).toContain("máximo");
  });

  it("acepta la octava foto", () => {
    expect(validarArchivo(archivo("image/jpeg", 1000), 7).valido).toBe(true);
  });
});

describe("tamanoLegible", () => {
  it("usa KB para los archivos chicos", () => {
    expect(tamanoLegible(512_000)).toBe("500 KB");
  });

  it("usa MB con coma decimal, como se escribe acá", () => {
    expect(tamanoLegible(TOPE_BYTES)).toBe("5,0 MB");
    expect(tamanoLegible(6_600_000)).toBe("6,3 MB");
  });
});

describe("mover", () => {
  const lista = ["a", "b", "c", "d"];

  it("mueve un elemento hacia adelante", () => {
    expect(mover(lista, 0, 2)).toEqual(["b", "c", "a", "d"]);
  });

  it("mueve un elemento al principio", () => {
    expect(mover(lista, 3, 0)).toEqual(["d", "a", "b", "c"]);
  });

  it("devuelve la misma lista si no hay nada que mover", () => {
    expect(mover(lista, 1, 1)).toBe(lista);
  });

  it("ignora posiciones fuera de rango", () => {
    expect(mover(lista, 0, 9)).toBe(lista);
    expect(mover(lista, -1, 2)).toBe(lista);
  });

  it("no modifica la lista original", () => {
    mover(lista, 0, 3);

    expect(lista).toEqual(["a", "b", "c", "d"]);
  });
});
