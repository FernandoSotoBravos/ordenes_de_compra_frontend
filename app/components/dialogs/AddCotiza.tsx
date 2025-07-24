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
import SimpleFileUpload from "@/app/components/SimpleUploadFile";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { requisitionService } from "@/app/api/requisitionService";

export default function DialogAddQuo({
  payload,
  open,
  onClose,
}: DialogProps<number, number | null>) {
  const [file, setFile] = useState<File>();
  const [fileTwo, setFileTwo] = useState<File>();
  const [fileThree, setFileThree] = useState<File>();
  const [loading, setLoading] = useState(false);
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;

  const handleUploadFiles = async () => {
    const files = [file, fileTwo, fileThree].filter(Boolean) as File[]; // Filtra archivos no nulos
    if (files.length < 3) {
      dialogs.alert("Debe subir 3 archivos");
      return;
    }

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

    const data = base64Files.map((base64File, index) => ({
      filename: files[index].name,
      content_type: files[index].type,
      content: base64File.split(",")[1],
    }));

    setLoading(true);
    requisitionService
      .addQuotizations(token as string, payload as number, data)
      .then((response) => {
        dialogs.alert("Cotizaciones agregadas correctamente");
        onClose(payload as number);
      })
      .catch((error) => {
        dialogs.alert("Error al agregar cotizaciones: " + error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>Agregar cotizaciones</DialogTitle>
      <DialogContent dividers>
        <Grid
          display="flex"
          justifyContent="center"
          alignItems="center"
          size="grow"
          gap={2}
        >
          <SimpleFileUpload setFile={setFile} file={file} />
          <SimpleFileUpload setFile={setFileTwo} file={fileTwo} />
          <SimpleFileUpload setFile={setFileThree} file={fileThree} />
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={() => onClose(null)}>
          Cerrar
        </Button>
        <LoadingButton
          loading={loading}
          color="primary"
          onClick={handleUploadFiles}
        >
          Guardar
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
