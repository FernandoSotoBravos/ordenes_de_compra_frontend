import * as React from "react";
import { AppProvider } from "@toolpad/core/nextjs";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PostAddIcon from "@mui/icons-material/PostAdd";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import type { Navigation } from "@toolpad/core/AppProvider";
import { SessionProvider, signIn, signOut } from "next-auth/react";
import theme from "../theme";
import { auth } from "../auth";
import LogoImg from "./components/logo";

const AUTHENTICATION = {
  signIn,
  signOut,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  //------------------------------------------------------------------
  // 🚨 HOOK DE PERMISOS (CORRE DEL LADO DEL CLIENTE)
  //------------------------------------------------------------------
  React.useEffect(() => {
    if (!session?.user) return;

    const role = session.user.role as number;
    const path = window.location.pathname;

    const NO_CREATE = [2, 3, 4, 6, 7];
    const NO_ORDERS = [2, 3];
    const NO_CATALOGS = [2, 3, 4];

    // ❌ Bloqueo: crear órdenes o requisiciones
    if (
      (path.startsWith("/orders/create") ||
        path.startsWith("/requi/create")) &&
      NO_CREATE.includes(role)
    ) {
      window.location.href = "/403";
      return;
    }

    // ❌ Bloqueo: módulo de órdenes
    if (path.startsWith("/orders") && NO_ORDERS.includes(role)) {
      window.location.href = "/403";
      return;
    }

    // ❌ Bloqueo: catálogos
    if (path.startsWith("/catalogs") && NO_CATALOGS.includes(role)) {
      window.location.href = "/403";
      return;
    }
  }, [session]);

  //------------------------------------------------------------------
  // 🔽 NAVEGACIÓN TOOLPAD
  //------------------------------------------------------------------

  let NAVIGATION: Navigation = [
    {
      kind: "header",
      title: "Menu",
    },

    // REQUISICIONES
    {
      segment: "requi",
      title: "Requisiciones",
      icon: <ArticleOutlinedIcon />,
      children: [
        {
          segment: "create",
          title: "Crear nueva requisicion de compra",
        },
        {
          segment: "list",
          title: "Listado de requisiciones",
        },
      ],
    },

    // ORDENES
    {
      segment: "orders",
      title: "Ordenes",
      icon: <ShoppingCartIcon />,
      children: [
        {
          segment: "create",
          title: "Crear nueva orden de pago",
        },
        {
          segment: "list",
          title: "Listado de ordenes",
        },
      ],
    },

    // CATÁLOGOS
    {
      segment: "catalogs",
      title: "Catalogos",
      icon: <PostAddIcon />,
      children: [
        { segment: "departments", title: "Departamentos" },
        { segment: "areas", title: "Areas" },
        { segment: "suppliers", title: "Proveedores" },
        { segment: "concepts", title: "Conceptos" },
      ],
    },
  ];

  //------------------------------------------------------------------
  // 🔽 FILTROS DE MENÚ SEGÚN ROL
  //------------------------------------------------------------------

  // Quitar catálogos a 2,3,4
  if ([2, 3, 4].includes(session?.user?.role as number)) {
    NAVIGATION = NAVIGATION.filter((nav) => nav.segment !== "catalogs");
  }

  // Quitar órdenes COMPLETAS a 2 y 3
  if ([2, 3].includes(session?.user?.role as number)) {
    NAVIGATION = NAVIGATION.filter((nav) => nav.segment !== "orders");
  }

  // Quitar crear a controlería (rol 6)
  if (session?.user?.role === 6) {
    NAVIGATION = NAVIGATION.map((item) => ({
      ...item,
      children: item.children?.filter((child) => child.segment !== "create"),
    }));
  }

  return (
    <html lang="en" data-toolpad-color-scheme="light">
      <body>
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppProvider
              theme={theme}
              navigation={NAVIGATION}
              branding={{
                title: "FC JUÁREZ",
                logo: <LogoImg width={40} height={40} />,
              }}
              session={session}
              authentication={AUTHENTICATION}
            >
              {children}
            </AppProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
