import React, { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext"; // fixed import path
import { useSnackbar } from "notistack";
import api from "../../../utils/axios"; // fixed import path
import { useForm, Controller } from "react-hook-form";
import { Box, Grid, Card, Typography, Divider, Button, TextField, RadioGroup, FormControlLabel, Radio } from "@mui/material";

const QUESTIONS = [
  "Whether your mentor is accessible and available?",
  "Does the mentor interact with you frequently?",
  "Whether your mentor has helped you in academic related problems?",
  "Does your mentor demonstrate a reasonable interest/concern towards you in your quest to offer assistance?",
  "Does the mentor demonstrate concern and interest by taking time to listen and respond to queries?",
  "Did your mentor motivate you to participate in professional activities?",
  "Any specific barrier expressed in the mentoring process was resolved?",
  "Whether the mentoring system is effective in facilitating the improvement in your professional performance & emotional status?",
  "How likely do you want to continue under the same mentor in the further semesters?"
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
  // Get semester from user profile
  // Ensure semester is a number and visible
  const semester = user?.semester ? user.semester.toString() : "";

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      mentorFeedback: Array(9).fill(""),
      pstMembersAware: "",
      pltMembersAware: "",
      remarks: "",
      semester: semester,
      rateMentor: "",
    },
  });

  // Ensure semester is always set from user profile
  React.useEffect(() => {
    if (semester) setValue("semester", semester);
  }, [semester, setValue]);

  // Ensure all questions are answered to enable the button
  // Button enabled only if all required fields except semester are filled
  const allFilled =
    watch("mentorFeedback")?.every((v) => v !== "") &&
    watch("pstMembersAware") !== "" &&
    watch("pltMembersAware") !== "" &&
    watch("remarks") !== undefined &&
    watch("rateMentor") !== "";

  const onSubmit = async (data) => {
    const scores = data.mentorFeedback.map(Number);
    const avgScore = Number(
      (scores.reduce((a, b) => a + b) / scores.length).toFixed(2)
    );

    try {
      await api.post("/feedback", {
        ...data,
        userId: user?._id,
        averageScore: avgScore,
        semester: semester, // always send semester from profile
      });
      enqueueSnackbar("Feedback submitted successfully!", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Error submitting feedback", { variant: "error" });
    }
  };

  return (
    <Box sx={{ backgroundColor: "#222A35", p: 2, borderRadius: 2 }}>
      <Typography variant="h4" align="center" gutterBottom color="#fff">
        Feedback Form
      </Typography>
      <Divider sx={{ bgcolor: "#444B58", mb: 3 }} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ p: 3, bgcolor: "#222A35", color: "#fff" }}>
          <Grid container spacing={2}>
            {/* Semester field (read-only, visible at top) */}
            <Grid item xs={12}>
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
                    InputProps={{ readOnly: true }}
                  />
                )}
              />
            </Grid>
            {QUESTIONS.map((q, i) => (
              <Grid item xs={12} key={i}> {/* Each question below the other */}
                <Typography gutterBottom>{q}</Typography>
                <Controller
                  name={`mentorFeedback[${i}]`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
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
                        <Typography variant="caption" color="#F44336">*Required</Typography>
                      )}
                    </>
                  )}
                />
              </Grid>
            ))}

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
                        label={<Typography color="#fff">Yes</Typography>}
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
                      <Typography variant="caption" color="#F44336">*Required</Typography>
                    )}
                  </>
                )}
              />
            </Grid>

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
                        label={<Typography color="#fff">Yes</Typography>}
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
                      <Typography variant="caption" color="#F44336">*Required</Typography>
                    )}
                  </>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Any other remarks</Typography>
              <Controller
                name="remarks"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <>
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
                    {field.value === "" && (
                      <Typography variant="caption" color="#F44336">*Required</Typography>
                    )}
                  </>
                )}
              />
            </Grid>


            {/* Rate mentor out of 5 (buttons) */}
            <Grid item xs={12}>
              <Typography gutterBottom>
                Rate your mentor (1-5)
              </Typography>
              <Controller
                name="rateMentor"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                      {[1,2,3,4,5].map((value) => {
                        let color = "#888";
                        if (value === 1 || value === 2) color = "#F44336"; // red
                        else if (value === 3) color = "#FFEB3B"; // yellow
                        else if (value === 4 || value === 5) color = "#4CAF50"; // green
                        return (
                          <Button
                            key={value}
                            variant={field.value === value.toString() ? "contained" : "outlined"}
                            sx={{
                              bgcolor: field.value === value.toString() ? color : "#222A35",
                              color: field.value === value.toString() ? (value === 3 ? "#222A35" : "#fff") : "#fff",
                              borderColor: color,
                              minWidth: 48,
                              minHeight: 36,
                              fontWeight: "bold",
                              fontSize: "1rem"
                            }}
                            onClick={() => field.onChange(value.toString())}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", ml: 0, gap: 2, flexWrap: "wrap" }}>
                      <Typography variant="caption" color="#F44336">1 = Fair</Typography>
                      <Typography variant="caption" color="#F44336">2 = Satisfactory</Typography>
                      <Typography variant="caption" color="#FFEB3B">3 = Good</Typography>
                      <Typography variant="caption" color="#4CAF50">4 = Very Good</Typography>
                      <Typography variant="caption" color="#4CAF50">5 = Excellent</Typography>
                    </Box>
                    {field.value === "" && (
                      <Typography variant="caption" color="#F44336">*Required</Typography>
                    )}
                  </>
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: allFilled ? "#4CAF50" : "#888",
                color: "#fff",
                py: 1.5,
                px: 4,
                fontWeight: "bold",
              }}
              disabled={!allFilled}
            >
              Submit Feedback
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}
