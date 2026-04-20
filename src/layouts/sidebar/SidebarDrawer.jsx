import { Drawer, useTheme } from "@mui/material";
import useResponsive from "../../hooks/useResponsive";

const SidebarDrawer = ({
  isSidebarOpen,
  setIsSidebarOpen,
  drawerWidth,
  children,
  onBackdropClick,
}) => {
  const theme = useTheme();
  const isNonMobile = useResponsive("up", "sm");

  const getActualWidth = () => {
    if (!isNonMobile || !isSidebarOpen) return 0;
    return typeof drawerWidth === 'number' ? drawerWidth : 250;
  };

  const actualWidth = getActualWidth();

  return (
    <Drawer
      open={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      variant="permanent"
      anchor="left"
      sx={{
        width: actualWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          width: actualWidth,
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {children}
    </Drawer>
  );
};

export default SidebarDrawer;