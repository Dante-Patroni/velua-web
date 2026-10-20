import { Button } from "@/components/ui/Button";
import { MENSAJES_AVISO, WHATSAPP_NUMERO } from "@/lib/mappings";
import { enlaceWhatsApp } from "@/lib/utils";
import { mensajeMasUnidades } from "@/carrito/cotizacion.utils";
import type { AvisoCotizacion } from "@/types";

const claseEnlaceAccion =
  "font-bold text-dorado-texto underline decoration-dorado-hondo decoration-2 underline-offset-4 hover:text-tinta";

type AvisosCarritoProps = {
  avisos: AvisoCotizacion[];
  onDescartar: () => void;
};

/**
 * @description Lista de lo que cambió en el carrito según la cotización
 * (producto sin stock, Próximamente, cantidad ajustada). Los textos salen del
 * mapa de avisos, por motivo. Si se bajó la cantidad por el tope por compra,
 * ofrece escribir por WhatsApp. Se usa en el carrito y en el checkout.
 * @param props Los avisos y qué hacer al descartarlos.
 * @returns El bloque de avisos, o null si no hay ninguno.
 */
export function AvisosCarrito({ avisos, onDescartar }: AvisosCarritoProps) {
  if (avisos.length === 0) return null;

  return (
    <div
      role="status"
      className="mt-6 flex flex-col gap-3 rounded-2xl border border-borde bg-crema-calida p-4 md:p-5"
    >
      <ul className="flex flex-col gap-2 text-tinta">
        {avisos.map((aviso, indice) => {
          const enlaceTope =
            aviso.motivo === "AJUSTADO_POR_TOPE"
              ? enlaceWhatsApp(WHATSAPP_NUMERO, mensajeMasUnidades(aviso.producto))
              : null;

          return (
            <li key={`${aviso.varianteId}-${aviso.motivo}-${indice}`}>
              {MENSAJES_AVISO[aviso.motivo](aviso)}
              {enlaceTope && (
                <>
                  {" "}
                  <a href={enlaceTope} target="_blank" rel="noopener noreferrer" className={claseEnlaceAccion}>
                    Escribinos por WhatsApp
                  </a>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <Button variante="enlace" className="self-start text-sm" onClick={onDescartar}>
        Entendido
      </Button>
    </div>
  );
}
