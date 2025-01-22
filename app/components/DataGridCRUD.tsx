import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ProductsOrder, CRUDTableProps } from "../interfaces/Order.interface";
import { useDialogs } from "@toolpad/core";

const CRUDTable = ({ tableData, setTableData, isSaving }: CRUDTableProps) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const dialogs = useDialogs();

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
        accessorKey: "unit_price",
        header: "Precio Unitario",
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
      table.setCreatingRow(null);
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

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    createDisplayMode: "modal", // ('modal', and 'custom' are also available)
    editDisplayMode: "modal", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateProduct,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveProduct,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
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
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Agregar Producto
      </Button>
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
