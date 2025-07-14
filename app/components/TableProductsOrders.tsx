import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  MRT_EditActionButtons,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ProductsOrder,
  CRUDTableProps,
  TaxesOrder,
} from "../interfaces/Order.interface";
import { useDialogs, useSession } from "@toolpad/core";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import TaxIcon from "../components/CustomIcons";
import AddTaxes from "./dialogs/AddTaxesOrder";
import { taxService } from "../api/taxService";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { Cancel } from "@mui/icons-material";
import { unitService } from "../api/unitService";
import { SelectDescription } from "../interfaces/SelecteBase.interface";

const CRUDTable = ({
  tableData,
  setTableData,
  isSaving,
  formValues,
  setFormsValue,
}: CRUDTableProps) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [taxes, setTaxes] = useState<TaxesOrder[]>([]);
  const [units, setUnits] = useState<SelectDescription[]>([]);
  const [iva, setIva] = useState(0.0);
  const [total, setTotal] = useState(0.0);
  const [subtotal, setSubtotal] = useState(0.0);
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token || "";

  const fetchUnit = async () => {
    try {
      const response = await unitService.getAll(token, 10, 1);
      setUnits(response);
    } catch (error: any) {
      dialogs.alert("Error al cargar el tipo de unidades: " + error.message, {
        title: "Error",
      });
    }
  };

  useEffect(() => {
    fetchUnit();
  }, []);

  useEffect(() => {
    const newSubtotal = tableData.reduce((acc, row) => acc + row.total, 0);
    const totalTaxes = taxes.reduce((acc, t) => {
      if (["Descuento", "ISR", "Nota de Credito"].includes(t.name)) {
        return acc - t.value;
      }
      return acc + t.value;
    }, 0);
    const newTotal = newSubtotal + iva + totalTaxes;

    setSubtotal(newSubtotal);
    setTotal(newTotal);

    // @ts-ignore
    setFormsValue({
      target: {
        name: "orderTotals",
        value: {
          subtotal: newSubtotal,
          iva,
          total: newTotal,
          taxes,
        },
      },
    });
  }, [tableData, iva, taxes]);

  const columns = useMemo<MRT_ColumnDef<ProductsOrder>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "description",
        header: "Descripción",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.description,
          helperText: validationErrors?.description,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
      {
        accessorKey: "quantity",
        header: "Cantidad",
        muiEditTextFieldProps: {
          required: true,
          type: "number",
          error: !!validationErrors?.quantity,
          helperText: validationErrors?.quantity,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              quantity: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: "unit_id",
        header: "Unidad de medida",
        editVariant: "select",
        Cell: ({ cell }): ReactNode => {
          const unit = units.find((u) => u.id === cell.getValue());
          // @ts-ignore
          return unit ? unit.description : cell.getValue();
        },
        muiEditTextFieldProps: {
          required: true,
          children: units.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {unit.description}
            </MenuItem>
          )),
          select: true,
          error: !!validationErrors?.unit_id,
          helperText: validationErrors?.unit_id,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              unit_id: undefined,
            }),
        },
      },
      {
        accessorKey: "unit_price",
        header: "Precio Unitario",
        Cell: ({ cell }) => {
          const value = cell.getValue() as number;
          return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(value);
        },
        muiEditTextFieldProps: {
          type: "number",
          required: true,
          error: !!validationErrors?.unit_price,
          helperText: validationErrors?.unit_price,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              unit_price: undefined,
            }),
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        enableEditing: false,
        Cell: ({ cell }) => {
          const value = cell.getValue() as number;
          return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(value);
        },
        muiEditTextFieldProps: {
          type: "number",
          // required: true,
          error: !!validationErrors?.total,
          helperText: validationErrors?.total,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              total: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  const handleCreateProduct: MRT_TableOptions<ProductsOrder>["onCreatingRowSave"] =
    async ({ values, table }) => {
      // Validar y agregar el nuevo producto
      const total = values.quantity * values.unit_price;
      const newProduct = { ...values, id: crypto.randomUUID(), total: total };
      const updatedTableData = [...tableData, newProduct];
      setTableData(updatedTableData);
      table.setCreatingRow(null);
    };

  const handleSaveProduct: MRT_TableOptions<ProductsOrder>["onEditingRowSave"] =
    async ({ values, table }) => {
      const total = values.quantity * values.unit_price;

      const updatedTableData = tableData.map((product) =>
        product.id === values.id ? { ...values, total } : product
      );
      setTableData(updatedTableData);
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = async (row: MRT_Row<ProductsOrder>) => {
    const result = await dialogs.confirm(
      "Deseas eliminar el elemento de la lista?",
      { title: "Eliminar item" }
    );
    if (result) {
      const updatedTableData = tableData.filter(
        (product) => product.id !== row.original.id
      );
      setTableData(updatedTableData);
    }
  };

  const formatCurrency = (value: string): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(parseFloat(value));
  };

  const fetchTaxes = async () => {
    try {
      const response = await taxService.getAll(token, 10, 1, 1);
      return response;
    } catch (error: any) {
      dialogs.alert("Error al cargar los ajustes fiscales: " + error.message, {
        title: "Error",
      });
      return [];
    }
  };

  const removeTaxesUsed = (taxesGet: TaxesOrder[]) => {
    return taxesGet.filter((t) => !taxes.some((d) => t.name === d.name));
  };

  const handleShowAddFiscalAdjustment = async () => {
    const taxesList = await fetchTaxes();
    const filteredTaxes = removeTaxesUsed(taxesList);
    // @ts-ignore
    const result = await dialogs.open(AddTaxes, filteredTaxes);
    if (result) {
      setTaxes((prev) => [
        ...prev,
        ...(Array.isArray(result) ? result : [result]),
      ]);
    }
  };

  const handleChangeIVA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(e.target.value);
    if (isNaN(numericValue)) {
      setIva(0);
    } else {
      setIva(numericValue);
    }
  };

  const handleRemoveTax = (name: string) => {
    setTaxes(taxes.filter((t) => t.name !== name));
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    createDisplayMode: "modal", // ('modal', and 'custom' are also available)
    editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        minHeight: "300px",
        maxHeight: "calc(100vh - 200px)",
      },
    },

    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => {
      const filteredComponents = internalEditComponents.filter(
        (component: any) =>
          component?.props?.cell?.column?.id &&
          !["id", "total"].includes(component.props.cell.column.id)
      );

      return (
        <>
          <DialogTitle variant="h6">Agregar producto</DialogTitle>
          <DialogContent
            dividers
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            {filteredComponents}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      );
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateProduct,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveProduct,
    localization: MRT_Localization_ES,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Editar">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Agregar Producto
      </Button>
    ),
    renderBottomToolbar: ({ table }) => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          px: 2,
          py: 2,
          width: "100%",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridAutoFlow: "column",
            gridTemplateColumns: "repeat(2, 200px)",
            gridAutoRows: "auto",
            gridTemplateRows: "repeat(3, auto)",
            gap: 2,
            flex: 1,
            minWidth: "300px",
          }}
        >
          {taxes.map((tax) => (
            <FormControl key={tax.name} sx={{ width: 200 }}>
              <InputLabel>{tax.name}</InputLabel>
              <OutlinedInput
                label={tax.name}
                value={formatCurrency(tax.value.toFixed(2))}
                disabled
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleRemoveTax(tax.name)}
                      edge="end"
                    >
                      <Cancel />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <IconButton
              color="primary"
              onClick={handleShowAddFiscalAdjustment}
              sx={{ width: 56, height: 56 }}
            >
              <TaxIcon fontSize="large" />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <FormControl sx={{ width: 200 }}>
              <InputLabel>Subtotal</InputLabel>
              <OutlinedInput
                label="Subtotal"
                id="subtotal"
                value={formatCurrency(subtotal.toFixed(2))}
                onChange={() =>
                  setSubtotal(
                    table
                      .getFilteredRowModel()
                      .rows.reduce((acc, row) => acc + row.original.total, 0)
                  )
                }
                disabled
              />
            </FormControl>

            <FormControl sx={{ width: 200 }}>
              <InputLabel>IVA</InputLabel>
              <OutlinedInput
                label="IVA"
                id="iva"
                value={iva === 0 ? "" : iva}
                type="number"
                onChange={handleChangeIVA}
                inputProps={{ step: "0.01" }}
              />
            </FormControl>

            <FormControl sx={{ width: 200 }}>
              <InputLabel>Total</InputLabel>
              <OutlinedInput
                label="Total"
                id="total"
                disabled
                value={formatCurrency(total.toFixed(2))}
              />
            </FormControl>
          </Box>
        </Box>
      </Box>
    ),
    state: {
      // isLoading: isLoadingUsers,
      isSaving: isSaving,
      showAlertBanner: isSaving,
      showProgressBars: isSaving,
    },
  });

  return <MaterialReactTable table={table} />;
};

export default CRUDTable;
