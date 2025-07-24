import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { DialogProps } from "@toolpad/core/useDialogs";
import { useState } from "react";
import TextArea from "../TextArea";

export default function DialogCommentariesCustom({
  payload,
  open,
  onClose,
}: DialogProps<Record<string, string>, string | null>) {
  const [result, setResult] = useState<string>("");
  return (
    <Dialog fullWidth open={open} onClose={() => onClose(null)}>
      <DialogTitle>{payload.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{payload.content}</DialogContentText>
        <TextArea
          maxRows={10}
          placeholder="Comentarios"
          minRows={3}
          value={result}
          onChange={(event) => setResult(event.currentTarget.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(result)}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}
