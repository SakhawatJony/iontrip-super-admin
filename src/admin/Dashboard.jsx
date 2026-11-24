import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
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
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import HotelIcon from "@mui/icons-material/Hotel";
import CardTravelIcon from "@mui/icons-material/CardTravel";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import SimCardIcon from "@mui/icons-material/SimCard";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import { useAuth } from "../context/AuthContext.jsx";
import { useDashboardFilter } from "../context/DashboardFilterContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import {
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
  formatRangeLabel,
  formatSignedTrend,
  formatTrend,
  mapDashboardResponse,
} from "./dashboardData.js";

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

const GAP = "15px";
const CARD_PAD = "16px";
const CARD_SX = {
  bgcolor: C.cardBg,
  borderRadius: "12px",
  border: `1px solid ${C.border}`,
  boxShadow: "0px 4px 18px rgba(112, 144, 176, 0.08)",
  height: "100%",
  width: "100%",
  boxSizing: "border-box",
};

/** Fixed row heights — matched to reference screenshot */
const H = {
  kpi: 120,
  service: 64,
  charts: 355,
  data: 430,
  financeRow: 245,
  actionsRow: 208,
  footer: 62,
};

function DashRow({ columns, height, children, sx = {} }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: columns,
        gap: GAP,
        height,
        minHeight: height,
        maxHeight: height,
        width: "100%",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

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

function cellSx() {
  return { minWidth: 0, height: "100%", display: "flex" };
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

function severityColor(severity) {
  const value = String(severity || "").toLowerCase();
  if (value.includes("danger") || value.includes("error") || value.includes("high") || value.includes("critical")) return C.danger;
  if (value.includes("warn") || value.includes("medium")) return C.warning;
  if (value.includes("success") || value.includes("ok") || value.includes("low")) return C.success;
  return C.primary;
}

function activityMeta(type) {
  const value = String(type || "").toLowerCase();
  if (value.includes("cancel")) return { icon: <CancelOutlinedIcon sx={{ fontSize: 14 }} />, color: C.danger };
  if (value.includes("credit") || value.includes("payment") || value.includes("deposit")) {
    return { icon: <CreditCardIcon sx={{ fontSize: 14 }} />, color: C.teal };
  }
  if (value.includes("ticket") || value.includes("issue")) {
    return { icon: <ConfirmationNumberIcon sx={{ fontSize: 14 }} />, color: C.success };
  }
  if (value.includes("book")) return { icon: <BookOnlineIcon sx={{ fontSize: 14 }} />, color: C.primary };
  return { icon: <FlightIcon sx={{ fontSize: 14 }} />, color: C.primary };
}

function alertIcon(severity) {
  const color = severityColor(severity);
  if (color === C.danger) return <WarningAmberIcon sx={{ fontSize: 16 }} />;
  if (color === C.success) return <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />;
  return <InfoOutlinedIcon sx={{ fontSize: 16 }} />;
}

function KpiCard({ title, value, trend, trendUp, icon, iconBg, sparkData, sparkColor, comparisonLabel }) {
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
        <Typography sx={{ fontSize: 11, fontWeight: 500, color: C.muted, lineHeight: 1.35, maxWidth: "62%" }}>
          {title}
        </Typography>
        <Box
          sx={{
            width: 44,
            height: 44,
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
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: C.text, mt: 0.75, lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mt: 0.5 }}>
        {trendUp ? (
          <TrendingUpIcon sx={{ fontSize: 13, color: C.success }} />
        ) : (
          <TrendingDownIcon sx={{ fontSize: 13, color: C.danger }} />
        )}
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: trendUp ? C.success : C.danger }}>{trend}</Typography>
        {comparisonLabel ? (
          <Typography sx={{ fontSize: 9, color: C.muted, ml: 0.25 }}>{comparisonLabel}</Typography>
        ) : null}
      </Box>
      <Box sx={{ mt: "auto" }}>
        <AreaSparkline data={sparkData} color={sparkColor} height={36} />
      </Box>
    </Paper>
  );
}

