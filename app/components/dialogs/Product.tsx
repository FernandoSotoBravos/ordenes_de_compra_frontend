'use client";';
import { useEffect, useState } from "react";
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
import {
  ProductDialog,
  ProductEdit,
} from "@/app/interfaces/Product.interface";
import { Stack, TextField } from "@mui/material";

export default function DialogProduct({
  payload,
  open,
  onClose,
}: DialogProps<ProductDialog, number | null>) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState<ProductEdit>({
    productCode: "",
    description: "",
    unit_price: 0,
    quantity: 0,
    img: "",
    warehouse: "",
  });

  useEffect(() => {
    if (payload.action === "edit") {
      setForm({
        ...payload.payload,
      });
    }
  }, [payload]);

  const handleCreateProduct = async () => {
    setLoading(true);

    // try {
    //   // Convertir archivos a Base64
    //   const base64Files = await Promise.all(
    //     files.map((file) => {
    //       return new Promise<string>((resolve, reject) => {
    //         const reader = new FileReader();
    //         reader.onload = () => resolve(reader.result as string);
    //         reader.onerror = reject;
    //         reader.readAsDataURL(file); // Convierte el archivo a Base64
    //       });
    //     })
    //   );

    //   // Crear el payload con archivos en formato Base64
    //   const data: OrderCreateProps = {
    //     concept_id: parseInt(payload.concept),
    //     supplier_id: parseInt(payload.beneficiary),
    //     department_id: parseInt(payload.department),
    //     area_id: parseInt(payload.area),
    //     comments: comentaries,
    //     description: payload.descriptionPayment,
    //     created_by: session?.user?.id as string,
    //     currency_id: parseInt(payload.currency),
    //     details: payload.products.map((product) => ({
    //       product_id: 1,
    //       description: product.description,
    //       quantity: product.quantity,
    //       unit_price: product.unit_price,
    //       total: product.total,
    //     })),
    //     documents: base64Files.map((base64File, index) => ({
    //       filename: files[index].name,
    //       content_type: files[index].type,
    //       content: base64File.split(",")[1],
    //     })),
    //   };
    // } catch (error) {
    //   console.error(error);
    //   dialogs.alert(`Erro al generar la orden de compra: ${error}`, {
    //     title: "Error",
    //   });
    //   setLoading(false);
    //   onClose(null);
    // }
  };
  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>
        {payload.action === "edit" ? "Editar Producto" : "Agregar Producto"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Codigo de Producto"
            value={form.productCode}
            onChange={(e) => setForm({ ...form, productCode: e.target.value })}
            fullWidth
          />
          <TextField
            label="Descripcion"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
          />
          <TextField
            label="Precio Unitario"
            value={form.unit_price}
            onChange={(e) => setForm({ ...form, unit_price: parseFloat(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Cantidad"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) })}
            fullWidth
          />
          <FileUpload setFiles={setFiles} files={files} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)}>Cancelar</Button>
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
