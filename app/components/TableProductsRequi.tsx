import { ReactNode, useMemo, useState, useEffect } from "react";
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
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ProductsRequisition,
  CRUDTableProps,
} from "../interfaces/Requisitions.interface";
import { useDialogs, useSession } from "@toolpad/core";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { SelectDescription } from "../interfaces/SelecteBase.interface";
import { unitService } from "../api/unitService";
import { CustomSession } from "../interfaces/Session.interface";

const CRUDTable = ({ tableData, setTableData, isSaving }: CRUDTableProps) => {
  const [units, setUnits] = useState<SelectDescription[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
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

  const columns = useMemo<MRT_ColumnDef<ProductsRequisition>[]>(
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
    ],
    [validationErrors]
  );

  const handleCreateProduct: MRT_TableOptions<ProductsRequisition>["onCreatingRowSave"] =
    async ({ values, table }) => {
      // Validate required fields
      const errors: Record<string, string | undefined> = {};
      if (!values.description) {
        errors.description = "La descripción es requerida";
      }
      if (!values.quantity || values.quantity <= 0) {
        errors.quantity = "La cantidad debe ser mayor a 0";
      }
      if (!values.unit_id) {
        errors.unit_id = "La unidad de medida es requerida";
      }
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      setValidationErrors({});
      const newProduct = { ...values, id: crypto.randomUUID() };
      const updatedTableData = [...tableData, newProduct];
      setTableData(updatedTableData);
      table.setCreatingRow(null);
    };

  const handleSaveProduct: MRT_TableOptions<ProductsRequisition>["onEditingRowSave"] =
    async ({ values, table }) => {
      const updatedTableData = tableData.map((product) =>
        product.id === values.id ? { ...values } : product
      );
      setTableData(updatedTableData);
      table.setEditingRow(null);
    };

  const openDeleteConfirmModal = async (row: MRT_Row<ProductsRequisition>) => {
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

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableFilters: false,
    enableHiding: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    createDisplayMode: "modal", // ('modal', and 'custom' are also available)
    editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        minHeight: "350px",
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
    state: {
      isSaving: isSaving,
      showAlertBanner: isSaving,
      showProgressBars: isSaving,
      columnVisibility: { id: false },
    },
  });

  return <MaterialReactTable table={table} />;
};

export default CRUDTable;
