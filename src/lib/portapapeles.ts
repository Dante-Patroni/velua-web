/** Lo mínimo del portapapeles que se usa. Permite probar sin navegador. */
type Portapapeles = Pick<Clipboard, "writeText">;

/**
 * @description Copia un texto al portapapeles. Nunca lanza: el portapapeles
 * solo existe en páginas seguras (https) y el navegador puede negar el permiso,
 * así que quien llama decide qué mostrar si no se pudo.
 * @param texto Texto a copiar.
 * @param portapapeles Dónde copiar. Por defecto, el del navegador.
 * @returns true si se copió, false si no hay portapapeles o falló.
 */
export const copiarAlPortapapeles = async (
  texto: string,
  portapapeles: Portapapeles | undefined = globalThis.navigator?.clipboard,
): Promise<boolean> => {
  if (!portapapeles) return false;

  try {
    await portapapeles.writeText(texto);
    return true;
  } catch {
    return false;
  }
};
