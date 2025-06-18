import { useEffect, useState } from "react";
import { DialogProps, useDialogs } from "@toolpad/core/useDialogs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { requisitionService } from "@/app/api/requisitionService";
import {
  RequisitionHistory,
  RequisitionHistoryProps,
} from "@/app/interfaces/Requisitions.interface";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Skeleton } from "@mui/material";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { useSession } from "@toolpad/core";
import dayjs from "dayjs";

export default function DialogHistoryRequisition({
  payload,
  open,
  onClose,
}: DialogProps<RequisitionHistoryProps, number | null>) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RequisitionHistory[]>([]);
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;

  useEffect(() => {
    if (open) {
      setLoading(true);
      requisitionService
        .getRequisitionHistory(token as string, payload.id)
        .then((response) => {
          setHistory(response);
        })
        .catch((error) => {
          if (error.status === 404) {
            dialogs.alert("No se encontraron registros", {
              title: "No encontrado",
            });
            setLoading(false);
            onClose(null);

            return;
          }

          dialogs.alert(
            "Error al obtener el historial de la requisicion " + error,
            {
              title: "Error",
            }
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)} maxWidth="md">
      <DialogTitle>Historial de requisicion</DialogTitle>
      <DialogContent>
        {loading ? (
          <Skeleton variant="rectangular" height={200} />
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 450 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Accion Aplicada</TableCell>
                  <TableCell align="left">Comentarios</TableCell>
                  <TableCell align="left">Hecho por</TableCell>
                  <TableCell align="left">Fecha Creacion</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell align="left">{row.action}</TableCell>
                    <TableCell align="left">{row.comments}</TableCell>
                    <TableCell align="left">{row.changed_by}</TableCell>
                    <TableCell align="left">
                      {dayjs(row.created_at).format("DD/MM/YYYY HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
