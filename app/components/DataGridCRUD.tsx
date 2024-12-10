import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
// import { type User, fakeData, usStates } from './makeData';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ProductsOrder,
  CRUDTableProps,
} from "../interfaces/OrderCreate.interface";

const CRUDTable = ({ tableData, setTableData, isSaving }: CRUDTableProps) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<ProductsOrder>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        enableEditing: false,
        size: 80,
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
        muiEditTextFieldProps: {
          type: "number",
          required: true,
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
      const newProduct = { ...values, id: crypto.randomUUID() };
      const updatedTableData = [...tableData, newProduct];
      setTableData(updatedTableData);
    };

  const handleSaveProduct: MRT_TableOptions<ProductsOrder>["onEditingRowSave"] =
    async ({ values, table }) => {
      // Actualizar el producto editado
      const updatedTableData = tableData.map((product) =>
        product.id === values.id ? values : product
      );
      setTableData(updatedTableData);
    };

  const openDeleteConfirmModal = (row: MRT_Row<ProductsOrder>) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      const updatedTableData = tableData.filter(
        (product) => product.id !== row.original.id
      );
      setTableData(updatedTableData);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
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
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
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

// //CREATE hook (post new user to api)
// function useCreateProduct() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (product: ProductsOrder) => {
//       //send api update request here
//       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       return Promise.resolve();
//     },
//     //client side optimistic update
//     onMutate: (newProductOrder: ProductsOrder) => {
//       queryClient.setQueryData(
//         ["users"],
//         (prevUsers: any) =>
//           [
//             ...prevUsers,
//             {
//               ...newProductOrder,
//               id: (Math.random() + 1).toString(36).substring(7),
//             },
//           ] as ProductsOrder[]
//       );
//     },
//     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
//   });
// }

// //READ hook (get users from api)
// function useGetUsers() {
//   return useQuery<ProductsOrder[]>({
//     queryKey: ["users"],
//     queryFn: async () => {
//       //send api request here
//       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       return Promise.resolve([]);
//     },
//     refetchOnWindowFocus: false,
//   });
// }

// //UPDATE hook (put user in api)
// function useUpdateUser() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (product: ProductsOrder) => {
//       //send api update request here
//       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       return Promise.resolve();
//     },
//     //client side optimistic update
//     onMutate: (updateProduct: ProductsOrder) => {
//       queryClient.setQueryData(["users"], (product: any) =>
//         product?.map((prevProduct: ProductsOrder) =>
//           prevProduct.id === updateProduct.id ? updateProduct : prevProduct
//         )
//       );
//     },
//     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
//   });
// }

// //DELETE hook (delete user in api)
// function useDeleteUser() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (productId: string) => {
//       //send api update request here
//       await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
//       return Promise.resolve();
//     },
//     //client side optimistic update
//     onMutate: (productId: string) => {
//       queryClient.setQueryData(["users"], (prevUsers: any) =>
//         prevUsers?.filter((product: ProductsOrder) => product.id !== productId)
//       );
//     },
//     // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), //refetch users after mutation, disabled for demo
//   });
// }