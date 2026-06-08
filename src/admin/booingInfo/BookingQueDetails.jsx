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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.js";
import { toast } from "react-toastify";
import RefundQuotationDialog from "./RefundQuotationDialog.jsx";
import RefundRejectDialog from "./RefundRejectDialog.jsx";
import RefundApproveDialog from "./RefundApproveDialog.jsx";
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
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import {
  resolveBookingAgentEmail,
  formatBqNumber,
  isRefundRequestStatus,
  isRefundQuotedStatus,
  isRefundProcessingStatus,
  isRefundedStatus,
  resolveRefundRequestId,
} from "./bookingQueUtils.js";

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
  const [issueBalanceDialogOpen, setIssueBalanceDialogOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletBalanceLoading, setWalletBalanceLoading] = useState(false);
  const [payWithWalletLoading, setPayWithWalletLoading] = useState(false);
  const [cancelBookingLoading, setCancelBookingLoading] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [bookingRefreshKey, setBookingRefreshKey] = useState(0);
  const [refundTransferLoading, setRefundTransferLoading] = useState(false);

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

  const bookingAgentEmail = resolveBookingAgentEmail(bookingData, agentEmail);

  useEffect(() => {
    if (!issueBalanceDialogOpen || !bookingAgentEmail || !superadminToken) return;

    const fetchWallet = async () => {
      setWalletBalanceLoading(true);
      setWalletBalance(null);
      try {
        const res = await axios.get(
          `${baseUrl}/wallet/getWalletBalance?email=${encodeURIComponent(bookingAgentEmail)}`,
          {
            headers: {
              Authorization: `Bearer ${superadminToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const bal =
          res?.data?.data?.balance ??
          res?.data?.data?.walletBalance ??
          res?.data?.balance ??
          res?.data?.walletBalance ??
          null;
        setWalletBalance(bal);
      } catch {
        setWalletBalance(null);
      } finally {
        setWalletBalanceLoading(false);
      }
    };

    fetchWallet();
  }, [issueBalanceDialogOpen, bookingAgentEmail, superadminToken, baseUrl]);

  const handlePayWithWallet = async () => {
    if (!superadminToken || !bookingId || !bookingAgentEmail) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Missing booking or agent details.",
        confirmButtonColor: BQ.actionBlue,
      });
      return;
    }
    const result = await Swal.fire({
      icon: "question",
      title: "Issue with Balance",
      text: "Confirm payment from agent wallet to issue this booking?",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: BQ.navy,
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setPayWithWalletLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/flight/payWithWallet`,
        { bookingId, email: bookingAgentEmail },
        {
          headers: {
            Authorization: `Bearer ${superadminToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      const successMessage =
        response?.data?.message ?? response?.data?.data?.message ?? "Payment successful.";
      Swal.fire({
        icon: "success",
        title: "Success",
        text: successMessage,
        confirmButtonColor: BQ.actionBlue,
      });
      setIssueBalanceDialogOpen(false);
      const refetchRes = await axios.get(`${baseUrl}/booking/admin/${bookingId}`, {
        headers: { Authorization: `Bearer ${superadminToken}`, "Content-Type": "application/json" },
      });
      setBookingData(unwrapBookingResponse(refetchRes));
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Failed to issue with balance.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: BQ.actionBlue,
      });
    } finally {
      setPayWithWalletLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    const cancelEmail = resolveBookingAgentEmail(bookingData, agentEmail);
    if (!superadminToken || !cancelEmail || !bookingId) {
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
        `${baseUrl}/flight/CancelBooking?bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(cancelEmail)}`,
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
      const refetchRes = await axios.get(
        `${baseUrl}/booking/admin/${bookingId}`,
        { headers: { Authorization: `Bearer ${superadminToken}`, "Content-Type": "application/json" } }
      );
      setBookingData(unwrapBookingResponse(refetchRes));
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
  const isRefundRequest = isRefundRequestStatus(bookingData?.status);
  const isRefundQuoted = isRefundQuotedStatus(bookingData?.status);
  const isRefundProcessing = isRefundProcessingStatus(bookingData?.status);
  const isRefunded = isRefundedStatus(bookingData?.status);

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
                  {isHold ? (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AccountBalanceWalletIcon />}
                      onClick={() => setIssueBalanceDialogOpen(true)}
                      sx={{
                        ...bqSidebarBtnSx,
                        bgcolor: BQ.navy,
                        color: "#fff",
                        "&:hover": { bgcolor: BQ.navyDark },
                      }}
                    >
                      Issue with Balance
                    </Button>
                  ) : null}
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
                  ) : null}
                </>
              )}
              <BookingQueFareDetails data={bookingData} />
              <BookingQueSupport />
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



      <Dialog
        open={issueBalanceDialogOpen}
        onClose={() => !payWithWalletLoading && setIssueBalanceDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: BQ.radius, overflow: "hidden" } }}
      >
        <DialogTitle sx={{ bgcolor: BQ.navy, color: "#fff", fontSize: 16, fontWeight: 700, py: 1.5 }}>
          Issue with Balance
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <Typography sx={{ fontSize: 12, color: BQ.muted, mb: 1.5 }}>
            Agent: {bookingAgentEmail || "N/A"}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 12, color: BQ.muted }}>Booking amount</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.navy }}>
              {bookingData?.farecurrency || "BDT"}{" "}
              {formatBqNumber(bookingData?.netPrice ?? bookingData?.clientFare ?? 0)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 12, color: BQ.muted }}>Wallet balance</Typography>
            {walletBalanceLoading ? (
              <CircularProgress size={18} sx={{ color: BQ.actionBlue }} />
            ) : (
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.actionBlue }}>
                {walletBalance != null
                  ? `${bookingData?.farecurrency || "BDT"} ${formatBqNumber(walletBalance)}`
                  : "—"}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setIssueBalanceDialogOpen(false)}
            disabled={payWithWalletLoading}
            sx={{ textTransform: "none", color: BQ.muted }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handlePayWithWallet}
            disabled={payWithWalletLoading}
            sx={{
              textTransform: "none",
              bgcolor: BQ.navy,
              "&:hover": { bgcolor: BQ.navyDark },
            }}
          >
            {payWithWalletLoading ? "Processing..." : "Confirm payment"}
          </Button>
        </DialogActions>
      </Dialog>

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
      />
      <RefundRejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        bookingId={bookingData?.bookingId || bookingId}
        token={superadminToken}
      />
      <RefundApproveDialog
        open={approveDialogOpen}
        onClose={() => setApproveDialogOpen(false)}
        bookingId={bookingData?.bookingId || bookingId}
        token={superadminToken}
        onSuccess={() => setBookingRefreshKey((k) => k + 1)}
      />
    </Box>
  );
};

export default BookingQueDetails;
