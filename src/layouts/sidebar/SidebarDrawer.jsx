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
  const getDrawerWidth = () => {
    if (!isNonMobile) return 0;
    if (typeof drawerWidth === 'object') return drawerWidth.sm || drawerWidth.md || 250;
    return drawerWidth;
  };
  const actualWidth = getDrawerWidth();

  return (
    <Drawer
      open={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      variant={isNonMobile ? "permanent" : "temporary"}
      anchor="left"
      ModalProps={{
        keepMounted: true,
        onBackdropClick: onBackdropClick || (() => setIsSidebarOpen(false)),
      }}
      sx={{
        flexShrink: 0,
        width: actualWidth,
        "& .MuiDrawer-paper": {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          width: actualWidth,
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
          paddingBottom: isNonMobile ? "0" : "20px",
        },
      }}
    >
      {children}
    </Drawer>
  );
};

export default SidebarDrawer;
