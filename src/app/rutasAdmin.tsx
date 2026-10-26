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
    path: "admin/salir",
    lazy: async () => {
      const { accionSalir, cargarSalir } = await import("@/pages/Admin/Salir.action");
      return { loader: cargarSalir, action: accionSalir };
    },
  },
  {
    path: "admin",
    lazy: async () => {
      const [{ AdminLayout }, { authLoader }, { ErrorPanel }] = await Promise.all([
        import("@/components/layout/AdminLayout"),
        import("@/auth/authService"),
        import("@/components/layout/ErrorPanel"),
      ]);
      return { Component: AdminLayout, loader: authLoader, ErrorBoundary: ErrorPanel };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const [{ Pedidos }, { cargarPedidos }] = await Promise.all([
            import("@/pages/Admin/Pedidos"),
            import("@/pages/Admin/Pedidos.action"),
          ]);
          return { Component: Pedidos, loader: cargarPedidos };
        },
      },
      {
        path: "pedidos/:id",
        lazy: async () => {
          const [{ Pedido }, { cargarPedido }] = await Promise.all([
            import("@/pages/Admin/Pedido"),
            import("@/pages/Admin/Pedido.action"),
          ]);
          return { Component: Pedido, loader: cargarPedido };
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
        path: "mi-cuenta",
        lazy: async () => {
          const [{ MiCuenta }, { accionMiCuenta }] = await Promise.all([
            import("@/pages/Admin/MiCuenta"),
            import("@/pages/Admin/MiCuenta.action"),
          ]);
          return { Component: MiCuenta, action: accionMiCuenta };
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
