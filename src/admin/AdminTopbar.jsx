import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext.jsx";
import { useDashboardFilter } from "../context/DashboardFilterContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { formatRangeLabel, getDefaultDateRange, toISODate } from "../admin/dashboardData.js";
import {
  extractNotificationNavFields,
  isNotificationNavigable,
  resolveNotificationDestination,
} from "../utils/notificationNavigation.js";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeNotifications(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : payload?.data ?? payload?.notifications ?? payload?.items ?? [];

  return asArray(raw).map((item, index) => ({
    id: item?.id ?? item?._id ?? index,
    title: item?.title || item?.subject || item?.message || "Notification",
    message: item?.body || item?.description || (item?.title ? item?.message : "") || "",
    isRead: Boolean(item?.isRead ?? item?.read ?? item?.is_read),
    importance: item?.importance || "none",
    createdAt: item?.createdAt || item?.created_at || item?.time || item?.relativeTime || "",
    raw: item,
    ...extractNotificationNavFields(item),
  }));
}

function getUnreadCount(payload, list) {
  if (payload?.unreadCount != null) return Number(payload.unreadCount) || 0;
  if (payload?.unread != null) return Number(payload.unread) || 0;
  return list.filter((item) => !item.isRead).length;
}

function formatNotificationTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return String(value);
}

function getPaginationMeta(payload, listLength, page, limit) {
  const total = Number(payload?.total ?? payload?.totalCount ?? listLength) || 0;
  const totalPages =
    Number(payload?.totalPages) ||
    Math.max(1, Math.ceil(total / limit) || 1);
  return { total, totalPages, page };
}

function getAuthHeaders(authToken) {
  return {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };
}

const NOTIFICATION_LIMIT = 10;

const NOTIFICATION_IMPORTANCE_OPTIONS = [
  { value: "", label: "All importance" },
  { value: "high", label: "High" },
  { value: "low", label: "Low" },
  { value: "none", label: "None" },
];