function ServiceCard({ icon, label, count, color, bg }) {
  return (
    <Paper
      sx={{
        ...CARD_SX,
        p: "10px 12px",
        height: H.service,
        minHeight: H.service,
        maxHeight: H.service,
        display: "flex",
        alignItems: "center",
        gap: 1,
        boxShadow: "0px 2px 10px rgba(112, 144, 176, 0.06)",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "8px",
          bgcolor: bg,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 600, color: C.muted, lineHeight: 1.3 }} noWrap>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
          {count.toLocaleString()}
        </Typography>
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
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text }}>{title}</Typography>
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

function FinanceInnerCard({ label, value, trend, up, icon, color }) {
  return (
    <Box sx={{ border: `1px solid ${C.border}`, borderRadius: "10px", p: "10px 12px", height: "100%", boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: 9, fontWeight: 500, color: C.muted, lineHeight: 1.3, maxWidth: "68%" }}>
          {label}
        </Typography>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            bgcolor: `${color}18`,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.text, mt: 0.5, lineHeight: 1.2 }}>{value}</Typography>
      <Typography sx={{ fontSize: 9, fontWeight: 700, color: up ? C.success : C.danger, mt: 0.25 }}>{trend}</Typography>
    </Box>
  );
}

function ActionRequiredItem({ icon, label, count, color }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.85, borderBottom: `1px solid ${C.border}` }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: `${color}18`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1 }}>{label}</Typography>
      <Chip
        label={`${count} Pending`}
        size="small"
        sx={{
          height: 22,
          fontSize: 10,
          fontWeight: 700,
          bgcolor: count > 0 ? `${color}18` : "#F4F7FE",
          color: count > 0 ? color : C.muted,
        }}
      />
    </Box>
  );
}

