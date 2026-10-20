import { describe, expect, it } from "vitest";

import { formatearDiaMes } from "@/lib/fechas";

describe("formatearDiaMes", () => {
  it("muestra día y mes partiendo el texto", () => {
    expect(formatearDiaMes("2026-11-05")).toBe("05/11");
    expect(formatearDiaMes("2026-01-09")).toBe("09/01");
  });

  it("no corre la fecha un día, como haría Date con la zona horaria", () => {
    expect(formatearDiaMes("2026-12-01")).toBe("01/12");
  });

  it("devuelve null si no hay fecha o el formato no es AAAA-MM-DD", () => {
    expect(formatearDiaMes(null)).toBeNull();
    expect(formatearDiaMes(undefined)).toBeNull();
    expect(formatearDiaMes("")).toBeNull();
    expect(formatearDiaMes("05/11/2026")).toBeNull();
  });
});
