import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { VarianteAdmin } from "@/types";

type Props = {
  /** Prefijo de los campos. Al crear es "variantes.0.", al editar es vacío. */
  prefijo?: string;
  /** Valores iniciales, cuando la variante ya existe. */
  variante?: VarianteAdmin;
  /** Avisa el precio para que la vista previa lo refleje. Solo la primera variante. */
  alCambiarPrecio?: (precio: string, anterior: string) => void;
  details?: Record<string, string>;
};

/**
 * @description Muestra el error de un campo de variante, si la API devolvió uno.
 *
 * Al crear, el backend nombra los campos con la posición: `variantes[1].precio`.
 * Al editar es solo `precio`. Por eso se prueban las dos formas.
 *
 * @param props Datos del error.
 * @param props.details Errores por campo que devolvió la API.
 * @param props.prefijo Prefijo de los campos del formulario.
 * @param props.campo Nombre del campo.
 * @returns El mensaje, o null si ese campo no tiene error.
 */
function ErrorVariante({
  details,
  prefijo,
  campo,
}: {
  details?: Record<string, string>;
  prefijo: string;
  campo: string;
}) {
  // "variantes.2." del formulario equivale a "variantes[2]." en la respuesta
  const indice = prefijo.match(/^variantes\.(\d+)\.$/)?.[1];
  const conIndice = indice !== undefined ? `variantes[${indice}].${campo}` : null;

  const mensaje = details?.[campo] ?? (conIndice ? details?.[conIndice] : undefined);
  if (!mensaje) return null;

  return (
    <p role="alert" className="mt-1 text-sm text-error">
      {mensaje}
    </p>
  );
}

/**
 * @description Campos de una variante: presentación, precio, precio anterior,
 * stock y código. Los mismos sirven para crear y para editar; lo que cambia es
 * el prefijo de los nombres y quién los envuelve.
 *
 * El precio va como texto con teclado numérico, nunca `type="number"`: acá se
 * escribe con coma, y un input numérico la rechaza o la interpreta distinto
 * según la configuración del sistema. El valor viaja tal cual y lo normaliza
 * el backend.
 *
 * @param props Prefijo, valores iniciales, avisador de precio y errores.
 * @returns Los campos de la variante.
 */
export function CamposVariante({
  prefijo = "",
  variante,
  alCambiarPrecio,
  details,
}: Props) {
  const campo = (nombre: string) => `${prefijo}${nombre}`;
  const id = (nombre: string) => `${prefijo}${nombre}`.replace(/\./g, "-");

  /**
   * @description Lee los dos precios del formulario y los informa hacia afuera.
   * @param e Evento del input que cambió.
   * @returns Nada.
   */
  const informarPrecio = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!alCambiarPrecio) return;

    const formulario = e.target.form;
    const leer = (nombre: string) =>
      (formulario?.elements.namedItem(campo(nombre)) as HTMLInputElement | null)?.value ?? "";

    alCambiarPrecio(leer("precio"), leer("precioAnterior"));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor={id("nombre")}>Presentación</Label>
        <Input
          id={id("nombre")}
          name={campo("nombre")}
          required
          maxLength={80}
          defaultValue={variante?.nombre ?? ""}
          placeholder="100 g"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-texto-tenue">
          El tamaño o la presentación. Si el producto viene en uno solo, poné
          &quot;Único&quot;.
        </p>
        <ErrorVariante details={details} prefijo={prefijo} campo="nombre" />
      </div>

      <div>
        <Label htmlFor={id("precio")}>Precio</Label>
        <Input
          id={id("precio")}
          name={campo("precio")}
          required
          type="text"
          inputMode="decimal"
          defaultValue={variante?.precio ?? ""}
          placeholder="8500"
          className="mt-1"
          onChange={informarPrecio}
        />
        <ErrorVariante details={details} prefijo={prefijo} campo="precio" />
      </div>

      <div>
        <Label htmlFor={id("precioAnterior")}>Precio anterior</Label>
        <Input
          id={id("precioAnterior")}
          name={campo("precioAnterior")}
          type="text"
          inputMode="decimal"
          defaultValue={variante?.precioAnterior ?? ""}
          placeholder="Solo si está en oferta"
          className="mt-1"
          onChange={informarPrecio}
        />
        <p className="mt-1 text-xs text-texto-tenue">
          Tiene que ser mayor que el precio actual. Dejalo vacío si no hay oferta.
        </p>
        <ErrorVariante details={details} prefijo={prefijo} campo="precioAnterior" />
      </div>

      <div>
        <Label htmlFor={id("stock")}>Stock</Label>
        <Input
          id={id("stock")}
          name={campo("stock")}
          type="text"
          inputMode="numeric"
          defaultValue={variante?.stock ?? 0}
          placeholder="0"
          className="mt-1"
        />
        <ErrorVariante details={details} prefijo={prefijo} campo="stock" />
      </div>

      <div>
        <Label htmlFor={id("sku")}>Código</Label>
        <Input
          id={id("sku")}
          name={campo("sku")}
          maxLength={60}
          defaultValue={variante?.sku ?? ""}
          placeholder="Opcional"
          className="mt-1 font-mono text-sm"
        />
        <ErrorVariante details={details} prefijo={prefijo} campo="sku" />
      </div>
    </div>
  );
}