function QuickActionTile({ icon, title, subtitle, path, onNavigate }) {
  return (
    <Button
      onClick={() => onNavigate(path)}
      sx={{
        textTransform: "none",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 1,
        p: "10px 12px",
        borderRadius: "10px",
        border: `1px solid ${C.border}`,
        bgcolor: C.cardBg,
        height: "100%",
        minHeight: 0,
        width: "100%",
        boxShadow: "0px 2px 8px rgba(112, 144, 176, 0.05)",
        "&:hover": { bgcolor: "rgba(0, 82, 204, 0.04)", borderColor: "#DEEBFF" },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          bgcolor: "#DEEBFF",
          color: C.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ textAlign: "left", minWidth: 0 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: C.text, lineHeight: 1.3 }} noWrap>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 9, color: C.muted, lineHeight: 1.3 }} noWrap>
          {subtitle}
        </Typography>
      </Box>
    </Button>
  );
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { dateRange, currency: filterCurrency } = useDashboardFilter();
  const [chartPeriod, setChartPeriod] = useState("daily");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverTime, setServerTime] = useState(() => new Date());

  const fetchDashboard = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      setLoading(false);
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        trendGranularity: chartPeriod,
        currency: filterCurrency,
      });

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD_LIVE}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const mapped = mapDashboardResponse(response.data, filterCurrency);
      setDashboardData(mapped);

      if (mapped.meta?.serverTime) {
        const parsed = new Date(mapped.meta.serverTime);
        if (!Number.isNaN(parsed.getTime())) setServerTime(parsed);
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load dashboard data.";
      toast.error(apiMessage);
      console.error("Dashboard fetch failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [token, dateRange.startDate, dateRange.endDate, chartPeriod, filterCurrency]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const t = setInterval(() => setServerTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const comparisonLabel = dashboardData?.meta?.comparisonLabel || formatRangeLabel(dateRange.startDate, dateRange.endDate);
  const currency = filterCurrency || "BDT";

  const kpis = [
    {
      title: "Total Revenue (MTD)",
      value: formatCurrency(dashboardData?.kpis?.totalRevenue?.value, currency),
      trend: formatTrend(dashboardData?.kpis?.totalRevenue?.change),
      trendUp: dashboardData?.kpis?.totalRevenue?.trendUp ?? true,
      icon: <AttachMoneyIcon sx={{ fontSize: 24 }} />,
      iconBg: "#DEEBFF",
      sparkColor: C.primary,
      sparkData: dashboardData?.kpis?.totalRevenue?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      comparisonLabel: dashboardData?.kpis?.totalRevenue?.comparisonLabel || comparisonLabel,
    },
    {
      title: "Net Profit (MTD)",
      value: formatCurrency(dashboardData?.kpis?.netProfit?.value, currency),
      trend: formatTrend(dashboardData?.kpis?.netProfit?.change),
      trendUp: dashboardData?.kpis?.netProfit?.trendUp ?? true,
      icon: <ShowChartIcon sx={{ fontSize: 24 }} />,
      iconBg: "#E3FCEF",
      sparkColor: C.success,
      sparkData: dashboardData?.kpis?.netProfit?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      comparisonLabel: dashboardData?.kpis?.netProfit?.comparisonLabel || comparisonLabel,
    },
    {
      title: "Total Bookings (MTD)",
      value: formatNumber(dashboardData?.kpis?.totalBookings?.value),
      trend: formatTrend(dashboardData?.kpis?.totalBookings?.change),
      trendUp: dashboardData?.kpis?.totalBookings?.trendUp ?? true,
      icon: <ConfirmationNumberIcon sx={{ fontSize: 24 }} />,
      iconBg: "#EDE7F6",
      sparkColor: C.purple,
      sparkData: dashboardData?.kpis?.totalBookings?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      comparisonLabel: dashboardData?.kpis?.totalBookings?.comparisonLabel || comparisonLabel,
    },
    {
      title: "Active Agents",
      value: formatNumber(dashboardData?.kpis?.activeAgents?.value),
      trend: formatTrend(dashboardData?.kpis?.activeAgents?.change),
      trendUp: dashboardData?.kpis?.activeAgents?.trendUp ?? true,
      icon: <GroupsIcon sx={{ fontSize: 24 }} />,
      iconBg: "#FFF0E0",
      sparkColor: C.warning,
      sparkData: dashboardData?.kpis?.activeAgents?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      comparisonLabel: dashboardData?.kpis?.activeAgents?.comparisonLabel || comparisonLabel,
    },
    {
      title: "Total Outstanding",
      value: formatCurrency(dashboardData?.kpis?.totalOutstanding?.value, currency),
      trend: formatTrend(dashboardData?.kpis?.totalOutstanding?.change),
      trendUp: dashboardData?.kpis?.totalOutstanding?.trendUp ?? false,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 24 }} />,
      iconBg: "#FFEBE6",
      sparkColor: C.danger,
      sparkData: dashboardData?.kpis?.totalOutstanding?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      comparisonLabel: dashboardData?.kpis?.totalOutstanding?.comparisonLabel || comparisonLabel,
    },
    {
      title: "Cash Flow (MTD)",
      value: formatCurrency(dashboardData?.kpis?.cashFlow?.value, currency),
      trend: formatTrend(dashboardData?.kpis?.cashFlow?.change),
      trendUp: dashboardData?.kpis?.cashFlow?.trendUp ?? true,
      icon: <SavingsIcon sx={{ fontSize: 24 }} />,
      iconBg: "#E3FCEF",
      sparkColor: C.success,
      sparkData: dashboardData?.kpis?.cashFlow?.sparkline || [0, 0, 0, 0, 0, 0, 0],
      comparisonLabel: dashboardData?.kpis?.cashFlow?.comparisonLabel || comparisonLabel,
    },
  ];

  const serviceIconMap = {
    Flights: <FlightIcon sx={{ fontSize: 20 }} />,
    Hotels: <HotelIcon sx={{ fontSize: 20 }} />,
    Tours: <CardTravelIcon sx={{ fontSize: 20 }} />,
    Transfer: <DirectionsCarIcon sx={{ fontSize: 20 }} />,
    Visa: <CardTravelIcon sx={{ fontSize: 20 }} />,
    eSIM: <SimCardIcon sx={{ fontSize: 20 }} />,
    "Travel Insurance": <HealthAndSafetyIcon sx={{ fontSize: 20 }} />,
  };

  const services = (dashboardData?.services?.length
    ? dashboardData.services
    : [
        { label: "Flights", count: 0, color: C.primary, bg: "#DEEBFF" },
        { label: "Hotels", count: 0, color: C.success, bg: "#E3FCEF" },
        { label: "Tours", count: 0, color: C.purple, bg: "#EDE7F6" },
        { label: "Transfer", count: 0, color: C.teal, bg: "#E0F7FA" },
        { label: "Visa", count: 0, color: C.warning, bg: "#FFF0E0" },
        { label: "eSIM", count: 0, color: "#6554C0", bg: "#EDE7F6" },
        { label: "Travel Insurance", count: 0, color: C.danger, bg: "#FFEBE6" },
      ]
  ).map((service) => ({
    ...service,
    icon: serviceIconMap[service.label] || <FlightIcon sx={{ fontSize: 20 }} />,
  }));

  const revenueLabels = dashboardData?.revenueTrend?.labels?.length ? dashboardData.revenueTrend.labels : ["—"];
  const revenueSeries = dashboardData?.revenueTrend?.seriesA?.length ? dashboardData.revenueTrend.seriesA : [0];
  const profitSeries = dashboardData?.revenueTrend?.seriesB?.length ? dashboardData.revenueTrend.seriesB : [0];

  const donutSegments = dashboardData?.revenueByService?.length
    ? dashboardData.revenueByService.map(({ label, pct, amount, color }) => ({ label, pct, amount, color }))
    : [{ label: "No data", pct: 100, amount: "0", color: C.muted }];

  const alerts = (dashboardData?.alerts?.length ? dashboardData.alerts : []).map((alert) => ({
    icon: alertIcon(alert.severity),
    title: alert.title,
    desc: alert.desc,
    time: alert.time,
    color: severityColor(alert.severity),
  }));

  const topAgents = dashboardData?.topAgents?.length ? dashboardData.topAgents : [];

  const riskOverview = dashboardData?.riskOverview || { highRisk: 0, mediumRisk: 0, lowRisk: 0, categories: [] };
  const riskCategories = riskOverview.categories?.length ? riskOverview.categories : [];

  const topRoutes = dashboardData?.topRoutes?.length ? dashboardData.topRoutes : [];

  const liveActivity = (dashboardData?.liveActivity?.length ? dashboardData.liveActivity : []).map((act) => {
    const meta = activityMeta(act.type);
    return { ...act, icon: meta.icon, color: meta.color };
  });

  const financialCards = [
    {
      label: "Total Receivable",
      value: formatCurrency(dashboardData?.financialOverview?.totalReceivable?.value, currency),
      trend: formatSignedTrend(dashboardData?.financialOverview?.totalReceivable?.trend),
      up: dashboardData?.financialOverview?.totalReceivable?.up ?? true,
      icon: <ReceiptLongIcon sx={{ fontSize: 17 }} />,
      color: C.danger,
    },
    {
      label: "Total Payable",
      value: formatCurrency(dashboardData?.financialOverview?.totalPayable?.value, currency),
      trend: formatSignedTrend(dashboardData?.financialOverview?.totalPayable?.trend),
      up: dashboardData?.financialOverview?.totalPayable?.up ?? false,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 17 }} />,
      color: C.warning,
    },
    {
      label: "Cash in Bank",
      value: formatCurrency(dashboardData?.financialOverview?.cashInBank?.value, currency),
      trend: formatSignedTrend(dashboardData?.financialOverview?.cashInBank?.trend),
      up: dashboardData?.financialOverview?.cashInBank?.up ?? true,
      icon: <SavingsIcon sx={{ fontSize: 17 }} />,
      color: C.success,
    },
    {
      label: "Daily Collection (Avg)",
      value: formatCurrency(dashboardData?.financialOverview?.dailyCollectionAvg?.value, currency),
      trend: formatSignedTrend(dashboardData?.financialOverview?.dailyCollectionAvg?.trend),
      up: dashboardData?.financialOverview?.dailyCollectionAvg?.up ?? true,
      icon: <AttachMoneyIcon sx={{ fontSize: 17 }} />,
      color: C.primary,
    },
  ];

  const cashIn = dashboardData?.cashFlowTrend?.seriesA?.length ? dashboardData.cashFlowTrend.seriesA : [0];
  const cashOut = dashboardData?.cashFlowTrend?.seriesB?.length ? dashboardData.cashFlowTrend.seriesB : [0];
  const cashFlowLabels = dashboardData?.cashFlowTrend?.labels?.length ? dashboardData.cashFlowTrend.labels : revenueLabels;

  const quickActions = [
    { label: "Add New Agent", icon: <PersonAddIcon sx={{ fontSize: 18 }} />, path: "/dashboard/customer/allagent" },
    { label: "Add Credit to Agent", icon: <CreditCardIcon sx={{ fontSize: 18 }} />, path: "/dashboard/alldeposit" },
    { label: "Manual Booking", icon: <FlightIcon sx={{ fontSize: 18 }} />, path: "/dashboard/flightbookings/addflightbooking" },
    { label: "Record Payment", icon: <ReceiptLongIcon sx={{ fontSize: 18 }} />, path: "/dashboard/alldeposit" },
    { label: "Generate Report", icon: <AssessmentIcon sx={{ fontSize: 18 }} />, path: "/dashboard/ledgerreport" },
  ];

  const requiredActions = (dashboardData?.requiredActions?.length ? dashboardData.requiredActions : []).map((action) => ({
    label: action.label,
    count: action.count,
    icon: <PendingActionsIcon sx={{ fontSize: 16 }} />,
    color: severityColor(action.severity),
  }));

  const quickActionIconMap = {
    bookings: <BookOnlineIcon sx={{ fontSize: 20 }} />,
    users: <ManageAccountsIcon sx={{ fontSize: 20 }} />,
    flights: <FlightIcon sx={{ fontSize: 20 }} />,
    stays: <HotelIcon sx={{ fontSize: 20 }} />,
    tours: <CardTravelIcon sx={{ fontSize: 20 }} />,
    cars: <DirectionsCarIcon sx={{ fontSize: 20 }} />,
    pages: <AssessmentIcon sx={{ fontSize: 20 }} />,
    blogs: <ReceiptLongIcon sx={{ fontSize: 20 }} />,
    finance: <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />,
    settings: <SettingsIcon sx={{ fontSize: 20 }} />,
  };

  const quickActionGrid = (dashboardData?.quickActions?.length
    ? dashboardData.quickActions.slice(0, 8)
    : [
        { title: "Bookings", subtitle: "Manage Bookings", path: "/dashboard/flightbookings/bookinghistory", key: "bookings" },
        { title: "Users", subtitle: "Agent Management", path: "/dashboard/customer/allagent", key: "users" },
        { title: "Reports", subtitle: "Ledger Reports", path: "/dashboard/ledgerreport", key: "finance" },
        { title: "Deposits", subtitle: "Credit & Wallet", path: "/dashboard/alldeposit", key: "finance" },
        { title: "Hotels", subtitle: "Hotel Bookings", path: "/dashboard/hotel/bookinghistory", key: "stays" },
<<<<<<< HEAD
        { title: "Visa", subtitle: "Visa Applications", path: "/dashboard/visa/bookinghistory", key: "tours" },
        { title: "Tours", subtitle: "Tour Packages", path: "/dashboard/tour/bookinghistory", key: "tours" },
=======
        { title: "Visa", subtitle: "Visa Applications", path: "/dashboard/visa/allvisa", key: "tours" },
        { title: "Tours", subtitle: "Tour Packages", path: "/dashboard/tour/alltour", key: "tours" },
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
        { title: "Settings", subtitle: "System Config", path: "/dashboard/settings/alladmin", key: "settings" },
      ]
  ).map((item) => ({
    ...item,
    icon: quickActionIconMap[item.key] || <BookOnlineIcon sx={{ fontSize: 20 }} />,
  }));

  const footerStats = [
    {
      label: "Total Users",
      value: formatNumber(dashboardData?.footerStats?.totalUsers?.value),
      trend: formatSignedTrend(dashboardData?.footerStats?.totalUsers?.change),
      up: toNumber(dashboardData?.footerStats?.totalUsers?.change, 0) >= 0,
      icon: <PeopleIcon sx={{ fontSize: 14, color: C.muted }} />,
    },
    {
      label: "Total Bookings",
      value: formatNumber(dashboardData?.footerStats?.totalBookings?.value),
      trend: formatSignedTrend(dashboardData?.footerStats?.totalBookings?.change),
      up: toNumber(dashboardData?.footerStats?.totalBookings?.change, 0) >= 0,
      icon: <ConfirmationNumberIcon sx={{ fontSize: 14, color: C.muted }} />,
    },
    {
      label: "Total Agents",
      value: formatNumber(dashboardData?.footerStats?.totalAgents?.value),
      trend: formatSignedTrend(dashboardData?.footerStats?.totalAgents?.change),
      up: toNumber(dashboardData?.footerStats?.totalAgents?.change, 0) >= 0,
      icon: <GroupsIcon sx={{ fontSize: 14, color: C.muted }} />,
    },
    {
      label: "Verified Agents",
      value: formatNumber(dashboardData?.footerStats?.verifiedAgents?.value),
      trend: formatSignedTrend(dashboardData?.footerStats?.verifiedAgents?.change),
      up: toNumber(dashboardData?.footerStats?.verifiedAgents?.change, 0) >= 0,
      icon: <CheckCircleOutlineIcon sx={{ fontSize: 14, color: C.muted }} />,
    },
    {
      label: "Pending Verification",
      value: formatNumber(dashboardData?.footerStats?.pendingVerification?.value),
      trend: formatSignedTrend(dashboardData?.footerStats?.pendingVerification?.change),
      up: toNumber(dashboardData?.footerStats?.pendingVerification?.change, 0) >= 0,
      icon: <ScheduleIcon sx={{ fontSize: 14, color: C.muted }} />,
    },
    {
      label: "Inactive Agents",
      value: formatNumber(dashboardData?.footerStats?.inactiveAgents?.value),
      trend: formatSignedTrend(dashboardData?.footerStats?.inactiveAgents?.change),
      up: toNumber(dashboardData?.footerStats?.inactiveAgents?.change, 0) >= 0,
      icon: <WarningAmberIcon sx={{ fontSize: 14, color: C.muted }} />,
    },
  ];

  const timeStr = serverTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = serverTime.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box sx={{ width: "100%", bgcolor: C.pageBg, display: "flex", flexDirection: "column", gap: GAP, position: "relative" }}>
      {loading ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            bgcolor: "rgba(244, 247, 254, 0.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={36} sx={{ color: C.primary }} />
        </Box>
      ) : null}
      {/* Row 1 — 6 KPI cards, equal width */}
      <DashRow columns="repeat(6, 1fr)" height={H.kpi}>
        {kpis.map((k) => (
          <Box key={k.title} sx={cellSx()}>
            <KpiCard {...k} />
          </Box>
        ))}
      </DashRow>

      {/* Row 2 — 7 service cards, equal width */}
      <DashRow columns="repeat(7, 1fr)" height={H.service}>
        {services.map((s) => (
          <Box key={s.label} sx={cellSx()}>
            <ServiceCard {...s} />
          </Box>
        ))}
      </DashRow>

      {/* Row 3 — Charts: 45% | 25% | 30% */}
      <DashRow columns="4.5fr 2.5fr 3fr" height={H.charts}>
        <Box sx={cellSx()}>
          <CardShell height={H.charts}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
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
                    fontSize: 10,
                    fontWeight: 600,
                    px: 1.25,
                    py: 0.35,
                    border: "none",
                    borderRadius: "6px !important",
                    color: C.muted,
                    minWidth: 52,
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
            <Box sx={{ display: "flex", gap: 2, mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: C.primary }} />
                <Typography sx={{ fontSize: 10, color: C.muted }}>Revenue ({currency})</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: C.success }} />
                <Typography sx={{ fontSize: 10, color: C.muted }}>Profit ({currency})</Typography>
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
                height={250}
              />
            </Box>
          </CardShell>
        </Box>

        <Box sx={cellSx()}>
          <CardShell height={H.charts}>
            <SectionTitle title="Revenue by Service" />
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
              <DonutChart
                segments={donutSegments}
                totalValue={formatCompactCurrency(dashboardData?.revenueByServiceTotal || 0, currency)}
              />
            </Box>
          </CardShell>
        </Box>

        <Box sx={cellSx()}>
          <CardShell height={H.charts}>
            <SectionTitle
              title="Alerts & Notifications"
              action={
                <Button size="small" sx={{ textTransform: "none", fontSize: 10, fontWeight: 700, color: C.primary, minWidth: 0, p: 0 }}>
                  View All
                </Button>
              }
            />
            <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
              {alerts.length ? (
                alerts.map((a, i) => (
                  <Box key={`${a.title}-${i}`} sx={{ "& > div": i === alerts.length - 1 ? { borderBottom: "none" } : {} }}>
                    <AlertItem {...a} />
                  </Box>
                ))
              ) : (
                <Typography sx={{ fontSize: 11, color: C.muted, py: 2, textAlign: "center" }}>No alerts</Typography>
              )}
            </Box>
          </CardShell>
        </Box>
      </DashRow>

      {/* Row 4 — 4 equal columns */}
      <DashRow columns="repeat(4, 1fr)" height={H.data}>
        <Box sx={cellSx()}>
          <CardShell height={H.data}>
            <SectionTitle title="Top Agents (By Revenue)" />
            <TableContainer sx={{ flex: 1, minHeight: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Rank", "Agent Name", `Revenue (${currency})`, "Growth"].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 600, fontSize: 9, color: C.muted, borderColor: C.border, py: 0.5, px: 0.5 }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topAgents.length ? (
                    topAgents.map((a) => (
                      <TableRow key={a.rank} sx={{ "& td": { borderColor: C.border, py: 0.55, px: 0.5 } }}>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, color: C.muted, width: 32 }}>#{a.rank}</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 600, color: C.text }}>{a.name}</TableCell>
                        <TableCell sx={{ fontSize: 10, fontWeight: 700, color: C.text }}>{a.revenue}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", color: a.growth >= 0 ? C.success : C.danger }}>
                            <ArrowUpwardIcon sx={{ fontSize: 11, transform: a.growth < 0 ? "rotate(180deg)" : "none" }} />
                            <Typography sx={{ fontSize: 10, fontWeight: 700 }}>{Math.abs(a.growth)}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ fontSize: 10, color: C.muted, textAlign: "center", py: 2 }}>
                        No agent data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardShell>
        </Box>

        <Box sx={cellSx()}>
          <CardShell height={H.data}>
            <SectionTitle title="Agent Risk Overview" />
            <Grid container spacing={0.75} sx={{ mb: 1 }}>
              {[
                { label: "High Risk", count: riskOverview.highRisk, color: C.danger, bg: "#FFEBE6" },
                { label: "Medium Risk", count: riskOverview.mediumRisk, color: C.warning, bg: "#FFF0E0" },
                { label: "Low Risk", count: riskOverview.lowRisk, color: C.success, bg: "#E3FCEF" },
              ].map((r) => (
                <Grid item xs={4} key={r.label}>
                  <Box sx={{ borderRadius: "10px", bgcolor: r.bg, p: 1, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 9, fontWeight: 600, color: r.color }}>{r.label}</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{r.count}</Typography>
                    <Typography sx={{ fontSize: 8, color: C.muted }}>agents</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            {riskCategories.length ? (
              riskCategories.map((cat) => (
                <Box
                  key={cat.label}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75, borderTop: `1px solid ${C.border}` }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: C.text }}>{cat.label}</Typography>
                    <Typography sx={{ fontSize: 9, color: C.muted }}>{cat.agents} Agents</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: C.danger }}>{cat.amount}</Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: 10, color: C.muted, py: 1.5, textAlign: "center" }}>No risk data</Typography>
            )}
          </CardShell>
        </Box>

        <Box sx={cellSx()}>
          <CardShell height={H.data}>
            <SectionTitle title="Top Routes (By Bookings)" />
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              {topRoutes.length ? (
                topRoutes.map((r) => <RouteBar key={r.route} {...r} />)
              ) : (
                <Typography sx={{ fontSize: 10, color: C.muted, py: 2, textAlign: "center" }}>No route data</Typography>
              )}
            </Box>
          </CardShell>
        </Box>

        <Box sx={cellSx()}>
          <CardShell height={H.data}>
            <SectionTitle title="Live Activity" />
            {liveActivity.length ? (
              liveActivity.map((act, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    gap: 1,
                    py: 0.85,
                    borderBottom: i < liveActivity.length - 1 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
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
                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: C.text, lineHeight: 1.35 }}>{act.text}</Typography>
                    <Typography sx={{ fontSize: 9, color: C.muted }}>{act.route} · {act.time}</Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: 10, color: C.muted, py: 2, textAlign: "center" }}>No recent activity</Typography>
            )}
          </CardShell>
        </Box>
      </DashRow>

      {/* Row 5 — Financial | Cash Flow | Quick Actions (same row, same height) */}
      <DashRow columns="3.5fr 4.5fr 2fr" height={H.financeRow}>
        <Box sx={cellSx()}>
          <CardShell height={H.financeRow}>
            <SectionTitle title="Financial Overview" />
            <Box
              sx={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: "10px",
                minHeight: 0,
              }}
            >
              {financialCards.map((f) => (
                <FinanceInnerCard key={f.label} {...f} />
              ))}
            </Box>
          </CardShell>
        </Box>

        <Box sx={cellSx()}>
          <CardShell height={H.financeRow}>
            <SectionTitle title="Cash Flow Trend" />
            <Box sx={{ display: "flex", gap: 2, mb: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 3, bgcolor: C.success, borderRadius: 1 }} />
                <Typography sx={{ fontSize: 10, color: C.muted }}>Cash In</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 10, height: 3, bgcolor: C.danger, borderRadius: 1 }} />
                <Typography sx={{ fontSize: 10, color: C.muted }}>Cash Out</Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DualLineChart
                chartId="cash"
                labels={cashFlowLabels}
                seriesA={cashIn}
                seriesB={cashOut}
                colorA={C.success}
                colorB={C.danger}
                height={160}
              />
            </Box>
          </CardShell>
        </Box>

        <Box sx={cellSx()}>
          <CardShell height={H.financeRow}>
            <SectionTitle title="Quick Actions" />
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 0 }}>
              {quickActions.map((q) => (
                <Button
                  key={q.label}
                  fullWidth
                  onClick={() => navigate(q.path)}
                  startIcon={<Box sx={{ color: C.primary, display: "flex", mr: -0.5 }}>{q.icon}</Box>}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.primary,
                    py: 0.5,
                    px: 0.5,
                    minHeight: 0,
                    "&:hover": { bgcolor: "rgba(0, 82, 204, 0.06)" },
                  }}
                >
                  {q.label}
                </Button>
              ))}
            </Box>
          </CardShell>
        </Box>
      </DashRow>

      {/* Row 6 — Actions Required | Quick Actions Grid */}
      <DashRow columns="1fr 2fr" height={H.actionsRow}>
        <Box sx={cellSx()}>
          <CardShell height={H.actionsRow}>
            <SectionTitle title="Actions (Required)" />
            <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
              {requiredActions.length ? (
                requiredActions.map((a, i) => (
                  <Box key={a.label} sx={{ "& > div": i === requiredActions.length - 1 ? { borderBottom: "none" } : {} }}>
                    <ActionRequiredItem {...a} />
                  </Box>
                ))
              ) : (
                <Typography sx={{ fontSize: 11, color: C.muted, py: 2, textAlign: "center" }}>No pending actions</Typography>
              )}
            </Box>
          </CardShell>
        </Box>

        <Box sx={cellSx()}>
          <CardShell height={H.actionsRow}>
            <SectionTitle title="Quick Actions" />
            <Box
              sx={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "1fr 1fr",
                gap: "10px",
                minHeight: 0,
              }}
            >
              {quickActionGrid.map((q) => (
                <QuickActionTile key={q.title} {...q} onNavigate={navigate} />
              ))}
            </Box>
          </CardShell>
        </Box>
      </DashRow>

      {/* Footer — system status bar */}
      <Paper
        sx={{
          ...CARD_SX,
          p: "12px 16px",
          height: H.footer,
          minHeight: H.footer,
          maxHeight: H.footer,
          boxShadow: "none",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {footerStats.map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <Divider orientation="vertical" flexItem sx={{ borderColor: C.border, height: 32 }} />}
            <Box sx={{ flexShrink: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.25 }}>
                {s.icon}
                <Typography sx={{ fontSize: 9, color: C.muted, fontWeight: 500, whiteSpace: "nowrap" }}>{s.label}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 2.25 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.text }}>{s.value}</Typography>
                {s.chip ? (
                  <Chip label="Excellent" size="small" sx={{ height: 18, fontSize: 8, fontWeight: 700, bgcolor: "#E3FCEF", color: C.success }} />
                ) : s.trend && s.trend !== "—" ? (
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: s.up ? C.success : C.danger }}>{s.trend}</Typography>
                ) : null}
              </Box>
            </Box>
          </React.Fragment>
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
          <ScheduleIcon sx={{ fontSize: 15, color: C.primary }} />
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.primary }}>{timeStr}</Typography>
            <Typography sx={{ fontSize: 9, color: C.muted, whiteSpace: "nowrap" }}>Server Time · {dateStr} (GMT+6)</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
