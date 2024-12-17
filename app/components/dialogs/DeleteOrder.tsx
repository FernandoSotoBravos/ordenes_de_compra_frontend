import { useState } from "react";
import { DialogProps } from "@toolpad/core/useDialogs";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextArea from "../TextArea";
import Grid from "@mui/material/Grid2";
import { Order, OrderCreate } from "@/app/interfaces/Order.interface";
import LoadingButton from "@mui/lab/LoadingButton";
import { OrderCreateProps } from "@/app/interfaces/Order.interface";
import { useSession } from "@toolpad/core";
import { orderService } from "@/app/api/orderService";
import { useDialogs } from "@toolpad/core/useDialogs";

export default function DialogDeleteOrder({
  payload,
  open,
  onClose,
}: DialogProps<Order, number | null>) {
  const [comentaries, setComentaries] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const dialogs = useDialogs();

  const handleRejectOrder = () => {
    setLoading(true);

    orderService
      .remove(payload.id, comentaries)
      .then((response) => {
        setLoading(false);

        onClose(response);
      })
      .catch((error) => {
        console.error(error);
        dialogs.alert(`Erro al rechazar la orden de compra: ${error}`, {
          title: "Error",
        });
        setLoading(false);
        onClose(null);
      });
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Rechazar Orden de Compra</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <TextArea
            name="comentaries"
            value={comentaries}
            onChange={(e) => setComentaries(e.target.value)}
            maxRows={10}
            placeholder="Comentarios"
            minRows={3}
          />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => onClose(null)}>
          Cerrar
        </Button>
        <LoadingButton
          loading={loading}
          color="primary"
          onClick={handleRejectOrder}
        >
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
