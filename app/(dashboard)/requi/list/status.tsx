import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PreviewIcon from "@mui/icons-material/Preview";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import { Box, Chip, Typography } from "@mui/material";

const stategyStatus: Record<
  string,
  { Icon: any; color: string; text: string }
> = {
  1: {
    Icon: PendingIcon,
    color: "#FFC107",
    text: "Pendiente Aprobacion",
  },
  2: {
    Icon: PreviewIcon,
    color: "#2196F3",
    text: "Aprobado por Lider de Departamento",
  },
  10: {
    Icon: PreviewIcon,
    color: "#2196F3",
    text: "Aprobado por Lider de Area",
  },
  3: {
    Icon: CheckCircleIcon,
    color: "#4CAF50",
    text: "Aprobado por Contralor",
  },
  8: {
    Icon: CreditScoreIcon,
    color: "#4CAF50",
    text: "Finalizada",
  },
  7: {
    Icon: ErrorIcon,
    color: "#F44336",
    text: "Rechazada",
  },
  11: {
    Icon: PreviewIcon,
    color: "#007BFF",
    text: "Revisión Contraloría"
  }
};

interface StatusRequiProps {
  status: string;
}

export const StatusRequisitionComponent = ({ status }: StatusRequiProps) => {
  const { Icon, color, text } = stategyStatus[status];
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Chip
        label={
          <Typography
            variant="body2"
            style={{ color: "white", fontWeight: 500 }}
          >
            {text}
          </Typography>
        }
        style={{
          backgroundColor: color,
          color: "white",
          borderRadius: "16px",
          padding: "4px",
          minWidth: "120px",
        }}
        size="medium"
      />
    </Box>
  );
};
