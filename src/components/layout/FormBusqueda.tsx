import { useId } from "react";
import { Form } from "react-router-dom";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type FormBusquedaProps = {
  /** Se llama al enviar, por ejemplo para cerrar el panel que lo contiene. */
  alBuscar?: () => void;
  autoFocus?: boolean;
};

/**
 * @description Buscador de la tienda. Navega a /buscar?q= con un Form de
 * react-router por GET: la búsqueda queda en la URL y se puede compartir.
 * @param props Callback al enviar y si toma el foco al aparecer.
 * @returns El formulario de búsqueda.
 */
export function FormBusqueda({ alBuscar, autoFocus }: FormBusquedaProps) {
  const id = useId();

  return (
    <Form action="/buscar" method="get" role="search" onSubmit={alBuscar} className="flex gap-2">
      <Label htmlFor={id} className="sr-only">
        Buscar en la tienda
      </Label>
      <Input
        id={id}
        name="q"
        type="search"
        required
        autoFocus={autoFocus}
        placeholder="Buscar jabones, aromas, ingredientes"
        enterKeyHint="search"
      />
      <Button type="submit" variante="primario" tamano="icono" aria-label="Buscar">
        <Search strokeWidth={1.5} aria-hidden />
      </Button>
    </Form>
  );
}
