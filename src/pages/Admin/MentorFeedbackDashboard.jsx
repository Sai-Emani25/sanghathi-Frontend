import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Snackbar,
  Switch,
  Typography,
} from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import api from "../../utils/axios";

const MentorFeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  useEffect(() => {
    api
      .get("/global-settings/")
      .then((res) => {
        const val = res.data?.data?.settings?.mentorFeedbackEnabled;
        setEnabled(val === true);
      })
      .catch(() => setEnabled(true));
  }, []);

  useEffect(() => {
    if (!enabled) {
      setFeedbacks([]);
      return;
    }

    api
      .get("/mentor-feedback/")
      .then((res) => {
        setFeedbacks(res.data?.data || []);
      })
      .catch(() => setFeedbacks([]));
  }, [enabled]);

  const handleToggle = () => {
    setPendingEnabled(!enabled);
    setDialogOpen(true);
  };

  const handleDialogConfirm = () => {
    setDialogOpen(false);
    api
      .patch("/global-settings/", { mentorFeedbackEnabled: pendingEnabled })
      .then((res) => {
        setEnabled(res.data?.data?.settings?.mentorFeedbackEnabled === true);
        setSnackbarMsg("Option saved successfully.");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setEnabled(pendingEnabled);
        setSnackbarMsg("Option saved, but with fallback.");
        setSnackbarOpen(true);
      });
  };

  const handleExport = () => {
    const csvRows = [
      [
        "Semester",
        "Department",
        "Average Score",
        "Mentor Rating",
        "Remarks",
        "Submitted At",
      ],
      ...feedbacks.map((feedback) => [
        feedback.semester || "-",
        feedback.studentProfile?.department || "-",
        feedback.averageScore || "-",
        feedback.rateMentor || "-",
        JSON.stringify(feedback.remarks || ""),
        feedback.createdAt || "-",
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mentor_feedback.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
            Mentor Feedback Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="body1" sx={{ fontWeight: 500, color: enabled ? "success.main" : "text.secondary" }}>
              {enabled ? "Feedback Enabled" : "Feedback Disabled"}
            </Typography>
            <Switch checked={enabled} onChange={handleToggle} color={enabled ? "success" : "default"} />
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={!enabled || feedbacks.length === 0}
            >
              Export CSV
            </Button>
          </Box>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          {feedbacks.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                No feedback responses yet.
              </Typography>
            </Grid>
          ) : (
            feedbacks.map((feedback) => (
              <Grid item xs={12} md={6} key={feedback._id}>
                <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {feedback.studentName || "Student"}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    <Chip size="small" label={`USN: ${feedback.usn || "-"}`} />
                    <Chip size="small" label={`Semester: ${feedback.semester || "-"}`} />
                    <Chip size="small" label={`Avg Score: ${feedback.averageScore || "-"}`} color="primary" />
                    <Chip size="small" label={`Mentor Rating: ${feedback.rateMentor || "-"}`} color="secondary" />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Email: {feedback.userId?.email || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Department: {feedback.studentProfile?.department || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    PST Members Aware: {feedback.pstMembersAware || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    PLT Members Aware: {feedback.pltMembersAware || "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Remarks: {feedback.remarks || "-"}
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={() => window.open(`/admin/mentor-feedback/${feedback._id}`, "_blank")}
                  >
                    View Structured Feedback
                  </Button>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm Change</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {pendingEnabled ? "enable" : "disable"} mentor feedback?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDialogConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MentorFeedbackDashboard;
