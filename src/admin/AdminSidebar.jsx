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
  IconButton,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";

import SettingsIcon from "@mui/icons-material/Settings";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import HotelIcon from "@mui/icons-material/Hotel";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import HistoryIcon from "@mui/icons-material/History";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ApiIcon from "@mui/icons-material/Api";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import GroupsIcon from "@mui/icons-material/Groups";
import AnchorIcon from "@mui/icons-material/Anchor";
import Button from "@mui/material/Button";
import logo from "../assets/logo.png";

const SIDEBAR_BG = "var(--sidebar-bg, #0A2B76)";
const SIDEBAR_CARD_BG = "rgba(0, 0, 0, 0.18)";
const SIDEBAR_BORDER = "rgba(255, 255, 255, 0.12)";
const MENU_TEXT_COLOR = "#FFFFFF";
const MENU_ICON_COLOR = "#FFFFFF";
const MENU_ACTIVE_COLOR = "#FFFFFF";
const MENU_ACTIVE_BG = "rgba(44,127,255,0.52)";
const MENU_ACTIVE_HOVER_BG = "rgba(58,140,255,0.35)";
const MENU_INACTIVE_HOVER_BG = "rgba(255,255,255,0.08)";
const BRAND_B2B = "#7DD3FC";
const DROPDOWN_ICON_BG = "rgba(0, 0, 0, 0.25)";

const SUBMENU_TEXT_COLOR = "rgba(255, 255, 255, 0.75)";
const SUBMENU_ACTIVE_COLOR = "#FFFFFF";
const SUBMENU_ICON_BORDER = "rgba(255, 255, 255, 0.35)";
const SUBMENU_ICON_ACTIVE = "#7DD3FC";

const menuItem = (icon, text, options = {}, location = null, collapsed = false) => {
  const {
    dropdown = false,
    path,
    end = false,
    sx,
    onClick,
    onToggleClick,
    isOpen,
    activePaths = [],
  } = options;

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
        py: collapsed ? 0.9 : 1.2,
        px: collapsed ? 0 : 1.25,
        borderRadius: "5px",
        minHeight: 44,
        mx: collapsed ? 0 : 0.5,
        width: "100%",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 1.25,
        textAlign: collapsed ? "center" : "left",
        boxSizing: "border-box",
        borderLeft: "3px solid transparent",
        bgcolor: isActive ? MENU_ACTIVE_BG : "transparent",
        "&.active": {
          bgcolor: MENU_ACTIVE_BG,
        },
        "&:hover": {
          bgcolor: isActive ? MENU_ACTIVE_HOVER_BG : MENU_INACTIVE_HOVER_BG,
        },
        "&.active .MuiListItemIcon-root, &.active .MuiListItemText-primary": {
          color: MENU_ACTIVE_COLOR,
        },
        ...sx,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : 34,
          pr: collapsed ? 0 : undefined,
          width: collapsed ? "100%" : "auto",
          display: "flex",
          justifyContent: "center",
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
          fontWeight: isActive ? 700 : 500,
          color: MENU_TEXT_COLOR,
          letterSpacing: "0.01em",
        }}
        primary={text}
        sx={{ display: collapsed ? "none" : "block" }}
      />

      {!collapsed && dropdown && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggleClick?.(e);
          }}
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

const SubMenuItem = ({ text, path, location, collapsed = false }) => {
  const isActive = location.pathname === path;

  return (
    <Box
      component={NavLink}
      to={path}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 1.75,
        py: 0.55,
        pl: collapsed ? 0 : 5.25,
        pr: collapsed ? 0 : 1.25,
        minHeight: 32,
        textDecoration: "none",
        cursor: "pointer",
        width: "100%",
        boxSizing: "border-box",
        borderLeft: isActive ? `3px solid ${MENU_ACTIVE_BG}` : "3px solid transparent",
        "&:hover": {
          bgcolor: "rgba(255,255,255,0.04)",
        },
      }}
    >
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: 1,
          bgcolor: isActive ? SUBMENU_ICON_ACTIVE : "transparent",
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
          display: collapsed ? "none" : "block",
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

