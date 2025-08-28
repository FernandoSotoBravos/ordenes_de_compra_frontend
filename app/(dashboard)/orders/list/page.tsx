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
  MRT_ActionMenuItem,
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
import DialogStatusOrder from "@/app/components/dialogs/ChangeStatusOrder";
import DialogHistoryOrder from "@/app/components/dialogs/HistoryOrder";
import DialogDocumentsOrder from "@/app/components/dialogs/DocumentsOrder";
import { useSession } from "@toolpad/core";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { StatusRole } from "@/app/mocks/statusRole";
import Viewer from "@/app/components/viewer";
import { useRouter } from "next/navigation";
import { MRT_Localization_ES } from "material-react-table/locales/es";

const RUDOrders = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;

  const router = useRouter();

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
        accessorKey: "total",
        header: "Total",
        Cell: ({ cell }) => {
          const value = cell.getValue() as number;
          return new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(value);
        },
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
    setValidationErrors({});
    await updateOrder(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openRejectConfirmModal = async (
    menuClose: () => void,
    row: MRT_Row<Order>
  ) => {
    const result = await dialogs.open(DialogStatusOrder, {
      id: row.original.id,
      status: 7, // rechazada
      title: "Rechazar Orden de Compra",
    });
    if (result === null) {
      menuClose();
      return;
    }

    deleteOrder(row.original.id);
    menuClose();
  };

  const openAcceptConfirmModal = async (
    menuClose: () => void,
    row: MRT_Row<Order>
  ) => {
    // se obtiene el siguiente estatus en base al rol que esta autorizando
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
      menuClose();
      return;
    }

    deleteOrder(row.original.id);
    menuClose();
  };

  const handleDownloadFile = async (orderId: number) => {
    return orderService
      .downloadPDFOrder(token as string, orderId)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        dialogs.alert("Error al descargar el documento " + error, {
          title: "Error",
        });

        return;
      });
  };

  const openPDFViewer = async (menuClose: () => void, row: MRT_Row<Order>) => {
    const file: Blob = await handleDownloadFile(row.original.id);

    const result = await dialogs.open(Viewer, {
      id: row.original.id,
      file: file,
    });
    if (result === null) {
      menuClose();
      return;
    }

    menuClose();
  };

  const openHistoryOrder = async (
    menuClose: () => void,
    row: MRT_Row<Order>
  ) => {
    const result = await dialogs.open(DialogHistoryOrder, {
      id: row.original.id,
    });
    if (result === null) {
      menuClose();
      return;
    }

    menuClose();
  };

  const openDocumentsOrder = async (
    menuClose: () => void,
    row: MRT_Row<Order>
  ) => {
    const result = await dialogs.open(DialogDocumentsOrder, {
      id: row.original.id,
      documents: row.original.documents,
    });
    if (result === null) {
      menuClose();
      return;
    }

    menuClose();
  };

  const handleEditingRow = (menuClose: () => void, row: MRT_Row<Order>) => {
    router.push(`/orders/edit/${row.original.id}`);
  };

  const availableEdit = (row: MRT_Row<Order>) => {
    const isAvailable = [1, 2, 7].includes(row.original.status_id);
    const isCreator =
      row.original.created_user?.toLowerCase() ===
      session?.user?.name?.toLowerCase();

    return !(isAvailable && isCreator);
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedOrders,
    positionActionsColumn: "last",
    enableRowActions: true,
    enableStickyHeader: true,
    enableExpandAll: false,
    initialState: {
      density: "compact",
      columnVisibility: {
        id: false,
        concept: false,
        description: false,
        comments: false,
      },
    },
    getRowId: (row) => (row.id ? row.id.toString() : ""),
    muiToolbarAlertBannerProps: isLoadingOrdersError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: "300px",
        minWidth: "100%",
        maxHeight: "calc(100vh - 200px)",
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
    localization: MRT_Localization_ES,
    renderRowActionMenuItems: ({ closeMenu, row, table }) => [
      <MRT_ActionMenuItem //or just use a normal MUI MenuItem component
        icon={<RemoveRedEyeIcon />}
        key="pdf"
        label="Abrir PDF"
        onClick={() => openPDFViewer(closeMenu, row)}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<EditIcon />}
        key="edit"
        label="Editar"
        disabled={availableEdit(row)}
        onClick={() => handleEditingRow(closeMenu, row)}
        table={table}
      />,
      <div key="approbe">
        {isPower && ![7, 8].includes(row.original.status_id) && (
          <MRT_ActionMenuItem
            icon={<ThumbUpIcon sx={{ color: "#4caf50" }} />}
            key="approbe"
            label="Aprobar"
            onClick={() => openAcceptConfirmModal(closeMenu, row)}
            table={table}
          />
        )}
      </div>,
      <div key="reject">
        {isPower && ![7, 8].includes(row.original.status_id) && (
          <MRT_ActionMenuItem
            icon={<ThumbDownIcon sx={{ color: "#f44336" }} />}
            key="dismiss"
            label="Rechazar"
            onClick={() => openRejectConfirmModal(closeMenu, row)}
            table={table}
          />
        )}
      </div>,
      <MRT_ActionMenuItem
        icon={<TimelineIcon sx={{ color: "primary" }} />}
        key="history"
        label="Historial"
        onClick={() => openHistoryOrder(closeMenu, row)}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<PictureAsPdfIcon sx={{ color: "primary" }} />}
        key="docs"
        label="Documentos"
        onClick={() => openDocumentsOrder(closeMenu, row)}
        disabled={!row.original.documents}
        table={table}
      />,
    ],
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
    mutationFn: async (order: Order) => {},
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
