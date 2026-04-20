import React, { useState, useContext, useEffect, useCallback } from "react";
import { Container, Grid, Typography, Box, useTheme, Paper } from "@mui/material";
import Page from "../components/Page";
import { Card, CardHeader, CardContent, CardActionArea } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  BugReport as BugReportIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  EmojiEvents as EmojiEventsIcon,
  Today as TodayIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { blueGrey } from "@mui/material/colors";
import { alpha } from "@mui/material/styles";
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import HdrStrongIcon from '@mui/icons-material/HdrStrong';
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import DashboardHeroCard from "../components/dashboard/DashboardHeroCard";
import useStudentSemester from "../hooks/useStudentSemester";
import api from "../utils/axios";

const StudentTile = ({ title, icon, link }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  
  return (
    <Card
      sx={{
        transition: "all 0.3s ease",
        borderRadius: 3,
        borderLeft: `4px solid ${isLight ? theme.palette.primary.main : theme.palette.info.main}`,
        overflow: 'hidden',
        backgroundColor: isLight 
          ? alpha(theme.palette.primary.main, 0.05)
          : alpha(theme.palette.info.main, 0.12),
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: isLight 
            ? theme.customShadows.primary
            : `0 10px 28px 0 ${alpha(theme.palette.info.dark, 0.3)}`,
        },
      }}
    >
      <CardActionArea component={Link} to={link}>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            minHeight: "auto",
            p: { xs: 2, sm: 3 },
            "&:hover": {
              backgroundColor: isLight 
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.info.main, 0.2),
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 52, sm: 64 },
              height: { xs: 52, sm: 64 },
              borderRadius: '12px',
              mr: { xs: 2, sm: 3 },
              backgroundColor: isLight
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.info.main, 0.15),
              color: isLight
                ? theme.palette.primary.main
                : theme.palette.info.light,
            }}
          >
            {React.cloneElement(icon, { fontSize: "large" })}
          </Box>
          
          <Box>
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5
              }}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                opacity: 0.8
              }}
            >
              Click to access
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const AttendanceSummary = ({ user, onAttendanceFetch }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [attendancePercentage, setAttendancePercentage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/students/attendance/${user._id}`);
      const data = response.data.data.attendance;
      
      if (data?.semesters && data.semesters.length > 0) {
        const currentSemester = data.semesters[0].semester;
        const semesterData = data.semesters.find(s => s.semester === currentSemester);
        
        if (semesterData && semesterData.months && semesterData.months.length > 0) {
          let totalAttended = 0;
          let totalTaken = 0;
          
          semesterData.months.forEach((monthData) => {
            if (monthData.subjects) {
              monthData.subjects.forEach((subject) => {
                totalAttended += subject.attendedClasses || 0;
                totalTaken += subject.totalClasses || 0;
              });
            }
          });
          
          if (totalTaken > 0) {
            const percentage = ((totalAttended / totalTaken) * 100).toFixed(1);
            setAttendancePercentage({ percentage, semester: currentSemester });
            if (onAttendanceFetch) {
              onAttendanceFetch(percentage, currentSemester);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?._id, onAttendanceFetch]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading attendance...</Typography>
      </Paper>
    );
  }

  if (!attendancePercentage) {
    return null;
  }

  const isGoodAttendance = parseFloat(attendancePercentage.percentage) >= 75;
  const color = isGoodAttendance ? theme.palette.success.main : theme.palette.warning.main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        backgroundColor: isLight
          ? alpha(color, 0.1)
          : alpha(color, 0.15),
        border: `1px solid ${alpha(color, 0.3)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            borderRadius: "12px",
            backgroundColor: alpha(color, 0.2),
            color: color,
          }}
        >
          <TodayIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Current Attendance (Semester {attendancePercentage.semester})
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ color }}>
            {attendancePercentage.percentage}%
          </Typography>
        </Box>
      </Box>
      <Button
        component={Link}
        to="/student/attendance"
        variant={isLight ? "contained" : "outlined"}
        size="small"
        sx={{ borderRadius: 2 }}
      >
        View Details
      </Button>
    </Paper>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const { user } = useContext(AuthContext);
  const [bugReportDialogOpen, setBugReportDialogOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);

  if (!user) {
    return null;
  }
  
  const handleBugReportDialogOpen = () => {
    setBugReportDialogOpen(true);
  };
  
  const handleBugReportDialogClose = () => {
    setBugReportDialogOpen(false);
  };
  
  const handleAttendanceFetch = (percentage, semester) => {
    setAttendanceData({ percentage, semester });
  };
  
  return (
    <Page title="Home">
      <Box
        sx={{
          pt: 3,
          pb: 5,
          backgroundColor: isLight 
            ? alpha(theme.palette.primary.lighter, 0.4)
            : alpha(theme.palette.grey[900], 0.2),
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 0 } }}>
          <DashboardHeroCard
            user={user}
            fallbackName="Student"
            dashboardTitle="Student Dashboard"
            description="Welcome to the Sanghathi student portal. Access all student services from here."
            attendancePercentage={attendanceData?.percentage}
          />

          <AttendanceSummary user={user} onAttendanceFetch={handleAttendanceFetch} />

          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6} md={isLight ? 6 : 6} lg={isLight ? 4 : 4}>
              <StudentTile
                title="Profile"
                icon={<PersonIcon />}
                link="/student/profile"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={isLight ? 6 : 6} lg={isLight ? 4 : 4}>
              <StudentTile
                title={isLight ? "Career Review" : "Career Review"}
                icon={<WorkIcon />}
                link="/career-review"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={isLight ? 6 : 6} lg={isLight ? 4 : 4}>
              <StudentTile
                title="Scorecard"
                icon={<AssignmentIcon />}
                link="/scorecard"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={isLight ? 6 : 6} lg={isLight ? 4 : 4}>
              <StudentTile
                title="Placement"
                icon={<EmojiEventsIcon />}
                link="/placement"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={isLight ? 6 : 6} lg={isLight ? 4 : 4}>
              <StudentTile
                title="Attendance"
                icon={<TodayIcon />}
                link="/student/attendance"
              />
            </Grid>
            

            
            <Grid item xs={12} sm={6} md={isLight ? 6 : 6} lg={isLight ? 4 : 4}>
              <StudentTile
                title="PO Attainment"
                icon={<AnalyticsIcon />}
                link="/po-attainment-grading"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={isLight ? 6 : 6} lg={isLight ? 4 : 4}>
              <StudentTile
                title="TYL Scorecard"
                icon={<AssignmentIcon />}
                link="/student/tyl-scorecard"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Page>
  );
};
export default Dashboard;
