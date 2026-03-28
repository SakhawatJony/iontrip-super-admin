import React from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import PersonIcon from "@mui/icons-material/Person";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import TimelineIcon from "@mui/icons-material/Timeline";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import FlightIcon from "@mui/icons-material/Flight";
import HotelIcon from "@mui/icons-material/Hotel";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MapIcon from "@mui/icons-material/Map";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

/** PHPTRAVELS-style admin dashboard tokens */
const C = {
  pageBg: "#F4F7F6",
  cardBg: "#FFFFFF",
  border: "#E0E0E0",
  text: "#333333",
  muted: "#666666",
  mutedLight: "#888888",
  primary: "#024DAF",
  success: "#28A745",
  danger: "#DC3545",
  warning: "#FD7E14",
  purple: "#6F42C1",
  teal: "#17A2B8",
  shadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const CARD_SX = {
  bgcolor: C.cardBg,
  borderRadius: "14px",
  p: 2.25,
  border: "1px solid #E5E7EB",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

function CardHeader({ title, right }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#024DAF" }}>{title}</Typography>
      <Box sx={{ flexGrow: 1 }} />
      {right}
    </Box>
  );
}

function ActionRow({ icon, label, subLabel, count, color, bg }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        p: 1.25,
        borderRadius: "12px",
        bgcolor: bg,
        border: "1px solid #F3F4F6",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          bgcolor: `${color}1A`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 900,
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#6B7280", fontWeight: 700 }}>{subLabel}</Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          px: 1.25,
          py: 0.5,
          borderRadius: "12px",
          bgcolor: `${color}1A`,
          color,
          border: "1px solid",
          borderColor: `${color}33`,
          minWidth: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 900, color }}>{count}</Typography>
      </Box>
    </Box>
  );
}

function ModuleRow({ name, count, color, divider = true }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 0.85,
        borderTop: divider ? `1px solid ${C.border}` : "none",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "999px",
            bgcolor: `${color}10`,
            border: `1px solid ${color}33`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Box sx={{ width: 7, height: 7, borderRadius: "999px", bgcolor: color }} />
        </Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: C.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>{count}</Typography>
    </Box>
  );
}

function LineChart30Days({ seriesRevenue, seriesPaid, seriesUnpaid }) {
  const w = 640;
  const h = 240;
  const pad = 28;

  const all = [...seriesRevenue, ...seriesPaid, ...seriesUnpaid];
  const minY = Math.min(...all);
  const maxY = Math.max(...all);
  const range = maxY - minY || 1;

  const xAt = (i, len) => pad + (i * (w - pad * 2)) / (len - 1 || 1);
  const yAt = (v) => pad + (h - pad * 2) * (1 - (v - minY) / range);

  const buildPath = (series) => {
    if (!series.length) return "";
    return series
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i, series.length).toFixed(2)} ${yAt(v).toFixed(2)}`)
      .join(" ");
  };

  const pathR = buildPath(seriesRevenue);
  const pathP = buildPath(seriesPaid);
  const pathU = buildPath(seriesUnpaid);

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="auto" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="dashRev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={C.primary} stopOpacity="0.2" />
            <stop offset="1" stopColor={C.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((i) => {
          const y = pad + (i * (h - pad * 2)) / 4;
          return <line key={`h-${i}`} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#E8E8E8" strokeDasharray="2 4" />;
        })}
        {[1, 2, 3, 4, 5, 6].map((i) => {
          const x = pad + (i * (w - pad * 2)) / 7;
          return <line key={`v-${i}`} x1={x} y1={pad} x2={x} y2={h - pad} stroke="#E8E8E8" strokeDasharray="2 4" />;
        })}

        <path
          d={`${pathR} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
          fill="url(#dashRev)"
          stroke="none"
        />
        <path d={pathR} stroke={C.primary} strokeWidth="2.5" fill="none" />
        <path d={pathP} stroke={C.success} strokeWidth="2.5" fill="none" />
        <path d={pathU} stroke={C.danger} strokeWidth="2" fill="none" strokeDasharray="4 3" />
      </svg>
    </Box>
  );
}

function OverviewStatCard({ label, value, icon, accentColor, valueSx }) {
  return (
    <Box
      sx={{
        borderRadius: "14px",
        p: 1.75,
        bgcolor: C.cardBg,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        minHeight: 76,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 900, color: "#6B7280", mb: 0.35 }}>{label}</Typography>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 900,
            color: "#111827",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            ...valueSx,
          }}
        >
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          bgcolor: `${accentColor}1A`,
          color: accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </Box>
  );
}

