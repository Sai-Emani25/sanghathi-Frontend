import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Container, Typography, Divider, CircularProgress, Box } from "@mui/material";
import api from "../../utils/axios";

const MentorFeedbackDetail = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/mentor-feedback/${id}`)
      .then(res => {
        setFeedback(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not fetch feedback details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!feedback) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}>
          Mentor Feedback Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography><b>USN:</b> {feedback.usn || feedback.userId?.usn || "-"}</Typography>
        <Typography><b>Semester:</b> {feedback.semester}</Typography>
        <Typography><b>Average Score:</b> {feedback.averageScore}</Typography>
        <Typography><b>Remarks:</b> {feedback.remarks || "-"}</Typography>
        <Typography><b>Mentor Rate:</b> {feedback.rateMentor}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Full Feedback Object:</Typography>
        <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, fontSize: 14 }}>
          {JSON.stringify(feedback, null, 2)}
        </pre>
      </Card>
    </Container>
  );
};

export default MentorFeedbackDetail;
