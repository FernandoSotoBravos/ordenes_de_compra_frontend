import { useState } from "react";
import { DialogProps } from "@toolpad/core/useDialogs";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextArea from "../TextArea";
import Grid from "@mui/material/Grid2";
import { OrderCreate } from "@/app/interfaces/Order.interface";
import LoadingButton from "@mui/lab/LoadingButton";
import { OrderCreateProps } from "@/app/interfaces/Order.interface";
import { useSession } from "@toolpad/core";
import { orderService } from "@/app/api/orderService";
import { useDialogs } from "@toolpad/core/useDialogs";
import FileUpload from "@/app/components/fileUpload";
import { CustomSession } from "@/app/interfaces/Session.interface";

export default function DialogCreateOrder({
  payload,
  open,
  onClose,
}: DialogProps<OrderCreate, number | null>) {
  const [comentaries, setComentaries] = useState<string>("");
  const [observations, setObservations] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<number | null>(null);
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();

  const handleCreateProduct = async () => {
    setLoading(true);

    try {
      // Convertir archivos a Base64
      const base64Files = await Promise.all(
        files.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file); // Convierte el archivo a Base64
          });
        })
      );

      // Crear el payload con archivos en formato Base64
      const data: OrderCreateProps = {
        concept_id: parseInt(payload.segment),
        supplier_id: parseInt(payload.beneficiary),
        comments: comentaries,
        description: payload.descriptionPayment,
        created_by: session?.user?.id as string,
        currency_id: parseInt(payload.currency),
        details: payload.products.map((product) => ({
          product_id: 1,
          description: product.description,
          quantity: product.quantity,
          unit_price: product.unit_price,
          total: product.total,
        })),
        documents: base64Files.map((base64File, index) => ({
          filename: files[index].name,
          content_type: files[index].type,
          content: base64File.split(",")[1],
        })),
      };

      orderService
        .create(data, session?.user?.access_token as string)
        .then((response) => {
          dialogs.alert(
            `La orden de compra ha sido creada con el ID: ${response.order}`,
            {
              title: "Success",
            }
          );
          setLoading(false);

          onClose(response.order);
        })
        .catch((error) => {
          console.error(error);
          dialogs.alert(
            `Error al generar la orden de compra hacia el servidor: ${error}`,
            {
              title: "Error",
            }
          );
          setLoading(false);
          onClose(null);
        });
    } catch (error) {
      console.error(error);
      dialogs.alert(`Erro al generar la orden de compra: ${error}`, {
        title: "Error",
      });
      setLoading(false);
      onClose(null);
    }
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Crear Orden de Compra</DialogTitle>
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
          <FileUpload setFiles={setFiles} files={files} />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => onClose(null)}>
          Cerrar
        </Button>
        <LoadingButton
          loading={loading}
          color="primary"
          onClick={handleCreateProduct}
        >
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
