import React, { useEffect, useState, useContext } from "react";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { Box, Grid, Card, Stack, Typography, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/axios";

const DEFAULT_VALUES = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  relationWithGuardian: "",
  mobileNumber: "",
  phoneNumber: "",
  residenceAddress: "",
  taluka: "",
  district: "",
  state: "",
  pincode: "",
};

export default function LocalGuardianForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const [isDataFetched, setIsDataFetched] = useState(false);

  const isFaculty = user?.roleName === "faculty";
  const isEditable = !isFaculty;

  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    const fetchLocalGuardian = async () => {
      try {
        const userId = menteeId || user?._id;
        if (!userId) return;

        const response = await api.get(`/v1/local-guardians/${userId}`);
        if (response.data.status === "success") {
          if (response.data.data?.localGuardian) {
            reset(response.data.data.localGuardian);
          } else {
            reset(DEFAULT_VALUES);
          }
        }
      } catch (error) {
        if (error.response?.status === 404) {
          reset(DEFAULT_VALUES);
        } else {
          enqueueSnackbar("Error fetching guardian details", { variant: "error" });
        }
      } finally {
        setIsDataFetched(true);
      }
    };

    fetchLocalGuardian();
  }, [menteeId, user, reset, enqueueSnackbar]);

  const onSubmit = async (data) => {
    try {
      const userId = menteeId || user?._id;
      if (!userId) {
        enqueueSnackbar("User ID is required", { variant: "error" });
        return;
      }

      await api.post("/v1/local-guardians", { ...data, userId });
      enqueueSnackbar("Guardian details saved successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || "Error saving guardian details",
        { variant: "error" }
      );
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {isFaculty && (
        <Box sx={{ mb: 2, p: 2, bgcolor: "warning.light", borderRadius: 1 }}>
          <Typography variant="body2" color="warning.dark">
            You are viewing this student profile in read-only mode. Only students can edit their own profiles.
          </Typography>
        </Box>
      )}

      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Local Guardian Details
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {!isDataFetched ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography>Loading guardian details...</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {/* Required fields with validation */}
              <Grid item xs={12} md={4}>
                <RHFTextField
                  name="firstName"
                  id="firstName"
                  label="First Name"
                  fullWidth
                  disabled={!isEditable}
                  rules={{ required: "First name is required" }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField
                  name="lastName"
                  id="lastName"
                  label="Last Name"
                  fullWidth
                  disabled={!isEditable}
                  rules={{ required: "Last name is required" }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField
                  name="email"
                  id="email"
                  label="Email"
                  type="email"
                  fullWidth
                  disabled={!isEditable}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <RHFTextField
                  name="mobileNumber"
                  id="mobileNumber"
                  label="Mobile Number"
                  type="tel"
                  fullWidth
                  disabled={!isEditable}
                  rules={{
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Enter a valid 10-digit number",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <RHFTextField
                  name="residenceAddress"
                  id="residenceAddress"
                  label="Residence Address"
                  fullWidth
                  multiline
                  rows={4}
                  disabled={!isEditable}
                  rules={{ required: "Residence address is required" }}
                />
              </Grid>

              {/* Auto-generate remaining optional fields */}
              {Object.keys(DEFAULT_VALUES)
                .filter(
                  (f) =>
                    !["firstName", "lastName", "email", "mobileNumber", "residenceAddress"].includes(f)
                )
                .map((field) => (
                  <Grid item xs={12} md={4} key={field}>
                    <RHFTextField
                      name={field}
                      id={field}
                      label={field.split(/(?=[A-Z])/).join(" ")}
                      fullWidth
                      disabled={!isEditable}
                    />
                  </Grid>
                ))}
            </Grid>

            {/* Actions */}
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                <LoadingButton
                  variant="outlined"
                  onClick={() => reset(DEFAULT_VALUES)}
                  disabled={isSubmitting || !isEditable}
                >
                  Reset
                </LoadingButton>
                {isEditable && (
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={isSubmitting}
                  >
                    Save
                  </LoadingButton>
                )}
              </Box>
            </Stack>
          </>
        )}
      </Card>
    </FormProvider>
  );
}
