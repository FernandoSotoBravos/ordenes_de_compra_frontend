import { use, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import {
  CardContent,
  CardHeader,
  Dialog,
  InputLabel,
  Select,
} from "@mui/material";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";
import { SelectRole } from "@/app/interfaces/Roles.interface";
import { areaService } from "@/app/api/areaService";
import { departmentService } from "@/app/api/departmentService";
import { useDialogs, useSession } from "@toolpad/core";
import { userService } from "@/app/api/userService";
import { CustomSession } from "@/app/interfaces/Session.interface";

export interface ChangePasswordProps {
  open: boolean;
  onClose: (value: boolean) => void;
}

export default function ChangePassword({ open, onClose }: ChangePasswordProps) {
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const session = useSession<CustomSession>();
  const dialogs = useDialogs();

  const validateInputs = () => {
    const password = document.getElementById("password") as HTMLInputElement;
    let isValid = true;

    if (!password.value || password.value.length < 8) {
      setPasswordError(true);
      setPasswordErrorMessage(
        "La contraseña debe tener al menos 8 caracteres, un número, una mayúscula y una minúscula."
      );
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordError) return;

    const idUser = session?.user?.id;
    const token = session?.user?.access_token;
    if (!idUser) {
      dialogs.alert("Error: Usuario no identificado");
      return;
    }

    const data = new FormData(event.currentTarget);

    userService
      .updatePasswordMe(token as string, data.get("password") as string)
      .then((response) => {
        dialogs.alert("Contraseña actualizada correctamente");
        onClose(false);
        window.location.href = "/auth/signin";
      })
      .catch((error) => {
        dialogs.alert(`Error al actualizar la contraseña ${error}`);
      });
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(false)}>
      <Card variant="outlined">
        <CardHeader title="Actualizar contrasenia" />
        <Divider />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="password">Nuevo Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Cambiar contraseña
            </Button>
          </Box>
        </CardContent>
        <Divider />
      </Card>
    </Dialog>
  );
}
