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
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import Typography from "@mui/material/Typography";
import {
  Order,
  OrderDetail,
  OrderHistory,
} from "@/app/interfaces/Order.interface";
import { orderService } from "@/app/api/orderService";
import { StatusOrderComponent } from "./status";
import dayjs from "dayjs";
import { useDialogs } from "@toolpad/core";
import DialogDeleteOrder from "@/app/components/dialogs/DeleteOrder";
import DialogStatusOrder from "@/app/components/dialogs/AcceptOrder";

const RUDOrders = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const dialogs = useDialogs();

  useEffect(() => {
    // departmentService.getAll().then((data) => {
    //   setDepartments(data);
    // });
  }, []);

  const columns = useMemo<MRT_ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "status_id",
        header: "Estado",
        Cell: ({ cell }) => {
          // Obtener el valor de status
          const status = cell.getValue() as string;
          return <StatusOrderComponent status={status} />;
        },
      },
      {
        accessorKey: "concept",
        header: "Concepto",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.concept,
          helperText: validationErrors?.concept,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              concept: undefined,
            }),
        },
      },
      {
        accessorKey: "supplier",
        header: "Proveedor",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.supplier,
          helperText: validationErrors?.supplier,
          //remove any previous validation errors when Order focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              supplier: undefined,
            }),
        },
      },
      {
        accessorKey: "created_user",
        header: "Creado por",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.created_user,
          helperText: validationErrors?.created_user,
          //remove any previous validation errors when Order focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              created_user: undefined,
            }),
        },
      },
      {
        accessorKey: "created_at",
        header: "Fecha de Creación",
        Cell: ({ cell }) => {
          return dayjs(cell.getValue() as string | number | Date).format(
            "DD/MM/YYYY HH:mm"
          );
        },
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.created_at,
          helperText: validationErrors?.created_at,
          //remove any previous validation errors when Order focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              created_at: undefined,
            }),
        },
      },
      {
        accessorKey: "subtotal",
        header: "Subtotal",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.subtotal,
          helperText: validationErrors?.subtotal,
          //remove any previous validation errors when Order focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              subtotal: undefined,
            }),
        },
      },
      {
        accessorKey: "iva",
        header: "Iva",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.iva,
          helperText: validationErrors?.iva,
          //remove any previous validation errors when Order focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              iva: undefined,
            }),
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.total,
          helperText: validationErrors?.total,
          //remove any previous validation errors when Order focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              total: undefined,
            }),
        },
      },
      {
        accessorKey: "comments",
        header: "Comentarios",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.comments,
          helperText: validationErrors?.comments,
          //remove any previous validation errors when Order focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              comments: undefined,
            }),
        },
      },
      {
        accessorKey: "description",
        header: "Descripción",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.description,
          helperText: validationErrors?.description,
          //remove any previous validation errors when Order focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  const {
    data: fetchedOrders = [],
    isError: isLoadingOrdersError,
    isFetching: isFetchingOrders,
    isLoading: isLoadingOrders,
  } = useGetOrders();
  //call UPDATE hook
  const { mutateAsync: updateOrder, isPending: isUpdatingOrder } =
    useUpdateOrder();
  //call DELETE hook
  const { mutateAsync: deleteOrder, isPending: isDeletingOrder } =
    useDeleteOrder();

  //UPDATE action
  const handleSaveOrder: MRT_TableOptions<Order>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    // const newValidationErrors = validateOrder(values);
    // if (Object.values(newValidationErrors).some((error) => error)) {
    //   setValidationErrors(newValidationErrors);
    //   return;
    // }
    setValidationErrors({});
    await updateOrder(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openRejectConfirmModal = async (row: MRT_Row<Order>) => {
    const result = await dialogs.open(DialogDeleteOrder, row.original);
    if (result === null) {
      return;
    }

    deleteOrder(row.original.id);
    // if (window.confirm("Are you sure you want to delete this Order?")) {
    //   deleteOrder(row.original.id);
    // }
  };

  const openAcceptConfirmModal = async (row: MRT_Row<Order>) => {
    const result = await dialogs.open(DialogStatusOrder, {
      id: row.original.id,
      status: "aprobada",
    });
    if (result === null) {
      return;
    }

    deleteOrder(row.original.id);
    // if (window.confirm("Are you sure you want to delete this Order?")) {
    //   deleteOrder(row.original.id);
    // }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedOrders,
    editDisplayMode: "modal",
    positionActionsColumn: "last",
    enableEditing: true,
    getRowId: (row) => (row.id ? row.id.toString() : ""),
    muiToolbarAlertBannerProps: isLoadingOrdersError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
        minWidth: "100%",
      },
    },
    muiDetailPanelProps: () => ({
      sx: (theme) => ({
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,210,244,0.1)"
            : "rgba(0,0,0,0.1)",
      }),
    }),
    //custom expand button rotation
    muiExpandButtonProps: ({ row, table }) => ({
      onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }), //only 1 detail panel open at a time
      sx: {
        transform: row.getIsExpanded() ? "rotate(180deg)" : "rotate(-90deg)",
        transition: "transform 0.2s",
      },
    }),
    //conditionally render detail panel
    renderDetailPanel: ({ row }) =>
      row.original.details ? (
        <Box
          key={row.id}
          sx={{
            display: "grid",
            margin: "auto",
            gridTemplateColumns: "1fr",
            width: "100%",
          }}
        >
          {row.original.details.map((detail: OrderDetail, index) => (
            <Stack key={index} gap="0.5rem" minHeight="00px" mt={2}>
              <Typography>Producto: {detail.product}</Typography>
              <Typography>Descripcion: {detail.description}</Typography>
              <Typography>Cantidad: {detail.quantity}</Typography>
              <Typography>Precio Unitario: {detail.unit_price}</Typography>
              <Typography>Total: {detail.total}</Typography>
              <Divider sx={{ borderBottomWidth: 5 }}/>
            </Stack>
          ))}
        </Box>
      ) : null,

    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveOrder,
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit Order</DialogTitle>
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
        <Tooltip title="Editar">
          <IconButton
            sx={{ color: "#2196F3" }}
            onClick={() => table.setEditingRow(row)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Aprobar">
          <IconButton
            sx={{ color: "#4caf50" }}
            onClick={() => openAcceptConfirmModal(row)}
          >
            <CheckCircleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Rechazar">
          <IconButton
            sx={{ color: "#f44336" }}
            onClick={() => openRejectConfirmModal(row)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    state: {
      isLoading: isLoadingOrders,
      isSaving: isUpdatingOrder || isDeletingOrder,
      showAlertBanner: isLoadingOrdersError,
      showProgressBars: isFetchingOrders,
    },
  });

  return <MaterialReactTable table={table} />;
};

