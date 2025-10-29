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
import { DialogProps } from "@toolpad/core/useDialogs";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";
import { useDialogs, useSession } from "@toolpad/core";
import CurrencyInput from "../CurrencyInput";

export interface ResultTaxes {
  value: string;
  name: string;
}

export default function AddTaxes({
  payload,
  open,
  onClose,
}: DialogProps<SelectBase[], ResultTaxes | null>) {
  const [formValues, setFormValues] = useState({
    value: "",
    name: "",
    is_deduction: false,
    id: undefined,
  });
  const dialogs = useDialogs();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formValues.name === "" || !formValues.value) {
      dialogs.alert("Por favor, complete todos los campos requeridos.", {
        title: "Error",
      });
      return;
    }

    const numericValue = parseFloat(formValues.value);

    if (isNaN(numericValue)) {
      dialogs.alert("Por favor, ingrese un número válido.", {
        title: "Error",
      });
      return;
    }

    if (numericValue < 0) {
      dialogs.alert("El monto no puede ser negativo.", { title: "Error" });
      return;
    }

    onClose(formValues);
  };

  const handleChangeValueN = (e: any) => {
    setFormValues({
      ...formValues,
      value: e,
    });
  };

  const handleChangeValue = (e: any) => {
    const selectedTax = payload.find((t) => t.name === e.target.value);
    setFormValues({
      ...formValues,
      name: e.target.value,
      is_deduction: selectedTax?.is_deduction ?? false,
      id: selectedTax?.id,
    });
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <Card variant="outlined">
        <CardHeader title="Agregar ajuste fiscal" />
        <Divider />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl fullWidth>
              <InputLabel id="tax-label">Ajustes</InputLabel>
              <Select
                labelId="tax-label"
                id="tax"
                name="tax"
                value={formValues.name}
                onChange={handleChangeValue}
                disabled={payload.length === 0}
              >
                {payload.map((tax) => (
                  <MenuItem key={tax.id} value={tax.name}>
                    {tax.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <CurrencyInput
              label="Monto"
              value={formValues.value}
              onChange={handleChangeValueN}
              width="100%"
              disabled={formValues.name === ""}
            />
            {/* <TextField
              label="Monto"
              type="number"
              variant="outlined"
              name="amount"
              value={formValues.value}
              onChange={handleChangeValueN}
              fullWidth
              required
              disabled={formValues.name === ""}
            /> */}

            <Button type="submit" fullWidth variant="contained">
              Agregar Ajuste Fiscal
            </Button>
          </Box>
        </CardContent>
        <Divider />
      </Card>
    </Dialog>
  );
}