function getImportanceStyle(importance) {
  const key = String(importance || "none").toLowerCase();
  if (key === "high") return { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
  if (key === "low") return { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
  return { color: "#64748B", bg: "#F1F5F9", border: "#E2E8F0" };
}

const calendarSx = {
  width: "100%",
  "& .MuiPickersCalendarHeader-label": {
    fontWeight: 700,
    color: "#0F2F56",
    fontSize: "0.9375rem",
  },
  "& .MuiPickersArrowSwitcher-button": {
    color: "#024DAF",
  },
  "& .MuiPickersCalendarHeader-switchViewButton": {
    color: "#024DAF",
  },
  "& .MuiPickersDay-root": {
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  "& .MuiPickersDay-root:not(.Mui-selected)": {
    color: "#334155",
  },
  "& .MuiPickersDay-root.Mui-selected": {
    bgcolor: "#024DAF !important",
    color: "#fff",
    fontWeight: 700,
    "&:hover, &:focus": {
      bgcolor: "#013A94 !important",
    },
  },
  "& .MuiDayCalendar-weekDayLabel": {
    color: "#94A3B8",
    fontWeight: 600,
    fontSize: "0.75rem",
  },
};

function RangePickersDay({ rangeStart, rangeEnd, day, outsideCurrentMonth, ...other }) {
  const isStart = rangeStart?.isValid() && day.isSame(rangeStart, "day");
  const isEnd = rangeEnd?.isValid() && day.isSame(rangeEnd, "day");
  const isBetween =
    rangeStart?.isValid() &&
    rangeEnd?.isValid() &&
    day.isAfter(rangeStart, "day") &&
    day.isBefore(rangeEnd, "day");
  const isSelected = isStart || isEnd;

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={isSelected}
      sx={{
        ...(isBetween && {
          bgcolor: "rgba(2, 77, 175, 0.14) !important",
          borderRadius: 0,
          color: "#024DAF",
        }),
        ...(isStart && {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }),
        ...(isEnd && {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }),
      }}
    />
  );
}

function FreeRangeCalendar({ value, onChange, sx }) {
  const [start, end] = value;

  const handleDaySelect = (day) => {
    if (!start || (start && end)) {
      onChange([day, null]);
      return;
    }
    if (day.isBefore(start, "day")) {
      onChange([day, start]);
      return;
    }
    onChange([start, day]);
  };

  return (
    <DateCalendar
      value={end || start}
      onChange={handleDaySelect}
      slots={{ day: RangePickersDay }}
      slotProps={{
        day: { rangeStart: start, rangeEnd: end },
      }}
      sx={sx}
    />
  );
}

export default function AdminTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [importanceFilter, setImportanceFilter] = useState("");
  const [readFilter, setReadFilter] = useState("all");
  const [notificationPage, setNotificationPage] = useState(1);
  const [notificationTotalPages, setNotificationTotalPages] = useState(1);
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [dateAnchor, setDateAnchor] = useState(null);
  const [draftRange, setDraftRange] = useState([null, null]);

  const { dateRange, setDateRange } = useDashboardFilter();
  const datePickerOpen = Boolean(dateAnchor);
  const displayName = user?.name || user?.adminId || "Super Admin";
  const displayEmail = user?.email || "admin@iontrip.com";
  const notificationOpen = Boolean(notificationAnchor);

  const getAuthToken = useCallback(
    () => token || localStorage.getItem("adminToken") || "",
    [token]
  );

  const fetchNotificationList = useCallback(
    async ({ unreadOnly = false, importance = "", page = 1 } = {}) => {
      const authToken = getAuthToken();
      if (!authToken) return null;

      const params = new URLSearchParams({
        page: String(page),
        limit: String(NOTIFICATION_LIMIT),
      });
      if (unreadOnly) params.set("unreadOnly", "true");
      if (importance) params.set("importance", importance);

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATION_ADMIN}?${params.toString()}`,
        { headers: getAuthHeaders(authToken) }
      );

      return response?.data;
    },
    [getAuthToken]
  );

  const markAllNotificationsRead = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    await axios.patch(
      `${API_BASE_URL}${API_ENDPOINTS.NOTIFICATION_READ_ALL}`,
      {},
      { headers: getAuthHeaders(authToken) }
    );
  }, [getAuthToken]);

  const refreshUnreadCount = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) {
      setUnreadCount(0);
      return;
    }

    try {
      const payload = await fetchNotificationList({ unreadOnly: true });
      const list = normalizeNotifications(payload);
      setUnreadCount(getUnreadCount(payload, list));
    } catch (err) {
      console.error("Fetch unread notification count failed:", err?.response?.data || err);
      setUnreadCount(0);
    }
  }, [getAuthToken, fetchNotificationList]);

  const loadNotifications = useCallback(
    async ({ markUnreadAsRead = false, importance = "", page = 1, unreadOnly = false } = {}) => {
      const authToken = getAuthToken();
      if (!authToken) {
        setNotifications([]);
        setUnreadCount(0);
        setNotificationTotal(0);
        setNotificationTotalPages(1);
        return;
      }

      setNotificationsLoading(true);

      try {
        const payload = await fetchNotificationList({ importance, page, unreadOnly });
        const list = normalizeNotifications(payload);
        const unread = getUnreadCount(payload, list);
        const pagination = getPaginationMeta(payload, list.length, page, NOTIFICATION_LIMIT);

        setNotifications(list);
        setNotificationPage(page);
        setNotificationTotal(pagination.total);
        setNotificationTotalPages(pagination.totalPages);

        if (markUnreadAsRead) {
          setUnreadCount(unread);
        }

        if (markUnreadAsRead && unread > 0) {
          setMarkingRead(true);
          await markAllNotificationsRead();
          setNotifications(list.map((item) => ({ ...item, isRead: true })));
          setUnreadCount(0);
        }
      } catch (err) {
        console.error("Fetch notifications failed:", err?.response?.data || err);
        setNotifications([]);
        if (markUnreadAsRead) setUnreadCount(0);
      } finally {
        setNotificationsLoading(false);
        setMarkingRead(false);
      }
    },
    [getAuthToken, fetchNotificationList, markAllNotificationsRead]
  );

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const handleOpenNotifications = (event) => {
    setNotificationAnchor(event.currentTarget);
    setNotificationPage(1);
    loadNotifications({
      markUnreadAsRead: true,
      importance: importanceFilter,
      page: 1,
      unreadOnly: readFilter === "unread",
    });
  };

  const handleImportanceFilterChange = (event) => {
    const value = event.target.value;
    setImportanceFilter(value);
    setNotificationPage(1);
    loadNotifications({
      markUnreadAsRead: false,
      importance: value,
      page: 1,
      unreadOnly: readFilter === "unread",
    });
  };

  const handleReadFilterChange = (value) => {
    setReadFilter(value);
    setNotificationPage(1);
    loadNotifications({
      markUnreadAsRead: false,
      importance: importanceFilter,
      page: 1,
      unreadOnly: value === "unread",
    });
  };

  const handleRefreshNotifications = () => {
    loadNotifications({
      markUnreadAsRead: false,
      importance: importanceFilter,
      page: notificationPage,
      unreadOnly: readFilter === "unread",
    });
    refreshUnreadCount();
  };

  const handleNotificationPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > notificationTotalPages) return;
    setNotificationPage(nextPage);
    loadNotifications({
      markUnreadAsRead: false,
      importance: importanceFilter,
      page: nextPage,
      unreadOnly: readFilter === "unread",
    });
  };

  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationClick = (item) => {
    const destination = resolveNotificationDestination(item, {
      userEmail: user?.email || "",
    });

    if (!destination?.path) return;

    handleCloseNotifications();
    navigate(destination.path, destination.state ? { state: destination.state } : undefined);
  };

  const handleMarkAllRead = async () => {
    setMarkingRead(true);

    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all notifications read failed:", err?.response?.data || err);
    } finally {
      setMarkingRead(false);
    }
  };

  const handleOpenDatePicker = (event) => {
    setDraftRange([dayjs(dateRange.startDate), dayjs(dateRange.endDate)]);
    setDateAnchor(event.currentTarget);
  };

  const handleCloseDatePicker = () => {
    setDateAnchor(null);
  };

  const handleApplyDateRange = () => {
    const [rawStart, rawEnd] = draftRange;
    if (!rawStart || !rawEnd) return;
    const start = rawStart.isAfter(rawEnd) ? rawEnd : rawStart;
    const end = rawStart.isAfter(rawEnd) ? rawStart : rawEnd;
    setDateRange({
      startDate: toISODate(start.toDate()),
      endDate: toISODate(end.toDate()),
    });
    handleCloseDatePicker();
  };

  const handleQuickRange = (days) => {
    const end = dayjs();
    const start = end.subtract(days - 1, "day");
    setDraftRange([start, end]);
  };

  const handleResetDateRange = () => {
    const defaults = getDefaultDateRange();
    setDraftRange([dayjs(defaults.startDate), dayjs(defaults.endDate)]);
    setDateRange(defaults);
    handleCloseDatePicker();
  };

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: isDashboard ? 2 : 1.25,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: "var(--primary-dark, #024DAF)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        flexWrap: { xs: "wrap", lg: "nowrap" },
      }}
    >
      {isDashboard ? (
        <Box sx={{ minWidth: { xs: "100%", lg: 200 } }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
            Super Admin Dashboard
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255, 255, 255, 0.85)", fontWeight: 500, mt: 0.25 }}>
            Welcome back, {displayName}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1 }} />
      )}

      <TextField
        size="small"
        placeholder="Search anything..."
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: { xs: "1 1 100%", lg: "1 1 auto" },
          maxWidth: { lg: 420 },
          mx: { lg: "auto" },
          order: { xs: 3, lg: 0 },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            bgcolor: "#F8FAFC",
            height: 40,
            fontSize: 14,
            "& fieldset": { borderColor: "#E2E8F0" },
            "&:hover fieldset": { borderColor: "#CBD5E1" },
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5 },
          ml: { lg: "auto" },
          flexShrink: 0,
        }}
      >
        {isDashboard ? (
          <>
            <Button
              size="small"
              onClick={handleOpenDatePicker}
              endIcon={<KeyboardArrowDownIcon sx={{ color: "#FFFFFF" }} />}
              startIcon={<CalendarMonthIcon sx={{ fontSize: 18, color: "#FFFFFF" }} />}
              sx={{
                textTransform: "none",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 12,
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "10px",
                px: 1.5,
                py: 0.75,
                bgcolor: "rgba(255, 255, 255, 0.12)",
                display: { xs: "none", sm: "inline-flex" },
                whiteSpace: "nowrap",
              }}
            >
              {formatRangeLabel(dateRange.startDate, dateRange.endDate)}
            </Button>

            <Popover
              open={datePickerOpen}
              anchorEl={dateAnchor}
              onClose={handleCloseDatePicker}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    p: 1.5,
                    width: 340,
                    borderRadius: 2,
                    boxShadow: "0 12px 40px rgba(15, 47, 86, 0.18)",
                    overflow: "hidden",
                  },
                },
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F2F56", mb: 1, px: 0.5 }}>
                Select Date Range
              </Typography>

              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1, px: 0.5 }}>
                {[
                  { label: "Last 7 days", days: 7 },
                  { label: "Last 30 days", days: 30 },
                ].map((preset) => (
                  <Button
                    key={preset.days}
                    size="small"
                    variant="outlined"
                    onClick={() => handleQuickRange(preset.days)}
                    sx={{
                      textTransform: "none",
                      fontSize: 11,
                      fontWeight: 600,
                      borderColor: "#BFDBFE",
                      color: "#024DAF",
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <FreeRangeCalendar
                  value={draftRange}
                  onChange={setDraftRange}
                  sx={calendarSx}
                />
              </LocalizationProvider>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1, px: 0.5 }}>
                <Button
                  size="small"
                  onClick={handleResetDateRange}
                  sx={{ textTransform: "none", color: "#64748B" }}
                >
                  Reset
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={handleApplyDateRange}
                  disabled={!draftRange[0] || !draftRange[1]}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#024DAF",
                    "&:hover": { bgcolor: "#0B2442" },
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Popover>
          </>
        ) : null}

        <IconButton
          size="small"
          onClick={handleOpenNotifications}
          aria-label="Notifications"
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.35)",
            borderRadius: "10px",
            width: 40,
            height: 40,
          }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsNoneIcon sx={{ color: "#FFFFFF" }} />
          </Badge>
        </IconButton>

        <Popover
          open={notificationOpen}
          anchorEl={notificationAnchor}
          onClose={handleCloseNotifications}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                width: 380,
                maxWidth: "calc(100vw - 24px)",
                borderRadius: "14px",
                boxShadow: "0 16px 40px rgba(15, 47, 86, 0.18)",
                overflow: "hidden",
                border: "1px solid #E0E0E0",
              },
            },
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              bgcolor: "#024DAF",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <NotificationsNoneIcon sx={{ color: "#FFFFFF", fontSize: 20 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }}>
                  Notifications
                </Typography>
                <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.85)", mt: 0.15 }}>
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "All caught up"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={handleRefreshNotifications}
                disabled={notificationsLoading}
                title="Refresh"
                sx={{
                  width: 34,
                  height: 34,
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <Button
                size="small"
                onClick={handleMarkAllRead}
                disabled={markingRead || unreadCount === 0}
                startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#024DAF",
                  bgcolor: "#E8EDF5",
                  borderRadius: 999,
                  px: 1.5,
                  py: 0.5,
                  minHeight: 34,
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#DCE4F0" },
                  "&.Mui-disabled": {
                    bgcolor: "rgba(232, 237, 245, 0.55)",
                    color: "rgba(2, 77, 175, 0.45)",
                  },
                }}
              >
                Read all
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              px: 1.75,
              py: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              bgcolor: "#FFFFFF",
              borderBottom: "1px solid #E8EEF5",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              {[
                { value: "all", label: "All" },
                { value: "unread", label: "Unread" },
              ].map((tab) => {
                const isActive = readFilter === tab.value;
                return (
                  <Button
                    key={tab.value}
                    size="small"
                    onClick={() => handleReadFilterChange(tab.value)}
                    disabled={notificationsLoading}
                    sx={{
                      textTransform: "none",
                      fontSize: 12,
                      fontWeight: 600,
                      minWidth: 0,
                      px: 1.75,
                      py: 0.45,
                      borderRadius: 999,
                      lineHeight: 1.4,
                      color: isActive ? "#FFFFFF" : "#64748B",
                      bgcolor: isActive ? "#024DAF" : "#FFFFFF",
                      border: isActive ? "1px solid #024DAF" : "1px solid #E2E8F0",
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: isActive ? "#013A94" : "#F8FAFC",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Box>

            <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
              <Select
                value={importanceFilter}
                onChange={handleImportanceFilterChange}
                displayEmpty
                disabled={notificationsLoading}
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 999,
                  bgcolor: "#FFFFFF",
                  height: 34,
                  color: "#334155",
                  "& .MuiSelect-select": { py: 0.65, px: 1.5, pr: "32px !important" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
                  "& .MuiSelect-icon": { color: "#64748B", fontSize: 20, right: 8 },
                }}
              >
                {NOTIFICATION_IMPORTANCE_OPTIONS.map((option) => (
                  <MenuItem key={option.value || "all"} value={option.value} sx={{ fontSize: 12 }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              minHeight: 280,
              maxHeight: 380,
              overflowY: "auto",
              bgcolor: "#FFFFFF",
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(2, 77, 175, 0.25)",
                borderRadius: 999,
              },
            }}
          >
            {notificationsLoading ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, gap: 1 }}>
                <CircularProgress size={24} sx={{ color: "#024DAF" }} />
                <Typography sx={{ fontSize: 12, color: "#64748B" }}>Loading notifications...</Typography>
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ py: 8, px: 3, textAlign: "center" }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "14px",
                    bgcolor: "#F1F5F9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <InboxOutlinedIcon sx={{ fontSize: 32, color: "#94A3B8" }} />
                </Box>
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>
                  No notifications
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#94A3B8", mt: 0.75 }}>
                  New updates will appear here
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 1.25 }}>
                {notifications.map((item) => {
                  const importanceStyle = getImportanceStyle(item.importance);
                  const navigable = isNotificationNavigable(item);
                  return (
                    <Box
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      role={navigable ? "button" : undefined}
                      tabIndex={navigable ? 0 : undefined}
                      onKeyDown={(event) => {
                        if (!navigable) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleNotificationClick(item);
                        }
                      }}
                      sx={{
                        mb: 1,
                        p: 1.5,
                        borderRadius: "12px",
                        bgcolor: "#FFFFFF",
                        border: "1px solid",
                        borderColor: item.isRead ? "#E8EEF5" : "#BFDBFE",
                        boxShadow: item.isRead
                          ? "none"
                          : "0 2px 8px rgba(2, 77, 175, 0.08)",
                        transition: "background-color 0.15s ease",
                        cursor: navigable ? "pointer" : "default",
                        "&:hover": navigable ? { bgcolor: "#F8FAFC" } : undefined,
                        "&:last-child": { mb: 0 },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: item.isRead ? "#F1F5F9" : "#EAF2FF",
                            color: item.isRead ? "#64748B" : "#024DAF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.isRead ? (
                            <NotificationsNoneIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <FiberManualRecordIcon sx={{ fontSize: 14 }} />
                          )}
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 1,
                              mb: 0.35,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#0F172A",
                                lineHeight: 1.35,
                              }}
                            >
                              {item.title}
                            </Typography>
                            {item.importance && item.importance !== "none" ? (
                              <Box
                                sx={{
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  textTransform: "capitalize",
                                  px: 0.85,
                                  py: 0.25,
                                  borderRadius: 999,
                                  border: "1px solid",
                                  flexShrink: 0,
                                  color: importanceStyle.color,
                                  bgcolor: importanceStyle.bg,
                                  borderColor: importanceStyle.border,
                                }}
                              >
                                {item.importance}
                              </Box>
                            ) : null}
                          </Box>

                          {item.message ? (
                            <Typography
                              sx={{
                                fontSize: 12,
                                color: "#64748B",
                                lineHeight: 1.5,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.message}
                            </Typography>
                          ) : null}

                          {item.createdAt ? (
                            <Typography sx={{ fontSize: 10.5, color: "#94A3B8", mt: 0.75, fontWeight: 500 }}>
                              {formatNotificationTime(item.createdAt)}
                            </Typography>
                          ) : null}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {notificationTotalPages > 1 || notificationTotal > 0 ? (
            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                borderTop: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>
                {notificationTotal > 0
                  ? `Page ${notificationPage} of ${notificationTotalPages}`
                  : "No results"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  disabled={notificationsLoading || notificationPage <= 1}
                  onClick={() => handleNotificationPageChange(notificationPage - 1)}
                  sx={{
                    width: 30,
                    height: 30,
                    border: "1px solid #E2E8F0",
                    borderRadius: 1,
                    bgcolor: notificationPage <= 1 ? "#F8FAFC" : "#FFFFFF",
                    color: notificationPage <= 1 ? "#CBD5E1" : "#024DAF",
                  }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <Box
                  sx={{
                    minWidth: 32,
                    height: 30,
                    px: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                    bgcolor: "#024DAF",
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {notificationPage}
                </Box>

                <IconButton
                  size="small"
                  disabled={notificationsLoading || notificationPage >= notificationTotalPages}
                  onClick={() => handleNotificationPageChange(notificationPage + 1)}
                  sx={{
                    width: 30,
                    height: 30,
                    border: "1px solid #E2E8F0",
                    borderRadius: 1,
                    bgcolor: notificationPage >= notificationTotalPages ? "#F8FAFC" : "#FFFFFF",
                    color: notificationPage >= notificationTotalPages ? "#CBD5E1" : "#024DAF",
                  }}
                >
                  <ChevronRightIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
          ) : null}
        </Popover>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            pl: { sm: 1 },
            borderLeft: { sm: "1px solid rgba(255, 255, 255, 0.25)" },
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#2563EB",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {displayName[0]?.toUpperCase() || "S"}
          </Avatar>
          <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }} noWrap>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(255, 255, 255, 0.85)" }} noWrap>
              {displayEmail}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
