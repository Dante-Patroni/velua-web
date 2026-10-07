import { describe, expect, it } from "vitest";

import { enlaceWhatsApp, srcsetCloudinary, urlCloudinary } from "@/lib/utils";

const FOTO = "https://res.cloudinary.com/velua/image/upload/v1712/productos/eclat-noir.jpg";

describe("urlCloudinary", () => {
  it("inserta la transformación después de /image/upload", () => {
    expect(urlCloudinary(FOTO, 400)).toBe(
      "https://res.cloudinary.com/velua/image/upload/f_auto,q_auto,w_400/v1712/productos/eclat-noir.jpg",
    );
  });

  it("deja igual una URL que no es de Cloudinary", () => {
    const otra = "https://ejemplo.com/foto.jpg";
    expect(urlCloudinary(otra, 400)).toBe(otra);
  });
});

describe("srcsetCloudinary", () => {
  it("ofrece la versión normal y la de doble densidad", () => {
    expect(srcsetCloudinary(FOTO, 400)).toBe(
      `${urlCloudinary(FOTO, 400)} 1x, ${urlCloudinary(FOTO, 800)} 2x`,
    );
  });
});

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
