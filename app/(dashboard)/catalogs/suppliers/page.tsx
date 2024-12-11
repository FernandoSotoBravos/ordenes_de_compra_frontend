"use client";
import { useMemo, useState } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
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
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Supplier } from "@/app/interfaces/Suppliers.interface";
import { suppliersService } from "@/app/api/suppliersService";

const CRUDSuppliers = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Supplier>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "name",
        header: "Nombre",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.name,
          helperText: validationErrors?.name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },
      {
        accessorKey: "contact_name",
        header: "Contacto",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.contact_name,
          helperText: validationErrors?.contact_name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              contact_name: undefined,
            }),
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.email,
          helperText: validationErrors?.email,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              email: undefined,
            }),
        },
      },
      {
        accessorKey: "phone_number",
        header: "Teléfono",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.phone_number,
          helperText: validationErrors?.phone_number,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              phone_number: undefined,
            }),
        },
      },
      {
        accessorKey: "address",
        header: "Dirección",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.address,
          helperText: validationErrors?.address,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              address: undefined,
            }),
        },
      },
      {
        accessorKey: "city",
        header: "Ciudad",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.city,
          helperText: validationErrors?.city,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              city: undefined,
            }),
        },
      },
      {
        accessorKey: "state",
        header: "Estado",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.state,
          helperText: validationErrors?.state,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              state: undefined,
            }),
        },
      },
      {
        accessorKey: "country",
        header: "Pais",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.country,
          helperText: validationErrors?.country,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              country: undefined,
            }),
        },
      },
      {
        accessorKey: "postal_code",
        header: "Código Postal",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.postal_code,
          helperText: validationErrors?.postal_code,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              postal_code: undefined,
            }),
        },
      },
      {
        accessorKey: "tax",
        header: "Impuesto",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.tax,
          helperText: validationErrors?.tax,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              tax: undefined,
            }),
        },
      },
      {
        accessorKey: "account_manager",
        header: "Gerente de Cuenta",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.account_manager,
          helperText: validationErrors?.account_manager,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              account_manager: undefined,
            }),
        },
      },
      {
        accessorKey: "bank_name",
        header: "Nombre del Banco",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.bank_name,
          helperText: validationErrors?.bank_name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              bank_name: undefined,
            }),
        },
      },
      {
        accessorKey: "clabe",
        header: "CLABE",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.clabe,
          helperText: validationErrors?.clabe,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              clabe: undefined,
            }),
        },
      },
      {
        accessorKey: "website",
        header: "Sitio Web",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.website,
          helperText: validationErrors?.website,
        },
      },
    ],
    [validationErrors]
  );

  //call CREATE hook
  const { mutateAsync: createSupplier, isPending: isCreatingSupplier } =
    useCreateSupplier();
  //call READ hook
  const {
    data: fetchedSuppliers = [],
    isError: isLoadingSuppliersError,
    isFetching: isFetchingSuppliers,
    isLoading: isLoadingSuppliers,
  } = useGetSuppliers();
  //call UPDATE hook
  const { mutateAsync: updateSupplier, isPending: isUpdatingSupplier } =
    useUpdateSupplier();
  //call DELETE hook
  const { mutateAsync: deleteSupplier, isPending: isDeletingSupplier } =
    useDeleteSupplier();

  //CREATE action
  const handleCreateSupplier: MRT_TableOptions<Supplier>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateSupplier(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createSupplier(values);
      table.setCreatingRow(null); //exit creating mode
    };

  //UPDATE action
  const handleSaveSupplier: MRT_TableOptions<Supplier>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateSupplier(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateSupplier(values);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Supplier>) => {
    if (window.confirm("Are you sure you want to delete this Supplier?")) {
      deleteSupplier(row.original.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedSuppliers,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => (row.id ? row.id.toString() : ""),
    muiToolbarAlertBannerProps: isLoadingSuppliersError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSupplier,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSupplier,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New Supplier</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={2} size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Nombre" id="name" name="name" />
            <TextField
              fullWidth
              label="Nombre de Contacto"
              id="contact_name"
              name="contact_name"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              id="email"
              name="email"
            />
            <TextField
              fullWidth
              label="Dirección"
              id="address"
              name="address"
            />
            <TextField
              label="Numero de Telefono"
              id="phone_number"
              name="phone_number"
              type="number"
            />

            <TextField label="Ciudad" id="city" name="city" />
            <TextField
              label="Estado"
              id="state"
              name="phone_number"
              type="number"
            />
            <TextField label="Pais" id="country" name="country" />
            <TextField
              label="Codigo Postal"
              id="postal_code"
              name="postal_code"
              type="number"
            />
            <FormControl sx={{ width: "45%" }}>
              <InputLabel id="tax_id-label">Tipo de impuesto</InputLabel>
              <Select
                labelId="tax_id-label"
                id="tax_id"
                name="tax_id"
                onChange={(e) => console.log(e)}
              >
                {[
                  { id: 1, name: "FRONTERA" },
                  { id: 2, name: "NACIONAL" },
                  { id: 3, name: "OBJETO" },
                ].map((tax) => (
                  <MenuItem key={tax.id} value={tax.id}>
                    {tax.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Gerente de Cuenta"
              id="account_manager"
              name="account_manager"
            />
            <TextField
              fullWidth
              label="Nombre del Banco"
              id="bank_name"
              name="bank_name"
            />
            <TextField fullWidth label="CLABE" id="clabe" name="clabe" />
            <TextField
              fullWidth
              label="Sitio Web"
              id="website"
              name="website"
            />
          </Grid>

          {/* {...internalEditComponents}{" "}
          or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit Supplier</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
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
        Create New Supplier
      </Button>
    ),
    state: {
      isLoading: isLoadingSuppliers,
      isSaving: isCreatingSupplier || isUpdatingSupplier || isDeletingSupplier,
      showAlertBanner: isLoadingSuppliersError,
      showProgressBars: isFetchingSuppliers,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new Supplier to api)
function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Supplier: Supplier) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newSupplierInfo: Supplier) => {
      queryClient.setQueryData(
        ["Suppliers"],
        (prevSuppliers: any) =>
          [
            ...prevSuppliers,
            {
              ...newSupplierInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as Supplier[]
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['Suppliers'] }), //refetch Suppliers after mutation, disabled for demo
  });
}

//READ hook (get Suppliers from api)
function useGetSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: ["Suppliers"],
    queryFn: async () => {
      //send api request here
      return await suppliersService
        .getAll()
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });

      //   await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      //   return Promise.resolve([]);
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put Supplier in api)
function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Supplier: Supplier) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (newSupplierInfo: Supplier) => {
      queryClient.setQueryData(["Suppliers"], (prevSuppliers: any) =>
        prevSuppliers?.map((prevSupplier: Supplier) =>
          prevSupplier.id === newSupplierInfo.id
            ? newSupplierInfo
            : prevSupplier
        )
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['Suppliers'] }), //refetch Suppliers after mutation, disabled for demo
  });
}

//DELETE hook (delete Supplier in api)
function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (SupplierId: number) => {
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    onMutate: (SupplierId: number) => {
      queryClient.setQueryData(["Suppliers"], (prevSuppliers: any) =>
        prevSuppliers?.filter(
          (Supplier: Supplier) => Supplier.id !== SupplierId
        )
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['Suppliers'] }), //refetch Suppliers after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const SuppliersProviders = () => (
  <QueryClientProvider client={queryClient}>
    <CRUDSuppliers />
  </QueryClientProvider>
);

export default SuppliersProviders;

const validateRequired = (value: string) => !!value.length;

function validateSupplier(Supplier: Supplier) {
  return {
    name: !validateRequired(Supplier.name) ? "El Nombre es Requerido" : "",
  };
}
