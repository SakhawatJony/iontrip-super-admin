import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";

import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from "@mui/icons-material/Person";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const MENU_TEXT_COLOR = "#4B5563";
const MENU_ICON_COLOR = "#6B7280";
const MENU_ACTIVE_COLOR = "#1F2A44";
const SIDEBAR_BORDER = "#E5E7EB";
const BRAND_PRIMARY = "#1F2A44";
const BRAND_ACCENT = "#5BA2D4";
const DROPDOWN_ICON_BG = "#111827";

const SUBMENU_TEXT_COLOR = "#6B7C93";
const SUBMENU_ACTIVE_COLOR = "#1F4D8B";
const SUBMENU_ICON_BORDER = "#D1D5DB";
const SUBMENU_ICON_ACTIVE = "#1F4D8B";

const menuItem = (icon, text, options = {}, location = null) => {
  const { dropdown = false, path, end = false, sx, onClick, isOpen, activePaths = [] } = options;

  // Check if current route matches this menu item or any of its active paths
  const isActive = path
    ? location?.pathname === path || (end ? false : location?.pathname.startsWith(path))
    : activePaths.some((activePath) => location?.pathname.startsWith(activePath));

  const buttonProps = path
    ? { component: NavLink, to: path, end }
    : { component: "div" };

  return (
    <ListItemButton
      {...buttonProps}
      onClick={onClick}
      sx={{
        py: 1.2,
        px: 1.25,
        borderRadius: 1.25,
        minHeight: 42,
        alignItems: "center",
        gap: 1.25,
        bgcolor: isActive ? "rgba(31, 42, 68, 0.08)" : "transparent",
        "&.active": {
          bgcolor: "rgba(31, 42, 68, 0.08)",
        },
        "&.active .MuiListItemIcon-root, &.active .MuiListItemText-primary": {
          color: MENU_ACTIVE_COLOR,
        },
        ...sx,
      }}
    >
      <ListItemIcon 
        sx={{ 
          minWidth: 34, 
          color: isActive ? MENU_ACTIVE_COLOR : MENU_ICON_COLOR,
          "& .MuiSvgIcon-root": {
            color: isActive ? MENU_ACTIVE_COLOR : MENU_ICON_COLOR,
          },
        }}
      >
        {icon}
      </ListItemIcon>

      <ListItemText
        primaryTypographyProps={{
          fontSize: 14,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? MENU_ACTIVE_COLOR : MENU_TEXT_COLOR,
        }}
        primary={text}
      />

      {dropdown && (
        <IconButton
          size="small"
          onClick={onClick}
          sx={{
            ml: "auto",
            width: 22,
            height: 22,
            bgcolor: DROPDOWN_ICON_BG,
            color: "#fff",
            "&:hover": { bgcolor: DROPDOWN_ICON_BG },
          }}
        >
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              transition: "transform 0.2s ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </IconButton>
      )}
    </ListItemButton>
  );
};