function QuickActionTile({ title, subtitle, icon, onClick }) {
  return (
    <Button
      onClick={onClick}
      sx={{
        width: "100%",
        height: 82,
        p: 0,
        borderRadius: "10px",
        bgcolor: "white",
        border: "1px solid #E5E7EB",
        boxShadow: "none",
        textTransform: "none",
        alignItems: "stretch",
        justifyContent: "flex-start",
        overflow: "hidden",
        "&:hover": {
          borderColor: "var(--primary-dark, #024DAF)",
          bgcolor: "#FBFCFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: 1.5,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "8px",
            bgcolor: "rgba(18, 61, 110, 0.08)",
            color: "var(--primary-dark, #024DAF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", minWidth: 0, gap: 0.25 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 900,
              color: "var(--primary-dark, #024DAF)",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "#6B7280",
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Button>
  );
}

function MonthPerformanceCard({
  title,
  monthLabel,
  rangeLabel,
  bookings,
  revenue,
  modules,
  bookingsBoxBg,
  revenueBoxBg,
  bookingsColor,
  revenueColor,
}) {
  return (
    <Paper sx={CARD_SX}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "12px",
            bgcolor: `${bookingsColor}10`,
            color: bookingsColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#024DAF" }}>{title}</Typography>
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.75 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#6B7280" }}>{monthLabel}</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#EF4444" }}>{rangeLabel}</Typography>
      </Box>

      <Divider sx={{ my: 1.75, borderColor: C.border }} />

      <Grid container spacing={1.25}>
        <Grid item xs={6}>
          <Box
            sx={{
              borderRadius: "10px",
              bgcolor: bookingsBoxBg,
              border: `1px solid ${bookingsColor}22`,
              p: 2,
              minHeight: 102,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "8px",
                  bgcolor: `${bookingsColor}15`,
                  color: bookingsColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CalendarTodayIcon sx={{ fontSize: 14 }} />
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: bookingsColor }}>Bookings</Typography>
            </Box>
            <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#111827", lineHeight: 1.1, mt: 0.75 }}>
              {bookings}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={6}>
          <Box
            sx={{
              borderRadius: "10px",
              bgcolor: revenueBoxBg,
              border: `1px solid ${revenueColor}22`,
              p: 2,
              minHeight: 102,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "8px",
                  bgcolor: `${revenueColor}15`,
                  color: revenueColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AttachMoneyIcon sx={{ fontSize: 14 }} />
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: revenueColor }}>Revenue</Typography>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 900, color: "#111827", lineHeight: 1.2, mt: 0.75 }}>
              {revenue}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 900,
            color: "#6B7280",
            letterSpacing: "0.06em",
            mb: 0.5,
          }}
        >
          BY MODULE
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {modules.map((m, idx) => (
            <ModuleRow key={m.name} name={m.name} count={m.count} color={m.color} divider={idx !== 0} />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const actionsRequired = [
    {
      label: "UNPAID BOOKINGS",
      subLabel: "Payment Pending",
      count: 1,
      color: "#F59E0B",
      bg: "#FFF7ED",
      icon: <PaymentIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "FAILED PAYMENT",
      subLabel: "Retry Pending",
      count: 0,
      color: "#EF4444",
      bg: "#FEF2F2",
      icon: <MoneyOffIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "CANCELLATION REQUESTS",
      subLabel: "Process Cancellation",
      count: 0,
      color: "#F59E0B",
      bg: "#FFFBEB",
      icon: <CancelIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "PENDING VERIFICATION",
      subLabel: "Deposit Approval (required)",
      count: 0,
      color: "#10B981",
      bg: "#ECFDF5",
      icon: <AutorenewIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "INACTIVE USERS",
      subLabel: "Review inactive account",
      count: 0,
      color: "#6B7280",
      bg: "#F3F4F6",
      icon: <PersonIcon sx={{ fontSize: 18 }} />,
    },
  ];

  const pendingCount = actionsRequired.reduce((acc, a) => acc + (a.count > 0 ? a.count : 0), 0) || 0;

  const quickActions = [
    {
      title: "Bookings",
      subtitle: "Manage Bookings",
      icon: <PaymentIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard/flightbookings"),
    },
    {
      title: "Users",
      subtitle: "Manage Users",
      icon: <PersonIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard/customer/allagent"),
    },
    {
      title: "Flights",
      subtitle: "Manage Flights",
      icon: <FlightIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard/flightbookings"),
    },
    {
      title: "Stays",
      subtitle: "Manage Stays",
      icon: <HotelIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard/hotel/bookinghistory"),
    },
    {
      title: "Tours",
      subtitle: "Manage Tours",
      icon: <MapIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard/searchreport"),
    },
    {
      title: "Cars",
      subtitle: "Manage Cars",
      icon: <DirectionsCarIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard/flightbookings"),
    },
    {
      title: "Pages",
      subtitle: "Manage Pages",
      icon: <ArticleIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard"),
    },
    {
      title: "Blogs",
      subtitle: "Manage Blogs",
      icon: <MenuBookIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard"),
    },
    {
      title: "Finance",
      subtitle: "All Deposits",
      icon: <AccountBalanceIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard/alldeposit"),
    },
    {
      title: "Settings",
      subtitle: "All Admin Settings",
      icon: <SettingsIcon sx={{ fontSize: 16 }} />,
      onClick: () => navigate("/dashboard/settings/alladmin"),
    },
  ];

  const thisMonth = {
    month: "March 2026",
    range: "Mar 1 - Mar 19",
    bookings: 1,
    revenue: "USD 0.00",
    modules: [
      { name: "Stays", count: 1, color: C.primary },
      { name: "Flights", count: 0, color: C.purple },
      { name: "Tours", count: 0, color: C.warning },
      { name: "Cars", count: 0, color: C.teal },
      { name: "Visa", count: 0, color: C.success },
    ],
  };

  const lastMonth = {
    month: "February 2026",
    range: "Feb 1 - Feb 28",
    bookings: 0,
    revenue: "USD 0.00",
    modules: [
      { name: "Stays", count: 0, color: C.primary },
      { name: "Flights", count: 0, color: C.purple },
      { name: "Tours", count: 0, color: C.warning },
      { name: "Cars", count: 0, color: C.teal },
      { name: "Visa", count: 0, color: C.success },
    ],
  };

  const seriesPaid = [2, 4, 5, 3, 6, 8, 6, 7, 9, 6, 4, 5, 6, 10, 12, 11, 8, 9, 14, 13, 15, 13, 12, 16, 18, 20, 19, 21, 23, 22];
  const seriesRevenue = [1, 2, 2, 1, 3, 4, 3, 3, 4, 3, 2, 2, 3, 5, 6, 6, 5, 5, 7, 7, 8, 7, 7, 9, 10, 10, 9, 11, 12, 11];
  const seriesUnpaid = seriesPaid.map((v) => Math.max(0, Math.round(v * 0.15)));

  const overviewStats = [
    {
      label: "Total Bookings",
      value: 1,
      accentColor: C.primary,
      icon: <PaymentIcon sx={{ fontSize: 24 }} />,
    },
    {
      label: "Total Users",
      value: 5,
      accentColor: C.success,
      icon: <PersonIcon sx={{ fontSize: 24 }} />,
    },
    {
      label: "This Month Bookings",
      value: 1,
      accentColor: C.purple,
      icon: <TimelineIcon sx={{ fontSize: 24 }} />,
    },
    {
      label: "This Month Revenue",
      value: "USD 0",
      accentColor: C.teal,
      valueSx: { fontSize: 22 },
      icon: <AttachMoneyIcon sx={{ fontSize: 24 }} />,
    },
  ];

  const recentBookings = [
    {
      invoice: "#9724AB04",
      module: "Hotels",
      bookingId: "PENDING",
      payment: "UNPAID",
      price: "USD 80.00",
      customer: "hashboru",
      pnr: "1-hd-k",
      date: "Mar 18, 15:35",
    },
    {
      invoice: "#9802FF10",
      module: "Flights",
      bookingId: "PENDING",
      payment: "UNPAID",
      price: "USD 0.00",
      customer: "raihan",
      pnr: "1-adult",
      date: "Mar 17, 12:10",
    },
    {
      invoice: "#A12B9C30",
      module: "Visa",
      bookingId: "PENDING",
      payment: "UNPAID",
      price: "USD 0.00",
      customer: "monir",
      pnr: "1-adult",
      date: "Mar 16, 09:45",
    },
  ];

  const statusBadgeSx = {
    display: "inline-flex",
    px: 1,
    py: 0.35,
    borderRadius: "6px",
    bgcolor: "#EEEEEE",
    color: C.muted,
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  return (
    <Box sx={{ width: "100%", pb: 2 }}>
      <Box
        sx={{
          mb: 2,
          p: { xs: 2, md: 1 },
          borderRadius: 1,
          bgcolor: "var(--primary-dark, #024DAF)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
          Dashboard
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
          OTA Travel Management System
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text, mb: 1.25 }}>Overview</Typography>
          <Grid container spacing={2}>
            {overviewStats.map((s) => (
              <Grid item xs={12} sm={6} md={3} key={s.label}>
                <OverviewStatCard
                  label={s.label}
                  value={s.value}
                  accentColor={s.accentColor}
                  icon={s.icon}
                  valueSx={s.valueSx || undefined}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={CARD_SX}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text }}>Actions (required)</Typography>
              <Chip
                label={`${pendingCount} Pending`}
                size="small"
                sx={{
                  bgcolor: "#FFF3E0",
                  color: C.warning,
                  fontWeight: 700,
                  fontSize: 12,
                  height: 28,
                  border: "1px solid #FFE0B2",
                }}
              />
            </Box>
            <Divider sx={{ my: 1.75, borderColor: C.border }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {actionsRequired.map((a) => (
                <ActionRow
                  key={a.label}
                  icon={a.icon}
                  label={a.label}
                  subLabel={a.subLabel}
                  count={a.count}
                  color={a.color}
                  bg={a.bg}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={CARD_SX}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "10px",
                  bgcolor: "rgba(18, 61, 110, 0.08)",
          color: "var(--primary-dark, #024DAF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BoltIcon sx={{ fontSize: 18 }} />
              </Box>
      <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#024DAF" }}>Quick Actions</Typography>
              <Box sx={{ flexGrow: 1 }} />
            </Box>
            <Divider sx={{ my: 1.75, borderColor: C.border }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 1.25,
              }}
            >
              {quickActions.map((q) => (
                <QuickActionTile key={q.title} title={q.title} subtitle={q.subtitle} icon={q.icon} onClick={q.onClick} />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <MonthPerformanceCard
            title="This Month Bookings Performance"
            monthLabel={thisMonth.month}
            rangeLabel={thisMonth.range}
            bookings={thisMonth.bookings}
            revenue={thisMonth.revenue}
            modules={thisMonth.modules}
            bookingsBoxBg="#E3F2FD"
            revenueBoxBg="#E8F5E9"
            bookingsColor="#024DAF"
            revenueColor="#10B981"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <MonthPerformanceCard
            title="Last Month Bookings Performance"
            monthLabel={lastMonth.month}
            rangeLabel={lastMonth.range}
            bookings={lastMonth.bookings}
            revenue={lastMonth.revenue}
            modules={lastMonth.modules}
            bookingsBoxBg="#FCE4EC"
            revenueBoxBg="#E8F5E9"
            bookingsColor="#024DAF"
            revenueColor="#10B981"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ ...CARD_SX, p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
              <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                  Last 30 Days — Revenue &amp; Bookings Analytics
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mt: 1.25 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: C.primary }} />
                    <Typography sx={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Revenue</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: C.success }} />
                    <Typography sx={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Paid Bookings</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: C.danger }} />
                    <Typography sx={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Unpaid Bookings</Typography>
                  </Box>
                </Box>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "8px",
                  bgcolor: "#EEEEEE",
                  color: C.primary,
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChartIcon />
              </Box>
            </Box>
            <Divider sx={{ my: 1.75, borderColor: C.border }} />
            <Box sx={{ bgcolor: C.cardBg, borderRadius: "8px", p: 1.5, border: `1px solid ${C.border}` }}>
              <LineChart30Days seriesRevenue={seriesRevenue} seriesPaid={seriesPaid} seriesUnpaid={seriesUnpaid} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
              <Typography sx={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>Sample trend data</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                size="small"
                sx={{ textTransform: "none", fontWeight: 600, color: C.primary, fontSize: 13 }}
                onClick={() => navigate("/dashboard/salesreport")}
                endIcon={<ArrowForwardIcon />}
              >
                View Analytics
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={CARD_SX}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text }}>Recent Bookings</Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                size="small"
                onClick={() => navigate("/dashboard/flightbookings")}
                sx={{ textTransform: "none", color: C.primary, fontWeight: 600, fontSize: 13 }}
                variant="text"
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ my: 1.75, borderColor: C.border }} />
            <TableContainer sx={{ maxHeight: 340 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8F9FA" }}>
                    {["INVOICE", "MODULE", "BOOKING", "PAYMENT", "PRICE", "CUSTOMER", "PNR", "DATE"].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          fontWeight: 700,
                          color: C.mutedLight,
                          fontSize: 11,
                          borderBottom: `1px solid ${C.border}`,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBookings.map((r) => (
                    <TableRow
                      key={r.invoice}
                      hover
                      sx={{ cursor: "pointer", "& td": { borderColor: C.border } }}
                      onClick={() =>
                        navigate("/dashboard/bookingqueuedetails", { state: { bookingId: r.bookingId } })
                      }
                    >
                      <TableCell sx={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{r.invoice}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: C.text, fontSize: 13 }}>{r.module}</TableCell>
                      <TableCell sx={{ fontSize: 13 }}>
                        <Typography component="span" sx={statusBadgeSx}>
                          {r.bookingId}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 13 }}>
                        <Typography
                          component="span"
                          sx={{
                            ...statusBadgeSx,
                            bgcolor: "#FFEBEE",
                            color: C.danger,
                          }}
                        >
                          {r.payment}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{r.price}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: C.text, fontSize: 13 }}>{r.customer}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: C.text, fontSize: 13 }}>{r.pnr}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: C.muted, fontSize: 13 }}>{r.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
