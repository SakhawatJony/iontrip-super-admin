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

import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from "@mui/icons-material/Person";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BarChartIcon from "@mui/icons-material/BarChart";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import HotelIcon from "@mui/icons-material/Hotel";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import companyLogo from "../assets/logo.jpg";

const MENU_TEXT_COLOR = "#4B5563";
const MENU_ICON_COLOR = "#6B7280";
const MENU_ACTIVE_COLOR = "#1F2A44";
const SIDEBAR_BORDER = "#E5E7EB";
const BRAND_PRIMARY = "#1F2A44";
const DROPDOWN_ICON_BG = "#111827";

const SUBMENU_TEXT_COLOR = "#6B7C93";
const SUBMENU_ACTIVE_COLOR = "#1F4D8B";
const SUBMENU_ICON_BORDER = "#D1D5DB";
const SUBMENU_ICON_ACTIVE = "#1F4D8B";

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
        borderRadius: 1.25,
        minHeight: 42,
        width: "100%",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 1.25,
        textAlign: collapsed ? "center" : "left",
        boxSizing: "border-box",
        borderLeft: isActive
          ? "3px solid var(--primary-color, #024DAF)"
          : "3px solid transparent",
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
          fontWeight: isActive ? 600 : 500,
          color: isActive ? MENU_ACTIVE_COLOR : MENU_TEXT_COLOR,
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
        borderLeft: isActive
          ? "3px solid var(--primary-color, #024DAF)"
          : "3px solid transparent",
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

const AdminSidebar = ({ collapsed = false, onToggleCollapsed } = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
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
    if (location.pathname.startsWith("/dashboard/account")) {
      setExpandedMenu("account");
      return;
    }
    if (location.pathname.startsWith("/dashboard/manage")) {
      setExpandedMenu("manage");
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
        bgcolor: "#ffffff",
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
          background: BRAND_PRIMARY,
          borderRadius: "2px",
          "&:hover": {
            background: "#0F172A",
          },
        },
      }}
    >
      <Box
        sx={{
          px: collapsed ? 0 : 1.5,
          py: collapsed ? 1.8 : 1.5,
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
        <Box
          component="img"
          src={companyLogo}
          alt="iontrip"
          sx={{
            width: 28,
            height: 28,
            borderRadius: "6px",
            objectFit: "cover",
            display: collapsed ? "none" : "block",
          }}
        />

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: 18,
            color: "var(--secondary-color, #024DAF)",
            lineHeight: 1,
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: collapsed ? "none" : "block",
          }}
        >
          iontrip.com
        </Typography>

        <Box sx={{ ml: collapsed ? 0 : "auto", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <IconButton
            size="small"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggleCollapsed}
            sx={{
              width: 28,
              height: 28,
              border: "1px solid #D1D5DB",
              bgcolor: "#FFFFFF",
              "&:hover": { bgcolor: "#F9FAFB" },
              flexShrink: 0,
            }}
          >
            <MenuOpenIcon
              sx={{
                fontSize: 18,
                color: "#6B7280",
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
            background: BRAND_PRIMARY,
            borderRadius: "2px",
            "&:hover": {
              background: "#0F172A",
            },
          },
        }}
      >
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.75,
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
            <QueryStatsIcon sx={{ fontSize: 23 }} />,
            "Admin Dashboard",
            {
              path: "/dashboard",
              end: true,
            },
            location,
            collapsed
          )}

          {menuItem(<FlightTakeoffIcon sx={{ fontSize: 23 }} />, "Flight", {
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

          {menuItem(<HotelIcon sx={{ fontSize: 23 }} />, "Hotels", {
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

          {menuItem(<CardTravelIcon sx={{ fontSize: 23 }} />, "Visa", {
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

          {menuItem(<CardTravelIcon sx={{ fontSize: 23 }} />, "Tour", {
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

          {menuItem(<PersonIcon sx={{ fontSize: 23 }} />, "Customer", {
            dropdown: true,
            isOpen: expandedMenu === "customer",
            onClick: () => handleMainMenuClick("customer", "/dashboard/customer/allagent"),
            onToggleClick: () => handleToggle("customer"),
            activePaths: ["/dashboard/customer"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "customer"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="Agent History" path="/dashboard/customer/allagent" location={location} />
            </Box>
          </Collapse>

          {menuItem(<SettingsIcon sx={{ fontSize: 23 }} />, "Settings", {
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

          {menuItem(<AccountBalanceWalletIcon sx={{ fontSize: 23 }} />, "Wallet", {
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

          {menuItem(<PersonIcon sx={{ fontSize: 23 }} />, "Account", {
            dropdown: true,
            isOpen: expandedMenu === "account",
            onClick: () => handleMainMenuClick("account", "/dashboard/account"),
            onToggleClick: () => handleToggle("account"),
            activePaths: ["/dashboard/account"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "account"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="Profile" path="/dashboard/account" location={location} />
              <SubMenuItem collapsed={collapsed} text="All Traveler" path="/dashboard/account/alltraveler" location={location} />
            </Box>
          </Collapse>

          {menuItem(<AutorenewIcon sx={{ fontSize: 23 }} />, "Manage", {
            dropdown: true,
            isOpen: expandedMenu === "manage",
            onClick: () => handleMainMenuClick("manage", "/dashboard/manage/allblog"),
            onToggleClick: () => handleToggle("manage"),
            activePaths: ["/dashboard/manage"],
          }, location, collapsed)}
          <Collapse in={expandedMenu === "manage"} timeout="auto" unmountOnExit>
            <Box sx={submenuRailSx}>
              <SubMenuItem collapsed={collapsed} text="All Blog" path="/dashboard/manage/allblog" location={location} />
              <SubMenuItem collapsed={collapsed} text="Manage Website" path="/dashboard/manage/website" location={location} />
            </Box>
          </Collapse>

          {menuItem(<BarChartIcon sx={{ fontSize: 23 }} />, "Ot Reports", {
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

          {menuItem(<LogoutIcon sx={{ fontSize: 23 }} />, "Logout", {
            onClick: handleLogout,
          }, location, collapsed)}
        </List>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          px: collapsed ? 0.5 : 1.5,
          py: 1.5,
          borderTop: collapsed ? "none" : `1px solid ${SIDEBAR_BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1.5,
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Avatar
          sx={{
            width: collapsed ? 32 : 36,
            height: collapsed ? 32 : 36,
            bgcolor: "#f1f3f7",
            color: "#1f2a44",
            flexShrink: 0,
          }}
        >
          {user?.adminId?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "S"}
        </Avatar>
        <Box sx={{ minWidth: 0, display: collapsed ? "none" : "block" }}>
          <Typography fontSize={12} fontWeight={600} noWrap>
            {user?.name || user?.adminId || "Sakhawat Hosen"}
          </Typography>
          <Typography fontSize={12} color="text.secondary" noWrap>
            {user?.role || user?.position || "Project Manager"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminSidebar;
