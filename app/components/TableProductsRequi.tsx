import { ReactNode, useMemo, useState } from "react";
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
  OutlinedInput,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ProductsRequisition, CRUDTableProps } from "../interfaces/Requisitions.interface";
import { useDialogs } from "@toolpad/core";
import { MRT_Localization_ES } from "material-react-table/locales/es";

const CRUDTable = ({ tableData, setTableData, isSaving }: CRUDTableProps) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const dialogs = useDialogs();

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
    ],
    [validationErrors]
  );

  const handleCreateProduct: MRT_TableOptions<ProductsRequisition>["onCreatingRowSave"] =
    async ({ values, table }) => {
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
      columnVisibility: { id: false }
    },
  });

  return <MaterialReactTable table={table} />;
};

export default CRUDTable;
