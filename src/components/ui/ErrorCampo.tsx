type ErrorCampoProps = {
  /** Mensaje del campo, o undefined si no hay error. */
  mensaje?: string;
  /** Id del elemento, para enlazarlo con `aria-describedby` del campo. */
  id?: string;
};

/**
 * @description Muestra el mensaje de error de un campo de formulario, si lo
 * hay. El mensaje es el que la API devolvió para ese campo.
 * @param props El mensaje y el id para enlazarlo con el campo.
 * @returns El mensaje, o null si el campo no tiene error.
 */
export function ErrorCampo({ mensaje, id }: ErrorCampoProps) {
  if (!mensaje) return null;

  return (
    <p id={id} className="mt-1 text-sm text-error">
      {mensaje}
    </p>
  );
}