const SectionLabel = ({ children, collapsed, first }) =>
  collapsed ? null : (
    <Typography
      sx={{
        px: 2,
        pt: first ? 0.5 : 2,
        pb: 0.75,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: "rgba(255, 255, 255, 0.45)",
      }}
    >
      {children}
    </Typography>
  );

const AdminSidebar = ({ collapsed = false, onToggleCollapsed } = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedMenu, setExpandedMenu] = useState(null);

  useEffect(() => {
    if (collapsed) {
      setExpandedMenu(null);
    }
  }, [collapsed]);

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/flightbookings")) {
      setExpandedMenu("bookings");
      return;
    }
    if (location.pathname.startsWith("/dashboard/hotel")) {
      setExpandedMenu("hotel");
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
    if (location.pathname.startsWith("/dashboard/agentdeposit")) {
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
    if (location.pathname.startsWith("/dashboard/account") || location.pathname.startsWith("/dashboard/manage")) {
      setExpandedMenu("prefs");
      return;
    }
    if (location.pathname.startsWith("/dashboard/visa")) {
      setExpandedMenu("visa");
      return;
    }
    if (location.pathname.startsWith("/dashboard/tour")) {
      setExpandedMenu("tour");
      return;
    }
    setExpandedMenu(null);
  }, [location.pathname]);

  const handleToggle = (menuKey) => {
    setExpandedMenu((prev) => (prev === menuKey ? null : menuKey));
  };

  const handleMainMenuClick = (menuKey, firstSubRoute) => {
    if (expandedMenu === menuKey) {
      setExpandedMenu(null);
      return;
    }

    setExpandedMenu(menuKey);
    if (firstSubRoute && location.pathname !== firstSubRoute) {
      navigate(firstSubRoute);
    }
  };

  const handleLogout = () => {
    try {
      logout();

      toast.success("Logged out successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      navigate("/");
    } catch (error) {
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

  const submenuRailSx = {
    position: "relative",
    pl: 0,
    pr: 0,
    "&::before": {
      content: '""',
      position: "absolute",
      left: collapsed ? "50%" : 49,
      transform: collapsed ? "translateX(-50%)" : "none",
      top: 16,
      bottom: 16,
      width: 2,
      bgcolor: SUBMENU_ICON_BORDER,
    },
  };

  return (
    <Box
      sx={{
        height: "100vh",
        borderRight: collapsed ? "none" : `1px solid ${SIDEBAR_BORDER}`,
        display: "flex",
        flexDirection: "column",
        bgcolor: SIDEBAR_BG,
        color: "#fff",
        px: 0,
        overflowY: "hidden",
        overflowX: "hidden",
        position: "sticky",
        top: 0,
        "&::-webkit-scrollbar": {
          width: "2px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255,255,255,0.35)",
          borderRadius: "2px",
          "&:hover": {
            background: "rgba(255,255,255,0.5)",
          },
        },
      }}
    >
      <Box
        sx={{
          px: collapsed ? 0 : 2,
          py: collapsed ? 1.8 : 2,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1,
          flexShrink: 0,
          borderBottom: collapsed ? "none" : `1px solid ${SIDEBAR_BORDER}`,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {collapsed && (
          <Box
            component="img"
            src={logo}
            alt="Iontrip Logo"
            sx={{ width: 30, height: 30, objectFit: "contain" }}
          />
        )}
        <Box sx={{ display: collapsed ? "none" : "flex", alignItems: "center", gap: 0.5, minWidth: 0, flex: 1 }}>
          <Box
            component="img"
            src={logo}
            alt="Iontrip Logo"
            sx={{ height: 36, width: "auto", maxWidth: "100%", objectFit: "contain" }}
          />
        </Box>

        <Box sx={{ ml: collapsed ? 0 : "auto", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <IconButton
            size="small"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapsed}
            sx={{
              width: 28,
              height: 28,
              border: "1px solid rgba(255,255,255,0.15)",
              bgcolor: "rgba(255,255,255,0.06)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
              flexShrink: 0,
            }}
          >
            <MenuOpenIcon
              sx={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
                transform: collapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "2px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "2px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255,255,255,0.35)",
            borderRadius: "2px",
            "&:hover": {
              background: "rgba(255,255,255,0.5)",
            },
          },
        }}
      >
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.35,
            px: collapsed ? 0 : 0.5,
            py: 0.5,
            ...(collapsed && {
              alignItems: "center",
              width: "100%",
              p: 0,
              py: 0.5,
              "& .MuiListItemButton-root": { maxWidth: "100%" },
            }),
          }}
        >
          {menuItem(
            <DashboardIcon sx={{ fontSize: 22 }} />,
            "Dashboard",
            { path: "/dashboard", end: true },
            location,
            collapsed
          )}

          <SectionLabel collapsed={collapsed} first>
            MANAGEMENT
          </SectionLabel>

          {menuItem(<ManageAccountsIcon sx={{ fontSize: 22 }} />, "Agent Management", {
            path: "/dashboard/customer/allagent",
          }, location, collapsed)}

          {menuItem(<BookOnlineIcon sx={{ fontSize: 22 }} />, "Bookings", {
            dropdown: true,
            isOpen: expandedMenu === "bookings",
            onClick: () => handleMainMenuClick("bookings", "/dashboard/flightbookings/bookinghistory"),
            onToggleClick: () => handleToggle("bookings"),
            activePaths: ["/dashboard/flightbookings"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "bookings"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="Booking History" path="/dashboard/flightbookings/bookinghistory" location={location} />
              <SubMenuItem collapsed={collapsed} text="Ticketed" path="/dashboard/flightbookings/ticketedhistory" location={location} />
              <SubMenuItem collapsed={collapsed} text="Cancelled" path="/dashboard/flightbookings/cancelledhistory" location={location} />
              <SubMenuItem collapsed={collapsed} text="Reissue" path="/dashboard/flightbookings/reissuehistory" location={location} />
              <SubMenuItem collapsed={collapsed} text="Refunds" path="/dashboard/flightbookings/refundshistory" location={location} />
            </Box>
          </Collapse>

          {menuItem(<HotelIcon sx={{ fontSize: 22 }} />, "Hotels", {
            dropdown: true,
            isOpen: expandedMenu === "hotel",
            onClick: () => handleMainMenuClick("hotel", "/dashboard/hotel/bookinghistory"),
            onToggleClick: () => handleToggle("hotel"),
            activePaths: ["/dashboard/hotel"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "hotel"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="Booking History" path="/dashboard/hotel/bookinghistory" location={location} />
              <SubMenuItem collapsed={collapsed} text="Confirm" path="/dashboard/hotel/confirmhistory" location={location} />
              <SubMenuItem collapsed={collapsed} text="Refunds" path="/dashboard/hotel/refundshistory" location={location} />
              <SubMenuItem collapsed={collapsed} text="Cancelled" path="/dashboard/hotel/cancelledhistory" location={location} />
            </Box>
          </Collapse>

          {menuItem(<CardTravelIcon sx={{ fontSize: 22 }} />, "Visa", {
            dropdown: true,
            isOpen: expandedMenu === "visa",
            onClick: () => handleMainMenuClick("visa", "/dashboard/visa/allvisa"),
            onToggleClick: () => handleToggle("visa"),
            activePaths: ["/dashboard/visa"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "visa"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="Visa History" path="/dashboard/visa/allvisa" location={location} />
              <SubMenuItem collapsed={collapsed} text="Add Visa" path="/dashboard/visa/addvisa" location={location} />
            </Box>
          </Collapse>

          {menuItem(<CardTravelIcon sx={{ fontSize: 22 }} />, "Tour", {
            dropdown: true,
            isOpen: expandedMenu === "tour",
            onClick: () => handleMainMenuClick("tour", "/dashboard/tour/alltour"),
            onToggleClick: () => handleToggle("tour"),
            activePaths: ["/dashboard/tour"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "tour"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="Tour History" path="/dashboard/tour/alltour" location={location} />
              <SubMenuItem collapsed={collapsed} text="Add Tour" path="/dashboard/tour/addtour" location={location} />
            </Box>
          </Collapse>

          {menuItem(<AccountBalanceWalletIcon sx={{ fontSize: 22 }} />, "Credit & Wallet", {
            dropdown: true,
            isOpen: expandedMenu === "wallet",
            onClick: () => handleMainMenuClick("wallet", "/dashboard/wallet"),
            onToggleClick: () => handleToggle("wallet"),
            activePaths: ["/dashboard/wallet", "/dashboard/agentdeposit", "/dashboard/alldeposit"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "wallet"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="Wallet Overview" path="/dashboard/wallet" location={location} />
              <SubMenuItem collapsed={collapsed} text="All Deposit" path="/dashboard/alldeposit" location={location} />
            </Box>
          </Collapse>

          {menuItem(<BarChartIcon sx={{ fontSize: 22 }} />, "Reports", {
            dropdown: true,
            isOpen: expandedMenu === "reports",
            onClick: () => handleMainMenuClick("reports", "/dashboard/ledgerreport"),
            onToggleClick: () => handleToggle("reports"),
            activePaths: ["/dashboard/ledgerreport", "/dashboard/salesreport", "/dashboard/searchreport"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "reports"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="Ledger Report" path="/dashboard/ledgerreport" location={location} />
              <SubMenuItem collapsed={collapsed} text="Sales Report" path="/dashboard/salesreport" location={location} />
              <SubMenuItem collapsed={collapsed} text="Search Report" path="/dashboard/searchreport" location={location} />
            </Box>
          </Collapse>

        
          <SectionLabel collapsed={collapsed}>SYSTEM</SectionLabel>

          {menuItem(<AdminPanelSettingsIcon sx={{ fontSize: 22 }} />, "Management", {
            dropdown: true,
            isOpen: expandedMenu === "settings",
            onClick: () => handleMainMenuClick("settings", "/dashboard/settings/alladmin"),
            onToggleClick: () => handleToggle("settings"),
            activePaths: ["/dashboard/settings"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "settings"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="All Admin" path="/dashboard/settings/alladmin" location={location} />
              <SubMenuItem collapsed={collapsed} text="All Bank" path="/dashboard/settings/allbank" location={location} />
            </Box>
          </Collapse>

          

         

          {menuItem(<SettingsIcon sx={{ fontSize: 22 }} />, "Settings", {
            dropdown: true,
            isOpen: expandedMenu === "prefs",
            onClick: () => handleMainMenuClick("prefs", "/dashboard/account"),
            onToggleClick: () => handleToggle("prefs"),
            activePaths: ["/dashboard/account", "/dashboard/manage"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "prefs"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              
              <SubMenuItem collapsed={collapsed} text="Manage Website" path="/dashboard/manage/website" location={location} />
              <SubMenuItem collapsed={collapsed} text="All Blog" path="/dashboard/manage/allblog" location={location} />
            </Box>
          </Collapse>

          {menuItem(<LogoutIcon sx={{ fontSize: 22 }} />, "Logout", {
            onClick: handleLogout,
          }, location, collapsed)}
        </List>
      </Box>

      {!collapsed && (
        <Box sx={{ px: 1.5, py: 1.5, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            sx={{
              borderRadius: "12px",
              bgcolor: SIDEBAR_CARD_BG,
              border: `1px solid ${SIDEBAR_BORDER}`,
              p: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff", mb: 1 }}>Business Overview</Typography>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                  IONTRIP B2B Platform
                </Typography>
                <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.55)", mt: 0.35, lineHeight: 1.4 }}>
                  Super Admin Control Center
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                  bgcolor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <AnchorIcon sx={{ fontSize: 20, color: BRAND_B2B }} />
              </Box>
            </Box>
            <Button
              fullWidth
              size="small"
              sx={{
                textTransform: "none",
                fontSize: 12,
                fontWeight: 600,
                borderRadius: "8px",
                bgcolor: "rgba(0, 0, 0, 0.28)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                py: 0.85,
                "&:hover": { bgcolor: "rgba(0, 0, 0, 0.38)" },
              }}
            >
              View System Health
            </Button>
          </Box>

          <Box
            sx={{
              borderRadius: "12px",
              bgcolor: SIDEBAR_CARD_BG,
              border: `1px solid ${SIDEBAR_BORDER}`,
              p: 1.5,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff", mb: 1 }}>System Status</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#22C55E", flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#4ADE80" }}>
                All Systems Operational
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdminSidebar;
