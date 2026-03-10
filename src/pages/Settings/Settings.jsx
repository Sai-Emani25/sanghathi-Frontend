import { useState, useEffect, createContext } from "react";
import {
  Box,
  Card,
  Stack,
  TextField,
  Typography,
  Button,
  Alert,
  useTheme,
  Switch,
  FormControlLabel
} from "@mui/material";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

export const FeedbackEnabledContext = createContext({ feedbackEnabled: true });
export default function Settings() {
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const colorMode = isLight ? 'primary' : 'info';
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      enqueueSnackbar("Please log in to access this page", { variant: "error" });
      navigate("/login");
    }

    // Fetch global settings
    const fetchSettings = async () => {
      try {
        const response = await api.get("/global-settings");
        if (response.data.status === "success") {
          setFeedbackEnabled(response.data.data.settings.mentorFeedbackEnabled);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    if (token) fetchSettings();

  }, [navigate, enqueueSnackbar]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not logged in. Please log in again.");
        enqueueSnackbar("You are not logged in. Please log in again.", { variant: "error" });
        navigate("/login");
        return;
      }

      const response = await api.post("/users/reset-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        passwordConfirm: formData.confirmPassword,
        userId: user._id,
      });

      if (response.data.status === "success") {
        setSuccess("Password updated successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        enqueueSnackbar("Password updated successfully", { variant: "success" });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
      enqueueSnackbar(err.response?.data?.message || "Failed to update password", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add handler for Complains button
  const handleComplainsClick = () => {
    navigate("/Complain/Complaint");
  };

  return (
    <FeedbackEnabledContext.Provider value={{ feedbackEnabled }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom color={colorMode}>
          Settings
        </Typography>

        <Card sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {error && (
                <Alert severity="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" onClose={() => setSuccess("")}>
                  {success}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                color={colorMode}
              />

              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                color={colorMode}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                color={colorMode}
              />

              <Button
                type="submit"
                variant="contained"
                color={colorMode}
                size="large"
                disabled={loading}
              >
                Update Password
              </Button>
            </Stack>
          </form>
        </Card>

        {/* Complains Button and Feedback Toggle */}
        <Box sx={{ mt: 4, maxWidth: 600, mx: "auto", textAlign: "center" }}>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleComplainsClick}
            >
              Complains
            </Button>
            {(user?.roleName?.toLowerCase() === 'faculty' || user?.roleName?.toLowerCase() === 'admin' || user?.roleName?.toLowerCase() === 'hod' || user?.roleName?.toLowerCase() === 'director') && (
              <>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={feedbackEnabled} 
                      onChange={async (e) => {
                        const newValue = e.target.checked;
                        setFeedbackEnabled(newValue);
                        try {
                          const response = await api.patch("/global-settings", {
                            mentorFeedbackEnabled: newValue
                          });
                          if (response.data.status === "success") {
                            enqueueSnackbar("Feedback setting updated successfully", { variant: "success" });
                          }
                        } catch (err) {
                          console.error(err);
                          // Revert on error
                          setFeedbackEnabled(!newValue);
                          const message = err.response?.data?.message || "Failed to update settings";
                          enqueueSnackbar(message, { variant: "error" });
                        }
                      }} 
                      color="primary" 
                    />
                  }
                  label={feedbackEnabled ? "Feedback Enabled" : "Feedback Disabled"}
                />
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </FeedbackEnabledContext.Provider>
  );
}