const SubMenuItem = ({ text, path, location }) => {
  const isActive = location.pathname === path;

  return (
    <Box
      component={NavLink}
      to={path}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 1.75,
        py: 0.55,
        pl: 5.25,
        pr: 1.25,
        minHeight: 32,
        textDecoration: "none",
        cursor: "pointer",
        width: "100%",
        "&:hover": {
          bgcolor: "transparent",
        },
      }}
    >
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: 1,
          bgcolor: isActive ? SUBMENU_ICON_ACTIVE : "#fff",
          border: `1px solid ${isActive ? SUBMENU_ICON_ACTIVE : SUBMENU_ICON_BORDER}`,
          flexShrink: 0,
          zIndex: 1,
        }}
      />
      <Typography
        component="div"
        sx={{
          fontSize: 13,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? SUBMENU_ACTIVE_COLOR : SUBMENU_TEXT_COLOR,
          lineHeight: 1.6,
          whiteSpace: "nowrap",
          display: "block",
          flex: 1,
          zIndex: 1,
          position: "relative",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState(null);

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/bookings")) {
      setExpandedMenu("bookings");
      return;
    }
    if (location.pathname.startsWith("/dashboard/wallet")) {
      setExpandedMenu("wallet");
      return;
    }
    if (location.pathname.startsWith("/dashboard/alldeposit")) {
      setExpandedMenu("wallet");
      return;
    }
    if (location.pathname.startsWith("/dashboard/customer")) {
      setExpandedMenu("customer");
      return;
    }
    if (location.pathname.startsWith("/dashboard/settings")) {
      setExpandedMenu("settings");
      return;
    }
    if (location.pathname.startsWith("/dashboard/ledgerreport")) {
      setExpandedMenu("reports");
      return;
    }
    if (location.pathname.startsWith("/dashboard/salesreport")) {
      setExpandedMenu("reports");
      return;
    }
    if (location.pathname.startsWith("/dashboard/searchreport")) {
      setExpandedMenu("reports");
      return;
    }
    if (location.pathname.startsWith("/dashboard/account")) {
      setExpandedMenu("account");
      return;
    }
    setExpandedMenu(null);
  }, [location.pathname]);

  const handleToggle = (menuKey) => {
    setExpandedMenu((prev) => (prev === menuKey ? null : menuKey));
  };

  const handleLogout = () => {
    try {
      // Clear auth session
      logout();
      
      // Show success toast
      toast.success("Logged out successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Navigate to home page
      navigate("/");
    } catch (error) {
      // Show error toast if logout fails
      toast.error("Failed to logout. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error("Logout error:", error);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        minHeight: "100vh",
        borderRight: `1px solid ${SIDEBAR_BORDER}`,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        px: 2,
        position: "sticky",
        top: 0,
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "2px",
          color:"var(--primary-color, #123D6E)",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
          color:"var(--primary-color, #123D6E)",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "4px",
          color:"var(--primary-color, #123D6E)",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555",
          color:"var(--primary-color, #123D6E)",
        },
      }}
    >
      <Box sx={{ px: 1, py: 3, textAlign: "center" }}>
        <Typography fontWeight={800} fontSize={22} color={BRAND_PRIMARY}>
          ionTrip
        </Typography>
        <Typography
          fontWeight={700}
          fontSize={13}
          letterSpacing={2}
          color={BRAND_ACCENT}
        >
          TECH
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
        {menuItem(<HomeIcon sx={{ fontSize: 23 }} />, "Dashboard", {
          path: "/dashboard",
          end: true,
        }, location)}

        {menuItem(<StorageIcon sx={{ fontSize: 23 }} />, "Bookings", {
          dropdown: true,
          isOpen: expandedMenu === "bookings",
          onClick: () => handleToggle("bookings"),
          activePaths: ["/dashboard/bookings"],
        }, location)}
        <Collapse in={expandedMenu === "bookings"} timeout="auto" unmountOnExit>
          <Box
            sx={{
              position: "relative",
              pl: 0,
              pr: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 49,
                top: 16,
                bottom: 16,
                width: 2,
                bgcolor: SUBMENU_ICON_BORDER,
              },
            }}
          >
            <SubMenuItem text="All Flight Booking" path="/dashboard/flightbookings" location={location} />
            
          </Box>
        </Collapse>

        {menuItem(<PersonIcon sx={{ fontSize: 23 }} />, "Customer", {
          dropdown: true,
          isOpen: expandedMenu === "customer",
          onClick: () => handleToggle("customer"),
          activePaths: ["/dashboard/customer"],
        }, location)}
        <Collapse in={expandedMenu === "customer"} timeout="auto" unmountOnExit>
          <Box
            sx={{
              position: "relative",
              pl: 0,
              pr: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 49,
                top: 16,
                bottom: 16,
                width: 2,
                bgcolor: SUBMENU_ICON_BORDER,
              },
            }}
          >
            <SubMenuItem text="All Agent" path="/dashboard/customer/allagent" location={location} />
          </Box>
        </Collapse>

        {menuItem(<SettingsIcon sx={{ fontSize: 23 }} />, "Settings", {
          dropdown: true,
          isOpen: expandedMenu === "settings",
          onClick: () => handleToggle("settings"),
          activePaths: ["/dashboard/settings"],
        }, location)}
        <Collapse in={expandedMenu === "settings"} timeout="auto" unmountOnExit>
          <Box
            sx={{
              position: "relative",
              pl: 0,
              pr: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 49,
                top: 16,
                bottom: 16,
                width: 2,
                bgcolor: SUBMENU_ICON_BORDER,
              },
            }}
          >
            <SubMenuItem text="All Admin" path="/dashboard/settings/alladmin" location={location} />
            <SubMenuItem text="All Bank" path="/dashboard/settings/allbank" location={location} />
          </Box>
        </Collapse>

        {menuItem(<AccountBalanceWalletIcon sx={{ fontSize: 23 }} />, "Wallet", {
          dropdown: true,
          isOpen: expandedMenu === "wallet",
          onClick: () => handleToggle("wallet"),
          activePaths: ["/dashboard/wallet", "/dashboard/agentdeposit", "/dashboard/alldeposit"],
        }, location)}
        <Collapse in={expandedMenu === "wallet"} timeout="auto" unmountOnExit>
          <Box
            sx={{
              position: "relative",
              pl: 0,
              pr: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 49,
                top: 16,
                bottom: 16,
                width: 2,
                bgcolor: SUBMENU_ICON_BORDER,
              },
            }}
          >
            <SubMenuItem text="Wallet Overview" path="/dashboard/wallet" location={location} />
            <SubMenuItem text="All Deposit" path="/dashboard/alldeposit" location={location} />
          </Box>
        </Collapse>

        {menuItem(<PersonIcon sx={{ fontSize: 23 }} />, "Account", {
          dropdown: true,
          isOpen: expandedMenu === "account",
          onClick: () => handleToggle("account"),
          activePaths: ["/dashboard/account"],
        }, location)}
        <Collapse in={expandedMenu === "account"} timeout="auto" unmountOnExit>
          <Box
            sx={{
              position: "relative",
              pl: 0,
              pr: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 49,
                top: 16,
                bottom: 16,
                width: 2,
                bgcolor: SUBMENU_ICON_BORDER,
              },
            }}
          >
            <SubMenuItem text="Profile" path="/dashboard/account" location={location} />
            <SubMenuItem text="All Traveler" path="/dashboard/account/alltraveler" location={location} />
          </Box>
        </Collapse>

        {menuItem(<AutorenewIcon sx={{ fontSize: 23 }} />, "Manage", {
          path: "/dashboard/manage",
        }, location)}

        {menuItem(<BarChartIcon sx={{ fontSize: 23 }} />, "Ot Reports", {
          dropdown: true,
          isOpen: expandedMenu === "reports",
          onClick: () => handleToggle("reports"),
          activePaths: ["/dashboard/ledgerreport", "/dashboard/salesreport", "/dashboard/searchreport"],
        }, location)}
        <Collapse in={expandedMenu === "reports"} timeout="auto" unmountOnExit>
          <Box
            sx={{
              position: "relative",
              pl: 0,
              pr: 0,
              "&::before": {
                content: '""',
                position: "absolute",
                left: 49,
                top: 16,
                bottom: 16,
                width: 2,
                bgcolor: SUBMENU_ICON_BORDER,
              },
            }}
          >
            <SubMenuItem text="Ledger Report" path="/dashboard/ledgerreport" location={location} />
            <SubMenuItem text="Sales Report" path="/dashboard/salesreport" location={location} />
            <SubMenuItem text="Search Report" path="/dashboard/searchreport" location={location} />
          </Box>
        </Collapse>

        {menuItem(<LogoutIcon sx={{ fontSize: 23 }} />, "Logout", {
          onClick: handleLogout,
        }, location)}
      </List>

      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${SIDEBAR_BORDER}`,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: "#f1f3f7", color: "#1f2a44" }}>
          {user?.adminId?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "S"}
        </Avatar>
        <Box>
          <Typography fontSize={12} fontWeight={600}>
            {user?.name || user?.adminId || "Sakhawat Hosen"}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {user?.role || user?.position || "Project Manager"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
