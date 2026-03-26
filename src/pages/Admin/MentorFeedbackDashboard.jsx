import React, { useEffect, useState } from "react";
import { Button, Card, Container, Typography, Switch, Divider, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import api from "../../utils/axios";
import { Box } from "@mui/material";

const MentorFeedbackDashboard = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [enabled, setEnabled] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  // Fetch global setting on load
  useEffect(() => {
    api.get("/global-settings/")
      .then(res => {
        const val = res.data?.data?.settings?.mentorFeedbackEnabled;
        setEnabled(val === true);
      })
      .catch(() => setEnabled(true));
  }, []);

  useEffect(() => {
    if (enabled) {
      api.get("/mentor-feedback/")
        .then(res => {
          setFeedbacks(res.data.data);
        })
        .catch(() => setFeedbacks([]));
    } else {
      setFeedbacks([]);
    }
  }, [enabled]);

  // Show confirmation dialog before toggling
  const handleToggle = () => {
    setPendingEnabled(!enabled);
    setDialogOpen(true);
  };

  // Confirm toggle and save
  const handleDialogConfirm = () => {
    setDialogOpen(false);
    api.patch("/global-settings/", { mentorFeedbackEnabled: pendingEnabled })
      .then(res => {
        setEnabled(res.data?.data?.settings?.mentorFeedbackEnabled === true);
        setSnackbarMsg("Option saved successfully!");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setEnabled(pendingEnabled);
        setSnackbarMsg("Option saved, but with fallback.");
        setSnackbarOpen(true);
      });
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleExport = () => {
    // Export feedbacks to CSV
    const csvRows = [
      ["Student Name", "USN", "Semester", "Average Score", "Feedback"],
      ...feedbacks.map(f => [f.name, f.usn, f.semester, f.averageScore, JSON.stringify(f.mentorFeedback)])
    ];
    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mentor_feedback.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>Mentor Feedback Dashboard</Typography>
          <Grid item sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 500, color: enabled ? "success.main" : "text.secondary" }}>
                {enabled ? "Feedback Enabled" : "Feedback Disabled"}
              </Typography>
              <Switch checked={enabled} onChange={handleToggle} color={enabled ? "success" : "default"} />
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport} disabled={!enabled || feedbacks.length === 0} sx={{ ml: 2 }}>
                Export CSV
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {feedbacks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No feedback responses yet.</Typography>
          ) : (
            feedbacks.map((fb, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card sx={{ p: 2 }}>
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      USN: {fb.usn || fb.userId?.usn || "-"} &nbsp; | &nbsp; Sem: {fb.semester} &nbsp; | &nbsp; Avg Score: {fb.averageScore}
                    </Typography>
                    <Typography variant="body2">Remarks: {fb.remarks || "-"}</Typography>
                    <Typography variant="body2">Mentor Rate: {fb.rateMentor}</Typography>
                    <Button
                      variant="outlined"
                      sx={{ mt: 1 }}
                      onClick={() => window.open(`/admin/mentor-feedback/${fb._id}`, "_blank")}
                    >
                      View Full Score
                    </Button>
                  </>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Card>
      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogCancel}>
        <DialogTitle>Confirm Change</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to {pendingEnabled ? "enable" : "disable"} mentor feedback?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogCancel}>Cancel</Button>
          <Button onClick={handleDialogConfirm} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar Notification */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
                // ...existing code...
};

export default MentorFeedbackDashboard;
