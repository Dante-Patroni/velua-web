import type { RouteObject } from "react-router-dom";

import { TiendaLayout } from "@/components/layout/TiendaLayout";
import {
  cargarTiendaLayout,
  ID_RUTA_TIENDA,
  revalidarTiendaLayout,
} from "@/components/layout/TiendaLayout.action";
import { Cambios } from "@/pages/Legales/Cambios";
import { Privacidad } from "@/pages/Legales/Privacidad";
import { Terminos } from "@/pages/Legales/Terminos";
import { Arrepentimiento } from "@/pages/Tienda/Arrepentimiento";
import { Buscar } from "@/pages/Tienda/Buscar";
import { Carrito } from "@/pages/Tienda/Carrito";
import { Categoria } from "@/pages/Tienda/Categoria";
import { cargarCategoria } from "@/pages/Tienda/Categoria.action";
import { Checkout } from "@/pages/Tienda/Checkout";
import { LaMarca } from "@/pages/Tienda/LaMarca";
import { Pedido } from "@/pages/Tienda/Pedido";
import { Portada } from "@/pages/Tienda/Portada";
import { cargarPortada } from "@/pages/Tienda/Portada.action";
import { Producto } from "@/pages/Tienda/Producto";

/**
 * Rama pública, sin autenticación. Las rutas estáticas le ganan a /:categoria
 * por ranking de react-router, así que /carrito nunca se toma como categoría.
 * Por lo mismo, ninguna colección puede usar un slug igual a una ruta fija.
 */
export const rutasTienda: RouteObject[] = [
  {
    id: ID_RUTA_TIENDA,
    Component: TiendaLayout,
    loader: cargarTiendaLayout,
    shouldRevalidate: revalidarTiendaLayout,
    children: [
      { index: true, Component: Portada, loader: cargarPortada },
      { path: ":categoria", Component: Categoria, loader: cargarCategoria },
      { path: "productos/:slug", Component: Producto },
      { path: "buscar", Component: Buscar },
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
