"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function PermissionGuard() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const role = session.user.role as number;
    const path = window.location.pathname;

    const NO_CREATE = [2, 3, 4, 6, 7];
    const NO_ORDERS = [2, 3];
    const NO_CATALOGS = [2, 3, 4];

    if (
      (path.startsWith("/orders/create") ||
        path.startsWith("/requi/create")) &&
      NO_CREATE.includes(role)
    ) {
      window.location.href = "/403";
      return;
    }

    if (path.startsWith("/orders") && NO_ORDERS.includes(role)) {
      window.location.href = "/403";
      return;
    }

    if (path.startsWith("/catalogs") && NO_CATALOGS.includes(role)) {
      window.location.href = "/403";
      return;
    }
  }, [session]);

  return null;
}
