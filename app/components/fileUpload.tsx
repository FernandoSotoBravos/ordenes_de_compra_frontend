import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

interface FileUploadProps {
  onUpload: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);

    const uploadedFiles = Array.from(event.dataTransfer.files);
    setFiles(uploadedFiles);
    onUpload(uploadedFiles);
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
    setFiles(uploadedFiles);
    onUpload(uploadedFiles);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 400,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          border: dragging ? "2px dashed #4caf50" : "2px dashed #ccc",
          bgcolor: dragging ? "#e8f5e9" : "#fafafa",
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
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
