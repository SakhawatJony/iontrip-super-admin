import React, { useEffect, useState } from "react";
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
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import GroupsIcon from "@mui/icons-material/Groups";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import FlightIcon from "@mui/icons-material/Flight";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ApiIcon from "@mui/icons-material/Api";
import SpeedIcon from "@mui/icons-material/Speed";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";

const C = {
  pageBg: "#F4F7FE",
  cardBg: "#FFFFFF",
  border: "#E9EDF7",
  text: "#2B3674",
  muted: "#A3AED0",
  primary: "#0052CC",
  success: "#36B37E",
  danger: "#FF5630",
  warning: "#FFAB00",
  purple: "#7551FF",
  teal: "#00B8D9",
};

const CARD_PAD = 2;
const CARD_SX = {
  bgcolor: C.cardBg,
  borderRadius: "12px",
  border: `1px solid ${C.border}`,
  boxShadow: "0px 4px 18px rgba(112, 144, 176, 0.08)",
  height: "100%",
  boxSizing: "border-box",
};

/** Fixed card heights per row — matches reference layout */
const H = {
  kpi: 130,
  row2: 372,
  row3: 452,
  row4: 252,
  footer: 70,
};

function CardShell({ height, children, sx = {} }) {
  return (
    <Paper
      sx={{
        ...CARD_SX,
        p: CARD_PAD,
        height,
        minHeight: height,
        maxHeight: height,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function gridItemSx() {
  return { display: "flex", "& > *": { width: "100%" } };
}

function AreaSparkline({ data, color, height = 44 }) {
  const width = 200;
  const padX = 0;
  const padY = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = padX + (i * (width - padX * 2)) / (data.length - 1 || 1);
    const y = padY + (height - padY * 2) * (1 - (v - min) / range);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1][0]} ${height} L ${pts[0][0]} ${height} Z`;
  const gradId = `spark-${color.replace("#", "")}`;

  return (
    <Box sx={{ width: "100%", mt: 1, mx: -0.5, overflow: "hidden" }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </Box>
  );
}

function KpiCard({ title, value, trend, trendUp, icon, iconBg, sparkData, sparkColor }) {
  return (
    <Paper
      sx={{
        ...CARD_SX,
        p: CARD_PAD,
        height: H.kpi,
        minHeight: H.kpi,
        maxHeight: H.kpi,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: C.muted, lineHeight: 1.35, maxWidth: "65%" }}>
          {title}
        </Typography>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "10px",
            bgcolor: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: sparkColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: C.text, mt: 1.25, lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.75 }}>
        {trendUp ? (
          <TrendingUpIcon sx={{ fontSize: 14, color: C.success }} />
        ) : (
          <TrendingDownIcon sx={{ fontSize: 14, color: C.danger }} />
        )}
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: trendUp ? C.success : C.danger }}>{trend}</Typography>
        <Typography sx={{ fontSize: 10, color: C.muted, ml: 0.25 }}>vs Apr 20 – Apr 26</Typography>
      </Box>
      <Box sx={{ mt: "auto" }}>
        <AreaSparkline data={sparkData} color={sparkColor} />
      </Box>
    </Paper>
  );
}

function DualLineChart({ chartId, labels, seriesA, seriesB, colorA, colorB, height = 250 }) {
  const w = 640;
  const h = height;
  const pad = { t: 16, r: 16, b: 30, l: 40 };
  const all = [...seriesA, ...seriesB];
  const minY = Math.min(...all) * 0.88;
  const maxY = Math.max(...all) * 1.06;
  const range = maxY - minY || 1;
  const xAt = (i) => pad.l + (i * (w - pad.l - pad.r)) / (labels.length - 1 || 1);
  const yAt = (v) => pad.t + (h - pad.t - pad.b) * (1 - (v - minY) / range);
  const linePath = (series) =>
    series.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
  const areaPath = (series) => {
    const line = series.map((v, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(" ");
    const last = series.length - 1;
    return `${line} L ${xAt(last).toFixed(1)} ${h - pad.b} L ${xAt(0).toFixed(1)} ${h - pad.b} Z`;
  };

  return (
    <Box sx={{ width: "100%" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="auto">
        <defs>
          <linearGradient id={`${chartId}-a`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorA} stopOpacity="0.2" />
            <stop offset="100%" stopColor={colorA} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${chartId}-b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colorB} stopOpacity="0.15" />
            <stop offset="100%" stopColor={colorB} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = pad.t + (i * (h - pad.t - pad.b)) / 4;
          return <line key={i} x1={pad.l} y1={y} x2={w - pad.r} y2={y} stroke="#E9EDF7" />;
        })}
        <path d={areaPath(seriesA)} fill={`url(#${chartId}-a)`} />
        <path d={areaPath(seriesB)} fill={`url(#${chartId}-b)`} />
        <path d={linePath(seriesA)} fill="none" stroke={colorA} strokeWidth="2.5" />
        <path d={linePath(seriesB)} fill="none" stroke={colorB} strokeWidth="2.5" />
        {labels.map((lbl, i) => (
          <text key={lbl} x={xAt(i)} y={h - 8} textAnchor="middle" fontSize="10" fill={C.muted} fontWeight="500">
            {lbl}
          </text>
        ))}
      </svg>
    </Box>
  );
}

function DonutChart({ segments, totalValue }) {
  const size = 128;
  const cx = size / 2;
  const cy = size / 2;
  const r = 46;
  const stroke = 14;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minHeight: 0 }}>
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg) => {
            const dash = (seg.pct / 100) * circ;
            const el = (
              <circle
                key={seg.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
            offset += dash;
            return el;
          })}
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fill={C.muted} fontWeight="500">
            Total
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill={C.text} fontWeight="700">
            {totalValue}
          </text>
        </svg>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        {segments.map((seg) => (
          <Box key={seg.label} sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.85 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: seg.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.text, flex: 1 }} noWrap>
              {seg.label}
            </Typography>
            <Typography sx={{ fontSize: 10, color: C.muted, fontWeight: 500, whiteSpace: "nowrap" }}>
              ৳ {seg.amount}
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.text, minWidth: 28, textAlign: "right" }}>
              {seg.pct}%
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function AlertItem({ icon, title, desc, time, color }) {
  return (
    <Box sx={{ display: "flex", gap: 1.25, py: 1.15, borderBottom: `1px solid ${C.border}` }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
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
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.35 }}>{title}</Typography>
        <Typography sx={{ fontSize: 10, color: C.muted, mt: 0.25, lineHeight: 1.4 }}>{desc}</Typography>
      </Box>
      <Typography sx={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap", flexShrink: 0, pt: 0.25 }}>{time}</Typography>
    </Box>
  );
}

