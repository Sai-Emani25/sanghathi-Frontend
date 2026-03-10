import { capitalCase } from "change-case";
import { AuthContext } from "../../context/AuthContext";
import { useState, useContext, useEffect } from "react";
// @mui
import { Container, Tab, Box, Tabs, useTheme } from "@mui/material";
import { useLocation } from "react-router-dom";
// routes

// hooks
import useTabs from "../../hooks/useTabs";

// components
import Page from "../../components/Page";
import Iconify from "../../components/Iconify";
import HeaderBreadcrumbs from "../../components/HeaderBreadcrumbs";
// sections

import React from "react";
import StudentDetailsForm from "./StudentDetailsForm";
import AdmissionDetails from "./AdmissionDetails";
import LocalGuardianForm from "./LocalGuardianForm";
import ParentsDetails from "./ParentsDetails";
import ContactDetails from "./ContactDetails";
import Academic from "./Academic";
import PrevAcademic from "./PrevAcademic";

// ----------------------------------------------------------------------


export default function StudentProfile() {
  const { currentTab, onChangeTab } = useTabs("Student Details");
  const theme = useTheme();
  const location = useLocation();
  const isLight = theme.palette.mode === 'light';
  const colorMode = isLight ? 'primary' : 'info';

  // Feedback enable/disable state
  const [feedbackEnabled, setFeedbackEnabled] = useState(true);
  const [pendingFeedbackEnabled, setPendingFeedbackEnabled] = useState(feedbackEnabled);
  const [saving, setSaving] = useState(false);

  // Check if we're in admin edit mode
  const searchParams = new URLSearchParams(location.search);
  const isAdminEdit = searchParams.get('adminEdit') === 'true';
  const menteeId = searchParams.get('menteeId');

  // Save feedback enabled/disabled state (replace with API/localStorage as needed)
  const handleSaveFeedbackEnabled = () => {
    setSaving(true);
    setTimeout(() => {
      setFeedbackEnabled(pendingFeedbackEnabled);
      setSaving(false);
    }, 500); // Simulate save
  };

  // Define all available tabs
  const ALL_TABS = [
    {
      value: "Student Details",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <StudentDetailsForm colorMode={colorMode} menteeId={menteeId} isAdminEdit={isAdminEdit} />,
    },
    {
      value: "Parent Details",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <ParentsDetails colorMode={colorMode} />,
    },
    {
      value: "Guardian Details",
      icon: <Iconify icon={"ic:round-receipt"} width={20} height={20} />,
      component: <LocalGuardianForm colorMode={colorMode} />,
    },
    {
      value: "Contact Details",
      icon: <Iconify icon={"eva:bell-fill"} width={20} height={20} />,
      component: <ContactDetails colorMode={colorMode} />,
    },
    {
      value: "Academic Details",
      icon: <Iconify icon={"eva:share-fill"} width={20} height={20} />,
      component: <PrevAcademic colorMode={colorMode} />,
    },
    {
      value: "Admission Details",
      icon: <Iconify icon={"eva:share-fill"} width={20} height={20} />,
      component: <AdmissionDetails colorMode={colorMode} />,
    },
  ];

  // Use only student details tab for admin edit mode, all tabs for regular student view
  const ACCOUNT_TABS = isAdminEdit ? [ALL_TABS[0]] : ALL_TABS;

  return (
    <Page title="Student Profile">
      <Container maxWidth="lg">
        {/* Feedback toggle and save button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <label style={{ marginRight: 8 }}>
            <input
              type="checkbox"
              checked={pendingFeedbackEnabled}
              onChange={e => setPendingFeedbackEnabled(e.target.checked)}
              style={{ marginRight: 4 }}
            />
            Enable Feedback
          </label>
          <button
            onClick={handleSaveFeedbackEnabled}
            disabled={saving || pendingFeedbackEnabled === feedbackEnabled}
            style={{ marginLeft: 8 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </Box>

        <Tabs
          allowScrollButtonsMobile
          variant="scrollable"
          scrollButtons="auto"
          value={currentTab}
          onChange={onChangeTab}
          sx={{
            '& .MuiTab-root': {
              color: isLight ? theme.palette.text.secondary : theme.palette.text.primary,
              '&.Mui-selected': {
                color: isLight ? theme.palette.primary.main : theme.palette.info.main
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: isLight ? theme.palette.primary.main : theme.palette.info.main
            }
          }}
        >
          {ACCOUNT_TABS.map((tab) => (
            <Tab
              disableRipple
              key={tab.value}
              label={tab.value}
              icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>

        <Box sx={{ mb: 5 }} />

        {/* Conditionally render feedback section */}
        {feedbackEnabled && (
          <Box sx={{ mb: 3 }}>
            {/* Replace with your actual Feedback component/section */}
            <div style={{ padding: '16px', background: '#222', borderRadius: '8px', color: '#fff' }}>
              Feedback section is visible.
            </div>
          </Box>
        )}

        {ACCOUNT_TABS.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
