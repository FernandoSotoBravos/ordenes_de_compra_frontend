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
  MRT_PaginationState,
} from "material-react-table";
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import TimelineIcon from "@mui/icons-material/Timeline";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Typography from "@mui/material/Typography";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Order,
  OrderDetail,
  OrderHistory,
} from "@/app/interfaces/Order.interface";
import { orderService } from "@/app/api/orderService";
import { StatusOrderComponent } from "./status";
import dayjs from "dayjs";
import { useDialogs } from "@toolpad/core";
import DialogStatusOrder from "@/app/components/dialogs/AcceptOrder";
import DialogHistoryOrder from "@/app/components/dialogs/HistoryOrder";
import DialogDocumentsOrder from "@/app/components/dialogs/DocumentsOrder";
import { useSession } from "@toolpad/core";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { StatusRole } from "@/app/mocks/statusRole";
import Viewer from "@/app/components/viewer";

const RUDOrders = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isPower =
    session?.user?.is_admin ||
    session?.user?.is_leader_area ||
    session?.user?.is_leader_department ||
    [6, 7].includes(session?.user?.role as number);

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
          return dayjs(cell.getValue() as string | number | Date)
            .subtract(7, "hours")
            .format("DD/MM/YYYY HH:mm");
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
  } = useGetOrders(session?.user?.access_token as string);
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
    const result = await dialogs.open(DialogStatusOrder, {
      id: row.original.id,
      status: "REJECTED",
      title: "Rechazar Orden de Compra",
    });
    if (result === null) {
      return;
    }

    deleteOrder(row.original.id);
  };

  const openAcceptConfirmModal = async (row: MRT_Row<Order>) => {
    const status = StatusRole[session?.user?.role as number];

    if (!status) {
      dialogs.alert("Rol no se encuentra por favor vuelve a iniciar sesion");
      return;
    }

    const result = await dialogs.open(DialogStatusOrder, {
      id: row.original.id,
      status: status,
      title: "Aceptar Orden de Compra",
    });
    if (result === null) {
      return;
    }

    deleteOrder(row.original.id);
  };

  const openPDFViewer = async (row: MRT_Row<Order>) => {
    handleClose();

    const result = await dialogs.open(Viewer, {
      id: row.original.id,
    });
    if (result === null) {
      return;
    }
  };

  const openHistoryOrder = async (row: MRT_Row<Order>) => {
    const result = await dialogs.open(DialogHistoryOrder, {
      id: row.original.id,
    });
    if (result === null) {
      return;
    }
  };

  const openDocumentsOrder = async (row: MRT_Row<Order>) => {
    const result = await dialogs.open(DialogDocumentsOrder, {
      id: row.original.id,
      documents: row.original.documents,
    });
    if (result === null) {
      return;
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedOrders,
    editDisplayMode: "modal",
    positionActionsColumn: "last",
    enableEditing: true,
    enableStickyHeader: true,
    enableExpandAll: false,
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
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? "long-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          id="long-menu"
          MenuListProps={{
            "aria-labelledby": "long-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              style: {
                maxHeight: 48 * 4.5,
                width: "20ch",
              },
            },
          }}
        >
          <Tooltip title="Mostrar">
            <MenuItem
              sx={{ display: "flex", gap: "1rem" }}
              onClick={() => openPDFViewer(row)}
            >
              <RemoveRedEyeIcon sx={{ color: "red" }} />
              Abrir PDF
            </MenuItem>
          </Tooltip>
          {row.original.status_id == 4 ||
            (!isPower && (
              <MenuItem
                sx={{ display: "flex", gap: "1rem" }}
                onClick={() => table.setEditingRow(row)}
              >
                <EditIcon sx={{ color: "#2196F3" }} />
                Editar
              </MenuItem>
            ))}
          {isPower && (
            <MenuItem
              sx={{ display: "flex", gap: "1rem" }}
              onClick={() => openAcceptConfirmModal(row)}
            >
              <ThumbUpIcon sx={{ color: "#4caf50" }} />
              Aprobar
            </MenuItem>
          )}
          {isPower && (
            <MenuItem
              sx={{ display: "flex", gap: "1rem" }}
              onClick={() => openRejectConfirmModal(row)}
            >
              <ThumbDownIcon sx={{ color: "#f44336" }} />
              Rechazar
            </MenuItem>
          )}
          <MenuItem
            sx={{ display: "flex", gap: "1rem" }}
            onClick={() => openHistoryOrder(row)}
          >
            <TimelineIcon sx={{ color: "primary" }} />
            Historial
          </MenuItem>
          {row.original.documents && (
            <MenuItem
              sx={{ display: "flex", gap: "1rem" }}
              onClick={() => openDocumentsOrder(row)}
            >
              <PictureAsPdfIcon sx={{ color: "primary" }} />
              Documentos
            </MenuItem>
          )}
        </Menu>
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

function useGetOrders(token: string) {
  return useQuery<Order[]>({
    queryKey: ["Orders"],
    queryFn: async () => {
      return await orderService
        .getAll(token)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          alert("Error loading Orders " + error);
          return [];
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
