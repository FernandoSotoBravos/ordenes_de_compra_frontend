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
    text: "Pendiente",
  },
  2: {
    Icon: PreviewIcon,
    color: "#2196F3",
    text: "En revisión",
  },
  3: {
    Icon: CheckCircleIcon,
    color: "#4CAF50",
    text: "Aprobada",
  },
  4: {
    Icon: ErrorIcon,
    color: "#F44336",
    text: "Rechazada",
  },
  5: {
    Icon: CreditScoreIcon,
    color: "#4CAF50",
    text: "Pagada",
  },
  6: {
    Icon: ErrorIcon,
    color: "#F44336",
    text: "Cancelada",
  },
};

interface StatusOrderProps {
  status: string;
}

export const StatusOrderComponent = ({ status }: StatusOrderProps) => {
  const { Icon, color, text } = stategyStatus[status];
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Chip
        icon={<Icon style={{ color: "white" }} />}
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
