"use client";
import { useEffect, useMemo, useState } from "react";
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
  MenuItem,
  TextField,
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
import { Area, createArea, updateArea } from "@/app/interfaces/Areas.interface";
import { areaService } from "@/app/api/areaService";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";
import { departmentService } from "@/app/api/departmentService";

const CRUDAreas = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [departments, setDepartments] = useState<SelectBase[]>([]);

  useEffect(() => {
    departmentService.getAll().then((data) => {
      setDepartments(data);
    });
  }, []);

  const columns = useMemo<MRT_ColumnDef<Area>[]>(
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
        accessorKey: "department",
        header: "Departamento",
        muiEditTextFieldProps: {
          required: true,
          children: departments.map((department) => (
            <MenuItem key={department.id} value={department.id}>
              {department.name}
            </MenuItem>
          )),
          select: true,
          error: !!validationErrors?.department,
          helperText: validationErrors?.department,
          //remove any previous validation errors when Area focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              department: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  //call CREATE hook
  const { mutateAsync: createArea, isPending: isCreatingArea } =
    useCreateArea();
  //call READ hook
  const {
    data: fetchedAreas = [],
    isError: isLoadingAreasError,
    isFetching: isFetchingAreas,
    isLoading: isLoadingAreas,
  } = useGetAreas();
  //call UPDATE hook
  const { mutateAsync: updateArea, isPending: isUpdatingArea } =
    useUpdateArea();
  //call DELETE hook
  const { mutateAsync: deleteArea, isPending: isDeletingArea } =
    useDeleteArea();

  //CREATE action
  const handleCreateArea: MRT_TableOptions<Area>["onCreatingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateArea(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createArea(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveArea: MRT_TableOptions<Area>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateArea(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateArea(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Area>) => {
    if (window.confirm("Are you sure you want to delete this Area?")) {
      deleteArea(row.original.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedAreas,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => (row.id ? row.id.toString() : ""),
    muiToolbarAlertBannerProps: isLoadingAreasError
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
    onCreatingRowSave: handleCreateArea,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveArea,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New Area</DialogTitle>
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
        <DialogTitle variant="h3">Edit Area</DialogTitle>
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
        Create New Area
      </Button>
    ),
    state: {
      isLoading: isLoadingAreas,
      isSaving: isCreatingArea || isUpdatingArea || isDeletingArea,
      showAlertBanner: isLoadingAreasError,
      showProgressBars: isFetchingAreas,
    },
  });

  return <MaterialReactTable table={table} />;
};

function useCreateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (area: Area) => {
      console.log("area", area);
      const createArea: createArea = {
        name: area.name,
        department_id: parseInt(area.department),
      };

      return await areaService
        .create(createArea)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    },
    //client side optimistic update
    onMutate: (newAreaInfo: Area) => {
      queryClient.setQueryData(
        ["Areas"],
        (prevAreas: any) =>
          [
            ...prevAreas,
            {
              ...newAreaInfo,
            },
          ] as Area[]
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Areas"] }), //refetch Areas after mutation, disabled for demo
  });
}

//READ hook (get Areas from api)
function useGetAreas() {
  return useQuery<Area[]>({
    queryKey: ["Areas"],
    queryFn: async () => {
      //send api request here
      return await areaService
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

function useUpdateArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (area: Area) => {
      const updateArea: updateArea = {
        name: area.name,
        department_id: parseInt(area.department),
      };

      return await areaService
        .update(area.id, updateArea)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    },
    //client side optimistic update
    onMutate: (newAreaInfo: Area) => {
      queryClient.setQueryData(["Areas"], (prevAreas: any) =>
        prevAreas?.map((prevArea: Area) =>
          prevArea.id === newAreaInfo.id ? newAreaInfo : prevArea
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Areas"] }), //refetch Areas after mutation, disabled for demo
  });
}

function useDeleteArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (areaId: number) => {
      return await areaService
        .remove(areaId)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    },
    //client side optimistic update
    onMutate: (AreaId: number) => {
      queryClient.setQueryData(["Areas"], (prevAreas: any) =>
        prevAreas?.filter((Area: Area) => Area.id !== AreaId)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Areas"] }), //refetch Areas after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const AreasProviders = () => (
  <QueryClientProvider client={queryClient}>
    <CRUDAreas />
  </QueryClientProvider>
);

export default AreasProviders;

const validateRequired = (value: string) => !!value.length;

function validateArea(Area: Area) {
  return {
    name: !validateRequired(Area.name) ? "El Nombre es Requerido" : "",
    department_id: !validateRequired(String(Area.department_id))
      ? "El departamento es requerido"
      : "",
  };
}
