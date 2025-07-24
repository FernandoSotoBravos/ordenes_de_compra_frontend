import { useState } from "react";
import { DialogProps } from "@toolpad/core/useDialogs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import Grid from "@mui/material/Grid2";
import { OrderCreate } from "@/app/interfaces/Order.interface";
import LoadingButton from "@mui/lab/LoadingButton";
import { OrderCreateProps } from "@/app/interfaces/Order.interface";
import { useSession } from "@toolpad/core";
import { orderService } from "@/app/api/orderService";
import { useDialogs } from "@toolpad/core/useDialogs";
import SimpleFileUpload from "@/app/components/SimpleUploadFile";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { requisitionService } from "@/app/api/requisitionService";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Button,
  Typography,
  Tooltip,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import DialogCommentariesCustom from "./reasonDialog";

export default function DialogAcceptQuo({
  payload,
  open,
  onClose,
}: DialogProps<Map<string, any>, boolean | null>) {
  const [loading, setLoading] = useState(false);
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;

  const handleAcceptQuo = async (filename: string) => {
    const reason = await dialogs.open(DialogCommentariesCustom, {
      title: "Aceptar cotización",
      content: "¿Por qué acepta esta cotización?",
    });

    setLoading(true);
    try {
      const response = await requisitionService.acceptQuotization(
        token as string,
        payload.get("id"),
        filename,
        reason === null ? "" : reason
      );
      if (response) {
        dialogs.alert("Cotización aceptada correctamente", {
          title: "Éxito",
        });
        onClose(true);
      }
    } catch (error) {
      dialogs.alert("Error al aceptar la cotización: " + error, {
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = (filename: string) => {
    setLoading(true);
    requisitionService
      .downloadDocument(token as string, payload.get("id"), filename, true)
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Aceptar cotizaciones</DialogTitle>
      <DialogContent dividers>
        <Grid
          container
          spacing={{ xs: 2, md: 1 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          justifyContent="center"
          alignItems="stretch"
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
          {Object.values(payload.get("quotizations")).map((quo, index) => (
            <Card
              key={index}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <CardHeader title={`Cotización #${index + 1}`} />
              <CardContent sx={{ flexGrow: 1 }}>
                <Tooltip title={String(quo)}>
                  <Chip
                    color="warning"
                    label={
                      <span
                        style={{
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {String(quo).length > 13
                          ? String(quo).substring(0, 13) + "..."
                          : String(quo)}
                      </span>
                    }
                    icon={<Download />}
                    sx={{
                      textAlign: "center",
                      mb: 2,
                      maxWidth: "100%",
                    }}
                    clickable
                    onClick={() => handleDownloadFile(String(quo))}
                  />
                </Tooltip>
              </CardContent>

              {(session?.user?.role == 6 || session?.user?.super_user) && !payload.get("accepted") && (
                <LoadingButton
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "10px 20px",
                  }}
                  fullWidth
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<ThumbUpIcon sx={{ color: "#4caf50" }} />}
                  variant="text"
                  onClick={() => handleAcceptQuo(String(quo))}
                >
                  Aceptar
                </LoadingButton>
              )}
            </Card>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => onClose(null)}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
