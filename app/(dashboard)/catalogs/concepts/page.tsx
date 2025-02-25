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
  Concept,
  createConcept,
  updateConcept,
} from "@/app/interfaces/Concepts.interface";
import { conceptService } from "@/app/api/conceptService";
import { areaService } from "@/app/api/areaService";
import { SelectBase } from "@/app/interfaces/SelecteBase.interface";

const CRUDConcepts = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [areas, setAreas] = useState<SelectBase[]>([]);

  useEffect(() => {
    areaService.getAll().then((data) => {
      setAreas(data);
    });
    // DESCOMENTAR CUANDO SE TOMA LOS VALORES DE LOS USUARIOS
    // areaService.getByDepartment(parseInt(event.target.value)).then((data) => {
    //   setAreas(data);
    // });
  }, []);

  const columns = useMemo<MRT_ColumnDef<Concept>[]>(
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
        accessorKey: "area",
        header: "Area",
        muiEditTextFieldProps: {
          children: areas.map((area) => (
            <MenuItem key={area.id} value={area.id}>
              {area.name}
            </MenuItem>
          )),
          select: true,
          required: true,
          error: !!validationErrors?.area,
          helperText: validationErrors?.area,
          //remove any previous validation errors when Concept focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              area: undefined,
            }),
        },
      },
      {
        accessorKey: "segment_business",
        header: "Segmento de Negocio",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.segment_business,
          helperText: validationErrors?.segment_business,
          //remove any previous validation errors when Concept focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              segment_business: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  //call CREATE hook
  const { mutateAsync: createConcept, isPending: isCreatingConcept } =
    useCreateConcept();
  //call READ hook
  const {
    data: fetchedConcepts = [],
    isError: isLoadingConceptsError,
    isFetching: isFetchingConcepts,
    isLoading: isLoadingConcepts,
  } = useGetConcepts();
  //call UPDATE hook
  const { mutateAsync: updateConcept, isPending: isUpdatingConcept } =
    useUpdateConcept();
  //call DELETE hook
  const { mutateAsync: deleteConcept, isPending: isDeletingConcept } =
    useDeleteConcept();

  //CREATE action
  const handleCreateConcept: MRT_TableOptions<Concept>["onCreatingRowSave"] =
    async ({ values, table }) => {
      // const newValidationErrors = validateConcept(values);
      // if (Object.values(newValidationErrors).some((error) => error)) {
      //   setValidationErrors(newValidationErrors);
      //   return;
      // }
      setValidationErrors({});
      await createConcept(values);
      table.setCreatingRow(null); //exit creating mode
    };

  //UPDATE action
  const handleSaveConcept: MRT_TableOptions<Concept>["onEditingRowSave"] =
    async ({ values, table }) => {
      // const newValidationErrors = validateConcept(values);
      // if (Object.values(newValidationErrors).some((error) => error)) {
      //   setValidationErrors(newValidationErrors);
      //   return;
      // }
      setValidationErrors({});
      await updateConcept(values);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Concept>) => {
    if (window.confirm("Are you sure you want to delete this Concept?")) {
      deleteConcept(row.original.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedConcepts,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => (row.id ? row.id.toString() : ""),
    muiToolbarAlertBannerProps: isLoadingConceptsError
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
    onCreatingRowSave: handleCreateConcept,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveConcept,
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New Concept</DialogTitle>
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
        <DialogTitle variant="h3">Edit Concept</DialogTitle>
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
        Create New Concept
      </Button>
    ),
    state: {
      isLoading: isLoadingConcepts,
      isSaving: isCreatingConcept || isUpdatingConcept || isDeletingConcept,
      showAlertBanner: isLoadingConceptsError,
      showProgressBars: isFetchingConcepts,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new Concept to api)
function useCreateConcept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (concept: Concept) => {
      const newConcept: createConcept = {
        name: concept.name,
        area_id: parseInt(concept.area),
        segment_business: concept.segment_business,
      };

      return await conceptService
        .create(newConcept)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    },
    //client side optimistic update
    onMutate: (newConceptInfo: Concept) => {
      queryClient.setQueryData(["Concepts"], (prevConcepts: any) => {
        const conceptsArray = Array.isArray(prevConcepts) ? prevConcepts : [];
        return [...conceptsArray, { ...newConceptInfo }] as Concept[];
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Concepts"] }), //refetch Concepts after mutation, disabled for demo
  });
}

//READ hook (get Concepts from api)
function useGetConcepts() {
  return useQuery<Concept[]>({
    queryKey: ["Concepts"],
    queryFn: async () => {
      //send api request here
      return await conceptService
        .getAll()
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put Concept in api)
function useUpdateConcept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (concept: Concept) => {
      const updateConcept: updateConcept = {
        name: concept.name,
        area_id: parseInt(concept.area),
        segment_business: concept.segment_business,
      };

      return await conceptService
        .update(concept.id, updateConcept)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    },
    //client side optimistic update
    onMutate: (newConceptInfo: Concept) => {
      queryClient.setQueryData(["Concepts"], (prevConcepts: any) =>
        prevConcepts?.map((prevConcept: Concept) =>
          prevConcept.id === newConceptInfo.id ? newConceptInfo : prevConcept
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Concepts"] }), //refetch Concepts after mutation, disabled for demo
  });
}

//DELETE hook (delete Concept in api)
function useDeleteConcept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conceptId: number) => {
      return await conceptService
        .remove(conceptId)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          return error;
        });
    },
    //client side optimistic update
    onMutate: (ConceptId: number) => {
      queryClient.setQueryData(["Concepts"], (prevConcepts: any) =>
        prevConcepts?.filter((Concept: Concept) => Concept.id !== ConceptId)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Concepts"] }), //refetch Concepts after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const ConceptsProviders = () => (
  <QueryClientProvider client={queryClient}>
    <CRUDConcepts />
  </QueryClientProvider>
);

export default ConceptsProviders;

// const validateRequired = (value: string) => !!value.length;

// function validateConcept(Concept: Concept) {
//   return {
//     name: !validateRequired(Concept.name) ? "El Nombre es Requerido" : "",
//     area_id: !validateRequired(Concept.area_id.toString())
//       ? "El departamento es requerido"
//       : "",
//     segment_business: !validateRequired(Concept.segment_business)
//       ? "El Segmento de Negocio es requerido"
//       : "",
//   };
// }
