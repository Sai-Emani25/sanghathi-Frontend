import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useSnackbar } from "notistack";
import api from "../../../utils/axios";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Grid,
  Card,
  Typography,
  Divider,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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

const FEEDBACK_OPTIONS = [
  { label: "Strongly Disagree", value: 1 },
  { label: "Disagree", value: 2 },
  { label: "Neutral", value: 3 },
  { label: "Agree", value: 4 },
  { label: "Strongly Agree", value: 5 },
];

export default function MentorFeedbackForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      semester: user?.semester ? user.semester.toString() : "",
      usn: user?.usn || "",
      mentorFeedbackStep1: Array(QUESTIONS_STEP1.length).fill(""),
      mentorFeedbackStep2: Array(QUESTIONS_STEP2.length).fill(""),
      pstMembersAware: "",
      pltMembersAware: "",
      remarks: "",
      rateMentor: "",
      averageScore: "",
    },
  });

  const [step, setStep] = React.useState(1);
  const [locked, setLocked] = React.useState(false);

  // If user object changes (e.g. after login), reset form with profile values
  React.useEffect(() => {
    if (user) {
      reset({
        semester: user.semester?.toString() || "",
        usn: user.usn || "",
        mentorFeedbackStep1: Array(QUESTIONS_STEP1.length).fill(""),
        mentorFeedbackStep2: Array(QUESTIONS_STEP2.length).fill(""),
        pstMembersAware: "",
        pltMembersAware: "",
        remarks: "",
        rateMentor: "",
        averageScore: "",
      });
    }
  }, [user, reset]);

  const mentorFeedbackStep1 = watch("mentorFeedbackStep1") || [];
  const mentorFeedbackStep2 = watch("mentorFeedbackStep2") || [];
  const pstAware = watch("pstMembersAware") || "";
  const pltAware = watch("pltMembersAware") || "";
  const rateMentor = watch("rateMentor") || "";

  const step1Filled =
    mentorFeedbackStep1.length === QUESTIONS_STEP1.length &&
    mentorFeedbackStep1.every((v) => v !== "") &&
    pstAware !== "" &&
    pltAware !== "";

  const step2Filled =
    mentorFeedbackStep2.length === QUESTIONS_STEP2.length &&
    mentorFeedbackStep2.every((v) => v !== "") &&
    rateMentor !== "";

  // Dynamic average kept in form state but not rendered
  React.useEffect(() => {
    const all = [...mentorFeedbackStep1, ...mentorFeedbackStep2].filter(
      (v) => v !== ""
    );
    if (all.length === 0) {
      setValue("averageScore", "");
      return;
    }
    const scores = all.map((v) => Number(v));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    setValue("averageScore", avg.toFixed(2));
  }, [mentorFeedbackStep1, mentorFeedbackStep2, setValue]);

  const onSubmit = async (data) => {
    const scores1 = (data.mentorFeedbackStep1 || []).map((v) => Number(v));
    const scores2 = (data.mentorFeedbackStep2 || []).map((v) => Number(v));
    const scores = [...scores1, ...scores2];

    const avgScore =
      scores.length > 0
        ? Number(
            (
              scores.reduce((a, b) => a + b, 0) / scores.length
            ).toFixed(2)
          )
        : 0;

    try {
      const res = await api.post("/mentor-feedback", {
        ...data,
        mentorFeedback: scores,
        userId: user?._id,
        averageScore: avgScore,
        semester: Number(data.semester),
        rateMentor: Number(data.rateMentor),
      });

      const feedbackId = res.data?.id || res.data?._id;

      enqueueSnackbar("Feedback submitted successfully!", {
        variant: "success",
      });

      if (feedbackId) {
        navigate(`/mentor-feedback-summary/${feedbackId}`);
      }

      setLocked(true);
      setStep(1);
    } catch (error) {
      enqueueSnackbar("Error submitting feedback", { variant: "error" });
    }
  };

  const renderScale = (field) => (
    <>
      <RadioGroup row={false} {...field}>
        {FEEDBACK_OPTIONS.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value.toString()}
            control={
              <Radio
                sx={{
                  color: "#4CAF50",
                  "&.Mui-checked": { color: "#4CAF50" },
                }}
              />
            }
            label={<Typography color="#fff">{opt.label}</Typography>}
          />
        ))}
      </RadioGroup>
      {field.value === "" && (
        <Typography variant="caption" color="#F44336">
          *Required
        </Typography>
      )}
    </>
  );

  return (
    <Box sx={{ backgroundColor: "#222A35", p: 2, borderRadius: 2 }}>
      {!locked ? (
        <>
          <Typography variant="h4" align="center" gutterBottom color="#fff">
            Mentor Feedback Form
          </Typography>
          <Divider sx={{ bgcolor: "#444B58", mb: 3 }} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card sx={{ p: 3, bgcolor: "#222A35", color: "#fff" }}>
              <Grid container spacing={2}>
                {/* USN */}
                <Grid item xs={12} sm={4}>
                  <Typography gutterBottom>USN</Typography>
                  <Controller
                    name="usn"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          bgcolor: "#222A35",
                          color: "#fff",
                          borderColor: "#444B58",
                          input: { color: "#fff" },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Semester (editable) */}
                <Grid item xs={12} sm={4}>
                  <Typography gutterBottom>Semester</Typography>
                  <Controller
                    name="semester"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        variant="outlined"
                        sx={{
                          bgcolor: "#222A35",
                          color: "#fff",
                          borderColor: "#444B58",
                          input: { color: "#fff" },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* STEP 1 QUESTIONS */}
                {step === 1 &&
                  QUESTIONS_STEP1.map((q, i) => (
                    <Grid item xs={12} key={i}>
                      <Typography gutterBottom>{q}</Typography>
                      <Controller
                        name={`mentorFeedbackStep1[${i}]`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => renderScale(field)}
                      />
                    </Grid>
                  ))}

                {step === 1 && (
                  <>
                    {/* PST aware */}
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Are you aware of PST Members of your class?
                      </Typography>
                      <Controller
                        name="pstMembersAware"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <>
                            <RadioGroup row {...field}>
                              <FormControlLabel
                                value="yes"
                                control={
                                  <Radio
                                    sx={{
                                      color: "#4CAF50",
                                      "&.Mui-checked": { color: "#4CAF50" },
                                    }}
                                  />
                                }
                                label={
                                  <Typography color="#fff">Yes</Typography>
                                }
                              />
                              <FormControlLabel
                                value="no"
                                control={
                                  <Radio
                                    sx={{
                                      color: "#F44336",
                                      "&.Mui-checked": { color: "#F44336" },
                                    }}
                                  />
                                }
                                label={<Typography color="#fff">No</Typography>}
                              />
                            </RadioGroup>
                            {field.value === "" && (
                              <Typography
                                variant="caption"
                                color="#F44336"
                              >
                                *Required
                              </Typography>
                            )}
                          </>
                        )}
                      />
                    </Grid>

                    {/* PLT aware */}
                    <Grid item xs={12}>
                      <Typography gutterBottom>
                        Are you aware of PLT Members of your class?
                      </Typography>
                      <Controller
                        name="pltMembersAware"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <>
                            <RadioGroup row {...field}>
                              <FormControlLabel
                                value="yes"
                                control={
                                  <Radio
                                    sx={{
                                      color: "#4CAF50",
                                      "&.Mui-checked": { color: "#4CAF50" },
                                    }}
                                  />
                                }
                                label={
                                  <Typography color="#fff">Yes</Typography>
                                }
                              />
                              <FormControlLabel
                                value="no"
                                control={
                                  <Radio
                                    sx={{
                                      color: "#F44336",
                                      "&.Mui-checked": { color: "#F44336" },
                                    }}
                                  />
                                }
                                label={<Typography color="#fff">No</Typography>}
                              />
                            </RadioGroup>
                            {field.value === "" && (
                              <Typography
                                variant="caption"
                                color="#F44336"
                              >
                                *Required
                              </Typography>
                            )}
                          </>
                        )}
                      />
                    </Grid>
                  </>
                )}

                {/* STEP 2 QUESTIONS */}
                {step === 2 &&
                  QUESTIONS_STEP2.map((q, i) => (
                    <Grid item xs={12} key={i}>
                      <Typography gutterBottom>{q}</Typography>
                      <Controller
                        name={`mentorFeedbackStep2[${i}]`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => renderScale(field)}
                      />
                    </Grid>
                  ))}

                {step === 2 && (
                  <>
                    {/* Remarks (optional) */}
                    <Grid item xs={12}>
                      <Typography gutterBottom>Any other remarks</Typography>
                      <Controller
                        name="remarks"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            multiline
                            rows={2}
                            variant="outlined"
                            sx={{
                              bgcolor: "#222A35",
                              color: "#fff",
                              borderColor: "#444B58",
                              input: { color: "#fff" },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Rate mentor 1–5 (required) */}
                    <Grid item xs={12}>
                      <Typography gutterBottom>Rate your mentor (1-5)</Typography>
                      <Controller
                        name="rateMentor"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                                mb: 1,
                              }}
                            >
                              {[1, 2, 3, 4, 5].map((value) => {
                                let color = "#888";
                                if (value === 1 || value === 2) color = "#F44336";
                                else if (value === 3) color = "#FFEB3B";
                                else if (value === 4 || value === 5)
                                  color = "#4CAF50";
                                return (
                                  <Button
                                    key={value}
                                    variant={
                                      field.value === value.toString()
                                        ? "contained"
                                        : "outlined"
                                    }
                                    sx={{
                                      bgcolor:
                                        field.value === value.toString()
                                          ? color
                                          : "#222A35",
                                      color:
                                        field.value === value.toString()
                                          ? value === 3
                                            ? "#222A35"
                                            : "#fff"
                                          : "#fff",
                                      borderColor: color,
                                      minWidth: 48,
                                      minHeight: 36,
                                      fontWeight: "bold",
                                      fontSize: "1rem",
                                    }}
                                    onClick={() =>
                                      field.onChange(value.toString())
                                    }
                                  >
                                    {value}
                                  </Button>
                                );
                              })}
                            </Box>
                            {field.value === "" && (
                              <Typography
                                variant="caption"
                                color="#F44336"
                              >
                                *Required
                              </Typography>
                            )}
                          </>
                        )}
                      />
                    </Grid>
                  </>
                )}
              </Grid>

              {/* ACTION BUTTONS */}
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                )}

                {step === 1 && (
                  <Button
                    type="button"
                    variant="contained"
                    sx={{
                      bgcolor: step1Filled ? "#4CAF50" : "#888",
                      color: "#fff",
                      py: 1.5,
                      px: 4,
                      fontWeight: "bold",
                    }}
                    disabled={!step1Filled}
                    onClick={() => setStep(2)}
                  >
                    Next
                  </Button>
                )}

                {step === 2 && (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      bgcolor: step2Filled ? "#4CAF50" : "#888",
                      color: "#fff",
                      py: 1.5,
                      px: 4,
                      fontWeight: "bold",
                    }}
                    disabled={!step2Filled}
                  >
                    Submit
                  </Button>
                )}
              </Box>
            </Card>
          </form>
        </>
      ) : (
        <Card sx={{ p: 4, bgcolor: "#222A35", color: "#fff" }}>
          <Typography variant="h4" align="center" gutterBottom>
            Thank you for your feedback!
          </Typography>
          <Typography align="center" sx={{ mb: 3 }}>
            Your response has been recorded. You can submit another feedback if needed.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={() => {
                setLocked(false);
                setStep(1);
                reset({
                  semester: user?.semester?.toString() || "",
                  usn: user?.usn || "",
                  mentorFeedbackStep1: Array(QUESTIONS_STEP1.length).fill(""),
                  mentorFeedbackStep2: Array(QUESTIONS_STEP2.length).fill(""),
                  pstMembersAware: "",
                  pltMembersAware: "",
                  remarks: "",
                  rateMentor: "",
                  averageScore: "",
                });
              }}
            >
              Give another feedback
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
}
