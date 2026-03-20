import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import api from "../../utils/axios";

const QUESTIONS_STEP1 = [
  "Whether your mentor is accessible and available?",
  "Does the mentor interact with you frequently?",
  "Whether your mentor has helped you in academic related problems?",
  "Does your mentor demonstrate a reasonable interest/concern towards you in your quest to offer assistance?",
  "Does the mentor demonstrate concern and interest by taking time to listen and respond to queries?",
  "Did your mentor motivate you to participate in professional activities?",
  "Any specific barrier expressed in the mentoring process was resolved?",
  "Whether the mentoring system is effective in facilitating the improvement in your professional performance & emotional status?",
  "How likely do you want to continue under the same mentor in the further semesters?",
];

const QUESTIONS_STEP2 = [
  "Whether your mentor maintains punctuality?",
  "Does your mentor follow up on your academic progress regularly?",
  "Is your mentor approachable for personal / emotional issues?",
  "Are you satisfied with the guidance for competitive exams / higher studies?",
];

const SCALE_LABELS = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neutral",
  4: "Agree",
  5: "Strongly Agree",
};

const MentorFeedbackDetail = () => {
  const { id } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/mentor-feedback/${id}`)
      .then((res) => {
        setFeedback(res.data?.data || null);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not fetch feedback details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;
  if (!feedback) return null;

  const scores = feedback.mentorFeedback || [];
  const step1Scores = scores.slice(0, QUESTIONS_STEP1.length);
  const step2Scores = scores.slice(QUESTIONS_STEP1.length, QUESTIONS_STEP1.length + QUESTIONS_STEP2.length);

  const renderQuestionBlock = (questions, answers) =>
    questions.map((question, index) => (
      <Card key={question} variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {question}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Score: {answers[index] ?? "-"} {answers[index] ? `(${SCALE_LABELS[answers[index]] || "-"})` : ""}
        </Typography>
      </Card>
    ));

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main", mb: 2 }}>
          Mentor Feedback Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          {feedback.studentName || "Student"}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip label={`USN: ${feedback.usn || "-"}`} />
          <Chip label={`Semester: ${feedback.semester || "-"}`} />
          <Chip label={`Average Score: ${feedback.averageScore || "-"}`} color="primary" />
          <Chip label={`Mentor Rating: ${feedback.rateMentor || "-"}`} color="secondary" />
        </Box>

        <Typography variant="body2" color="text.secondary">Email: {feedback.userId?.email || "-"}</Typography>
        <Typography variant="body2" color="text.secondary">Department: {feedback.studentProfile?.department || "-"}</Typography>
        <Typography variant="body2" color="text.secondary">PST Members Aware: {feedback.pstMembersAware || "-"}</Typography>
        <Typography variant="body2" color="text.secondary">PLT Members Aware: {feedback.pltMembersAware || "-"}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Remarks: {feedback.remarks || "-"}
        </Typography>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Step 1 Responses
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {renderQuestionBlock(QUESTIONS_STEP1, step1Scores).map((item, index) => (
            <Grid item xs={12} key={`step1-${index}`}>
              {item}
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Step 2 Responses
        </Typography>
        <Grid container spacing={2}>
          {renderQuestionBlock(QUESTIONS_STEP2, step2Scores).map((item, index) => (
            <Grid item xs={12} key={`step2-${index}`}>
              {item}
            </Grid>
          ))}
        </Grid>
      </Card>
    </Container>
  );
};

export default MentorFeedbackDetail;
