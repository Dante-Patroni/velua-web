import { describe, expect, it, vi } from "vitest";

import { copiarAlPortapapeles } from "@/lib/portapapeles";

describe("copiarAlPortapapeles", () => {
  it("copia el texto y devuelve true", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(copiarAlPortapapeles("VEL-4K7Q2X", { writeText })).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("VEL-4K7Q2X");
  });

  it("si el navegador niega el permiso devuelve false y no lanza", async () => {
    const writeText = vi.fn().mockRejectedValue(new DOMException("denegado", "NotAllowedError"));

    await expect(copiarAlPortapapeles("VEL-4K7Q2X", { writeText })).resolves.toBe(false);
  });

  it("si no hay portapapeles (página no segura, entorno sin navegador) devuelve false", async () => {
    // En Node no hay `navigator.clipboard`: es el caso de una página sin https.
    await expect(copiarAlPortapapeles("VEL-4K7Q2X", undefined)).resolves.toBe(false);
  });

  it("copia el texto tal cual, sin modificarlo", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await copiarAlPortapapeles("  VEL-4K7Q2X ", { writeText });

    expect(writeText).toHaveBeenCalledWith("  VEL-4K7Q2X ");
  });
});
