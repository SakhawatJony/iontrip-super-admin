import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  Modal,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useLocation, useNavigate } from "react-router-dom";
import { BQ, bqCardSx, bqSidebarBtnSx } from "./bookingQueTheme.js";
import PaymentIcon from "@mui/icons-material/Payment";
import CancelIcon from "@mui/icons-material/Cancel";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { MultiSectionDigitalClock } from "@mui/x-date-pickers/MultiSectionDigitalClock";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.js";
import { toast } from "react-toastify";
import RefundQuotationDialog from "./RefundQuotationDialog.jsx";
import RefundRejectDialog from "./RefundRejectDialog.jsx";
import RefundApproveDialog from "./RefundApproveDialog.jsx";
import ReissueQuotationDialog from "./ReissueQuotationDialog.jsx";
import ReissueRejectDialog from "./ReissueRejectDialog.jsx";
import axios from "axios";
import Swal from "sweetalert2";
import BookingQueInfoSection from "./BookingQueInfoSection";
import BookingQueDetailsCard from "./BookingQueDetailsCard";
import BookingQuePassengerList from "./BookingQuePassengerList";
import BookingQueFareDetails from "./BookingQueFareDetails";
import BookingQueSupport from "./BookingQueSupport";
import BookingQueSessionTime from "./BookingQueSessionTime";
import { unwrapBookingResponse } from "../flightItineraryUtils.js";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import {
  resolveBookingAgentEmail,
  formatBqNumber,
  isRefundRequestStatus,
  isRefundQuotedStatus,
  isRefundProcessingStatus,
  isRefundedStatus,
  isReissueRequestStatus,
  resolveRefundRequestId,
  resolveReissueRequestId,
  resolveReissueFlightBookingId,
} from "./bookingQueUtils.js";

const LAST_TICKET_TIME_PRESETS = [
  { label: "+1 hour", amount: 1, unit: "hour" },
  { label: "+2 hours", amount: 2, unit: "hour" },
  { label: "+6 hours", amount: 6, unit: "hour" },
  { label: "+1 day", amount: 1, unit: "day" },
];

const lastTicketCalendarSx = {
  width: 260,
  maxWidth: 260,
  height: 248,
  maxHeight: 248,
  m: 0,
  "& .MuiPickersCalendarHeader-label": {
    fontSize: 13,
    fontWeight: 700,
  },
  "& .MuiDayCalendar-weekDayLabel": {
    width: 32,
    fontSize: 11,
    fontWeight: 700,
    color: BQ.muted,
  },
  "& .MuiPickersDay-root": {
    width: 32,
    height: 32,
    fontSize: 12,
    borderRadius: "8px",
  },
  "& .MuiPickersDay-root.Mui-selected": {
    bgcolor: BQ.navy,
    "&:hover": { bgcolor: BQ.navyDark },
  },
};

const lastTicketClockSx = {
  width: 200,
  maxHeight: 248,
  borderLeft: { xs: "none", sm: `1px solid ${BQ.border}` },
  borderTop: { xs: `1px solid ${BQ.border}`, sm: "none" },
  "& .MuiMultiSectionDigitalClockSection-root": {
    maxHeight: 220,
  },
  "& .MuiMultiSectionDigitalClockSection-item": {
    fontSize: 12,
    minHeight: 30,
  },
  "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
    bgcolor: BQ.navy,
    "&:hover": { bgcolor: BQ.navyDark },
  },
};

const BookingQueDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const superadminToken = token || localStorage.getItem("adminToken") || "";
  const baseUrl = API_BASE_URL;

  const bookingId = location.state?.bookingId || "";
  const agentEmail = user?.email || "";

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [timelineData, setTimelineData] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [voucherMenuAnchor, setVoucherMenuAnchor] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedVoucherType, setSelectedVoucherType] = useState(null);
  const [cancelBookingLoading, setCancelBookingLoading] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [reissueQuotationDialogOpen, setReissueQuotationDialogOpen] = useState(false);
  const [reissueRejectDialogOpen, setReissueRejectDialogOpen] = useState(false);
  const [bookingRefreshKey, setBookingRefreshKey] = useState(0);
  const [refundTransferLoading, setRefundTransferLoading] = useState(false);
  const [airlineTicketCountdown, setAirlineTicketCountdown] = useState(null);
  const [airlineTimeRefreshing, setAirlineTimeRefreshing] = useState(false);
  const [lastTicketTimeDialogOpen, setLastTicketTimeDialogOpen] = useState(false);
  const [lastTicketTimeValue, setLastTicketTimeValue] = useState(null);
  const [lastTicketTimeSaving, setLastTicketTimeSaving] = useState(false);
  const [lastTicketTimeError, setLastTicketTimeError] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("Booking ID missing.");
        return;
      }

      if (!agentEmail) {
        setError("Admin email missing. Please login again.");
        return;
      }

      if (!superadminToken) {
        setError("Superadmin token missing. Please login again.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${baseUrl}/booking/admin/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${superadminToken}`,
            "Content-Type": "application/json",
          },
        });

        setBookingData(unwrapBookingResponse(response));
      } catch (err) {
        const apiMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load booking details.";
        setError(apiMessage);
        console.error("Fetch booking details failed:", err?.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, agentEmail, superadminToken, baseUrl, bookingRefreshKey]);

  // Fetch timeline when modal opens (dynamic from API)
  useEffect(() => {
    if (!timelineModalOpen || !bookingId || !agentEmail) return;
    if (!superadminToken) return;

    const fetchTimeline = async () => {
      setTimelineLoading(true);
      setTimelineData(null);
      try {
        const res = await axios.get(
          `${baseUrl}/booking/admin/${bookingId}/timeline`,
          {
            headers: {
              Authorization: `Bearer ${superadminToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const raw = res?.data?.data ?? res?.data?.timeline ?? res?.data;
        setTimelineData(Array.isArray(raw) ? raw : raw?.timeline ?? raw?.bookingHistory ?? raw?.history ?? null);
      } catch {
        setTimelineData(null);
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimeline();
  }, [timelineModalOpen, bookingId, agentEmail, superadminToken, baseUrl]);

  useEffect(() => {
    const deadline = bookingData?.lastTicketTime;
    if (!deadline) {
      setAirlineTicketCountdown(null);
      return undefined;
    }
    const tick = () => setAirlineTicketCountdown(formatLiveCountdown(deadline));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [bookingData?.lastTicketTime]);

  const refetchBookingDetails = async (resolvedBookingId) => {
    const refetchRes = await axios.get(`${baseUrl}/booking/admin/${resolvedBookingId}`, {
      headers: { Authorization: `Bearer ${superadminToken}`, "Content-Type": "application/json" },
    });
    setBookingData(unwrapBookingResponse(refetchRes));
  };

  const handleCancelBooking = async () => {
    const cancelEmail = resolveBookingAgentEmail(bookingData, agentEmail);
    const resolvedBookingId = String(bookingData?.bookingId || bookingId || "").trim();
    if (!superadminToken || !cancelEmail || !resolvedBookingId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Missing superadmin token, email, or booking ID. Please login again.",
        confirmButtonColor: "var(--primary-color)",
      });
      return;
    }
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancel Booking",
      text: "Are you sure you want to cancel this booking?",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No",
      confirmButtonColor: "var(--primary-color)",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setCancelBookingLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/flight/CancelBooking?bookingId=${encodeURIComponent(resolvedBookingId)}&email=${encodeURIComponent(cancelEmail)}`,
        {
          headers: {
            Authorization: `Bearer ${superadminToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const successMessage =
        response?.data?.message ??
        response?.data?.data?.message ??
        "Booking cancelled successfully.";
      Swal.fire({
        icon: "success",
        title: "Success",
        text: successMessage,
        confirmButtonColor: "var(--primary-color)",
      });
      await refetchBookingDetails(resolvedBookingId);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to cancel booking. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "var(--primary-color)",
      });
      console.error("Cancel booking failed:", err?.response?.data || err);
    } finally {
      setCancelBookingLoading(false);
    }
  };

  const handleIssueTicketCancel = async () => {
    const resolvedBookingId = String(bookingData?.bookingId || bookingId || "").trim();
    if (!superadminToken || !resolvedBookingId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Missing superadmin token or booking ID. Please login again.",
        confirmButtonColor: "var(--primary-color)",
      });
      return;
    }
    const result = await Swal.fire({
      icon: "warning",
      title: "Cancel Booking",
      text: "Are you sure you want to cancel this booking?",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "No",
      confirmButtonColor: "var(--primary-color)",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    const issueTicketConfirmation = await Swal.fire({
      icon: "warning",
      title: "Final confirmation",
      html: `
        <div style="text-align:center; margin-top:4px;">
          <div style="font-size:14px; color:#374151; margin-bottom:10px; text-align:center;">
            Did issue ticket from another provider?
          </div>
          <label style="display:inline-flex; align-items:center; gap:8px; font-size:13px; color:#111827;">
            <input id="issueTicketProviderConfirm" type="checkbox" />
            I confirm
          </label>
        </div>
      `,
      confirmButtonText: "Okay",
      cancelButtonText: "Cancel",
      showCancelButton: true,
      confirmButtonColor: "var(--primary-color)",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const checkbox = document.getElementById("issueTicketProviderConfirm");
        if (confirmBtn) confirmBtn.disabled = true;
        if (checkbox && confirmBtn) {
          checkbox.addEventListener("change", () => {
            confirmBtn.disabled = !checkbox.checked;
          });
        }
      },
      preConfirm: () => {
        const checked = document.getElementById("issueTicketProviderConfirm")?.checked;
        if (!checked) {
          Swal.showValidationMessage("Please check the checkbox before continuing.");
          return false;
        }
        return true;
      },
    });

    if (!issueTicketConfirmation.isConfirmed) return;

    setCancelBookingLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/booking/admin/${encodeURIComponent(resolvedBookingId)}/cancel-issue-in-process`,
        {},
        {
          headers: {
            Authorization: `Bearer ${superadminToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const successMessage =
        response?.data?.message ??
        response?.data?.data?.message ??
        "Issue ticket cancelled successfully.";
      Swal.fire({
        icon: "success",
        title: "Success",
        text: successMessage,
        confirmButtonColor: "var(--primary-color)",
      });
      await refetchBookingDetails(resolvedBookingId);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to cancel issue ticket. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "var(--primary-color)",
      });
      console.error("Issue ticket cancel failed:", err?.response?.data || err);
    } finally {
      setCancelBookingLoading(false);
    }
  };

  const normalizeTimelineEvent = (e) => {
    const dateTime =
      e.dateTime ?? e.date ?? e.createdAt ?? e.created_at ?? e.timestamp ?? e.updatedAt ?? e.updated_at ?? e.time;
    const statusRaw =
      e.status ?? e.event ?? e.eventType ?? e.action ?? e.state ?? e.bookingStatus ?? "";
    const status = String(statusRaw).toUpperCase().replace(/\s+/g, " ").trim() || "N/A";
    const agent =
      e.agent ??
      e.agentName ??
      e.agent_name ??
      e.performedBy ??
      e.user ??
      e.userName ??
      "N/A";
    const remarks = e.remarks ?? e.remark ?? e.note ?? e.notes ?? e.description ?? "N/A";
    return { dateTime, status, agent, remarks };
  };

  const timelineEvents = useMemo(() => {
    const fromFetched = Array.isArray(timelineData) && timelineData.length > 0;
    const fromBooking =
      bookingData?.timeline ?? bookingData?.bookingHistory ?? bookingData?.history ?? bookingData?.bookingTimeline ?? bookingData?.events ?? bookingData?.statusHistory;
    const rawList = fromFetched ? timelineData : Array.isArray(fromBooking) ? fromBooking : null;

    if (rawList && rawList.length > 0) {
      const events = rawList.map(normalizeTimelineEvent);
      const hasHold = events.some(
        (e) =>
          /HOLD|BOOKED/i.test(e.status) && !/CANCEL|EXPIRED/i.test(e.status)
      );
      const isCancelled = events.some(
        (e) => /CANCELLED|CANCELED|EXPIRED/i.test(e.status)
      );
      const created =
        bookingData?.createdAt ??
        bookingData?.created_at ??
        bookingData?.lastTicketTime;
      const agentName =
        bookingData?.agentName ??
        bookingData?.agent_name ??
        user?.name ??
        user?.email ??
        "N/A";
      const remarks = bookingData?.remarks ?? "N/A";
      if (isCancelled && !hasHold && created) {
        const holdEvent = {
          dateTime: created,
          status: "BOOKING HOLD",
          agent: agentName,
          remarks,
        };
        const sorted = [holdEvent, ...events].sort(
          (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
        );
        return sorted;
      }
      return events.sort(
        (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
      );
    }
    const status = (bookingData?.status || "HOLD").toUpperCase().replace("BOOKED", "HOLD");
    const created =
      bookingData?.createdAt ?? bookingData?.created_at ?? bookingData?.lastTicketTime ?? new Date().toISOString();
    const updated =
      bookingData?.updatedAt ??
      bookingData?.updated_at ??
      bookingData?.cancelledAt ??
      bookingData?.cancelled_at ??
      bookingData?.canceledAt ??
      bookingData?.modifiedAt ??
      bookingData?.modified_at ??
      new Date().toISOString();
    const agentName =
      bookingData?.agentName ?? bookingData?.agent_name ?? user?.name ?? user?.email ?? "N/A";
    const remarks = bookingData?.remarks ?? "N/A";
    const isCancelled =
      status === "CANCELLED" || status === "CANCELED" || status === "EXPIRED";

    if (isCancelled) {
      return [
        {
          dateTime: created,
          status: "BOOKING HOLD",
          agent: agentName,
          remarks,
        },
        {
          dateTime: updated,
          status: status === "EXPIRED" ? "BOOKING EXPIRED" : "BOOKING CANCELLED",
          agent: agentName,
          remarks,
        },
      ];
    }
    return [
      {
        dateTime: created,
        status: status === "HOLD" ? "BOOKING HOLD" : status,
        agent: agentName,
        remarks,
      },
    ];
  }, [bookingData, user, timelineData]);

  const formatTimelineDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} ${h}:${m}`;
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: BQ.pageBg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: BQ.actionBlue }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: BQ.pageBg,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          px: 2,
        }}
      >
        <Typography sx={{ fontSize: 14, color: BQ.expired }}>{error}</Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/flightbookings/bookinghistory")}
          sx={{ textTransform: "none", borderColor: BQ.navy, color: BQ.navy }}
        >
          Back to bookings
        </Button>
      </Box>
    );
  }

  if (!bookingData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: BQ.pageBg,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 14, color: BQ.muted }}>No booking data found</Typography>
      </Box>
    );
  }

  const rawStatusNorm = (bookingData?.status || "").toUpperCase().replace(/\s+/g, "");
  const isHold = rawStatusNorm === "HOLD" || rawStatusNorm === "BOOKED";
  const isIssueInProcess = rawStatusNorm === "ISSUEINPROCESS";
  const apiStatusNorm = String(bookingData?.apiBookingStatus || "").toUpperCase().replace(/\s+/g, "");
  const canExtendLastTicketTime = isHold || apiStatusNorm === "BOOKED";
  const isRefundRequest = isRefundRequestStatus(bookingData?.status);
  const isRefundQuoted = isRefundQuotedStatus(bookingData?.status);
  const isRefundProcessing = isRefundProcessingStatus(bookingData?.status);
  const isRefunded = isRefundedStatus(bookingData?.status);
  const isReissueRequest = isReissueRequestStatus(bookingData?.status);
  const reissueRequestId = resolveReissueRequestId(bookingData);
  const reissueFlightBookingId =
    resolveReissueFlightBookingId(bookingData, bookingId) || bookingData?.bookingId || bookingId;

  const refundActionBtnBaseSx = {
    textTransform: "none",
    fontWeight: 700,
    fontSize: 13,
    py: 0.75,
    minHeight: 36,
    borderRadius: "4px",
    boxShadow: "none",
    flex: 1,
    color: "#fff",
    "&.Mui-disabled": { bgcolor: "#B0BEC5", color: "#fff" },
  };

  const handleMakeRefundQuotation = () => {
    setQuotationDialogOpen(true);
  };

  const handleCancelRefundQuotation = () => {
    setRejectDialogOpen(true);
  };

  const handleApproveRefund = () => {
    setApproveDialogOpen(true);
  };

  const handleMakeReissueQuotation = () => {
    setReissueQuotationDialogOpen(true);
  };

  const handleCancelReissueQuotation = () => {
    setReissueRejectDialogOpen(true);
  };

  const handleRefundTransferNow = async () => {
    const id = String(bookingData?.bookingId || bookingId || "").trim();
    if (!id) {
      toast.error("Booking ID is missing.");
      return;
    }
    if (!superadminToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Refund Transfer Now",
      text: "Confirm wallet transfer for this refund?",
      showCancelButton: true,
      confirmButtonText: "Yes, Transfer",
      cancelButtonText: "Cancel",
      confirmButtonColor: BQ.navy,
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setRefundTransferLoading(true);
    try {
      const response = await axios.patch(
        `${baseUrl}${API_ENDPOINTS.REFUND_TRANSFER(id)}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${superadminToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const message =
        response?.data?.message ??
        response?.data?.data?.message ??
        "Refund transferred to agent wallet successfully.";

      toast.success(message);
      setBookingRefreshKey((k) => k + 1);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors[0] : null) ??
        err?.message ??
        "Failed to transfer refund. Please try again.";

      toast.error(apiMessage);
    } finally {
      setRefundTransferLoading(false);
    }
  };

  const handleOpenLastTicketTimeDialog = () => {
    const currentValue = bookingData?.lastTicketTime;
    const defaultValue = currentValue ? dayjs(currentValue) : dayjs().add(1, "hour");
    setLastTicketTimeValue(defaultValue);
    setLastTicketTimeError("");
    setLastTicketTimeDialogOpen(true);
  };

  const getLastTicketTimeBounds = () => {
    const minDateTime = dayjs();
    const maxDateTime = bookingData?.airlineLastTicketDateTime
      ? dayjs(bookingData.airlineLastTicketDateTime)
      : null;
    return { minDateTime, maxDateTime };
  };

  const applyLastTicketTimePreset = (amount, unit) => {
    const { minDateTime, maxDateTime } = getLastTicketTimeBounds();
    const base = bookingData?.lastTicketTime ? dayjs(bookingData.lastTicketTime) : dayjs();
    let next = (base.isAfter(minDateTime) ? base : minDateTime).add(amount, unit);
    if (maxDateTime && next.isAfter(maxDateTime)) {
      next = maxDateTime;
    }
    setLastTicketTimeValue(next);
    setLastTicketTimeError("");
  };

  const handleLastTicketDateChange = (newDate) => {
    if (!newDate) return;
    const current = lastTicketTimeValue || dayjs();
    let merged = newDate
      .hour(current.hour())
      .minute(current.minute())
      .second(0)
      .millisecond(0);

    const { minDateTime, maxDateTime } = getLastTicketTimeBounds();
    if (merged.isBefore(minDateTime)) merged = minDateTime;
    if (maxDateTime && merged.isAfter(maxDateTime)) merged = maxDateTime;

    setLastTicketTimeValue(merged);
    setLastTicketTimeError("");
  };

  const handleLastTicketTimeChange = (newTime) => {
    if (!newTime) return;
    const current = lastTicketTimeValue || dayjs();
    let merged = current
      .hour(newTime.hour())
      .minute(newTime.minute())
      .second(0)
      .millisecond(0);

    const { minDateTime, maxDateTime } = getLastTicketTimeBounds();
    if (merged.isBefore(minDateTime)) merged = minDateTime;
    if (maxDateTime && merged.isAfter(maxDateTime)) merged = maxDateTime;

    setLastTicketTimeValue(merged);
    setLastTicketTimeError("");
  };

  const handleUpdateLastTicketTime = async () => {
    const resolvedBookingId = String(bookingData?.bookingId || bookingId || "").trim();
    if (!superadminToken || !resolvedBookingId) {
      toast.error("Missing superadmin token or booking ID.");
      return;
    }

    if (!lastTicketTimeValue || !lastTicketTimeValue.isValid()) {
      setLastTicketTimeError("Please select a valid date and time.");
      return;
    }

    const isoValue = lastTicketTimeValue.toISOString();
    const selectedTime = lastTicketTimeValue.valueOf();
    const now = Date.now();
    if (selectedTime <= now) {
      setLastTicketTimeError("Last ticket time must be in the future.");
      return;
    }

    const airlineDeadline = bookingData?.airlineLastTicketDateTime
      ? new Date(bookingData.airlineLastTicketDateTime).getTime()
      : null;
    if (airlineDeadline && selectedTime > airlineDeadline) {
      setLastTicketTimeError("Last ticket time cannot exceed the airline deadline.");
      return;
    }

    setLastTicketTimeSaving(true);
    setLastTicketTimeError("");
    try {
      const response = await axios.patch(
        `${baseUrl}/booking/admin/${encodeURIComponent(resolvedBookingId)}/last-ticket-time`,
        { lastTicketTime: isoValue },
        {
          headers: {
            Authorization: `Bearer ${superadminToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const message =
        response?.data?.message ??
        response?.data?.data?.message ??
        "Last ticket time updated successfully.";
      toast.success(message);
      setLastTicketTimeDialogOpen(false);
      setBookingData((prev) => (prev ? { ...prev, lastTicketTime: isoValue } : prev));
      await refetchBookingDetails(resolvedBookingId);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to update last ticket time.";
      setLastTicketTimeError(apiMessage);
      toast.error(apiMessage);
    } finally {
      setLastTicketTimeSaving(false);
    }
  };

  const handleRefreshAirlineTimes = async () => {
    if (!bookingId || !superadminToken) return;
    setAirlineTimeRefreshing(true);
    try {
      const response = await axios.get(`${baseUrl}/booking/admin/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${superadminToken}`,
          "Content-Type": "application/json",
        },
      });
      const latest = unwrapBookingResponse(response);
      setBookingData(latest);

      const hasAnyTime = Boolean(latest?.lastTicketTime || latest?.airlineLastTicketDateTime);
      if (hasAnyTime) {
        toast.success("Ticket times refreshed.");
      } else {
        toast.info("Ticket times are still unavailable.");
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to refresh ticket time.";
      toast.error(apiMessage);
    } finally {
      setAirlineTimeRefreshing(false);
    }
  };

  const formatAirlineLastTicketDateTime = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const isLastTicketTimeMissing = !bookingData?.lastTicketTime;
  const isAirlineLastTicketDateTimeMissing = !bookingData?.airlineLastTicketDateTime;

  const formatLiveCountdown = (value) => {
    if (!value) return null;
    const diff = new Date(value) - new Date();
    if (diff <= 0) return { expired: true, label: "Time expired" };

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return { expired: false, label: `${days}d ${hours}h ${minutes}m ${seconds}s left` };
    if (hours > 0) return { expired: false, label: `${hours}h ${minutes}m ${seconds}s left` };
    return { expired: false, label: `${minutes}m ${seconds}s left` };
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BQ.pageBg, pb: 4 }}>
      <Box
        sx={{
          bgcolor: BQ.navBar,
          px: { xs: 1.5, md: 2 },
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <IconButton
          onClick={() => navigate("/dashboard/flightbookings/bookinghistory")}
          sx={{ color: "#fff", p: 0.75 }}
          aria-label="Back"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
          Booking Queue Details
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1.25, md: 1.75 }, pt: 1.5 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <BookingQueInfoSection data={bookingData} />
              <BookingQueDetailsCard data={bookingData} />
              <BookingQuePassengerList data={bookingData} />
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.25,
                position: { lg: "sticky" },
                top: { lg: 12 },
              }}
            >
              {isRefundRequest ? (
                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleMakeRefundQuotation}
                      sx={{
                        ...refundActionBtnBaseSx,
                        bgcolor: "var(--secondary-color, #024DAF)",
                        "&:hover": {
                          bgcolor: "var(--secondary-color, #024DAF)",
                          opacity: 0.9,
                        },
                      }}
                    >
                      Make Refund Quotation
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleCancelRefundQuotation}
                      sx={{
                        ...refundActionBtnBaseSx,
                        bgcolor: "var(--primary-color, #0F2F56)",
                        "&:hover": {
                          bgcolor: "var(--primary-color, #0F2F56)",
                          opacity: 0.9,
                        },
                      }}
                    >
                      Cancel Refund Quotation
                    </Button>
                  </Box>
                </Box>
              ) : isRefundQuoted ? (
                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleApproveRefund}
                    sx={{
                      ...refundActionBtnBaseSx,
                      bgcolor: "var(--secondary-color, #024DAF)",
                      "&:hover": {
                        bgcolor: "var(--secondary-color, #024DAF)",
                        opacity: 0.9,
                      },
                    }}
                  >
                    Approve Refund
                  </Button>
                </Box>
              ) : isRefundProcessing ? (
                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleRefundTransferNow}
                    disabled={refundTransferLoading}
                    sx={{
                      ...refundActionBtnBaseSx,
                      bgcolor: "var(--secondary-color, #024DAF)",
                      "&:hover": {
                        bgcolor: "var(--secondary-color, #024DAF)",
                        opacity: 0.9,
                      },
                    }}
                  >
                    {refundTransferLoading ? "Transferring..." : "Refund Transfer Now"}
                  </Button>
                </Box>
              ) : isReissueRequest ? (
                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleMakeReissueQuotation}
                      sx={{
                        ...refundActionBtnBaseSx,
                        bgcolor: "var(--secondary-color, #024DAF)",
                        "&:hover": {
                          bgcolor: "var(--secondary-color, #024DAF)",
                          opacity: 0.9,
                        },
                      }}
                    >
                      Make Reissue Quotation
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleCancelReissueQuotation}
                      sx={{
                        ...refundActionBtnBaseSx,
                        bgcolor: "var(--primary-color, #0F2F56)",
                        "&:hover": {
                          bgcolor: "var(--primary-color, #0F2F56)",
                          opacity: 0.9,
                        },
                      }}
                    >
                      Cancel Reissue Quotation
                    </Button>
                  </Box>
                </Box>
              ) : (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShowChartOutlinedIcon />}
                    onClick={() => setTimelineModalOpen(true)}
                    sx={{
                      ...bqSidebarBtnSx,
                      bgcolor: BQ.navy,
                      color: "#fff",
                      "&:hover": { bgcolor: BQ.navyDark },
                    }}
                  >
                    Booking Timeline
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    endIcon={<KeyboardArrowDownIcon />}
                    onClick={(e) => setVoucherMenuAnchor(e.currentTarget)}
                    sx={{
                      ...bqSidebarBtnSx,
                      bgcolor: BQ.actionBlue,
                      color: "#fff",
                      "&:hover": { bgcolor: BQ.actionBlueHover },
                    }}
                  >
                    Download Voucher
                  </Button>
                  <Menu
                    anchorEl={voucherMenuAnchor}
                    open={Boolean(voucherMenuAnchor)}
                    onClose={() => setVoucherMenuAnchor(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                    PaperProps={{ sx: { minWidth: 200, mt: 1.5 } }}
                  >
                    {(() => {
                      const rawStatus = (bookingData?.status || "").toUpperCase();
                      const isBookedOrCancelled = ["BOOKED", "HOLD", "CANCELLED", "CANCELED", "EXPIRED"].includes(rawStatus);
                      const goToInvoice = (invoiceType) => {
                        setVoucherMenuAnchor(null);
                        navigate("/dashboard/bookingqueueinvoice", {
                          state: { bookingData, invoiceType },
                        });
                      };
                      if (isBookedOrCancelled) {
                        return (
                          <MenuItem onClick={() => goToInvoice("Booking Invoice")}>
                            Booking Invoice
                          </MenuItem>
                        );
                      }
                      return (
                        <>
                          <MenuItem onClick={() => goToInvoice("E-Ticket")}>
                            E-Ticket
                          </MenuItem>
                          <MenuItem onClick={() => goToInvoice("Agent Invoice")}>
                            Agent Invoice
                          </MenuItem>
                          <MenuItem onClick={() => goToInvoice("Customer Invoice")}>
                            Customer Invoice
                          </MenuItem>
                        </>
                      );
                    })()}
                  </Menu>
                  {!isHold && !isIssueInProcess && !isRefunded ? (
                    <>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<MoneyOffIcon />}
                        onClick={() =>
                          navigate("/dashboard/bookingqueuedetails/refund", {
                            state: {
                              bookingId: bookingData?.bookingId || bookingId,
                              bookingData,
                              refundRequestId: resolveRefundRequestId(bookingData),
                            },
                          })
                        }
                        sx={{
                          ...bqSidebarBtnSx,
                          bgcolor: BQ.refundBtn,
                          color: "#fff",
                          "&:hover": { bgcolor: BQ.refundBtnHover },
                        }}
                      >
                        Refund
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AutorenewIcon />}
                        onClick={() =>
                          navigate("/dashboard/flightbookings/reissuehistory", {
                            state: { bookingId: bookingData?.bookingId || bookingId },
                          })
                        }
                        sx={{
                          ...bqSidebarBtnSx,
                          bgcolor: BQ.navy,
                          color: "#fff",
                          "&:hover": { bgcolor: BQ.navyDark },
                        }}
                      >
                        Reissue
                      </Button>
                    </>
                  ) : null}
                  {isHold ? (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelBooking}
                      disabled={cancelBookingLoading}
                      sx={{
                        ...bqSidebarBtnSx,
                        bgcolor: BQ.cancelRed,
                        color: "#fff",
                        "&:hover": { bgcolor: BQ.cancelRedHover },
                      }}
                    >
                      {cancelBookingLoading ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  ) : null}
                  {isIssueInProcess ? (
                    <>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={() =>
                          navigate("/dashboard/maketicketed", {
                            state: { bookingData, bookingId },
                          })
                        }
                        sx={{
                          ...bqSidebarBtnSx,
                          bgcolor: BQ.actionBlue,
                          color: "#fff",
                          "&:hover": { bgcolor: BQ.actionBlueHover },
                        }}
                      >
                        Make ticketed
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CancelIcon />}
                        onClick={handleIssueTicketCancel}
                        disabled={cancelBookingLoading}
                        sx={{
                          ...bqSidebarBtnSx,
                          bgcolor: BQ.cancelRed,
                          color: "#fff",
                          "&:hover": { bgcolor: BQ.cancelRedHover },
                        }}
                      >
                        {cancelBookingLoading ? "Cancelling..." : "Issue Ticket Cancel"}
                      </Button>
                    </>
                  ) : null}
                </>
              )}
              <Box sx={{ ...bqCardSx, p: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: BQ.navy }}>
                    Airline Ticket Info
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                  <Box
                    sx={{
                      p: 1.1,
                      borderRadius: "8px",
                      bgcolor: "#F0F7FF",
                      border: "1px solid #B6D5FF",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.3)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Typography sx={{ fontSize: 11, color: "#64748B", fontWeight: 700, letterSpacing: 0.2 }}>
                        Airline Last Ticket Date
                      </Typography>
                      {isAirlineLastTicketDateTimeMissing ? (
                        <IconButton
                          size="small"
                          onClick={handleRefreshAirlineTimes}
                          disabled={airlineTimeRefreshing}
                          sx={{
                            color: BQ.navy,
                            bgcolor: "#EEF5FF",
                            p: 0.5,
                            "&:hover": { bgcolor: "#DFECFF" },
                            "&.Mui-disabled": { color: "#94A3B8" },
                          }}
                          aria-label="Refresh airline last ticket date"
                        >
                          {airlineTimeRefreshing ? (
                            <CircularProgress size={14} sx={{ color: BQ.navy }} />
                          ) : (
                            <RefreshIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      ) : null}
                    </Box>
                    <Typography sx={{ fontSize: 14, color: BQ.navy, fontWeight: 800, mt: 0.2 }}>
                      {formatAirlineLastTicketDateTime(bookingData?.airlineLastTicketDateTime)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "6px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Typography sx={{ fontSize: 11, color: "#64748B", fontWeight: 700, letterSpacing: 0.2 }}>
                        Last Ticket Time
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                        {canExtendLastTicketTime ? (
                          <IconButton
                            size="small"
                            onClick={handleOpenLastTicketTimeDialog}
                            sx={{
                              color: BQ.navy,
                              bgcolor: "#EEF5FF",
                              p: 0.5,
                              "&:hover": { bgcolor: "#DFECFF" },
                            }}
                            aria-label="Update last ticket time"
                            title="Extend last ticket time"
                          >
                            <ScheduleOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        ) : null}
                        {isLastTicketTimeMissing ? (
                          <IconButton
                            size="small"
                            onClick={handleRefreshAirlineTimes}
                            disabled={airlineTimeRefreshing}
                            sx={{
                              color: BQ.navy,
                              bgcolor: "#EEF5FF",
                              p: 0.5,
                              "&:hover": { bgcolor: "#DFECFF" },
                              "&.Mui-disabled": { color: "#94A3B8" },
                            }}
                            aria-label="Refresh last ticket time"
                          >
                            {airlineTimeRefreshing ? (
                              <CircularProgress size={14} sx={{ color: BQ.navy }} />
                            ) : (
                              <RefreshIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        ) : null}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: BQ.text, fontWeight: 700, mt: 0.2 }}>
                      {formatAirlineLastTicketDateTime(bookingData?.lastTicketTime)}
                    </Typography>
                    {airlineTicketCountdown ? (
                      <Typography
                        sx={{
                          fontSize: 11,
                          mt: 0.35,
                          color: airlineTicketCountdown.expired ? BQ.cancelRed : BQ.navy,
                          fontWeight: 700,
                        }}
                      >
                        {airlineTicketCountdown.label}
                      </Typography>
                    ) : null}
                    {canExtendLastTicketTime ? (
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<ScheduleOutlinedIcon sx={{ fontSize: 15 }} />}
                        onClick={handleOpenLastTicketTimeDialog}
                        sx={{
                          mt: 0.9,
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 12,
                          py: 0.55,
                          borderColor: "#B6D5FF",
                          color: BQ.navy,
                          bgcolor: "#F8FBFF",
                          "&:hover": {
                            borderColor: BQ.navy,
                            bgcolor: "#EEF5FF",
                          },
                        }}
                      >
                        Extend Last Ticket Time
                      </Button>
                    ) : null}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: BQ.muted }}>
                    <Box component="span" sx={{ fontWeight: 700, color: BQ.text }}>
                      API Booking Status:
                    </Box>{" "}
                    {bookingData?.apiBookingStatus || "N/A"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: BQ.muted, lineHeight: 1.45 }}>
                    <Box component="span" sx={{ fontWeight: 700, color: BQ.text }}>
                      Last Ticket Message:
                    </Box>{" "}
                    {bookingData?.airlineLastTicketMessage || "N/A"}
                  </Typography>
                </Box>
              </Box>
              <BookingQueFareDetails data={bookingData} />
              <BookingQueSupport data={bookingData} />
              <BookingQueSessionTime data={bookingData} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Booking Timeline Modal */}
      <Modal
        open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Box
          sx={{
            bgcolor: BQ.card,
            borderRadius: BQ.radius,
            maxWidth: 560,
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: BQ.shadow,
            border: `1px solid ${BQ.border}`,
          }}
        >
          <Box
            sx={{
              position: "relative",
              px: 3,
              pt: 2.5,
              pb: 2,
              bgcolor: BQ.navy,
            }}
          >
            <IconButton
              onClick={() => setTimelineModalOpen(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
              Booking timeline
            </Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.9)", mt: 0.5 }}>
              PNR: {bookingData?.gdsPNR ?? "N/A"} · Airlines PNR:{" "}
              {bookingData?.airlinePNR ?? bookingData?.gdsPNR ?? "N/A"}
            </Typography>
          </Box>

          <Box sx={{ px: 3, pb: 3, pt: 2, overflowY: "auto" }}>
            {timelineLoading ? (
              <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress sx={{ color: BQ.navy }} size={32} />
              </Box>
            ) : (
              timelineEvents.map((event, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    position: "relative",
                    pb: index < timelineEvents.length - 1 ? 2.5 : 0,
                  }}
                >
                  <Box sx={{ width: 130, flexShrink: 0, pr: 1.5 }}>
                    <Typography sx={{ fontSize: 12, color: BQ.muted, fontWeight: 500 }}>
                      {formatTimelineDate(event.dateTime)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 20,
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: BQ.navy,
                        flexShrink: 0,
                        border: `2px solid ${BQ.card}`,
                        boxShadow: `0 0 0 2px ${BQ.navy}40`,
                      }}
                    />
                    {index < timelineEvents.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          minHeight: 40,
                          bgcolor: BQ.border,
                          mt: 0.5,
                        }}
                      />
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0, pl: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: BQ.navy,
                        textTransform: "uppercase",
                      }}
                    >
                      {event.status}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: BQ.text, mt: 0.35 }}>
                      Agent: {event.agent}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>
                      Remarks: {event.remarks}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Modal>


      {/* Invoice Details Modal (E-Ticket / Agent Invoice / Customer Invoice) */}
      <Modal
        open={invoiceModalOpen}
        onClose={() => { setInvoiceModalOpen(false); setSelectedVoucherType(null); }}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "12px",
            maxWidth: 560,
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: 24,
          }}
        >
          <Box sx={{ position: "relative", px: 3, pt: 3, pb: 2, borderBottom: "1px solid #E5E7EB", background: "#F9FAFB" }}>
            <IconButton
              onClick={() => { setInvoiceModalOpen(false); setSelectedVoucherType(null); }}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "#6B7280",
                "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1F2937" }}>
              {selectedVoucherType || "Invoice"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Booking Status:</Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "6px",
                  bgcolor:
                    (bookingData?.status || "").toUpperCase() === "CANCELLED" ||
                      (bookingData?.status || "").toUpperCase() === "CANCELED" ||
                      (bookingData?.status || "").toUpperCase() === "EXPIRED"
                      ? "#FEE2E2"
                      : "#D1FAE5",
                  color:
                    (bookingData?.status || "").toUpperCase() === "CANCELLED" ||
                      (bookingData?.status || "").toUpperCase() === "CANCELED" ||
                      (bookingData?.status || "").toUpperCase() === "EXPIRED"
                      ? "#B91C1C"
                      : "#065F46",
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: "capitalize",
                }}
              >
                {(() => {
                  const s = (bookingData?.status || "N/A").toUpperCase();
                  if (s === "CANCELLED" || s === "CANCELED" || s === "EXPIRED") return s.replace("CANCELED", "Cancelled");
                  if (s === "BOOKED" || s === "HOLD") return "Booked / Ticketed";
                  return s;
                })()}
              </Box>
            </Box>
          </Box>
          <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mb: 1.5 }}>
              Invoice Details
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                { label: "Booking ID", value: bookingData?.bookingId || "N/A" },
                { label: "PNR", value: bookingData?.gdsPNR || "N/A" },
                { label: "Airlines PNR", value: bookingData?.airlinePNR || bookingData?.gdsPNR || "N/A" },
                { label: "Booking Status", value: (bookingData?.status || "N/A") },
                {
                  label: "Total Amount",
                  value: `${bookingData?.farecurrency || "MYR"} ${Number(bookingData?.netPrice ?? bookingData?.clientFare ?? 0).toFixed(2)}`,
                },
              ].map((row) => (
                <Box
                  key={row.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1,
                    px: 1.5,
                    borderRadius: "6px",
                    bgcolor: "#F3F4F6",
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>
                    {row.label}
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            {Array.isArray(bookingData?.travellers) && bookingData.travellers.length > 0 && (
              <>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mt: 2, mb: 1 }}>
                  Passengers
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {bookingData.travellers.map((p, i) => (
                    <Box
                      key={i}
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: "6px",
                        bgcolor: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>
                        {[p.title, p.firstName, p.lastName].filter(Boolean).join(" ")}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                        {p.paxType || "Adult"} • {p.dateOfBirth ? `DOB: ${p.dateOfBirth}` : ""}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
            {Array.isArray(bookingData?.pricebreakdown) && bookingData.pricebreakdown.length > 0 && (
              <>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mt: 2, mb: 1 }}>
                  Fare breakdown
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {bookingData.pricebreakdown.map((item, i) => {
                    const paxCount = item.PaxCount || 1;
                    const base = (parseFloat(item.BaseFare || 0) * paxCount).toFixed(2);
                    const tax = (parseFloat(item.Tax || 0) * paxCount).toFixed(2);
                    const currency = bookingData?.farecurrency || "MYR";
                    return (
                      <Box
                        key={i}
                        sx={{
                          py: 1,
                          px: 1.5,
                          borderRadius: "6px",
                          bgcolor: "#F9FAFB",
                          border: "1px solid #E5E7EB",
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#1F2937" }}>
                          {item.PaxType || "Adult"} (x{paxCount})
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                          Base: {currency} {base} • Tax: {currency} {tax}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Modal>

      <RefundQuotationDialog
        open={quotationDialogOpen}
        onClose={() => setQuotationDialogOpen(false)}
        bookingId={bookingData?.bookingId || bookingId}
        token={superadminToken}
        defaultQuotedAmount={bookingData?.netPrice ?? bookingData?.clientFare ?? ""}
        onSuccess={() => setBookingRefreshKey((k) => k + 1)}
      />
      <RefundRejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        bookingId={bookingData?.bookingId || bookingId}
        token={superadminToken}
        onSuccess={() => setBookingRefreshKey((k) => k + 1)}
      />
      <RefundApproveDialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        bookingId={bookingData?.bookingId || bookingId}
        token={superadminToken}
        onSuccess={() => setBookingRefreshKey((k) => k + 1)}
      />
      <ReissueQuotationDialog
        open={reissueQuotationDialogOpen}
        onClose={() => setReissueQuotationDialogOpen(false)}
        bookingId={reissueFlightBookingId}
        reissueRequestId={reissueRequestId}
        token={superadminToken}
        reissueRequest={bookingData?.reissueRequest}
        defaultQuotedAmount={bookingData?.netPrice ?? bookingData?.clientFare ?? ""}
        onSuccess={() => setBookingRefreshKey((k) => k + 1)}
      />
      <ReissueRejectDialog
        open={reissueRejectDialogOpen}
        onClose={() => setReissueRejectDialogOpen(false)}
        bookingId={reissueFlightBookingId}
        token={superadminToken}
        onSuccess={() => setBookingRefreshKey((k) => k + 1)}
      />

      <Modal
        open={lastTicketTimeDialogOpen}
        onClose={() => !lastTicketTimeSaving && setLastTicketTimeDialogOpen(false)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
      >
        <Box
          sx={{
            bgcolor: BQ.card,
            borderRadius: 2,
            maxWidth: 540,
            width: "100%",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 50px rgba(0, 51, 102, 0.18)",
            border: `1px solid ${BQ.border}`,
          }}
        >
          <Box sx={{ position: "relative", px: 2.5, pt: 2.25, pb: 1.75, bgcolor: BQ.navy }}>
            <IconButton
              onClick={() => setLastTicketTimeDialogOpen(false)}
              disabled={lastTicketTimeSaving}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.15)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  bgcolor: "rgba(255,255,255,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccessTimeOutlinedIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  Extend Last Ticket Time
                </Typography>
                <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.9)", mt: 0.25 }}>
                  Booking ID: {bookingData?.bookingId || bookingId || "N/A"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ px: 2.5, py: 1.75, overflowY: "auto" }}>
            {bookingData?.airlineLastTicketDateTime ? (
              <Box
                sx={{
                  mb: 2,
                  p: 1.25,
                  borderRadius: 1.5,
                  bgcolor: "#F0F7FF",
                  border: "1px solid #B6D5FF",
                }}
              >
                <Typography sx={{ fontSize: 11, color: BQ.muted, fontWeight: 700, letterSpacing: 0.2 }}>
                  Airline Deadline
                </Typography>
                <Typography sx={{ fontSize: 14, color: BQ.navy, fontWeight: 800, mt: 0.25 }}>
                  {formatAirlineLastTicketDateTime(bookingData.airlineLastTicketDateTime)}
                </Typography>
              </Box>
            ) : null}

            <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.text, mb: 0.75 }}>
              Quick extend
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
              {LAST_TICKET_TIME_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  size="small"
                  variant="outlined"
                  onClick={() => applyLastTicketTimePreset(preset.amount, preset.unit)}
                  disabled={lastTicketTimeSaving}
                  sx={{
                    textTransform: "none",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 999,
                    px: 1.25,
                    py: 0.35,
                    borderColor: "#B6D5FF",
                    color: BQ.navy,
                    bgcolor: "#F8FBFF",
                    "&:hover": {
                      borderColor: BQ.navy,
                      bgcolor: "#EEF5FF",
                    },
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </Box>

            <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.text, mb: 0.75 }}>
              Select date & time
            </Typography>
            <Box
              sx={{
                border: "1px solid #B6D5FF",
                borderRadius: 2,
                bgcolor: "#F8FBFF",
                overflow: "hidden",
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  bgcolor: BQ.navy,
                  px: 1.5,
                  py: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.75)", fontWeight: 700, letterSpacing: 0.3 }}>
                  SELECT DATE & TIME
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#fff", fontWeight: 800 }}>
                  {lastTicketTimeValue?.isValid()
                    ? lastTicketTimeValue.format("DD MMM YYYY, hh:mm A")
                    : "—"}
                </Typography>
              </Box>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DateCalendar
                    value={lastTicketTimeValue}
                    onChange={handleLastTicketDateChange}
                    disabled={lastTicketTimeSaving}
                    minDate={getLastTicketTimeBounds().minDateTime.startOf("day")}
                    maxDate={getLastTicketTimeBounds().maxDateTime?.endOf("day") || undefined}
                    sx={lastTicketCalendarSx}
                  />
                  <MultiSectionDigitalClock
                    value={lastTicketTimeValue}
                    onChange={handleLastTicketTimeChange}
                    disabled={lastTicketTimeSaving}
                    ampm
                    minTime={
                      lastTicketTimeValue?.isSame(getLastTicketTimeBounds().minDateTime, "day")
                        ? getLastTicketTimeBounds().minDateTime
                        : undefined
                    }
                    maxTime={
                      getLastTicketTimeBounds().maxDateTime &&
                      lastTicketTimeValue?.isSame(getLastTicketTimeBounds().maxDateTime, "day")
                        ? getLastTicketTimeBounds().maxDateTime
                        : undefined
                    }
                    sx={lastTicketClockSx}
                  />
                </Box>
              </LocalizationProvider>
            </Box>

            {lastTicketTimeError ? (
              <Typography sx={{ fontSize: 12, color: BQ.cancelRed, fontWeight: 600, mb: 1 }}>
                {lastTicketTimeError}
              </Typography>
            ) : (
              <Typography sx={{ fontSize: 12, color: BQ.muted, mb: 1 }}>
                Select a future time within the airline deadline.
              </Typography>
            )}

            {lastTicketTimeValue?.isValid() ? (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.1,
                  borderRadius: 1.25,
                  bgcolor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <Typography sx={{ fontSize: 11, color: BQ.muted, fontWeight: 700 }}>
                  Selected time
                </Typography>
                <Typography sx={{ fontSize: 13, color: BQ.navy, fontWeight: 800, mt: 0.2 }}>
                  {lastTicketTimeValue.format("dddd, DD MMM YYYY • hh:mm A")}
                </Typography>
              </Box>
            ) : null}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2.25 }}>
              <Button
                variant="outlined"
                onClick={() => setLastTicketTimeDialogOpen(false)}
                disabled={lastTicketTimeSaving}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: BQ.border,
                  color: BQ.muted,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateLastTicketTime}
                disabled={lastTicketTimeSaving || !lastTicketTimeValue?.isValid()}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: 2.25,
                  bgcolor: BQ.navy,
                  boxShadow: "0 8px 20px rgba(0, 51, 102, 0.22)",
                  "&:hover": { bgcolor: BQ.navyDark },
                }}
              >
                {lastTicketTimeSaving ? "Saving..." : "Save Time"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default BookingQueDetails;
