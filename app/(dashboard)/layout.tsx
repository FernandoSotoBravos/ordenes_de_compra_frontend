"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import Copyright from "../components/Copyright";
import SidebarFooterAccount, {
  ToolbarAccountOverride,
} from "./SidebarFooterAccount";
import { useNotifications } from "@toolpad/core/useNotifications";
import { useSession } from "@toolpad/core";
import { NotificationsProvider } from "@toolpad/core/useNotifications";
import { CustomSession } from "../interfaces/Session.interface";
const BaseURLSocket = "wss://notification.fcbravos.com";

export default function Layout(props: { children: React.ReactNode }) {
  const notification = useNotifications();
  const router = useRouter();
  const session = useSession<CustomSession>();

  const {
    role,
    is_admin,
    is_leader_department,
    is_leader_area,
    area,
    department,
    id
  } = session?.user || {};

  const notify = (message: string) => {
    notification.show(message, {
      severity: "info",
      autoHideDuration: 5000,
    });

    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };

  // React.useEffect(() => {
  //   const socket = new WebSocket(BaseURLSocket + "/ws");

  //   socket.onmessage = (event) => {
  //     const jsonData = JSON.parse(event.data);

  //     const message = jsonData.message;
  //     const { to, from, type } = jsonData.options;

  //     const targetArea = to.area ? parseInt(to.area, 10) : null;
  //     const targetDepartment = to.department
  //       ? parseInt(to.department, 10)
  //       : null;

  //     const userArea = area ? parseInt(area as string, 10) : null;
  //     const userDepartment = department
  //       ? parseInt(department as string, 10)
  //       : null;

  //     const isLeaderOfArea = is_leader_area && userArea === targetArea;
  //     const isLeaderOfDepartment =
  //       is_leader_department && userDepartment === targetDepartment;

  //     if (is_admin) {
  //       notify(message);
  //       return;
  //     }

  //     if (type === "danger" && to.user == id) {
  //       notify(message);
  //       return;
  //     }

  //     if (role === to.role && [2, 3].includes(from.role)) {
  //       notify(message);
  //       return;
  //     }

  //     if (role === to.role && from.role == 6) {
  //       notify(message);
  //       return;
  //     }

  //     if (is_leader_area && !isLeaderOfArea) {
  //       return;
  //     }

  //     if (is_leader_department && !isLeaderOfDepartment) {
  //       return;
  //     }

  //     if (role !== to.role) {
  //       return;
  //     }
      
  //     notify(message);
  //   };

  //   return () => socket.close();
  // }, []);

  return (
    <NotificationsProvider>
      <DashboardLayout
        slots={{
          toolbarAccount: ToolbarAccountOverride,
          sidebarFooter: SidebarFooterAccount,
        }}
      >
        {/* ignore error
        @ts-ignore */}
        <PageContainer maxWidth="fixed">
          {props.children}
          <Copyright sx={{ my: 4 }} />
        </PageContainer>
      </DashboardLayout>
    </NotificationsProvider>
  );
}
