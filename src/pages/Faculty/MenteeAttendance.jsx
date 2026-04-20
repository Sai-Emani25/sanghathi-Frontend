import { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Container,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { CheckCircle, Cancel, Visibility } from "@mui/icons-material";
import Page from "../../components/Page";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import { useSnackbar } from "notistack";

const MenteeAttendance = () => {
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const [menteeAttendanceMap, setMenteeAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMenteeAttendance();
  }, []);

  const fetchMenteeAttendance = async () => {
    try {
      const res = await api.get("/students/absence-reports/mentor/mentees");
      setMenteeAttendanceMap(res.data.data.menteeAttendanceMap || {});
    } catch (err) {
      enqueueSnackbar("Failed to fetch mentee attendance data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reportId) => {
    setActionLoading(true);
    try {
      await api.patch(`/students/absence-reports/${reportId}/approve`);
      enqueueSnackbar("Report approved! Thread created with student.", { variant: "success" });
      fetchMenteeAttendance();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Failed to approve", { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reportId) => {
    setActionLoading(true);
    try {
      await api.patch(`/students/absence-reports/${reportId}/reject`);
      enqueueSnackbar("Report rejected", { variant: "success" });
      fetchMenteeAttendance();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || "Failed to reject", { variant: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  return (
    <Page title="Mentee Attendance">
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mentee Attendance Reports
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          View and manage absence reports submitted by your mentees
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : Object.keys(menteeAttendanceMap).length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No mentees found or no reports submitted.</Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {Object.entries(menteeAttendanceMap).map(([menteeId, data]) => {
              const { mentee, reports } = data;
              const pendingCount = reports.filter((r) => r.status === "pending").length;

              return (
                <Card key={menteeId}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{mentee.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          USN: {mentee.usn} | Email: {mentee.email}
                        </Typography>
                      </Box>
                      {pendingCount > 0 && (
                        <Chip label={`${pendingCount} Pending`} color="warning" />
                      )}
                    </Stack>

                    {reports.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No absence reports submitted
                      </Typography>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Reason</TableCell>
                              <TableCell>Proof</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reports.map((report) => (
                              <TableRow key={report._id}>
                                <TableCell>
                                  {new Date(report.absentDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{report.reason}</TableCell>
                                <TableCell>
                                  {report.proof && (
                                    <IconButton
                                      size="small"
                                      onClick={() => window.open(report.proof, "_blank")}
                                    >
                                      <Visibility />
                                    </IconButton>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={report.status}
                                    color={getStatusColor(report.status)}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  {report.status === "pending" && (
                                    <Stack direction="row" spacing={1}>
                                      <IconButton
                                        color="success"
                                        onClick={() => handleApprove(report._id)}
                                        disabled={actionLoading}
                                      >
                                        <CheckCircle />
                                      </IconButton>
                                      <IconButton
                                        color="error"
                                        onClick={() => handleReject(report._id)}
                                        disabled={actionLoading}
                                      >
                                        <Cancel />
                                      </IconButton>
                                    </Stack>
                                  )}
                                  {report.threadId && (
                                    <Button
                                      size="small"
                                      component="a"
                                      href={`/threads/${report.threadId}`}
                                    >
                                      View Thread
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Page>
  );
};

export default MenteeAttendance;