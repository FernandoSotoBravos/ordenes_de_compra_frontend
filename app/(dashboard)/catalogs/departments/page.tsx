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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Department,
  CreateDepto,
  UpdateDepto,
} from "@/app/interfaces/Departments.interface";
import { departmentService } from "@/app/api/departmentService";

const CRUDDepartments = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Department>[]>(
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
    ],
    [validationErrors]
  );

  //call CREATE hook
  const { mutateAsync: createDepartment, isPending: isCreatingDepartment } =
    useCreateDepartment();
  //call READ hook
  const {
    data: fetchedDepartments = [],
    isError: isLoadingDepartmentsError,
    isFetching: isFetchingDepartments,
    isLoading: isLoadingDepartments,
  } = useGetDepartments();
  //call UPDATE hook
  const { mutateAsync: updateDepartment, isPending: isUpdatingDepartment } =
    useUpdateDepartment();
  //call DELETE hook
  const { mutateAsync: deleteDepartment, isPending: isDeletingDepartment } =
    useDeleteDepartment();

  //CREATE action
  const handleCreateDepartment: MRT_TableOptions<Department>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateDepartment(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createDepartment(values);
      table.setCreatingRow(null); //exit creating mode
    };

  //UPDATE action
  const handleSaveDepartment: MRT_TableOptions<Department>["onEditingRowSave"] =
    async ({ values, table }) => {
      const newValidationErrors = validateDepartment(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateDepartment(values);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Department>) => {
    if (window.confirm("Are you sure you want to delete this Department?")) {
      deleteDepartment(row.original.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedDepartments,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => (row.id ? row.id.toString() : ""),
    muiToolbarAlertBannerProps: isLoadingDepartmentsError
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
    onCreatingRowSave: handleCreateDepartment,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveDepartment,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New Department</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit Department</DialogTitle>
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
        Create New Department
      </Button>
    ),
    state: {
      isLoading: isLoadingDepartments,
      isSaving:
        isCreatingDepartment || isUpdatingDepartment || isDeletingDepartment,
      showAlertBanner: isLoadingDepartmentsError,
      showProgressBars: isFetchingDepartments,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new Department to api)
function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (department: Department) => {
      const newDepartment: CreateDepto = {
        name: department.name,
      };
      return await departmentService
        .create(newDepartment)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    },
    //client side optimistic update
    onMutate: (newDepartmentInfo: Department) => {
      queryClient.setQueryData(
        ["Departments"],
        (prevDepartments: any) =>
          [
            ...prevDepartments,
            {
              ...newDepartmentInfo,
            },
          ] as Department[]
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["Departments"] }), //refetch Departments after mutation, disabled for demo
  });
}

//READ hook (get Departments from api)
function useGetDepartments() {
  return useQuery<Department[]>({
    queryKey: ["Departments"],
    queryFn: async () => {
      //send api request here
      return await departmentService
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

//UPDATE hook (put Department in api)
function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (department: Department) => {
      const updatedDepartment: UpdateDepto = {
        name: department.name,
      };
      return await departmentService
        .update(department.id, updatedDepartment)
        .then((response) => {
          alert("Department updated successfully");
          return response;
        })
        .catch((error) => {
          alert("Error updating Department");
          return error;
        });
    },
    //client side optimistic update
    onMutate: (newDepartmentInfo: Department) => {
      queryClient.setQueryData(["Departments"], (prevDepartments: any) =>
        prevDepartments?.map((prevDepartment: Department) =>
          prevDepartment.id === newDepartmentInfo.id
            ? newDepartmentInfo
            : prevDepartment
        )
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["Departments"] }), //refetch Departments after mutation, disabled for demo
  });
}

//DELETE hook (delete Department in api)
function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (departmentId: number) => {
      return await departmentService
        .remove(departmentId)
        .then((response) => {
          alert("Department deleted successfully");
          return response;
        })
        .catch((error) => {
          alert("Error deleting Department");
          return error;
        });
    },
    //client side optimistic update
    onMutate: (DepartmentId: number) => {
      queryClient.setQueryData(["Departments"], (prevDepartments: any) =>
        prevDepartments?.filter(
          (Department: Department) => Department.id !== DepartmentId
        )
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["Departments"] }), //refetch Departments after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const DepartmentsProviders = () => (
  <QueryClientProvider client={queryClient}>
    <CRUDDepartments />
  </QueryClientProvider>
);

export default DepartmentsProviders;

const validateRequired = (value: string) => !!value.length;

function validateDepartment(Department: Department) {
  return {
    name: !validateRequired(Department.name) ? "El Nombre es Requerido" : "",
  };
}
