import { AlertDialog } from "@base-ui/react/alert-dialog";

import { Button } from "@/components/ui/Button";

type VaciarCarritoProps = {
  /** Se llama solo si la clienta confirma. */
  onVaciar: () => void;
};

/**
 * @description Enlace secundario "Vaciar carrito" con confirmación. No vacía
 * al primer toque: abre un diálogo ("¿Vaciar el carrito? Se van a quitar todos
 * los productos.") con Vaciar y Cancelar. El diálogo atrapa el foco y se cierra
 * con Escape. No llama a la API: el carrito es estado del navegador.
 * @param props `onVaciar`, que corre únicamente al confirmar.
 * @returns El enlace y su diálogo de confirmación.
 */
export function VaciarCarrito({ onVaciar }: VaciarCarritoProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger render={<Button variante="enlace" className="text-sm" />}>
        Vaciar carrito
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-tinta/40" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-borde bg-crema-clara p-6 shadow-xl outline-none">
          <AlertDialog.Title className="font-display text-3xl font-medium text-tinta">
            ¿Vaciar el carrito?
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-texto-suave">
            Se van a quitar todos los productos.
          </AlertDialog.Description>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialog.Close render={<Button variante="secundario" />}>Cancelar</AlertDialog.Close>
            <AlertDialog.Close render={<Button />} onClick={onVaciar}>
              Vaciar
            </AlertDialog.Close>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
