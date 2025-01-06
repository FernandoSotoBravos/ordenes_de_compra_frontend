"use client";
import * as React from "react";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import MenuList from "@mui/material/MenuList";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Divider from "@mui/material/Divider";
import LockResetIcon from "@mui/icons-material/LockReset";
import {
  Account,
  AccountPreview,
  AccountPreviewProps,
  AccountPopoverFooter,
  SignOutButton,
} from "@toolpad/core/Account";
import { SidebarFooterProps } from "@toolpad/core/DashboardLayout";
import SignUp from "../components/dialogs/SingUp";
import ChangePassword from "../components/dialogs/ChangePassword";

function AccountSidebarPreview(props: AccountPreviewProps & { mini: boolean }) {
  const { handleClick, open, mini } = props;
  return (
    <Stack direction="column" p={0} overflow="hidden">
      <Divider />
      <AccountPreview
        variant={mini ? "condensed" : "expanded"}
        slotProps={{ avatarIconButton: { sx: mini ? { border: "0" } : {} } }}
        handleClick={handleClick}
        open={open}
      />
    </Stack>
  );
}

function SidebarFooterAccountPopover({
  mini,
  setOpenModal,
  setChangePassword,
}: {
  mini: boolean;
  setOpenModal: (value: boolean) => void;
  setChangePassword: (value: boolean) => void;
}) {
  return (
    <Stack direction="column">
      {mini ? <AccountPreview variant="expanded" /> : null}
      <MenuList>
        <Button
          variant="text"
          sx={{ textTransform: "capitalize", display: "flex", mx: "auto" }}
          size="small"
          fullWidth
          startIcon={<LockResetIcon />}
          disableElevation
          onClick={() => setChangePassword(true)}
        >
          Cambiar contraseña
        </Button>
        <Button
          variant="text"
          sx={{ textTransform: "capitalize", display: "flex", mx: "auto" }}
          size="small"
          fullWidth
          startIcon={<AddIcon />}
          disableElevation
          onClick={() => setOpenModal(true)}
        >
          Agregar usuario
        </Button>
      </MenuList>
      <Divider />
      <AccountPopoverFooter>
        <SignOutButton />
      </AccountPopoverFooter>
    </Stack>
  );
}

const createPreviewComponent = (mini: boolean) => {
  function PreviewComponent(props: AccountPreviewProps) {
    return <AccountSidebarPreview {...props} mini={mini} />;
  }
  return PreviewComponent;
};

const createPopoverComponent = (
  mini: boolean,
  setOpenSingUp: (value: boolean) => void,
  setChangePassword: (value: boolean) => void
) => {
  function PopoverComponent() {
    return (
      <SidebarFooterAccountPopover setOpenModal={setOpenSingUp} mini={mini} setChangePassword={setChangePassword} />
    );
  }
  return PopoverComponent;
};

export default function SidebarFooterAccount({ mini }: SidebarFooterProps) {
  const [openSingUp, setOpenSingUp] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const handleClick = (value: boolean) => setOpenSingUp(value);
  const handleClickChangePassword = (value: boolean) => setOpenChangePassword(value);
  const PreviewComponent = React.useMemo(
    () => createPreviewComponent(mini),
    [mini]
  );
  const PopoverComponent = React.useMemo(
    () => createPopoverComponent(mini, handleClick, handleClickChangePassword),
    [mini]
  );
  return (
    <>
      <SignUp open={openSingUp} onClose={handleClick} />
      <ChangePassword open={openChangePassword} onClose={handleClickChangePassword} />
      <Account
        slots={{
          preview: PreviewComponent,
          popoverContent: PopoverComponent,
        }}
        localeText={{
          signOutLabel: "Cerrar sesión",
        }}
        slotProps={{
          popover: {
            transformOrigin: { horizontal: "left", vertical: "top" },
            anchorOrigin: { horizontal: "right", vertical: "bottom" },
            slotProps: {
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: (theme) =>
                    `drop-shadow(0px 2px 8px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.32)"})`,
                  mt: 1,
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    bottom: 10,
                    left: 0,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translate(-50%, -50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            },
          },
        }}
      />
    </>
  );
}

export function ToolbarAccountOverride() {
  return null;
}
