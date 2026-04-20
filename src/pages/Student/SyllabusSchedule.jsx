import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  useTheme,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  MenuBook as BookIcon,
  CalendarMonth as CalendarIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import Page from "../../components/Page";

const PDF_URL = "https://pdf.ac/AZkLYFqjZ4";

const ActionButton = ({ title, icon, link, color }) => {
  const theme = useTheme();
  const isExternal = link?.startsWith("http");

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
        component={isExternal ? "a" : Link}
        href={isExternal ? link : undefined}
        to={isExternal ? undefined : link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
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

const ClassScheduleViewer = () => {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      <iframe
        src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(PDF_URL)}`}
        style={{
          width: "100%",
          height: "500px",
          border: "none",
        }}
        title="Class Schedule"
      />
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <IconButton
          component="a"
          href={PDF_URL}
          download="ClassSchedule.pdf"
          target="_blank"
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "white",
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          <CloudDownloadIcon />
        </IconButton>
      </Box>
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
      isPdf: true,
    },
    {
      title: "Online Portal",
      icon: <DownloadIcon fontSize="large" />,
      link: "https://www.vtustudymaterials.online/",
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

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom mb={2}>
            Class Schedule
          </Typography>
          <ClassScheduleViewer />
        </Box>
      </Container>
    </Page>
  );
};

export default SyllabusSchedule;