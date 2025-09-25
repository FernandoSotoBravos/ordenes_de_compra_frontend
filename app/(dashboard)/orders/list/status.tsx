import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import PreviewIcon from "@mui/icons-material/Preview";
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
    text: "APROBADO POR COMPRAS",
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
  }
};

interface StatusOrderProps {
  status: string;
}

export const StatusOrderComponent = ({ status }: StatusOrderProps) => {
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
