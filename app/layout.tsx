import * as React from "react";
import { AppProvider } from "@toolpad/core/nextjs";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PostAddIcon from '@mui/icons-material/PostAdd';
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import type { Navigation } from "@toolpad/core/AppProvider";
import { SessionProvider, signIn, signOut } from "next-auth/react";
import theme from "../theme";
import { auth } from "../auth";

const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "orders",
    title: "Ordenes",
    icon: <ShoppingCartIcon />,
    children: [
      {
        segment: "create",
        title: "Crear nueva orden",
      },
    ],
  },
  {
    "segment": "catalogs",
    "title": "Catalogos",
    "icon": <PostAddIcon />,
    "children": [
      {
        "segment": "departments",
        "title": "Departamentos",
      },
      {
        "segment": "areas",
        "title": "Areas",
      },
      {
        "segment": "suppliers",
        "title": "Proveedores",
      },
      {
        "segment": "concepts",
        "title": "Conceptos",
      },
    ],
  }
];

const AUTHENTICATION = {
  signIn,
  signOut,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

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