function SectionTitle({ title, action }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.75 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</Typography>
      {action}
    </Box>
  );
}

function RouteBar({ route, count, pct }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.text, width: 72, flexShrink: 0 }}>
        {route}
      </Typography>
      <Box sx={{ flex: 1, height: 8, bgcolor: "#E9EDF7", borderRadius: 4, overflow: "hidden" }}>
        <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: C.primary, borderRadius: 4 }} />
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.text, width: 44, textAlign: "right", flexShrink: 0 }}>
        {count.toLocaleString()}
      </Typography>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState("weekly");
  const [serverTime, setServerTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setServerTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const kpis = [
    {
      title: "Total Revenue (MTD)",
      value: "৳ 125,430,000",
      trend: "18.6%",
      trendUp: true,
      icon: <AttachMoneyIcon sx={{ fontSize: 24 }} />,
      iconBg: "#DEEBFF",
      sparkColor: C.primary,
      sparkData: [40, 55, 48, 62, 58, 70, 75, 82],
    },
    {
      title: "Net Profit (MTD)",
      value: "৳ 28,750,000",
      trend: "16.2%",
      trendUp: true,
      icon: <ShowChartIcon sx={{ fontSize: 24 }} />,
      iconBg: "#E3FCEF",
      sparkColor: C.success,
      sparkData: [30, 38, 42, 45, 50, 48, 55, 60],
    },
    {
      title: "Total Bookings (MTD)",
      value: "18,750",
      trend: "14.7%",
      trendUp: true,
      icon: <ConfirmationNumberIcon sx={{ fontSize: 24 }} />,
      iconBg: "#EDE7F6",
      sparkColor: C.purple,
      sparkData: [50, 52, 55, 58, 60, 62, 65, 68],
    },
    {
      title: "Active Agents",
      value: "1,245",
      trend: "12.5%",
      trendUp: true,
      icon: <GroupsIcon sx={{ fontSize: 24 }} />,
      iconBg: "#FFF0E0",
      sparkColor: C.warning,
      sparkData: [35, 40, 38, 42, 45, 48, 50, 52],
    },
    {
      title: "Total Outstanding",
      value: "৳ 32,680,000",
      trend: "8.3%",
      trendUp: false,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 24 }} />,
      iconBg: "#FFEBE6",
      sparkColor: C.danger,
      sparkData: [70, 68, 65, 62, 60, 58, 55, 52],
    },
    {
      title: "Cash Flow (MTD)",
      value: "৳ 52,390,000",
      trend: "22.1%",
      trendUp: true,
      icon: <SavingsIcon sx={{ fontSize: 24 }} />,
      iconBg: "#E3FCEF",
      sparkColor: C.success,
      sparkData: [45, 50, 55, 58, 62, 68, 72, 78],
    },
  ];

  const revenueLabels = ["14 May", "15 May", "16 May", "17 May", "18 May", "19 May", "20 May"];
  const revenueSeries = [42, 48, 45, 52, 58, 55, 62];
  const profitSeries = [18, 22, 20, 25, 28, 26, 30];

  const donutSegments = [
    { label: "Flights", pct: 62, amount: "78,580,000", color: C.primary },
    { label: "Hotels", pct: 22, amount: "28,350,000", color: C.success },
    { label: "Visa", pct: 10, amount: "12,650,000", color: C.warning },
    { label: "Others", pct: 6, amount: "5,850,000", color: C.purple },
  ];

  const alerts = [
    {
      icon: <WarningAmberIcon sx={{ fontSize: 16 }} />,
      title: "5 agents exceeded credit limit",
      desc: "Immediate review required for overdue accounts",
      time: "10 min ago",
      color: C.danger,
    },
    {
      icon: <InfoOutlinedIcon sx={{ fontSize: 16 }} />,
      title: "Outstanding balance alert",
      desc: "3 agents have balance over ৳ 500,000",
      time: "18 min ago",
      color: C.warning,
    },
    {
      icon: <InfoOutlinedIcon sx={{ fontSize: 16 }} />,
      title: "API rate limit approaching",
      desc: "GDS connector at 85% of daily quota",
      time: "25 min ago",
      color: C.primary,
    },
    {
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />,
      title: "Daily settlement completed",
      desc: "All agent wallets reconciled successfully",
      time: "1 hr ago",
      color: C.success,
    },
    {
      icon: <WarningAmberIcon sx={{ fontSize: 16 }} />,
      title: "3 pending refund approvals",
      desc: "Flight cancellations awaiting admin action",
      time: "2 hr ago",
      color: C.danger,
    },
  ];

  const topAgents = [
    { rank: 1, name: "Sky Tour & Travels", revenue: "18,750,000", growth: 22.5 },
    { rank: 2, name: "Global Wings BD", revenue: "15,420,000", growth: 20.1 },
    { rank: 3, name: "Dhaka Express", revenue: "12,850,000", growth: 18.4 },
    { rank: 4, name: "FlyEasy Agency", revenue: "10,680,000", growth: 16.2 },
    { rank: 5, name: "Horizon Tours", revenue: "9,240,000", growth: 14.8 },
    { rank: 6, name: "Prime Aviation", revenue: "8,150,000", growth: 12.3 },
    { rank: 7, name: "CityFly Partners", revenue: "7,420,000", growth: 10.5 },
    { rank: 8, name: "Eastern Wings", revenue: "6,580,000", growth: 9.2 },
    { rank: 9, name: "TravelHub Pro", revenue: "5,890,000", growth: 7.8 },
    { rank: 10, name: "JetSet Bangladesh", revenue: "5,120,000", growth: 6.4 },
  ];

  const riskCategories = [
    { label: "Overdue > 30 Days", amount: "৳ 8,420,000", agents: 12 },
    { label: "Overdue 15–30 Days", amount: "৳ 5,180,000", agents: 7 },
    { label: "Credit Limit Exceeded", amount: "৳ 3,920,000", agents: 5 },
    { label: "Low Activity (15 Days)", amount: "—", agents: 134 },
  ];

  const topRoutes = [
    { route: "DAC → DXB", count: 2850, pct: 100 },
    { route: "DAC → KUL", count: 2450, pct: 86 },
    { route: "DAC → BKK", count: 1920, pct: 67 },
    { route: "DAC → DEL", count: 1680, pct: 59 },
    { route: "DAC → DOH", count: 1450, pct: 51 },
    { route: "CGP → DXB", count: 980, pct: 34 },
  ];

  const liveActivity = [
    { text: "Sky Tour & Travels booked 2 tickets", route: "DAC → DXB", time: "Just now", icon: <FlightIcon sx={{ fontSize: 14 }} />, color: C.primary },
    { text: "Global Wings BD issued ticket", route: "DAC → DXB", time: "2 min ago", icon: <ConfirmationNumberIcon sx={{ fontSize: 14 }} />, color: C.success },
    { text: "Dhaka Express cancelled booking", route: "DAC → BKK", time: "5 min ago", icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} />, color: C.danger },
    { text: "FlyEasy Agency added credit", route: "৳ 50,000", time: "8 min ago", icon: <CreditCardIcon sx={{ fontSize: 14 }} />, color: C.teal },
    { text: "Horizon Tours booked 4 tickets", route: "DAC → DEL", time: "12 min ago", icon: <BookOnlineIcon sx={{ fontSize: 14 }} />, color: C.primary },
  ];

  const financialCards = [
    { label: "Total Receivable", value: "৳ 32,680,000", trend: "+5.2%", up: true, icon: <ReceiptLongIcon sx={{ fontSize: 17 }} />, color: C.danger },
    { label: "Total Payable", value: "৳ 18,750,000", trend: "+2.1%", up: false, icon: <AccountBalanceWalletIcon sx={{ fontSize: 17 }} />, color: C.warning },
    { label: "Cash in Bank", value: "৳ 52,390,000", trend: "+8.4%", up: true, icon: <SavingsIcon sx={{ fontSize: 17 }} />, color: C.success },
    { label: "Daily Collection (Avg)", value: "৳ 4,850,000", trend: "+12.0%", up: true, icon: <AttachMoneyIcon sx={{ fontSize: 17 }} />, color: C.primary },
  ];

  const cashIn = [32, 38, 35, 42, 48, 45, 52];
  const cashOut = [28, 30, 32, 35, 38, 36, 40];

  const quickActions = [
    { label: "Add New Agent", icon: <PersonAddIcon sx={{ fontSize: 18 }} />, path: "/dashboard/customer/allagent" },
    { label: "Add Credit to Agent", icon: <CreditCardIcon sx={{ fontSize: 18 }} />, path: "/dashboard/alldeposit" },
    { label: "Manual Booking", icon: <FlightIcon sx={{ fontSize: 18 }} />, path: "/dashboard/flightbookings/addflightbooking" },
    { label: "Record Payment", icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />, path: "/dashboard/alldeposit" },
    { label: "Generate Report", icon: <AssessmentIcon sx={{ fontSize: 18 }} />, path: "/dashboard/salesreport" },
  ];

  const footerStats = [
    { label: "Total Users", value: "2,548", trend: "+12.5%", up: true, icon: <PeopleOutlineIcon sx={{ fontSize: 14, color: C.muted }} /> },
    { label: "Total Agents", value: "1,245", trend: "+10.3%", up: true, icon: <GroupsIcon sx={{ fontSize: 14, color: C.muted }} /> },
    { label: "Total Customers", value: "18,750", trend: "+14.6%", up: true, icon: <PersonOutlineIcon sx={{ fontSize: 14, color: C.muted }} /> },
    { label: "API Requests (Today)", value: "12,850", trend: "+8.2%", up: true, icon: <ApiIcon sx={{ fontSize: 14, color: C.muted }} /> },
    { label: "Success Rate", value: "99.6%", trend: "+2.1%", up: true, icon: <SpeedIcon sx={{ fontSize: 14, color: C.muted }} /> },
    { label: "System Uptime", value: "99.9%", chip: true, icon: <CheckCircleOutlineIcon sx={{ fontSize: 14, color: C.muted }} /> },
  ];

  const timeStr = serverTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = serverTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", bgcolor: C.pageBg, minHeight: "100%" }}>
      <Grid container spacing={1.875} alignItems="stretch">
        {kpis.map((k) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={k.title} sx={gridItemSx()}>
            <KpiCard {...k} />
          </Grid>
        ))}

        <Grid item xs={12} lg={6} sx={gridItemSx()}>
          <CardShell height={H.row2}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.text }}>Revenue &amp; Profit Trend</Typography>
              <ToggleButtonGroup
                size="small"
                value={chartPeriod}
                exclusive
                onChange={(_, v) => v && setChartPeriod(v)}
                sx={{
                  bgcolor: "#F4F7FE",
                  borderRadius: "8px",
                  p: 0.25,
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    px: 1.5,
                    py: 0.4,
                    border: "none",
                    borderRadius: "6px !important",
                    color: C.muted,
                    minWidth: 56,
                    "&.Mui-selected": {
                      bgcolor: "#DEEBFF",
                      color: C.primary,
                      "&:hover": { bgcolor: "#DEEBFF" },
                    },
                  },
                }}
              >
                <ToggleButton value="daily">Daily</ToggleButton>
                <ToggleButton value="weekly">Weekly</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: "flex", gap: 2, mb: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: C.primary }} />
                <Typography sx={{ fontSize: 11, color: C.muted }}>Revenue (৳)</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: C.success }} />
                <Typography sx={{ fontSize: 11, color: C.muted }}>Profit (৳)</Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DualLineChart
                chartId="rev"
                labels={revenueLabels}
                seriesA={revenueSeries}
                seriesB={profitSeries}
                colorA={C.primary}
                colorB={C.success}
                height={268}
              />
            </Box>
          </CardShell>
        </Grid>

        <Grid item xs={12} md={6} lg={3} sx={gridItemSx()}>
          <CardShell height={H.row2}>
            <SectionTitle title="Revenue by Service" />
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
              <DonutChart segments={donutSegments} totalValue="৳125.4M" />
            </Box>
          </CardShell>
        </Grid>

        <Grid item xs={12} md={6} lg={3} sx={gridItemSx()}>
          <CardShell height={H.row2}>
            <SectionTitle
              title="Alerts & Notifications"
              action={
                <Button size="small" sx={{ textTransform: "none", fontSize: 11, fontWeight: 700, color: C.primary, minWidth: 0, p: 0 }}>
                  View All
                </Button>
              }
            />
            <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
              {alerts.map((a, i) => (
                <Box key={a.title} sx={{ "& > div": i === alerts.length - 1 ? { borderBottom: "none" } : {} }}>
                  <AlertItem {...a} />
                </Box>
              ))}
            </Box>
          </CardShell>
        </Grid>

        <Grid item xs={12} sm={6} lg={3} sx={gridItemSx()}>
          <CardShell height={H.row3}>
            <SectionTitle title="Top Agents (By Revenue)" />
            <TableContainer sx={{ flex: 1, minHeight: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Rank", "Agent Name", "Revenue (৳)", "Growth"].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 600, fontSize: 10, color: C.muted, borderColor: C.border, py: 0.75, px: 0.5 }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topAgents.map((a) => (
                    <TableRow key={a.rank} sx={{ "& td": { borderColor: C.border, py: 0.65, px: 0.5 } }}>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600, color: C.muted, width: 36 }}>#{a.rank}</TableCell>
                      <TableCell sx={{ fontSize: 11, fontWeight: 600, color: C.text }}>{a.name}</TableCell>
                      <TableCell sx={{ fontSize: 11, fontWeight: 700, color: C.text }}>{a.revenue}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", color: C.success }}>
                          <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>{a.growth}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardShell>
        </Grid>

        <Grid item xs={12} sm={6} lg={3} sx={gridItemSx()}>
          <CardShell height={H.row3}>
            <SectionTitle title="Agent Risk Overview" />
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              {[
                { label: "High Risk", count: 12, color: C.danger, bg: "#FFEBE6" },
                { label: "Medium Risk", count: 28, color: C.warning, bg: "#FFF0E0" },
                { label: "Low Risk", count: 1205, color: C.success, bg: "#E3FCEF" },
              ].map((r) => (
                <Grid item xs={4} key={r.label}>
                  <Box sx={{ borderRadius: "10px", bgcolor: r.bg, p: 1.25, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: r.color }}>{r.label}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{r.count}</Typography>
                    <Typography sx={{ fontSize: 9, color: C.muted }}>agents</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            {riskCategories.map((cat) => (
              <Box
                key={cat.label}
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.9, borderTop: `1px solid ${C.border}` }}
              >
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.text }}>{cat.label}</Typography>
                  <Typography sx={{ fontSize: 10, color: C.muted }}>{cat.agents} Agents</Typography>
                </Box>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.danger }}>{cat.amount}</Typography>
              </Box>
            ))}
          </CardShell>
        </Grid>

        <Grid item xs={12} sm={6} lg={3} sx={gridItemSx()}>
          <CardShell height={H.row3}>
            <SectionTitle title="Top Routes (By Bookings)" />
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              {topRoutes.map((r) => (
                <RouteBar key={r.route} {...r} />
              ))}
            </Box>
          </CardShell>
        </Grid>

        <Grid item xs={12} sm={6} lg={3} sx={gridItemSx()}>
          <CardShell height={H.row3}>
            <SectionTitle title="Live Activity" />
            {liveActivity.map((act, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  gap: 1,
                  py: 1,
                  borderBottom: i < liveActivity.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    bgcolor: `${act.color}18`,
                    color: act.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {act.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.text, lineHeight: 1.35 }}>{act.text}</Typography>
                  <Typography sx={{ fontSize: 10, color: C.muted }}>{act.route} · {act.time}</Typography>
                </Box>
              </Box>
            ))}
          </CardShell>
        </Grid>

        <Grid item xs={12} lg={6} sx={gridItemSx()}>
          <CardShell height={H.row4}>
            <SectionTitle title="Financial Overview" />
            <Grid container spacing={1.25}>
              {financialCards.map((f) => (
                <Grid item xs={6} key={f.label}>
                  <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "10px", p: 1.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 500, color: C.muted, lineHeight: 1.3 }}>{f.label}</Typography>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          bgcolor: `${f.color}18`,
                          color: f.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {f.icon}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text, mt: 0.75 }}>{f.value}</Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: f.up ? C.success : C.danger, mt: 0.25 }}>
                      {f.trend}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardShell>
        </Grid>

        <Grid item xs={12} lg={4} sx={gridItemSx()}>
          <CardShell height={H.row4}>
            <SectionTitle title="Cash Flow Trend" />
            <Box sx={{ display: "flex", gap: 2, mb: 0.75 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 3, bgcolor: C.success, borderRadius: 1 }} />
                <Typography sx={{ fontSize: 11, color: C.muted }}>Cash In</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 3, bgcolor: C.danger, borderRadius: 1 }} />
                <Typography sx={{ fontSize: 11, color: C.muted }}>Cash Out</Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DualLineChart
                chartId="cash"
                labels={revenueLabels}
                seriesA={cashIn}
                seriesB={cashOut}
                colorA={C.success}
                colorB={C.danger}
                height={168}
              />
            </Box>
          </CardShell>
        </Grid>

        <Grid item xs={12} lg={2} sx={gridItemSx()}>
          <CardShell height={H.row4}>
            <SectionTitle title="Quick Actions" />
            {quickActions.map((q) => (
              <Button
                key={q.label}
                fullWidth
                onClick={() => navigate(q.path)}
                startIcon={<Box sx={{ color: C.primary, display: "flex", mr: -0.5 }}>{q.icon}</Box>}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.primary,
                  py: 0.85,
                  px: 0.5,
                  mb: 0.25,
                  "&:hover": { bgcolor: "rgba(0, 82, 204, 0.06)" },
                }}
              >
                {q.label}
              </Button>
            ))}
          </CardShell>
        </Grid>

        <Grid item xs={12} sx={gridItemSx()}>
          <Paper
            sx={{
              ...CARD_SX,
              p: 1.5,
              height: H.footer,
              minHeight: H.footer,
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: { xs: 1.5, md: 2 },
            }}
          >
            {footerStats.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", lg: "block" }, borderColor: C.border, height: 32 }} />}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25 }}>
                    {s.icon}
                    <Typography sx={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>{s.label}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 2.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.value}</Typography>
                    {s.chip ? (
                      <Chip label="Excellent" size="small" sx={{ height: 20, fontSize: 9, fontWeight: 700, bgcolor: "#E3FCEF", color: C.success }} />
                    ) : (
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: s.up ? C.success : C.danger }}>{s.trend}</Typography>
                    )}
                  </Box>
                </Box>
              </React.Fragment>
            ))}
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <ScheduleIcon sx={{ fontSize: 16, color: C.primary }} />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{timeStr}</Typography>
                <Typography sx={{ fontSize: 10, color: C.muted }}>Server Time · {dateStr} (GMT+6)</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
