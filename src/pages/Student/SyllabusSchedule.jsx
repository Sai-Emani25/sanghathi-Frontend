import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  MenuBook as BookIcon,
  CalendarMonth as CalendarIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import Page from "../../components/Page";

const ActionButton = ({ title, icon, link, color }) => {
  const theme = useTheme();

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
        <Typography variant="h6" fontWeight={600} textAlign="center">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

const SyllabusSchedule = () => {
  const theme = useTheme();

  const buttons = [
    {
      title: "Syllabus",
      icon: <BookIcon fontSize="large" />,
      link: "/student/syllabus",
      color: theme.palette.primary.main,
    },
    {
      title: "Class Schedule",
      icon: <CalendarIcon fontSize="large" />,
      link: "/student/schedule",
      color: theme.palette.info.main,
    },
    {
      title: "Download Syllabus",
      icon: <DownloadIcon fontSize="large" />,
      link: "/student/syllabus/download",
      color: theme.palette.success.main,
    },
    {
      title: "Semester Plan",
      icon: <SchoolIcon fontSize="large" />,
      link: "/student/semester-plan",
      color: theme.palette.warning.main,
    },
    {
      title: "Exam Schedule",
      icon: <ScheduleIcon fontSize="large" />,
      link: "/student/exam-schedule",
      color: theme.palette.error.main,
    },
  ];

  return (
    <Page title="Syllabus & Schedule">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center" mb={4}>
          Syllabus & Schedule
        </Typography>

        <Grid container spacing={3}>
          {buttons.map((button, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ActionButton {...button} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Page>
  );
};

export default SyllabusSchedule;