import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  IconButton,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Delete } from "@mui/icons-material";

interface FileUploadProps {
  setFiles: (files: File[]) => void;
  files: File[];
}

const FileUpload: React.FC<FileUploadProps> = ({ setFiles, files }) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);

    const uploadedFiles = Array.from(event.dataTransfer.files);
    setFiles([...files, ...uploadedFiles]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setFiles([...files, ...uploadedFiles]);
  };

  const handleDeleteFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  return (
    <Box
      sx={{
        width: "100%",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          border: dragging ? "2px dashed #4caf50" : "2px dashed #ccc",
          transition: "all 0.3s ease",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <UploadFileIcon color="primary" sx={{ fontSize: 50 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Arrastra y suelta tus archivos aquí
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          o selecciona archivos manualmente
        </Typography>
        <Button variant="contained" component="label">
          Seleccionar Archivos
          <input type="file" hidden multiple onChange={handleFileSelect} />
        </Button>
      </Paper>

      {files.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle1">Archivos seleccionados:</Typography>
          <List>
            {files.map((file, index) => (
              <ListItem key={index} sx={{ display: "flex", gap: "1rem" }}>
                <Typography variant="body2">{file.name}</Typography>

                <IconButton
                  onClick={() => handleDeleteFile(index)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
