import type { RouteObject } from "react-router-dom";

import { TiendaLayout } from "@/components/layout/TiendaLayout";
import { Cambios } from "@/pages/Legales/Cambios";
import { Privacidad } from "@/pages/Legales/Privacidad";
import { Terminos } from "@/pages/Legales/Terminos";
import { Arrepentimiento } from "@/pages/Tienda/Arrepentimiento";
import { Carrito } from "@/pages/Tienda/Carrito";
import { Categoria } from "@/pages/Tienda/Categoria";
import { Checkout } from "@/pages/Tienda/Checkout";
import { LaMarca } from "@/pages/Tienda/LaMarca";
import { Pedido } from "@/pages/Tienda/Pedido";
import { Portada } from "@/pages/Tienda/Portada";
import { Producto } from "@/pages/Tienda/Producto";

/**
 * Rama pública, sin autenticación. Las rutas estáticas le ganan a /:categoria
 * por ranking de react-router, así que /carrito nunca se toma como categoría.
 */
export const rutasTienda: RouteObject[] = [
  {
    Component: TiendaLayout,
    children: [
      { index: true, Component: Portada },
      { path: ":categoria", Component: Categoria },
      { path: "productos/:slug", Component: Producto },
      { path: "carrito", Component: Carrito },
      { path: "checkout", Component: Checkout },
      { path: "pedido/:numero", Component: Pedido },
      { path: "la-marca", Component: LaMarca },
      { path: "arrepentimiento", Component: Arrepentimiento },
      { path: "terminos", Component: Terminos },
      { path: "privacidad", Component: Privacidad },
      { path: "cambios", Component: Cambios },
    ],
  },
];
