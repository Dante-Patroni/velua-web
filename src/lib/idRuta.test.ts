import { describe, expect, test } from "vitest";

import { leerIdRuta } from "./idRuta";

describe("leerIdRuta", () => {
  test("acepta enteros positivos escritos solo con dígitos", () => {
    expect(leerIdRuta("1")).toBe(1);
    expect(leerIdRuta("12")).toBe(12);
    expect(leerIdRuta("9999999999")).toBe(9999999999);
  });

  test("rechaza todo lo demás, incluido el path traversal", () => {
    const invalidos = [
      undefined,
      "",
      "0",
      "012",
      "-1",
      "1.5",
      "1e2",
      "0x10",
      " 12",
      "12 ",
      "1abc",
      "../categorias",
      "1/../../categorias",
      "..%2Fcategorias",
      "12345678901",
    ];

    for (const valor of invalidos) {
      expect(leerIdRuta(valor), String(valor)).toBeNull();
    }
  });
});