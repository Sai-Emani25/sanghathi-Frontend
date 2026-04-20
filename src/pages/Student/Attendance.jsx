import { useState, useEffect, useContext, useCallback } from "react";
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AuthContext } from "../../context/AuthContext";
import useStudentSemester from "../../hooks/useStudentSemester";
import api from "../../utils/axios";
import { useSnackbar } from "notistack";

import logger from "../../utils/logger.js";
const Attendance = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchParams] = useSearchParams();
  const { semester: studentSemester, loading: semesterLoading } = useStudentSemester();
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentInfo, setStudentInfo] = useState({ usn: '', name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  
  const [absentReportDialogOpen, setAbsentReportDialogOpen] = useState(false);
  const [absentDate, setAbsentDate] = useState(null);
  const [absentReason, setAbsentReason] = useState("");
  const [absentProof, setAbsentProof] = useState(null);
  const [absentProofPreview, setAbsentProofPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [myReports, setMyReports] = useState([]);

  const fetchAttendance = useCallback(async () => {
    // Wait for semester to load before fetching
    if (semesterLoading) {
      return;
    }

    try {
      // Get menteeId from URL params if viewing as faculty
      const menteeId = searchParams.get('menteeId') || user?._id;

      if (!menteeId) {
        setError("User not authenticated or mentee ID not provided.");
        setLoading(false);
        return;
      }
      
      logger.info("Fetching attendance for ID:", menteeId); // Debug log
      
      // Fetch student info (optional - don't fail if this errors)
      try {
        const userResponse = await api.get(`/users/${menteeId}`);
        
        if (userResponse.data?.data?.user) {
          setStudentInfo({
            usn: userResponse.data.data.user.usn || '',
            name: userResponse.data.data.user.name || ''
          });
        }
      } catch (userError) {
        logger.warn("Could not fetch user info:", userError);
        // Use user from context as fallback
        if (user) {
          setStudentInfo({
            usn: user.usn || '',
            name: user.name || ''
          });
        }
      }
      
      const response = await api.get(`/students/attendance/${menteeId}`);
      
      logger.info("Attendance API response:", response.data); // Debug log
      
      const data = response.data.data.attendance;
      if (data && data.semesters) {
        setAttendanceData(data.semesters);
        if (data.semesters.length > 0) {
          // Use student's current semester from profile if available and exists in data
          const defaultSem = studentSemester && data.semesters.find(s => s.semester === studentSemester)
            ? studentSemester
            : data.semesters[0].semester;
          logger.info('[Attendance] Setting semester to:', defaultSem, '(studentSemester:', studentSemester, ', first available:', data.semesters[0].semester, ')');
          setSelectedSemester(defaultSem);
        }
      } else {
        setAttendanceData([]);
      }
      setLoading(false);
    } catch (err) {
      logger.error("Attendance fetch error:", err); // Debug log
      setError("Failed to fetch attendance data");
      setLoading(false);
    }
  }, [semesterLoading, searchParams, user, studentSemester]);

  const fetchMyReports = useCallback(async () => {
    if (!user?._id) return;
    try {
      const res = await api.get(`/students/absence-reports/my`);
      setMyReports(res.data.data.reports || []);
    } catch (err) {
      logger.warn("Could not fetch my absence reports:", err);
    }
  }, [user?._id]);

  const handleAbsentReportSubmit = async () => {
    if (!absentDate || !absentReason) {
      enqueueSnackbar("Please provide date and reason", { variant: "error" });
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("absentDate", absentDate.toISOString().split("T")[0]);
      formData.append("reason", absentReason);
      if (absentProof) {
        formData.append("proof", absentProof);
      }
      await api.post("/students/absence-reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      enqueueSnackbar("Absence report submitted successfully!", { variant: "success" });
      setAbsentReportDialogOpen(false);
      setAbsentDate(null);
      setAbsentReason("");
      setAbsentProof(null);
      setAbsentProofPreview(null);
      fetchMyReports();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Failed to submit absence report", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProofChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAbsentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => setAbsentProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchMyReports();
  }, [fetchAttendance, fetchMyReports]);

  // No need for transformBackendData in the old way

    const getCumulativeAttendance = (subjectName, semester) => {
        const semesterData = attendanceData.find(s => s.semester === semester);
        if (!semesterData) return "No Data";

        let totalAttended = 0;
        let totalTaken = 0;

        semesterData.months.forEach(monthData => {
            const sub = monthData.subjects.find(s => s.subjectName === subjectName);
            if (sub) {
                totalAttended += sub.attendedClasses;
                totalTaken += sub.totalClasses;
            }
        });

        if (totalTaken === 0) return "No Data";
        const percentage = ((totalAttended / totalTaken) * 100).toFixed(2);
        return `${totalAttended}/${totalTaken} (${percentage}%)`;
    };
    const getOverallAttendance = (semester) => {
        const semesterData = attendanceData.find(s => s.semester === semester);
        if (!semesterData) return "No Data";
        let totalAttended = 0;
        let totalTaken = 0;

        semesterData.months.forEach((monthData) => {
          monthData.subjects.forEach((subject) => {
            totalAttended += subject.attendedClasses;
            totalTaken += subject.totalClasses;
          });
        });
        if (totalTaken === 0) return "No Data";

        const percentage = ((totalAttended / totalTaken) * 100).toFixed(2);
        return `${totalAttended}/${totalTaken} (${percentage}%)`;
      };

  const getMonthAttendance = (subjectName, semester, month) => {
    if (month === 0) {
      // "All" months: show cumulative for the semester
      return getCumulativeAttendance(subjectName, semester);
    }

    const semesterData = attendanceData.find((s) => s.semester === semester);
    if (!semesterData) return "No Data";

    const monthData = semesterData.months.find((m) => m.month === month);
    if (!monthData) return "No Data";

    const subject = monthData.subjects.find((s) => s.subjectName === subjectName);
    if (!subject) return "No Data";

    const { attendedClasses, totalClasses } = subject;
    if (totalClasses === 0) return "No Data";
    const percentage = ((attendedClasses / totalClasses) * 100).toFixed(2);
    return `${attendedClasses}/${totalClasses} (${percentage}%)`;
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(parseInt(event.target.value, 10)); // Ensure it's a number
    setSelectedMonth(0); // Reset month selection
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10)); // Ensure it's a number
  };

  const getAvailableMonths = () => {
    if (!selectedSemester) return []; // No semester selected
    const semesterData = attendanceData.find((s) => s.semester === selectedSemester);
    if (!semesterData) return []; // No data for the selected semester
    const months = semesterData.months.map((m) => m.month);
    return [0, ...months]; // Add 0 for "All"
  };

    // Helper function to get unique subjects for the selected semester
    const getSubjectsForSemester = () => {
        if (!selectedSemester) return [];
        const semesterData = attendanceData.find(s => s.semester === selectedSemester);
        if (!semesterData) return [];

        // Get all subjects from all months in the selected semester
        const allSubjects = semesterData.months.flatMap(monthData => monthData.subjects);
        
        // Create a Map to store unique subjects by subjectName (since subjectCode might be missing)
        const uniqueSubjects = new Map();
        
        // Process all subjects, keeping only the most recent entry for each subject
        allSubjects.forEach(subject => {
            // Use subjectName as the unique key since subjectCode might be empty
            const key = subject.subjectName || 'Unknown Subject';
            if (!uniqueSubjects.has(key)) {
                uniqueSubjects.set(key, {
                    subjectCode: subject.subjectCode || 'N/A',
                    subjectName: subject.subjectName || 'Unknown Subject'
                });
            }
        });

        // Convert Map to array and sort by subjectName
        return Array.from(uniqueSubjects.values())
            .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography
            variant={isSmDown ? "h5" : "h4"}
            component="h1"
            gutterBottom
            align="center"
            sx={{ mb: 0 }}
          >
            Attendance Report
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setAbsentReportDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Submit Absent Report
          </Button>
        </Stack>
      {studentInfo.usn && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 0.5, sm: 2 }}
          sx={{ mb: 2, alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "center" }}
        >
          <Typography variant="body2"><strong>USN:</strong> {studentInfo.usn}</Typography>
          {studentInfo.name && (
            <Typography variant="body2"><strong>Name:</strong> {studentInfo.name}</Typography>
          )}
          {selectedSemester && (
            <Typography variant="body2"><strong>Semester:</strong> {selectedSemester}</Typography>
          )}
        </Stack>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 2, alignItems: { xs: "stretch", sm: "center" }, justifyContent: "center" }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="attendance-semester-select-label">Semester</InputLabel>
          <Select
            labelId="attendance-semester-select-label"
            value={selectedSemester ?? ""}
            onChange={handleSemesterChange}
            label="Semester"
            displayEmpty
          >
            {attendanceData.map((sem) => (
              <MenuItem key={sem.semester} value={sem.semester}>
                Semester {sem.semester}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 220 } }}>
          <InputLabel id="attendance-month-select-label">Month</InputLabel>
            <Select
              labelId="attendance-month-select-label"
              value={selectedMonth}
              onChange={handleMonthChange}
              label="Month"
            >
              {getAvailableMonths().map((month) => (
                <MenuItem key={month} value={month}>
                  {month === 0 ? "All" : `Month ${month}`}
                </MenuItem>
              ))}
            </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
          Loading attendance data...
        </Typography>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <TableContainer sx={{ border: "1px solid gray", overflowX: "auto" }}>
          <Table sx={{ minWidth: { xs: 720, md: "100%" } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid gray" }}>
                Subject Code
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Subject Name
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Attendance
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Cumulative Attendance
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSubjectsForSemester().length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ border: "1px solid gray", py: 3 }}>
                  No attendance data available for the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              getSubjectsForSemester().map((subject, index) => (
                <TableRow key={`${subject.subjectName}-${index}`}>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.subjectCode}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.subjectName}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {getMonthAttendance(subject.subjectName, selectedSemester, selectedMonth)}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {getCumulativeAttendance(subject.subjectName, selectedSemester)}
                  </TableCell>
                </TableRow>
              ))
            )}
            <TableRow sx={{ fontWeight: "bold" }}>
              <TableCell colSpan={2}>Overall Attendance</TableCell>
              <TableCell>
                {getOverallAttendance(selectedSemester)}
                <Box component="span" sx={{ ml: 1 }}>
                  (for selected semester)
                </Box>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={absentReportDialogOpen} onClose={() => setAbsentReportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit Absence Report</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DatePicker
              label="Date of Absence"
              value={absentDate}
              onChange={setAbsentDate}
              slotProps={{ textField: { fullWidth: true } }}
              disableFuture={false}
            />
            <TextField
              label="Reason for Absence"
              multiline
              rows={3}
              fullWidth
              value={absentReason}
              onChange={(e) => setAbsentReason(e.target.value)}
              placeholder="Please provide a valid reason for your absence"
            />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Proof (optional - image, document, etc.)
              </Typography>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleProofChange}
                style={{ width: "100%" }}
              />
              {absentProofPreview && (
                <Box mt={1} sx={{ maxWidth: 200 }}>
                  {absentProof?.type?.startsWith("image/") ? (
                    <img src={absentProofPreview} alt="Proof preview" style={{ maxWidth: "100%", borderRadius: 8 }} />
                  ) : (
                    <Typography variant="body2">{absentProof?.name}</Typography>
                  )}
                </Box>
              )}
            </Box>
            {myReports.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>My Submitted Reports</Typography>
                <Stack spacing={1}>
                  {myReports.map((report) => (
                    <Box key={report._id} sx={{ p: 1, border: "1px solid", borderRadius: 1, borderColor: "divider" }}>
                      <Typography variant="body2"><strong>Date:</strong> {new Date(report.absentDate).toLocaleDateString()}</Typography>
                      <Typography variant="body2"><strong>Reason:</strong> {report.reason}</Typography>
                      <Typography variant="body2" sx={{ color: report.status === "approved" ? "success.main" : report.status === "rejected" ? "error.main" : "warning.main" }}>
                        <strong>Status:</strong> {report.status}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAbsentReportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAbsentReportSubmit} variant="contained" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </LocalizationProvider>
  );
};

export default Attendance;