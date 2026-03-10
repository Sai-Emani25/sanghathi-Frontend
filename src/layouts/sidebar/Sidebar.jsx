import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import getNavConfig from "./NavConfig";
import SidebarDrawer from "./SidebarDrawer";
import NavItemsList from "./NavItemsList";
import FlexBetween from "../../components/FlexBetween";
import logo from "../../public/logo.svg";
import { Box, IconButton, useTheme, Typography } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";

const Sidebar = ({
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
  onBackdropClick,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("dashboard");
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);

  const normalizeText = (text) => {
    return text.replace(/[\s_-]/g, "");
  };

  useEffect(() => {
    if (pathname === "/") {
      setActive("dashboard");
    } else {
      setActive(normalizeText(pathname.substring(1)));
    }
  }, [pathname]);

  useEffect(() => {
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
    // Only fetch if student
    if (user?.roleName === 'student') {
      fetchSettings();
    }
  }, [user]);

  let navConfig = getNavConfig(user?.roleName);
  // For students, filter out Feedback tab if feedback is disabled
  if (user?.roleName === 'student' && !feedbackEnabled) {
    navConfig = navConfig.filter(item => item.text !== 'Feedback');
  }

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <SidebarDrawer
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          drawerWidth={drawerWidth}
          onBackdropClick={onBackdropClick}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <img
              src={logo}
              alt="CMRIT Logo"
              style={{
                filter: "none",
                margin: "20px 5px",
                width: "145px",
              }}
            />
          </Box>
          <FlexBetween color={theme.palette.secondary.main}>
            {!isNonMobile && (
              <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <ChevronLeft />
              </IconButton>
            )}
          </FlexBetween>
          <NavItemsList
            navConfig={navConfig}
            active={active}
            setActive={setActive}
          />
        </SidebarDrawer>
      )}
    </Box>
  );
};

export default Sidebar;
