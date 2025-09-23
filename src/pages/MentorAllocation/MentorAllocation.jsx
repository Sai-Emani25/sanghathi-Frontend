import React, { useState, useEffect } from "react";
import {
  Box,
  TableContainer,
  Paper,
  Container,
  MenuItem,
  Select,
  Button,
  TextField,
  TablePagination,
  Divider,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Collapse,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import SchoolIcon from "@mui/icons-material/School";
import ConfirmationDialogMentor from '../Users/ConfirmationDialogMentorAllocation';
import ConfirmationDialogUnassign from '../Users/ConfirmationDialogMentorUnallocation';
import Page from "../../components/Page";
import api from "../../utils/axios";
import StudentTable from "./StudentTable";
import MentorAssignmentDialog from "./MentorAssignmentDialog";

const MentorAllocation = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("all");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [studentsWithMentors, setStudentsWithMentors] = useState([]);
  const [filterSem, setFilterSem] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [unassignConfirmationOpen, setUnassignConfirmationOpen] = useState(false);
  const [studentsToUnassign, setStudentsToUnassign] = useState([]);
  const rowsPerPageOptions = [5, 10, 25, 50];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Use the dedicated allocation-students endpoint
        const response = await api.get("/mentors/allocation-students");
        const { data } = response.data;
        console.log("Fetched students data:", data);
        
        // Check a sample student to understand structure
        if (data && data.length > 0) {
          console.log("Sample student structure:", JSON.stringify(data[0], null, 2));
          console.log("Profile data:", data[0].profile);
          console.log("Mentor data:", data[0].mentor);
          
          // Debug mentor structure variations
          console.log("Direct mentor name:", data[0]?.mentor?.name);
          console.log("Mentor ID:", data[0]?.mentorId);
          console.log("Mentor details:", data[0]?.mentorDetails);
        }
        
        setStudents(data || []);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  const refreshStudents = async () => {
    try {
      // Use the dedicated allocation-students endpoint
      const response = await api.get("/mentors/allocation-students");
      const { data } = response.data;
      
      setStudents(data || []);
    } catch (error) {
      console.error("Error refreshing students:", error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    refreshStudents(); 
  };

  // Add handleMentorAssignmentSuccess handler
  const handleMentorAssignmentSuccess = async () => {
    // Refresh the students data
    await refreshStudents();
    // Close the dialog
    setDialogOpen(false);
    // Clear selected students
    setSelectedStudents([]);
  };

  // Helper function to safely get profile data
  const getProfileData = (student, field) => {
    // Check all possible paths where the data might be
    if (student?.profile && student.profile[field]) {
      return student.profile[field];
    }
    
    if (student?.studentProfile && student.studentProfile[field]) {
      return student.studentProfile[field];
    }
    
    if (student?.[field]) {
      return student[field];
    }
    
    return null;
  };

  // Helper function to get mentor information
  const getMentorInfo = (student) => {
    // Check all possible paths where mentor data might be
    if (student?.mentor?.name) {
      return student.mentor.name;
    }
    
    if (student?.mentorName) {
      return student.mentorName;
    }
    
    if (student?.mentorId?.name) {
      return student.mentorId.name;
    }
    
    if (student?.mentorDetails?.name) {
      return student.mentorDetails.name;
    }
    
    // If we have a nested structure
    if (student?.mentor?.mentorDetails?.name) {
      return student.mentor.mentorDetails.name;
    }
    
    return null;
  };

  const filteredStudents = students.filter((student) => {
    const mentorName = getMentorInfo(student);
    
    const matchesMentorFilter =
      filterOption === "all" ||
      (filterOption === "assigned" && mentorName) ||
      (filterOption === "unassigned" && !mentorName);

    const matchesSemFilter = filterSem === "all" || getProfileData(student, 'sem') === filterSem;
    const matchesBranchFilter =
      filterBranch === "all" || getProfileData(student, 'department') === filterBranch;

    const matchesSearch = searchQuery === "" || 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (getProfileData(student, 'usn') || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mentorName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesMentorFilter && matchesSemFilter && matchesBranchFilter && matchesSearch;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAssignMentor = () => {
    setDialogOpen(true);
  };

  const handleAssignClick = () => {
    // Filter selected students who already have mentors
    const assignedStudents = students.filter(
      student => 
        selectedStudents.includes(student._id) && 
        student.mentor && 
        student.mentor.name
    );

    if (assignedStudents.length > 0) {
      setStudentsWithMentors(assignedStudents);
      setConfirmationOpen(true);
    } else {
      setDialogOpen(true);
    }
  };

  const handleUnassignMentor = () => {
    // Filter selected students who have mentors
    const studentsWithMentors = students.filter(student => 
      selectedStudents.includes(student._id) && getMentorInfo(student)
    );

    if (studentsWithMentors.length === 0) {
      alert("Selected students don't have mentors assigned.");
      return;
    }

    setStudentsToUnassign(studentsWithMentors);
    setUnassignConfirmationOpen(true);
  };

  const handleConfirmReassignment = () => {
    setConfirmationOpen(false);
    setDialogOpen(true);
  };

  const handleConfirmUnassign = async () => {
    try {
      const response = await api.delete("/mentors/unassign", {
        data: { menteeIds: studentsToUnassign.map(s => s._id) }
      });

      if (response.status === 200) {
        await refreshStudents();
        setSelectedStudents([]);
        setUnassignConfirmationOpen(false);
        setStudentsToUnassign([]);
        alert(`Successfully unassigned ${response.data.unassignedCount} mentors`);
      }
    } catch (error) {
      console.error("Error unassigning mentors:", error);
      alert("Error unassigning mentors. Please try again.");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterOption("all");
    setFilterSem("all");
    setFilterBranch("all");
  };

  const uniqueSems = [
    "all",
    ...new Set(students.map((student) => getProfileData(student, 'sem')).filter(Boolean)),
  ];
  const uniqueBranches = [
    "all",
    ...new Set(
      students.map((student) => getProfileData(student, 'department')).filter(Boolean)
    ),
  ];

  return (
    <Page title="Mentor Allocation">
      <Container maxWidth="lg">
        <Card sx={{ boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
          <Box 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 3,
              py: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
                Assign Mentors
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="secondary"
                disabled={selectedStudents.length === 0}
                onClick={handleAssignClick}
                endIcon={<SchoolIcon />}
                size="small"
              >
                Assign Mentor {selectedStudents.length > 0 && `(${selectedStudents.length})`}
              </Button>
              
              {/* Add this unassign button */}
              <Button
                variant="contained"
                color="error"
                disabled={selectedStudents.length === 0}
                onClick={handleUnassignMentor}
                endIcon={<ClearIcon />}
                size="small"
              >
                Unassign Mentor {selectedStudents.length > 0 && `(${selectedStudents.length})`}
              </Button>
              
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setShowFilters(!showFilters)}
                endIcon={<FilterListIcon />}
                size="small"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </Stack>
          </Box>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                  fullWidth
                  placeholder="Search by name or USN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    endAdornment: searchQuery && (
                      <IconButton size="small" onClick={() => setSearchQuery("")}>
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />
                {(searchQuery || filterOption !== "all" || filterSem !== "all" || filterBranch !== "all") && (
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>

              <Collapse in={showFilters}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: alpha(theme.palette.text.primary, 0.03),
                  borderRadius: 1
                }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value)}
                      sx={{ minWidth: 150 }}
                      fullWidth
                    >
                      <MenuItem value="all">All Students</MenuItem>
                      <MenuItem value="assigned">Assigned Mentors</MenuItem>
                      <MenuItem value="unassigned">Unassigned Mentors</MenuItem>
                    </Select>
                    <Select
                      value={filterSem}
                      onChange={(e) => setFilterSem(e.target.value)}
                      sx={{ minWidth: 150 }}
                      fullWidth
                    >
                      {uniqueSems.map((sem) => (
                        <MenuItem key={sem} value={sem}>
                          {sem === "all" ? "All Semesters" : `Sem ${sem}`}
                        </MenuItem>
                      ))}
                    </Select>
                    <Select
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                      sx={{ minWidth: 150 }}
                      fullWidth
                    >
                      {uniqueBranches.map((branch) => (
                        <MenuItem key={branch} value={branch}>
                          {branch === "all" ? "All Branches" : branch}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>
                </Box>
              </Collapse>

              <TableContainer 
                component={Paper}
                sx={{ 
                  boxShadow: 1,
                  borderRadius: 1,
                  overflow: 'hidden',
                  "& .MuiTableHead-root": {
                    backgroundColor: alpha(theme.palette.text.primary, 0.04),
                  },
                  "& .MuiTableRow-root:hover": {
                    backgroundColor: alpha(theme.palette.text.primary, 0.04),
                  }
                }}
              >
                <StudentTable
                  students={filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                  selectedStudents={selectedStudents}
                  onSelectStudent={setSelectedStudents}
                  theme={theme}
                  isLight={isLight}
                />

                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    py: 1,
                  }}
                >
                  <Box>
                    {selectedStudents.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Rows per page:
                    </Typography>
                    <Select
                      value={rowsPerPage}
                      onChange={handleChangeRowsPerPage}
                      size="small"
                      sx={{ 
                        minWidth: 70,
                        '& .MuiSelect-select': {
                          py: 0.5,
                        }
                      }}
                    >
                      {rowsPerPageOptions.map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {page * rowsPerPage + 1}-
                        {Math.min((page + 1) * rowsPerPage, filteredStudents.length)} of {filteredStudents.length}
                      </Typography>
                      <Box sx={{ display: 'flex', ml: 2 }}>
                        <IconButton 
                          size="small"
                          onClick={(e) => handleChangePage(e, page - 1)}
                          disabled={page === 0}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={(e) => handleChangePage(e, page + 1)}
                          disabled={page >= Math.ceil(filteredStudents.length / rowsPerPage) - 1}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </IconButton>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </TableContainer>
              
              {filteredStudents.length === 0 && (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No students match your filters
                  </Typography>
                  <Button
                    variant="text"
                    color="inherit"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                    sx={{ mt: 1 }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>

      <ConfirmationDialogMentor
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmReassignment}
        assignedStudents={studentsWithMentors}
      />

      <ConfirmationDialogUnassign
        open={unassignConfirmationOpen}
        onClose={() => setUnassignConfirmationOpen(false)}
        onConfirm={handleConfirmUnassign}
        studentsToUnassign={studentsToUnassign}
      />

      <MentorAssignmentDialog
        open={dialogOpen}
        studentIds={selectedStudents}
        onClose={() => {
          setDialogOpen(false);
          setSelectedStudents([]);
        }}
        onSuccess={handleMentorAssignmentSuccess}
      />
    </Page>
  );
};

export default MentorAllocation;
