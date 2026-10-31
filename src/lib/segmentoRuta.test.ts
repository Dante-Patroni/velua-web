import { describe, expect, test } from "vitest";

import { segmentoRuta } from "./segmentoRuta";

describe("segmentoRuta", () => {
  test.each(["VEL-4K7Q2X", "jabon-de-lavanda", "eclat-noir"])("deja pasar %s sin cambios", (valor) => {
    expect(segmentoRuta(valor)).toBe(valor);
  });

  test("codifica lo que podría armar otra ruta", () => {
    expect(segmentoRuta("../pago")).toBe("..%2Fpago");
    expect(segmentoRuta("a?b#c")).toBe("a%3Fb%23c");
  });

  test.each(["", ".", ".."])("rechaza %j sin devolver nada", (valor) => {
    expect(() => segmentoRuta(valor)).toThrow(
      expect.objectContaining({ codigo: "NO_ENCONTRADO", status: 404 }),
    );
  });

  test("un punto más ya no es un segmento especial", () => {
    expect(segmentoRuta("...")).toBe("...");
  });
});
