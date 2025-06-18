import { useState } from "react";
import { DialogProps, useDialogs } from "@toolpad/core/useDialogs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { requisitionService } from "@/app/api/requisitionService";
import { RequisitionDocumentsProps } from "@/app/interfaces/Requisitions.interface";
import { Skeleton } from "@mui/material";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { Download } from "@mui/icons-material";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { useSession } from "@toolpad/core";

export default function DialogDocumentsRequisition({
  payload,
  open,
  onClose,
}: DialogProps<RequisitionDocumentsProps, number | null>) {
  const [loading, setLoading] = useState(false);
  //   const [documents, setDocuments] = useState<string[]>([]);
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;

  const handleDownloadFile = (filename: string) => {
    requisitionService
      .downloadDocument(token as string, payload.id, filename)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        dialogs.alert("Error al descargar el documento " + error, {
          title: "Error",
        });
      });
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)} maxWidth="sm">
      <DialogTitle>Documents</DialogTitle>
      <DialogContent>
        {loading ? (
          <Skeleton variant="rectangular" height={200} />
        ) : (
          <Stack direction="column" spacing={1}>
            {Object.keys(payload.documents).map((document, index) => (
              <Chip
                size="medium"
                key={index}
                color="warning"
                label={document}
                onClick={() => handleDownloadFile(document)}
                icon={<Download />}
              />
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
