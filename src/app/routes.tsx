import { createBrowserRouter } from "react-router-dom";

import { AdminLayout } from "../components/layout/AdminLayout";
import { TiendaLayout } from "../components/layout/TiendaLayout";
import { AdminTemporal } from "../pages/AdminTemporal";
import { InicioTemporal } from "../pages/InicioTemporal";

export const router = createBrowserRouter([
  {
    element: <TiendaLayout />,
    children: [
      {
        path: "/",
        element: <InicioTemporal />,
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminTemporal />,
      },
    ],
  },
]);