import { useEffect, useMemo, useState } from "react";
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
  SelectChangeEvent,
} from "@mui/material";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";
import { SelectRole } from "@/app/interfaces/Roles.interface";
import { areaService } from "@/app/api/areaService";
import { departmentService } from "@/app/api/departmentService";
import { roleservice } from "@/app/api/roleService";
import { useDialogs } from "@toolpad/core";
import { userService } from "@/app/api/userService";
import { useSession } from "@toolpad/core";
import { CustomSession } from "@/app/interfaces/Session.interface";

export interface SignUpProps {
  open: boolean;
  onClose: (value: boolean) => void;
}

export default function SignUp({ open, onClose }: SignUpProps) {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [areaError, setAreaError] = useState(false);
  const [areaErrorMessage, setAreaErrorMessage] = useState("");
  const [departmentError, setDepartmentError] = useState(false);
  const [departmentErrorMessage, setDepartmentErrorMessage] = useState("");
  const [roleError, setRoleError] = useState(false);
  const [roleErrorMessage, setRoleErrorMessage] = useState("");
  const [departments, setDepartments] = useState<SelectBase[]>([]);
  const [roles, setRoles] = useState<SelectRole[]>([]);
  const [areas, setAreas] = useState<SelectBase[]>([]);
  const [area, setArea] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const dialog = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;

  useEffect(() => {
    departmentService.getAll(token as string).then((response) => {
      setDepartments(response);
    });

    roleservice
      .getAll(token as string)
      .then((response) => {
        setRoles(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const name = document.getElementById("name") as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Por favor ingrese un email válido.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

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

    if (!name.value || name.value.length < 1) {
      setNameError(true);
      setNameErrorMessage("El nombre es requerido.");
      isValid = false;
    } else {
      setNameError(false);
      setNameErrorMessage("");
    }

    if (!area) {
      setAreaError(true);
      setAreaErrorMessage("Área es requerida.");
      isValid = false;
    } else {
      setAreaError(false);
      setAreaErrorMessage("");
    }

    if (!department) {
      setDepartmentError(true);
      setDepartmentErrorMessage("Departamento es requerido.");
      isValid = false;
    } else {
      setDepartmentError(false);
      setDepartmentErrorMessage("");
    }

    if (!role) {
      setDepartmentError(true);
      setDepartmentErrorMessage("Rol es requerido.");
      isValid = false;
    } else {
      setDepartmentError(false);
      setDepartmentErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (
      nameError ||
      emailError ||
      passwordError ||
      areaError ||
      departmentError ||
      roleError
    ) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);
    userService
      .create({
        fullname: data.get("name") as string,
        username: data.get("email") as string,
        email: data.get("email") as string,
        password_hash: data.get("password") as string,
        department_id: parseInt(data.get("department") as string),
        area_id: parseInt(data.get("area") as string),
        role_id: parseInt(data.get("role") as string),
        created_by: 1,
      })
      .then((response) => {
        dialog.alert("Usuario creado exitosamente", {
          title: "Usuario creado",
        });
      })
      .catch((error) => {
        dialog.alert(`Error al crear el usuario: ${error}`);
      });
  };

  const handleChangeDepartment = (event: SelectChangeEvent<string>) => {
    if (!event.target.value) {
      return;
    }

    setDepartment(event.target.value as string);
    areaService
      .getByDepartment(token as string, parseInt(event.target.value))
      .then((response) => {
        setAreas(response);
      })
      .catch((error) => {
        dialog.alert("Ha fallado al traer las areas del departamento " + error);
        return;
      });
  };

  const handleClose = () => {
    setAreas([]);
    setDepartments([]);
    setRoles([]);
    onClose(false);
  };

  return (
    <Dialog fullWidth open={open} onClose={handleClose}>
      <Card variant="outlined">
        <CardHeader title="Registrar nuevo usuario" />
        <Divider />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name">Nombre Completo</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Nombre"
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={emailError}
                helperText={emailErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
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
            <FormControl fullWidth>
              <InputLabel id="departamento-label">Departamentos</InputLabel>
              <Select
                labelId="departamento-label"
                id="department"
                name="department"
                error={departmentError}
                required
                onChange={handleChangeDepartment}
                defaultValue={""}
              >
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {areas.length > 0 && (
              <FormControl fullWidth>
                <InputLabel id="area-concepto-label">Áreas</InputLabel>
                <Select
                  labelId="area-concepto-label"
                  id="area"
                  name="area"
                  error={areaError}
                  required
                  onChange={(e) => setArea(e.target.value as string)}
                  defaultValue={""}
                >
                  {areas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth>
              <InputLabel id="rol-label">Rol</InputLabel>
              <Select
                labelId="rol-label"
                id="role"
                name="role"
                error={roleError}
                required
                onChange={(e) => setRole(e.target.value as string)}
                defaultValue={""}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              Crear usuario
            </Button>
          </Box>
        </CardContent>
        <Divider />
      </Card>
    </Dialog>
  );
}
