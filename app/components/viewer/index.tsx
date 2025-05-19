import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { ZoomIn, ZoomOut } from "@mui/icons-material";
import { Document, Page } from "react-pdf";
import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ViewerProps } from "@/app/interfaces/Viewer.interface";
import { DialogProps, useDialogs } from "@toolpad/core/useDialogs";
import { orderService } from "@/app/api/orderService";
import { pdfjs } from "react-pdf";
import { Skeleton } from "@mui/material";
import { CustomSession } from "@/app/interfaces/Session.interface";
import { useSession } from "@toolpad/core";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// { open, onClose, pdf, filename }
const Viewer = ({
  payload,
  open,
  onClose,
}: DialogProps<ViewerProps, number | null>) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdf, setPdf] = useState<Blob>();
  const [filename, setFilename] = useState<string>();
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const dialogs = useDialogs();
  const session = useSession<CustomSession>();
  const token = session?.user?.access_token;

  const downloadPDF = () => {
    if (!pdf) {
      return;
    }
    const url = window.URL.createObjectURL(new Blob([pdf]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orden_${payload.id}.pdf`);

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    if (link.parentNode) {
      link.parentNode.removeChild(link);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber(pageNumber > 1 ? pageNumber - 1 : 1);
  const goToNextPage = () =>
    setPageNumber(pageNumber < numPages ? pageNumber + 1 : numPages);

  const handleZoomChange = (next: boolean) => {
    setScale((prev) => (next ? prev + 0.5 : prev - 0.5));
  };

  const handleDownloadFile = async () => {
    setLoading(true);
    orderService
      .downloadPDFOrder(token as string, Number(payload.id))
      .then((response) => {
        setPdf(response);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        dialogs.alert("Error al descargar el documento " + error, {
          title: "Error",
        });
      });
  };

  useEffect(() => {
    handleDownloadFile();
  }, []);

  return (
    <Dialog
      open={open}
      onClose={() => onClose(null)}
      maxWidth="md"
      aria-labelledby="pdf-viewer-title"
      fullWidth
    >
      {!pdf ? (
        <Skeleton variant="rectangular" height={200} />
      ) : (
        <>
          <DialogTitle id="pdf-viewer-title">
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">PDF Viewer</Typography>
              <Box
                mt={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                <IconButton onClick={goToPrevPage} disabled={pageNumber === 1}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="body1">
                  Página {pageNumber} de {numPages}
                </Typography>
                <IconButton
                  onClick={goToNextPage}
                  disabled={pageNumber === numPages}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
              <IconButton onClick={() => onClose(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Box display="flex" gap="15px">
              <IconButton onClick={() => handleZoomChange(false)}>
                <ZoomOut />
              </IconButton>
              <IconButton onClick={() => handleZoomChange(true)}>
                <ZoomIn />
              </IconButton>
            </Box>
            <Box display="flex" gap="15px">
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={downloadPDF}
              >
                Descargar
              </Button>
              <Button
                onClick={() => onClose(null)}
                variant="outlined"
                color="secondary"
              >
                Cerrar
              </Button>
            </Box>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default Viewer;