//READ hook (get Orders from api)
function useGetOrders() {
  return useQuery<Order[]>({
    queryKey: ["Orders"],
    queryFn: async () => {
      return await orderService
        .getAll()
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });

    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: Order) => {
      // const updateOrder: updateOrder = {
      //   name: Order.name,
      //   department_id: parseInt(Order.department),
      // };
      // return await OrderService.update(Order.id, updateOrder)
      //   .then((response) => {
      //     return response;
      //   })
      //   .catch((error) => {
      //     return error;
      //   });
    },
    //client side optimistic update
    onMutate: (newOrderInfo: Order) => {
      queryClient.setQueryData(["Orders"], (prevOrders: any) =>
        prevOrders?.map((prevOrder: Order) =>
          prevOrder.id === newOrderInfo.id ? newOrderInfo : prevOrder
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Orders"] }), //refetch Orders after mutation, disabled for demo
  });
}

function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: number) => {
      return true;
    },
    //client side optimistic update
    onMutate: (OrderId: number) => {
      queryClient.setQueryData(["Orders"], (prevOrders: any) =>
        prevOrders?.filter((Order: Order) => Order.id !== OrderId)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Orders"] }), //refetch Orders after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const OrdersProviders = () => (
  <QueryClientProvider client={queryClient}>
    <RUDOrders />
  </QueryClientProvider>
);

export default OrdersProviders;

// const validateRequired = (value: string) => !!value.length;

// function validateOrder(Order: Order) {
//   return {
//     name: !validateRequired(Order.name) ? "El Nombre es Requerido" : "",
//     department_id: !validateRequired(String(Order.department_id))
//       ? "El departamento es requerido"
//       : "",
//   };
// }
