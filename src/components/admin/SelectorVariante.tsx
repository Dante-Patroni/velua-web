import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { obtenerProducto } from "@/lib/api/catalogoAdmin.api";
import { formatearPrecio } from "@/lib/formato";
import { mensajeDeError } from "@/lib/mappings";
import type { ProductoAdmin, ProductoAdminFila } from "@/types";

type SelectorVarianteProps = {
  /** Productos activos que se ofrecen. */
  productos: readonly ProductoAdminFila[];
  /** Se llama con la variante, la cantidad y cómo nombrarla en la lista de la venta. */
  onAgregar: (varianteId: number, cantidad: number, etiqueta: string) => void;
};

/**
 * @description Elige un producto, una de sus variantes activas y una cantidad, y
 * la agrega a la venta. Los precios y el stock que se ven acá son informativos:
 * el precio real de la venta y el stock los decide la API al cotizar. Los
 * campos no llevan `name` y el componente va fuera del formulario de la venta:
 * una tecla Enter acá no registra nada.
 * @param props Productos y qué hacer al agregar.
 * @returns El selector.
 */
export function SelectorVariante({ productos, onAgregar }: SelectorVarianteProps) {
  const [productoId, setProductoId] = useState("");
  const [ficha, setFicha] = useState<ProductoAdmin | null>(null);
  const [errorFicha, setErrorFicha] = useState<string | null>(null);
  const [varianteId, setVarianteId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  useEffect(() => {
    const id = Number(productoId);

    if (productoId === "" || !Number.isSafeInteger(id)) return;

    const controlador = new AbortController();

    obtenerProducto(id, controlador.signal)
      .then((producto) => {
        setErrorFicha(null);
        setFicha(producto);
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return;
        setFicha(null);
        setErrorFicha(mensajeDeError(error, "venta"));
      });

    return () => controlador.abort();
  }, [productoId]);

  // Solo se ofrece la ficha del producto elegido: si se cambió de producto y la
  // nueva todavía no llegó, no se muestran las variantes del anterior.
  const fichaVigente = ficha && String(ficha.id) === productoId ? ficha : null;
  const variantes = (fichaVigente?.variantes ?? []).filter((variante) => variante.activa);
  const variante = variantes.find((v) => String(v.id) === varianteId);
  const unidades = Number(cantidad);
  const puedeAgregar =
    fichaVigente !== null &&
    variante !== undefined &&
    variante.stock > 0 &&
    Number.isSafeInteger(unidades) &&
    unidades > 0;

  const elegirProducto = (valor: string) => {
    setProductoId(valor);
    setFicha(null);
    setErrorFicha(null);
    setVarianteId("");
  };

  const agregar = () => {
    if (!puedeAgregar || !fichaVigente) return;

    onAgregar(variante.id, unidades, `${fichaVigente.nombre} · ${variante.nombre}`);
    setCantidad("1");
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label htmlFor="selector-producto">Producto</Label>
        <Select
          id="selector-producto"
          value={productoId}
          onChange={(evento) => elegirProducto(evento.target.value)}
          className="mt-1"
        >
          <option value="">Elegí un producto</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre}
            </option>
          ))}
        </Select>
      </div>

      {errorFicha && (
        <p role="alert" className="text-sm text-error">
          {errorFicha}
        </p>
      )}

      {productoId !== "" && !errorFicha && (
        <div>
          <Label htmlFor="selector-variante">Variante</Label>
          <Select
            id="selector-variante"
            value={varianteId}
            onChange={(evento) => setVarianteId(evento.target.value)}
            disabled={fichaVigente === null}
            className="mt-1"
          >
            <option value="">{fichaVigente === null ? "Cargando…" : "Elegí una variante"}</option>
            {variantes.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock < 1}>
                {v.nombre} · {formatearPrecio(v.precio)} ·{" "}
                {v.stock < 1 ? "sin stock" : `stock ${v.stock}`}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="w-28">
          <Label htmlFor="selector-cantidad">Cantidad</Label>
          <Input
            id="selector-cantidad"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={cantidad}
            onChange={(evento) => setCantidad(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key !== "Enter") return;
              evento.preventDefault();
              agregar();
            }}
            className="mt-1 lining-nums tabular-nums"
          />
        </div>
        <Button type="button" variante="secundario" onClick={agregar} disabled={!puedeAgregar}>
          Agregar a la venta
        </Button>
      </div>
    </div>
  );
}
