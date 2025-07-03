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

const AUTHENTICATION = {
  signIn,
  signOut,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  let NAVIGATION: Navigation = [
    {
      kind: "header",
      title: "Menu",
    },
    {
      title: "Dashboard",
      icon: <DashboardIcon />,
    },
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
        {
          segment: "edit",
          title: "Editar requisicion",
          pattern: "edit/:id",
        },
      ],
    },
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
        {
          segment: "edit",
          title: "Editar orden",
          pattern: "edit/:id",
        },
      ],
    },
    {
      segment: "catalogs",
      title: "Catalogos",
      icon: <PostAddIcon />,
      children: [
        {
          segment: "departments",
          title: "Departamentos",
        },
        {
          segment: "areas",
          title: "Areas",
        },
        {
          segment: "suppliers",
          title: "Proveedores",
        },
        {
          segment: "concepts",
          title: "Conceptos",
        },
        // {
        //   segment: "products",
        //   title: "Productos"
        // }
      ],
    },
  ];

  // si no es usuario de compras eliminar catalogos y ordenes
  //
  if ([2, 3, 4].includes(session?.user?.role as number)) {
    // @ts-ignore
    NAVIGATION = NAVIGATION.filter((nav) => nav.segment != "catalogs");
  }

  if ([2, 3, 4].includes(session?.user?.role as number)) {
    // @ts-ignore
    NAVIGATION = NAVIGATION.filter((nav) => nav.segment != "orders");
  }

  if ([6].includes(session?.user?.role as number)) {
    // @ts-ignore
    NAVIGATION = NAVIGATION.filter((nav) => nav.segment != "requi");
  }

  return (
    <html lang="en" data-toolpad-color-scheme="light">
      <body>
        <SessionProvider session={session}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppProvider
              theme={theme}
              navigation={NAVIGATION}
              branding={{ title: "FC Bravos de Juárez" }}
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
