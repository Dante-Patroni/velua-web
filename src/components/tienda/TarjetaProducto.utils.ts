/**
 * @description Decide si se muestra la oferta: solo si hay precio anterior y es
 * mayor que el actual. Sin esta guarda aparecen ofertas de cero pesos. Los
 * importes se convierten a número solo para comparar, nunca para operar.
 * @param precio Precio actual, como cadena decimal.
 * @param precioAnterior Precio anterior, si existe.
 * @returns true si corresponde mostrar la oferta.
 */
export const hayOferta = (precio: string, precioAnterior?: string | null): boolean => {
  if (!precioAnterior?.trim() || !precio.trim()) return false;

  const actual = Number(precio);
  const anterior = Number(precioAnterior);

  if (!Number.isFinite(actual) || !Number.isFinite(anterior)) return false;

  return anterior > actual;
};

/**
 * @description Mensaje que se precarga en WhatsApp cuando una clienta pide que
 * le avisen al volver el stock. Nombra el producto para que la marca sepa a
 * quién avisar sin preguntar.
 * @param nombre Nombre del producto agotado.
 * @returns El texto del mensaje.
 */
export const mensajeAvisarme = (nombre: string): string =>
  `Hola, quiero que me avisen cuando vuelva a haber ${nombre}.`;
