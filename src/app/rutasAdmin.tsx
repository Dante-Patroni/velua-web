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
      const [{ Login }, { accionLogin }] = await Promise.all([
        import("@/pages/Admin/Login"),
        import("@/pages/Admin/Login.action"),
      ]);
      return { Component: Login, action: accionLogin };
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
          const [{ Productos }, { cargarProductos, accionProductos }] = await Promise.all([
            import("@/pages/Admin/Productos"),
            import("@/pages/Admin/Productos.action"),
          ]);
          return { Component: Productos, loader: cargarProductos, action: accionProductos };
        },
      },
            {
        path: "categorias",
        lazy: async () => {
          const [{ Categorias }, { cargarCategorias, accionCategorias }] =
            await Promise.all([
              import("@/pages/Admin/Categorias"),
              import("@/pages/Admin/Categorias.action"),
            ]);
          return {
            Component: Categorias,
            loader: cargarCategorias,
            action: accionCategorias,
          };
        },
      },

            {
        path: "productos/nuevo",
        lazy: async () => {
          const [{ Producto }, { cargarFicha, accionFicha }] = await Promise.all([
            import("@/pages/Admin/Producto"),
            import("@/pages/Admin/Producto.action"),
          ]);
          return { Component: Producto, loader: cargarFicha, action: accionFicha };
        },
      },
      {
        path: "productos/:id",
        lazy: async () => {
          const [{ Producto }, { cargarFicha, accionFicha }] = await Promise.all([
            import("@/pages/Admin/Producto"),
            import("@/pages/Admin/Producto.action"),
          ]);
          return { Component: Producto, loader: cargarFicha, action: accionFicha };
        },
      },
    ],
  },
];
