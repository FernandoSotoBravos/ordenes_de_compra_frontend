"use client";
import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";

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
import { Requisition } from "@/app/interfaces/Requisitions.interface";
import { requisitionService } from "@/app/api/requisitionService";
import { StatusRequisitionComponent } from "./status";
import dayjs from "dayjs";
import { useDialogs } from "@toolpad/core";
import { useSession } from "@toolpad/core";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { StatusRole } from "@/app/mocks/statusRole";
import Viewer from "@/app/components/viewer";
import { useRouter } from "next/navigation";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import DialogHistoryRequisition from "@/app/components/dialogs/HistoryRequisition";
import DialogDocumentsRequisition from "@/app/components/dialogs/DocumentsRequisition";
import DialogStatusRequisition from "@/app/components/dialogs/ChangeStatusRequi";

const RUDRequisitions = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();

  const router = useRouter();

  const isPower =
    session?.user?.is_admin ||
    session?.user?.is_leader_area ||
    session?.user?.is_leader_department ||
    [6, 7].includes(session?.user?.role as number);

  const token = session?.user?.access_token;

  const columns = useMemo<MRT_ColumnDef<Requisition>[]>(
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
          return <StatusRequisitionComponent status={status} />;
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
        accessorKey: "created_user",
        header: "Creado por",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.created_user,
          helperText: validationErrors?.created_user,
          //remove any previous validation errors when Requisition focuses on the input
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
          //remove any previous validation errors when Requisition focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              created_at: undefined,
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
          //remove any previous validation errors when Requisition focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              comments: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  const {
    data: fetchedRequisitions = [],
    isError: isLoadingRequisitionsError,
    isFetching: isFetchingRequisitions,
    isLoading: isLoadingRequisitions,
  } = useGetRequisitions(session?.user?.access_token as string);
  //call UPDATE hook
  const { mutateAsync: updateRequisition, isPending: isUpdatingRequisition } =
    useUpdateRequisition();
  //call DELETE hook
  const { mutateAsync: deleteRequisition, isPending: isDeletingRequisition } =
    useDeleteRequisition();

  //UPDATE action
  const handleSaveRequisition: MRT_TableOptions<Requisition>["onEditingRowSave"] =
    async ({ values, table }) => {
      setValidationErrors({});
      await updateRequisition(values);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openRejectConfirmModal = async (
    menuClose: () => void,
    row: MRT_Row<Requisition>
  ) => {
    const result = await dialogs.open(DialogStatusRequisition, {
      id: row.original.id,
      status: "Rechazada",
      title: "Rechazar Orden de Compra",
    });
    if (result === null) {
      menuClose();
      return;
    }

    deleteRequisition(row.original.id);
    menuClose();
  };

  const openAcceptConfirmModal = async (
    menuClose: () => void,
    row: MRT_Row<Requisition>
  ) => {
    const status = StatusRole[session?.user?.role as number];

    if (!status) {
      dialogs.alert("Rol no se encuentra por favor vuelve a iniciar sesion");
      return;
    }

    const result = await dialogs.open(DialogStatusRequisition, {
      id: row.original.id,
      status: status,
      title: "Aceptar Orden de Compra",
    });
    if (result === null) {
      menuClose();
      return;
    }

    deleteRequisition(row.original.id);
    menuClose();
  };

  const handleDownloadFile = async (orderId: number) => {
    return requisitionService
      .downloadPDFRequisition(token as string, orderId)
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

  const openPDFViewer = async (
    menuClose: () => void,
    row: MRT_Row<Requisition>
  ) => {
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

  const openHistoryRequisition = async (
    menuClose: () => void,
    row: MRT_Row<Requisition>
  ) => {
    const result = await dialogs.open(DialogHistoryRequisition, {
      id: row.original.id,
    });
    if (result === null) {
      menuClose();
      return;
    }

    menuClose();
  };

  const openDocumentsRequisition = async (
    menuClose: () => void,
    row: MRT_Row<Requisition>
  ) => {
    const result = await dialogs.open(DialogDocumentsRequisition, {
      id: row.original.id,
      documents: row.original.documents,
    });
    if (result === null) {
      menuClose();
      return;
    }

    menuClose();
  };

  const handleEditingRow = (
    menuClose: () => void,
    row: MRT_Row<Requisition>
  ) => {
    router.push(`/requi/edit/${row.original.id}`);
  };

  const availableEdit = (row: MRT_Row<Requisition>) => {
    const isAvailable = [1, 4].includes(row.original.status_id);
    const isCreator =
      row.original.created_user?.toLowerCase() ===
      session?.user?.name?.toLowerCase();

    return !(isAvailable && isCreator);
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedRequisitions,
    positionActionsColumn: "last",
    enableRowActions: true,
    enableStickyHeader: true,
    enableExpandAll: false,
    getRowId: (row) => (row.id ? row.id.toString() : ""),
    muiToolbarAlertBannerProps: isLoadingRequisitionsError
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
        {isPower && row.original.status_id != 7 && (
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
        {isPower && (
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
        onClick={() => openHistoryRequisition(closeMenu, row)}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<PictureAsPdfIcon sx={{ color: "primary" }} />}
        key="docs"
        label="Documentos"
        onClick={() => openDocumentsRequisition(closeMenu, row)}
        disabled={!row.original.documents}
        table={table}
      />,
    ],
    state: {
      isLoading: isLoadingRequisitions,
      isSaving: isUpdatingRequisition || isDeletingRequisition,
      showAlertBanner: isLoadingRequisitionsError,
      showProgressBars: isFetchingRequisitions,
    },
  });

  return <MaterialReactTable table={table} />;
};

function useGetRequisitions(token: string) {
  return useQuery<Requisition[]>({
    queryKey: ["Requisitions"],
    queryFn: async () => {
      return await requisitionService
        .getAll(token)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          alert("Error loading Requisitions " + error);
          return [];
        });
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Requisition: Requisition) => {},
    onMutate: (newRequisitionInfo: Requisition) => {
      queryClient.setQueryData(["Requisitions"], (prevRequisitions: any) =>
        prevRequisitions?.map((prevRequisition: Requisition) =>
          prevRequisition.id === newRequisitionInfo.id
            ? newRequisitionInfo
            : prevRequisition
        )
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["Requisitions"] }), //refetch Requisitions after mutation, disabled for demo
  });
}

function useDeleteRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (RequisitionId: number) => {
      return true;
    },
    onMutate: (RequisitionId: number) => {
      queryClient.setQueryData(["Requisitions"], (prevRequisitions: any) =>
        prevRequisitions?.filter(
          (Requisition: Requisition) => Requisition.id !== RequisitionId
        )
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["Requisitions"] }), //refetch Requisitions after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const RequisitionsProviders = () => (
  <QueryClientProvider client={queryClient}>
    <RUDRequisitions />
  </QueryClientProvider>
);

export default RequisitionsProviders;
