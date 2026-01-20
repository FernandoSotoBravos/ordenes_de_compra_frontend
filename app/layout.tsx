import * as React from "react";
import { AppProvider } from "@toolpad/core/nextjs";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import type { Navigation } from "@toolpad/core/AppProvider";
import { SessionProvider, signIn, signOut } from "next-auth/react";
import theme from "../theme";
import { auth } from "../auth";
import LogoImg from "./components/logo";
import PermissionGuard from "./components/PermissionGuard";

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

  let NAVIGATION: Navigation = [
    {
      kind: "header",
      title: "Menu",
    },
    {
      segment: "requi",
      title: "Requisiciones",
      children: [
        { segment: "create", title: "Crear nueva requisicion de compra" },
        { segment: "list", title: "Listado de requisiciones" },
      ],
    },
    {
      segment: "orders",
      title: "Ordenes",
      children: [
        { segment: "create", title: "Crear nueva orden de pago" },
        { segment: "list", title: "Listado de ordenes" },
      ],
    },
    {
      segment: "catalogs",
      title: "Catalogos",
      children: [
        { segment: "departments", title: "Departamentos" },
        { segment: "areas", title: "Areas" },
        { segment: "suppliers", title: "Proveedores" },
        { segment: "concepts", title: "Conceptos" },
      ],
    },
  ];

  const role = session?.user?.role as number;

  if (role === 4) {
    NAVIGATION = NAVIGATION.filter(
      (nav) => !("segment" in nav) || nav.segment !== "catalogs"
    );

    NAVIGATION = NAVIGATION.map((item) => {
      if ("children" in item && item.children) {
        return {
          ...item,
          children: item.children.filter(
            (child) => !("segment" in child) || child.segment !== "create"
          ),
        };
      }
      return item;
    });
  }

  if ([2, 3].includes(role)) {
    NAVIGATION = NAVIGATION.filter(
      (nav) => !("segment" in nav) || nav.segment !== "catalogs"
    );
  }

  if ([2, 3].includes(role)) {
    NAVIGATION = NAVIGATION.filter(
      (nav) => !("segment" in nav) || nav.segment !== "orders"
    );
  }

  if (role === 6) {
    NAVIGATION = NAVIGATION.map((item) => {
      if ("children" in item && item.children) {
        return {
          ...item,
          children: item.children.filter(
            (child) => !("segment" in child) || child.segment !== "create"
          ),
        };
      }
      return item;
    });
  }

  return (
    <html lang="en" data-toolpad-color-scheme="light">
      <body>
        <SessionProvider session={session}>
          <PermissionGuard />

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
