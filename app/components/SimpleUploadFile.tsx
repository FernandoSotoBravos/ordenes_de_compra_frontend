import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

interface SimpleFileUploadProps {
  setFile: (file: File | undefined) => void;
  file: File | undefined;
}

const SimpleFileUpload: React.FC<SimpleFileUploadProps> = ({
  setFile,
  file,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const uploadedFiles = Array.from(event.dataTransfer.files);
    setFile(uploadedFiles[0]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setFile(uploadedFiles[0]);
  };

  const handleDeleteFile = () => {
    setFile(undefined);
  };

  return (
    <Box maxWidth="xl">
      <Paper
        elevation={dragging ? 6 : 2}
        sx={{
          p: 3,
          border: "2px dashed",
          borderColor: dragging ? "primary.main" : "grey.400",
          textAlign: "center",
          cursor: "pointer",
          backgroundColor: dragging ? "grey.100" : "inherit",
          transition: "0.3s ease",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Stack spacing={1} alignItems="center">
          <UploadFileIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h6">
            Arrastra y suelta tu archivo aquí
          </Typography>
          <Button variant="contained" component="label">
            Seleccionar archivo
            <input type="file" hidden onChange={handleFileSelect} />
          </Button>
        </Stack>
      </Paper>

      {file && (
        <Box
          mt={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          py={1}
          borderRadius={1}
          border="1px solid"
          borderColor="grey.300"
        >
          <Tooltip title={file.name}>
            <Typography maxWidth="80%">
              {file.name.length > 13
                ? file.name.substring(0, 13) + "..."
                : file.name}
            </Typography>
          </Tooltip>
          <IconButton color="error" onClick={handleDeleteFile}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default SimpleFileUpload;
