import { useState, useEffect, React } from "react";
//import * as XLSX from 'xlsx';

import {
  Avatar,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  InputAdornment,
  Grid,
  IconButton,
  MenuItem,
  Button,
  TextField,
  Chip,
  Stack,
  Badge,
  Divider,
  Card,
  AvatarGroup,
  Pagination
} from "@mui/material";
import { 
  Search as SearchIcon, 
  GetApp as GetAppIcon,
  FilterList as FilterListIcon,
  CalendarMonth as CalendarIcon,
  Category as CategoryIcon,
  MoreHoriz as MoreHorizIcon,
  Close as CloseIcon,
  Chat as ChatIcon
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";

import Page from "../../components/Page";
import api from "../../utils/axios"; // replace with your actual API path
import axios from "axios";
import { useSnackbar } from "notistack";
import { MessageList } from "../Thread/Message/Message";

const baseURL = import.meta.env.VITE_PYTHON_API;

import processTableData from "./ExportToExcel";

/* 
TODO : The export to excel button should be on the right side

On top of the card there should be a filter form 

New Features for data filt:


Add a search bar which should be able to display only the rows that contains the user
add sort by open and close
Add date fileter with from and to date
add sort option for date
Add filter for category

*/

/*

Excel report :

The header should be marked bold, with a sticky header and it should have a color,
Remove the _id and _v field from the data,
date should be an excel date format,
Excel file name should be a timestamp
participant name should be there as comma seperate list


*/
const Report = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [threads, setThreads] = useState([]);
  const [openDialogThreadId, setOpenDialogThreadId] = useState(null);
  const [openChatDialogThreadId, setOpenChatDialogThreadId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Closed");
  const [showFilters, setShowFilters] = useState(false);
  const [hideSummaryMessages, setHideSummaryMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(50); // Keep 50 items per page
  const { enqueueSnackbar } = useSnackbar();

  // Get the color based on the current theme mode
  const activeColor = isLight ? theme.palette.primary.main : theme.palette.info.main;

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await api.get("threads");
        if (response.status === 200) {
          const { data } = response.data;
          console.log("All threads:", data.threads);
          console.log("Thread statuses:", data.threads.map(t => t.status));
          setThreads(data.threads);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchThreads();
  }, []);

  useEffect(() => {
    setThreads([...threads]);
  }, [fromDate, toDate]);

  const handleFromDateChange = (event) => {
    setFromDate(event.target.value);
    setThreads([...threads]);
  };

  const handleToDateChange = (event) => {
    setToDate(event.target.value);
    setThreads([...threads]);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const filteredThreads = threads.filter((thread) => {
    // Get properly normalized values for comparison
    const normalizedStatus = thread.status ? thread.status.toLowerCase().trim() : '';
    
    // Only filter out threads that are explicitly "open" or "in progress" AND have no topic/category
    if ((normalizedStatus === 'open' || normalizedStatus === 'in progress') && !thread.topic) {
      return false;
    }

    // Filter out threads with "Not enough messages to generate a summary." if option is selected
    if (hideSummaryMessages && 
        (thread.description === "Not enough messages to generate a summary." || 
         thread.summary === "Not enough messages to generate a summary.")) {
      return false;
    }

    // Rest of filtering logic continues...
    const hasMatchingParticipant = thread.participants?.some((participant) =>
      participant.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const hasMatchingTitle = thread.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const fromDateObj = fromDate ? new Date(fromDate) : null;
    const toDateObj = toDate ? new Date(toDate) : null;

    const threadOpenDate = thread.createdAt ? new Date(thread.createdAt) : null;

    let dateMatches = true;

    if (fromDateObj && toDateObj) {
      dateMatches =
        threadOpenDate &&
        threadOpenDate >= fromDateObj &&
        threadOpenDate <= toDateObj;
    } else if (fromDateObj) {
      dateMatches =
        threadOpenDate &&
        threadOpenDate.toDateString() === fromDateObj.toDateString();
    } else if (toDateObj) {
      dateMatches = threadOpenDate && threadOpenDate <= toDateObj;
    }

    const categoryMatches =
      !selectedCategory || thread.topic === selectedCategory;
    
    // Normalize the selected status for comparison
    const normalizedSelectedStatus = selectedStatus ? selectedStatus.toLowerCase().trim() : '';
    let statusMatches = true;
    
    if (normalizedSelectedStatus === 'open') {
      // If "Open" is selected, show both "open" and "in progress" threads
      statusMatches = normalizedStatus === 'open' || normalizedStatus === 'in progress';
    } else if (normalizedSelectedStatus === 'closed') {
      statusMatches = normalizedStatus === 'closed';
    }
    
    // If no status filter is selected, show all statuses
    if (!normalizedSelectedStatus) {
      statusMatches = true;
    }

    // If search term is empty, show all matching threads
    if (!searchTerm) {
      return dateMatches && categoryMatches && statusMatches;
    }

    // If search term exists, check for matches
    return (
      (hasMatchingParticipant || hasMatchingTitle) &&
      dateMatches &&
      categoryMatches &&
      statusMatches
    );
  }).sort((a, b) => {
    // Sort by closed date (most recent closed date first)
    // Handle threads that don't have closedAt (open threads)
    const dateA = a.closedAt ? new Date(a.closedAt) : null;
    const dateB = b.closedAt ? new Date(b.closedAt) : null;
    
    // If both have closed dates, sort by most recent closed date
    if (dateA && dateB) {
      return dateB - dateA;
    }
    
    // If only one has a closed date, put the closed one first
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    
    // If neither has a closed date (both are open), sort by created date as fallback
    const createdA = new Date(a.createdAt);
    const createdB = new Date(b.createdAt);
    return createdB - createdA;
  });

  // Pagination logic
  const totalItems = filteredThreads.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedThreads = filteredThreads.slice(startIndex, endIndex);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleOpenDialog = (threadId) => {
    setOpenDialogThreadId(threadId);
  };

  const handleCloseDialog = () => {
    setOpenDialogThreadId(null);
  };

  const handleOpenChatDialog = async (threadId) => {
    setOpenChatDialogThreadId(threadId);
    try {
      const response = await api.get(`/threads/${threadId}`);
      if (response.status === 200) {
        const { data } = response.data;
        setChatMessages(data.thread.messages);
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Error loading chat messages", { variant: "error" });
    }
  };

  const handleCloseChatDialog = () => {
    setOpenChatDialogThreadId(null);
    setChatMessages([]);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    // Scroll to top of table when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const statusColors = {
    open: "#4caf50",
    "In Progress": "#ff9800",
    closed: "#f44336",
  };

  const getStatusBgColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "open" || statusLower === "in progress") {
      return isLight ? alpha('#4caf50', 0.15) : alpha('#4caf50', 0.25);
    } else if (statusLower === "closed") {
      return isLight ? alpha('#f44336', 0.15) : alpha('#f44336', 0.25);
    }
    return isLight ? alpha('#9e9e9e', 0.15) : alpha('#9e9e9e', 0.25);
  };
  
  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "open" || statusLower === "in progress") {
      return '#4caf50';
    } else if (statusLower === "closed") {
      return '#f44336';
    }
    return '#9e9e9e';
  };

  const handleExportToExcel = () => {
    try {
      // Prepare the data for Excel
      const excelData = filteredThreads.map(thread => ({
        'Title': thread.title || 'N/A',
        'Summary': thread.description || 'N/A',
        'Status': thread.status || 'N/A',
        'Category': thread.topic || 'Uncategorized',
        'Opened Date': thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : 'N/A',
        'Closed Date': thread.closedAt ? new Date(thread.closedAt).toLocaleDateString() : 'N/A',
        'Author': thread.author?.name || 'N/A',
        'Members': thread.participants?.map(p => p.name).join(', ') || 'N/A'
      }));

      // Create a worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const columnWidths = [
        { wch: 30 }, // Title
        { wch: 50 }, // Description
        { wch: 15 }, // Status
        { wch: 20 }, // Category
        { wch: 20 }, // Opened Date
        { wch: 20 }, // Closed Date
        { wch: 20 }, // Author
        { wch: 40 }  // Members
      ];
      worksheet['!cols'] = columnWidths;

      // Create a workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Threads Report');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create download link
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Threads_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      enqueueSnackbar("Report exported successfully!", { 
        variant: "success",
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      enqueueSnackbar("Error exporting report", { 
        variant: "error",
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        }
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setSelectedCategory("");
    setSelectedStatus("Closed");
    setHideSummaryMessages(true);
    setPage(1); // Reset to first page
  };

  return (
    <Page title="Thread">
      <Container maxWidth="xl" sx={{ overflowX: "hidden", overflowY: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 2,
            mb: 4,
            borderRadius: 2,
            backgroundColor: isLight 
              ? 'rgba(255, 255, 255, 0.8)'
              : alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(8px)',
            boxShadow: isLight
              ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
              : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          }}
        >
          <Box 
            sx={{ 
              textAlign: 'center',
              mb: 3
            }}
          >
            <Typography 
              variant="h4"
              sx={{
                fontWeight: 'bold',
                background: isLight 
                  ? `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                  : `-webkit-linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Threads Report
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              View and export thread data from your system
            </Typography>
          </Box>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            sx={{ mb: 3 }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <TextField
              placeholder="Search by title or participant..."
              fullWidth
              size="small"
              sx={{
                maxWidth: { sm: 300, md: 400 },
                backgroundColor: isLight 
                  ? alpha(theme.palette.common.white, 0.5)
                  : alpha(theme.palette.background.paper, 0.5),
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: activeColor,
                  },
                }
              }}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack 
              direction="row" 
              spacing={1}
              sx={{ 
                flexWrap: 'nowrap',
                justifyContent: { xs: 'space-between', sm: 'flex-end' }
              }}
            >
              <Button
                variant="outlined"
                color={isLight ? "primary" : "info"}
                onClick={toggleFilters}
                startIcon={<FilterListIcon />}
                size="small"
                sx={{
                  borderRadius: 2,
                  whiteSpace: 'nowrap'
                }}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>

              <Button
                variant="contained"
                color={isLight ? "primary" : "info"}
                onClick={handleExportToExcel}
                startIcon={<GetAppIcon />}
                size="small"
                sx={{
                  borderRadius: 2,
                  whiteSpace: 'nowrap'
                }}
              >
                Export to Excel
              </Button>
            </Stack>
          </Stack>

          {showFilters && (
            <Card
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                backgroundColor: isLight 
                  ? alpha(theme.palette.primary.main, 0.04)
                  : alpha(theme.palette.info.main, 0.08),
                borderRadius: 2,
              }}
            >
              <Stack 
                direction="row" 
                sx={{ 
                  mb: 2,
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  Filter Options
                </Typography>
                {(selectedCategory || selectedStatus || fromDate || toDate) && (
                  <Button 
                    variant="text" 
                    color="error" 
                    size="small" 
                    onClick={clearFilters}
                    startIcon={<CloseIcon fontSize="small" />}
                  >
                    Clear Filters
                  </Button>
                )}
              </Stack>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={2.4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: selectedStatus 
                              ? getStatusColor(selectedStatus) 
                              : 'text.disabled' 
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon 
                            fontSize="small" 
                            sx={{ 
                              color: selectedCategory 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {[...new Set(threads.map((thread) => thread.topic))].map(
                      (topic, index) => (
                        <MenuItem key={index} value={topic}>
                          {topic || "Uncategorized"}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon 
                            fontSize="small" 
                            sx={{ 
                              color: fromDate 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={handleToDateChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon 
                            fontSize="small" 
                            sx={{ 
                              color: toDate 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={2.4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Summary Filter"
                    value={hideSummaryMessages ? "hide" : "show"}
                    onChange={(e) => setHideSummaryMessages(e.target.value === "hide")}
                  >
                    <MenuItem value="show">Show All</MenuItem>
                    <MenuItem value="hide">Hide Empty Summaries</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Card>
          )}

          <Box sx={{ position: 'relative' }}>
            {/* Add pagination info above the table */}
            {filteredThreads.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                px: 1
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Page {page} of {totalPages}
                </Typography>
              </Box>
            )}

            {paginatedThreads.length > 0 ? (
              <>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    overflow: 'hidden',
                    maxWidth: '100%',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ 
                      backgroundColor: isLight 
                        ? alpha(theme.palette.primary.main, 0.08) 
                        : alpha(theme.palette.info.main, 0.1),
                      position: 'sticky',
                      top: 0,
                      zIndex: 10
                    }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Opened Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Closed date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Members</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedThreads.map((thread) => (
                        <TableRow 
                          key={thread._id}
                          hover
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: isLight 
                                ? alpha(theme.palette.primary.main, 0.04) 
                                : alpha(theme.palette.info.main, 0.08),
                            },
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {thread.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                maxHeight: "4rem",
                                maxWidth: "15rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  textAlign: "justify",
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}
                              >
                                {thread.description}
                              </Typography>
                            </Box>
                            <Button 
                              size="small" 
                              onClick={() => handleOpenDialog(thread._id)}
                              sx={{ 
                                textTransform: 'none', 
                                mt: 0.5,
                                color: isLight ? theme.palette.primary.main : theme.palette.info.main,
                                px: 1,
                                '&:hover': {
                                  backgroundColor: isLight 
                                    ? alpha(theme.palette.primary.main, 0.08) 
                                    : alpha(theme.palette.info.main, 0.1),
                                }
                              }}
                            >
                              Read more
                            </Button>
                            <Dialog
                              open={openDialogThreadId === thread._id}
                              onClose={handleCloseDialog}
                              PaperProps={{
                                sx: {
                                  borderRadius: 2,
                                  maxWidth: 'sm',
                                  width: '100%'
                                }
                              }}
                            >
                              <DialogContent>
                                <Typography variant="h6" gutterBottom>
                                  {thread.title}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body2">
                                  {thread.description}
                                </Typography>
                              </DialogContent>
                              <DialogActions>
                                <Button 
                                  onClick={handleCloseDialog}
                                  variant="outlined"
                                  color={isLight ? "primary" : "info"}
                                  size="small"
                                >
                                  Close
                                </Button>
                              </DialogActions>
                            </Dialog>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={thread.status}
                              size="small"
                              sx={{
                                backgroundColor: getStatusBgColor(thread.status),
                                color: getStatusColor(thread.status),
                                fontWeight: 'medium',
                                borderRadius: '8px',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {thread.topic ? (
                              <Chip
                                label={thread.topic}
                                size="small"
                                sx={{
                                  backgroundColor: isLight 
                                    ? alpha(theme.palette.primary.main, 0.08) 
                                    : alpha(theme.palette.info.main, 0.1),
                                  color: isLight 
                                    ? theme.palette.primary.main 
                                    : theme.palette.info.main,
                                  borderRadius: '8px',
                                }}
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No Category
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(thread.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {thread.closedAt
                                ? new Date(thread.closedAt).toLocaleDateString()
                                : "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 28, 
                                  height: 28,
                                  bgcolor: isLight 
                                    ? theme.palette.primary.main 
                                    : theme.palette.info.main,
                                  fontSize: '0.875rem',
                                  mr: 1
                                }}
                              >
                                {thread?.author?.name?.[0] || "?"}
                              </Avatar>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                                {thread?.author?.name || "Unknown"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <AvatarGroup
                              max={3}
                              sx={{
                                '& .MuiAvatar-root': {
                                  width: 28,
                                  height: 28,
                                  fontSize: '0.875rem',
                                  backgroundColor: isLight 
                                    ? alpha(theme.palette.primary.main, 0.8) 
                                    : alpha(theme.palette.info.main, 0.8),
                                },
                              }}
                            >
                              {thread.participants.map((participant, idx) => (
                                <Tooltip
                                  key={idx}
                                  title={participant.name}
                                  placement="top"
                                >
                                  <Avatar alt={participant.name}>
                                    {participant.name[0]}
                                  </Avatar>
                                </Tooltip>
                              ))}
                            </AvatarGroup>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ChatIcon />}
                              onClick={() => handleOpenChatDialog(thread._id)}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                color: isLight ? theme.palette.primary.main : theme.palette.info.main,
                                borderColor: isLight ? theme.palette.primary.main : theme.palette.info.main,
                                '&:hover': {
                                  backgroundColor: isLight 
                                    ? alpha(theme.palette.primary.main, 0.08) 
                                    : alpha(theme.palette.info.main, 0.1),
                                }
                              }}
                            >
                              View Chat
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Add pagination controls below the table */}
                {totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    mt: 3,
                    gap: 2
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      {totalItems} total results
                    </Typography>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color={isLight ? "primary" : "info"}
                      variant="outlined"
                      shape="rounded"
                      showFirstButton
                      showLastButton
                      sx={{
                        '& .MuiPaginationItem-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              // Your existing "no results" section remains the same
              <Box 
                sx={{ 
                  py: 6, 
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderRadius: 2,
                  border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No threads match your search criteria
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or search terms
                </Typography>
                {(selectedCategory || selectedStatus || fromDate || toDate || searchTerm) && (
                  <Button 
                    variant="outlined" 
                    color={isLight ? "primary" : "info"}
                    size="small" 
                    onClick={clearFilters}
                    sx={{ mt: 2 }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Chat Messages Dialog */}
        <Dialog
          open={Boolean(openChatDialogThreadId)}
          onClose={handleCloseChatDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              minHeight: '60vh',
              maxHeight: '80vh'
            }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="h6">
                Chat Messages
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
              {chatMessages.length > 0 ? (
                <MessageList 
                  conversation={threads.find(t => t._id === openChatDialogThreadId)} 
                  messages={chatMessages} 
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: 'text.secondary'
                }}>
                  <Typography>No messages in this thread</Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button 
              onClick={handleCloseChatDialog}
              variant="outlined"
              color={isLight ? "primary" : "info"}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
};

export default Report;
