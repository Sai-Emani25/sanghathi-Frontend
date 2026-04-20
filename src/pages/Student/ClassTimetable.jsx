import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import Page from "../../components/Page";

const ClassTimetable = () => {
  const theme = useTheme();

  return (
    <Page title="Class Timetable">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom textAlign="center" mb={4}>
          Class Timetable
        </Typography>

        <Card sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Class Timetable will be available soon
          </Typography>
        </Card>
      </Container>
    </Page>
  );
};

export default ClassTimetable;