import type { Navigation } from "react-router-dom";
import { Form } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { botonAvisoDeshabilitado } from "@/pages/Tienda/Pedido.utils";

type YaTransferiProps = {
  /** `useNavigation().state`: decide si el botón queda deshabilitado mientras viaja el aviso. */
  estado: Navigation["state"];
};

/**
 * @description Botón "Ya transferí". Envía el formulario de la página del
 * pedido con la intención de avisar; la action llama a la API. Se deshabilita
 * mientras viaja la petición para no mandar el aviso dos veces.
 * @param props Estado de la navegación.
 * @returns El formulario con el botón.
 */
export function YaTransferi({ estado }: YaTransferiProps) {
  return (
    <Form method="post" className="mt-6">
      <input type="hidden" name="intencion" value="avisar" />
      <Button type="submit" disabled={botonAvisoDeshabilitado(estado)} className="h-13 w-full md:w-auto md:px-12">
        {botonAvisoDeshabilitado(estado) ? "Avisando…" : "Ya transferí"}
      </Button>
    </Form>
  );
}
