import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { atributosContrasena } from "@/components/ui/InputContrasena.utils";


type PropsInputContrasena = Omit<ComponentProps<typeof Input>, "type">;

/**
 * @description Campo de contraseña con un botón para mostrarla u ocultarla.
 * Empieza oculta y vuelve a ocultarse al enviar el formulario. Se puede pegar,
 * para usar un gestor de contraseñas. El type y los atributos del corrector los
 * decide el componente: quien lo usa no los puede pisar.
 * @param props Propiedades del Input, salvo type.
 * @returns El campo con su botón.
 */
export function InputContrasena({ className, id, ...props }: PropsInputContrasena) {
  const [visible, setVisible] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;

  // Al enviar el formulario, la contraseña vuelve a ocultarse.
  useEffect(() => {
    const formulario = contenedor.current?.closest("form");
    if (!formulario) return;

    const ocultar = () => setVisible(false);
    formulario.addEventListener("submit", ocultar);
    return () => formulario.removeEventListener("submit", ocultar);
  }, []);

  return (
    <div ref={contenedor} className="relative">
      <Input
        {...props}
        id={idCampo}
        {...atributosContrasena(visible)}
        className={cn("pr-12", className)}
      />
      <Button
        type="button"
        variante="fantasma"
        tamano="icono"
        className="absolute inset-y-0 right-0"
        onClick={() => setVisible((actual) => !actual)}
        aria-controls={idCampo}
        aria-pressed={visible}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-5" />
        ) : (
          <Eye aria-hidden="true" className="size-5" />
        )}
      </Button>
    </div>
  );
}