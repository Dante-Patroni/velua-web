import type { RouteObject } from "react-router-dom";

/**
 * Rama del panel. Todo se importa con `lazy` de react-router, el mecanismo
 * propio del Data Mode: el layout, el authLoader y cada página quedan en
 * chunks aparte y no entran en el bundle de la tienda.
 *
 * Este archivo no puede tener imports estáticos de código del panel.
 */
export const rutasAdmin: RouteObject[] = [
  {
    path: "admin/login",
    lazy: async () => {
      const { Login } = await import("@/pages/Admin/Login");
      return { Component: Login };
    },
  },
  {
    path: "admin",
    lazy: async () => {
      const [{ AdminLayout }, { authLoader }] = await Promise.all([
        import("@/components/layout/AdminLayout"),
        import("@/auth/authService"),
      ]);
      return { Component: AdminLayout, loader: authLoader };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const { Pedidos } = await import("@/pages/Admin/Pedidos");
          return { Component: Pedidos };
        },
      },
      {
        path: "productos",
        lazy: async () => {
          const { Productos } = await import("@/pages/Admin/Productos");
          return { Component: Productos };
        },
      },
      {
        path: "categorias",
        lazy: async () => {
          const { Categorias } = await import("@/pages/Admin/Categorias");
          return { Component: Categorias };
        },
      },
    ],
  },
];
