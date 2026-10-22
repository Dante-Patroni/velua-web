import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { InputContrasena } from "@/components/ui/InputContrasena";
import { atributosContrasena } from "@/components/ui/InputContrasena.utils";

describe("atributosContrasena", () => {
  it("oculta: campo de contraseña y sin corrector", () => {
    expect(atributosContrasena(false)).toEqual({
      type: "password",
      spellCheck: false,
      autoCorrect: "off",
      autoCapitalize: "off",
    });
  });

  it("visible: campo de texto, pero igual sin corrector", () => {
    expect(atributosContrasena(true)).toMatchObject({
      type: "text",
      spellCheck: false,
      autoCorrect: "off",
      autoCapitalize: "off",
    });
  });
});

describe("InputContrasena", () => {
  it("empieza oculta y con el botón para mostrarla", () => {
    const html = renderToStaticMarkup(
      <InputContrasena name="password" autoComplete="current-password" />,
    );

    expect(html).toContain('type="password"');
    expect(html).toContain('autoComplete="current-password"');
    expect(html).toContain('spellCheck="false"');
    expect(html).toContain('aria-label="Mostrar contraseña"');
    expect(html).toContain('aria-pressed="false"');
  });

  it("no deja que quien lo usa lo convierta en un campo de texto", () => {
    const propsConType = { name: "password", type: "text" } as unknown as Parameters<
      typeof InputContrasena
    >[0];

    const html = renderToStaticMarkup(<InputContrasena {...propsConType} />);

    expect(html).toContain('type="password"');
    expect(html).not.toContain('type="text"');
  });
});