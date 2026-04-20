import { useContext } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  Receipt as ReceiptIcon,
  AccountBalanceWallet as WalletIcon,
  History as HistoryIcon,
  Payment as PaymentIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { AuthContext } from "../../context/AuthContext";
import Page from "../../components/Page";

const FeeButton = ({ title, icon, link, color }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Card
      sx={{
        height: "100%",
        transition: "all 0.3s ease",
        borderRadius: 3,
        borderLeft: `4px solid ${color || theme.palette.primary.main}`,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.customShadows?.primary || 6,
        },
      }}
    >
      <CardContent
        component={Link}
        to={link}
        sx={{
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 2,
          height: "100%",
          color: "text.primary",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
            color: color || theme.palette.primary.main,
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          fontWeight={600}
          textAlign="center"
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const Fees = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { user } = useContext(AuthContext);

  const feeButtons = [
    {
      title: "Pay Fees",
      icon: <PaymentIcon fontSize="large" />,
      link: "/student/fees/pay",
      color: theme.palette.success.main,
    },
    {
      title: "Fee Structure",
      icon: <ReceiptIcon fontSize="large" />,
      link: "/student/fees/structure",
      color: theme.palette.info.main,
    },
    {
      title: "Payment History",
      icon: <HistoryIcon fontSize="large" />,
      link: "/student/fees/history",
      color: theme.palette.warning.main,
    },
    {
      title: "Scholarship",
      icon: <WalletIcon fontSize="large" />,
      link: "/student/fees/scholarship",
      color: theme.palette.primary.main,
    },
    {
      title: "Due Notifications",
      icon: <WarningIcon fontSize="large" />,
      link: "/student/fees/notifications",
      color: theme.palette.error.main,
    },
  ];

  return (
    <Page title="Fees">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center" mb={4}>
          Fees Management
        </Typography>

        <Grid container spacing={3}>
          {feeButtons.map((button, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <FeeButton {...button} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Page>
  );
};

export default Fees;