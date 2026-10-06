import { describe, expect, it } from "vitest";

import { enlaceWhatsApp } from "@/lib/utils";

describe("enlaceWhatsApp", () => {
  it("sin número no arma enlace", () => {
    expect(enlaceWhatsApp("")).toBeNull();
    expect(enlaceWhatsApp("  ")).toBeNull();
  });

  it("deja solo los dígitos del número", () => {
    expect(enlaceWhatsApp("+54 9 358 400-0000")).toBe("https://wa.me/5493584000000");
  });

  it("codifica el mensaje inicial", () => {
    expect(enlaceWhatsApp("5493584000000", "Hola, ¿vuelve Éclat Noir?")).toBe(
      "https://wa.me/5493584000000?text=Hola%2C%20%C2%BFvuelve%20%C3%89clat%20Noir%3F",
    );
  });

  it("ignora un mensaje vacío", () => {
    expect(enlaceWhatsApp("5493584000000", "   ")).toBe("https://wa.me/5493584000000");
  });
});
