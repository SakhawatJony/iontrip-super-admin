import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL } from "../../config/api.js";
import RefundQuotationDialog from "./RefundQuotationDialog.jsx";
import RefundRejectDialog from "./RefundRejectDialog.jsx";
import { BQ, bqCardSx, bqLabelSx, bqValueSx } from "./bookingQueTheme.js";
import { BqTagChip } from "./bookingQueUi.jsx";
import BookingQueFareDetails from "./BookingQueFareDetails.jsx";
import {
  formatDisplayDuration,
  isRoundTripBooking,
  resolveBookingBackSegments,
  resolveBookingGoSegments,
  resolveSierraLegSummary,
  unwrapBookingResponse,
} from "../flightItineraryUtils.js";

const REFUND_TYPES = [
  { key: "voluntary", label: "Voluntary" },
  { key: "involuntary", label: "In-Voluntary" },
  { key: "others", label: "Others" },
];

const REFUND_INFO_CARDS = [
  {
    title: "Voluntary reissue",
    description: "Change of mind, Change of itinerary, Personal purpose",
  },
  {
    title: "In-voluntary reissue",
    description: "Flight cancellations, Denied boarding, Schedule changes, Travel restrictions",
  },
];

const alertSx = {
  display: "flex",
  alignItems: "flex-start",
  gap: 1,
  bgcolor: BQ.holdWarnBg,
  border: `1px solid ${BQ.holdWarn}`,
  borderRadius: "6px",
  px: 1.25,
  py: 1,
  mb: 1.5,
};

const sectionTitleSx = {
  fontSize: 14,
  fontWeight: 700,
  color: BQ.navy,
  mb: 1.25,
};

const checkboxSx = {
  color: BQ.border,
  "&.Mui-checked": { color: BQ.actionBlue },
};

function formatTime(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "N/A";
  }
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function formatPaxDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
}

function getLayoverLabel(prevSeg, nextSeg) {
  if (!prevSeg?.arrivalTime || !nextSeg?.departureTime) return null;
  const diffMs = new Date(nextSeg.departureTime) - new Date(prevSeg.arrivalTime);
  if (diffMs <= 0) return null;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours && minutes) return `Layover ${hours}h ${minutes}m`;
  if (hours) return `Layover ${hours}h`;
  return `Layover ${minutes}m`;
}

function buildSegmentRows(segmentsArray, data) {
  return segmentsArray.map((segment) => {
    const dep = segment.departureAirport || segment.departure || "N/A";
    const arr = segment.arrivalAirport || segment.arrival || "N/A";
    const depName = segment.departureAirportName || segment.departureName || dep;
    const arrName = segment.arrivalAirportName || segment.arrivalName || arr;
    const carrierCode = segment.marketingcareer || segment.marketingCarrier || "";
    const airlineName = segment.marketingcareerName || segment.marketingCarrierName || "";
    const flightNo = segment.marketingflight || segment.marketingFlight || "";
    const cabin = segment.class || segment.cabin || data?.cabinClass || "ECONOMY";
    const checkInBag = segment.bags || segment.checkInBags || "—";
    const cabinBag = segment.cabinBag || segment.cabinbag || "7KG";
    const duration = formatDisplayDuration(segment.flightduration || segment.duration) || "—";

    return {
      departureTime: segment.departureTime,
      arrivalTime: segment.arrivalTime,
      departTime: formatTime(segment.departureTime),
      departDate: formatDate(segment.departureTime),
      arriveTime: formatTime(segment.arrivalTime),
      arriveDate: formatDate(segment.arrivalTime),
      dep,
      arr,
      depName,
      arrName,
      airline: `${String(airlineName).toUpperCase()} - ${carrierCode} ${flightNo}`.trim(),
      cabin: String(cabin).toUpperCase(),
      checkInBag,
      cabinBag,
      duration,
      carrierCode: String(carrierCode).toUpperCase(),
    };
  });
}

function getInitials(traveller) {
  const f = (traveller?.firstName || "").charAt(0);
  const l = (traveller?.lastName || "").charAt(0);
  return (f + l).toUpperCase() || "?";
}

function getTitle(gender, title) {
  if (title) return String(title).toUpperCase();
  if (gender === "MALE") return "MR";
  if (gender === "FEMALE") return "MRS";
  return "MR";
}

function resolveRefundRequestId(bookingData, stateRefundRequestId) {
  return (
    stateRefundRequestId ||
    bookingData?.refundRequestId ||
    bookingData?.refundId ||
    bookingData?.refundRequest?.id ||
    bookingData?.refund?.id ||
    bookingData?.refund?.refundRequestId ||
    bookingData?.requestId ||
    ""
  );
}

export default function BookingQueRefund() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const superadminToken = token || localStorage.getItem("adminToken") || "";
  const baseUrl = API_BASE_URL;
  const agentEmail = user?.email || "";

  const bookingId = location.state?.bookingId || "";
  const [bookingData, setBookingData] = useState(location.state?.bookingData || null);
  const [loading, setLoading] = useState(!location.state?.bookingData);
  const [error, setError] = useState("");
  const [refundRequestId, setRefundRequestId] = useState(
    () => resolveRefundRequestId(location.state?.bookingData, location.state?.refundRequestId) || "",
  );
  const [quotedAmount, setQuotedAmount] = useState("");
  const [refundType, setRefundType] = useState("voluntary");
  const [remarks, setRemarks] = useState("");
  const [activeLeg, setActiveLeg] = useState("outbound");
  const [selectedLegs, setSelectedLegs] = useState({ outbound: true, return: true });
  const [selectedPassengers, setSelectedPassengers] = useState({});
  const [selectAllPassengers, setSelectAllPassengers] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quotationDialogOpen, setQuotationDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [logoErrors, setLogoErrors] = useState({});

  const footerBtnBaseSx = {
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

  const makeQuotationBtnSx = (enabled) => ({
    ...footerBtnBaseSx,
    bgcolor: enabled ? "var(--secondary-color, #024DAF)" : "#B0BEC5",
    "&:hover": {
      bgcolor: enabled ? "var(--secondary-color, #024DAF)" : "#B0BEC5",
      opacity: enabled ? 0.9 : 1,
    },
  });

  const cancelQuotationBtnSx = {
    ...footerBtnBaseSx,
    bgcolor: "var(--primary-color, #0F2F56)",
    "&:hover": {
      bgcolor: "var(--primary-color, #0F2F56)",
      opacity: 0.9,
    },
  };

  useEffect(() => {
    if (bookingData || !bookingId) return;

    const fetchBookingDetails = async () => {
      if (!agentEmail || !superadminToken) {
        setError("Authentication missing. Please login again.");
        setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, bookingData, agentEmail, superadminToken, baseUrl]);

  const travellers = bookingData?.travellers || [];
  const pricebreakdown = bookingData?.pricebreakdown || [];
  const isRoundTrip = isRoundTripBooking(bookingData);
  const goSegmentsRaw = resolveBookingGoSegments(bookingData);
  const backSegmentsRaw = resolveBookingBackSegments(bookingData);
  const goSegments = buildSegmentRows(goSegmentsRaw, bookingData);
  const backSegments = buildSegmentRows(backSegmentsRaw, bookingData);

  const goSummary = resolveSierraLegSummary(bookingData, 1);
  const backSummary = resolveSierraLegSummary(bookingData, 2);
  const firstGo = goSegmentsRaw[0] || {};
  const lastGo = goSegmentsRaw[goSegmentsRaw.length - 1] || firstGo;
  const firstBack = backSegmentsRaw[0] || {};
  const lastBack = backSegmentsRaw[backSegmentsRaw.length - 1] || firstBack;

  const goDep = bookingData?.godeparture || firstGo?.departure || goSummary?.departure || "—";
  const goArr = bookingData?.goarrival || lastGo?.arrival || goSummary?.arrival || "—";
  const backDep = bookingData?.backdeparture || firstBack?.departure || backSummary?.departure;
  const backArr = bookingData?.backarrival || lastBack?.arrival || backSummary?.arrival;

  useEffect(() => {
    if (!travellers.length) return;
    const initial = {};
    travellers.forEach((_, index) => {
      initial[index] = true;
    });
    setSelectedPassengers(initial);
  }, [bookingData]);

  useEffect(() => {
    if (!bookingData) return;

    const resolvedId = resolveRefundRequestId(bookingData, location.state?.refundRequestId);
    if (resolvedId) setRefundRequestId(String(resolvedId));

    if (!quotedAmount) {
      const defaultAmount = bookingData?.netPrice ?? bookingData?.clientFare ?? "";
      if (defaultAmount !== "" && defaultAmount != null) {
        setQuotedAmount(String(defaultAmount));
      }
    }
  }, [bookingData, location.state?.refundRequestId]);

  const currentSegments = activeLeg === "outbound" ? goSegments : backSegments;
  const legDep = activeLeg === "outbound" ? goDep : backDep || goArr;
  const legArr = activeLeg === "outbound" ? goArr : backArr || goDep;
  const legLabel = activeLeg === "outbound" ? "OUTBOUND FLIGHT" : "RETURN FLIGHT";
  const ticketNo = bookingData?.airlinePNR || bookingData?.gdsPNR || "N/A";

  const canSubmit = useMemo(() => {
    const hasLeg = Object.values(selectedLegs).some(Boolean);
    const hasPassenger = Object.values(selectedPassengers).some(Boolean);
    return agreeTerms && hasLeg && hasPassenger;
  }, [agreeTerms, selectedLegs, selectedPassengers]);

  const handleLegToggle = (leg) => {
    setSelectedLegs((prev) => {
      const next = { ...prev, [leg]: !prev[leg] };
      if (!next.outbound && !next.return) return prev;
      return next;
    });
    setActiveLeg(leg);
  };

  const handleSelectAllPassengers = (checked) => {
    setSelectAllPassengers(checked);
    const next = {};
    travellers.forEach((_, index) => {
      next[index] = checked;
    });
    setSelectedPassengers(next);
  };

  const handlePassengerToggle = (index) => {
    setSelectedPassengers((prev) => {
      const next = { ...prev, [index]: !prev[index] };
      const allSelected = travellers.every((_, i) => next[i]);
      const noneSelected = travellers.every((_, i) => !next[i]);
      setSelectAllPassengers(allSelected);
      if (noneSelected) return prev;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      // Placeholder until refund API is connected
      await Swal.fire({
        icon: "success",
        title: "Refund Request Sent",
        text: "Your refund request has been submitted successfully.",
        confirmButtonColor: BQ.navy,
      });
      navigate("/dashboard/bookingqueuedetails", {
        state: { bookingId: bookingData?.bookingId || bookingId },
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit refund request. Please try again.",
        confirmButtonColor: BQ.navy,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakeRefundQuotation = () => {
    setQuotationDialogOpen(true);
  };

  const handleCancelRefundQuotation = () => {
    setRejectDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: BQ.pageBg, display: "flex", justifyContent: "center", alignItems: "center" }}>
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
          onClick={() => navigate("/dashboard/bookingqueuedetails", { state: { bookingId } })}
          sx={{ textTransform: "none", borderColor: BQ.navy, color: BQ.navy }}
        >
          Back to booking details
        </Button>
      </Box>
    );
  }

  if (!bookingData) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: BQ.pageBg, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography sx={{ fontSize: 14, color: BQ.muted }}>No booking data found</Typography>
      </Box>
    );
  }

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
          onClick={() =>
            navigate("/dashboard/bookingqueuedetails", {
              state: { bookingId: bookingData?.bookingId || bookingId },
            })
          }
          sx={{ color: "#fff", p: 0.75 }}
          aria-label="Back"
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Refund Request</Typography>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1.25, md: 1.75 }, pt: 1.5 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Refund Information */}
              <Box sx={{ ...bqCardSx, p: 1.75 }}>
                <Typography sx={sectionTitleSx}>Refund Information</Typography>

                <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
                  {REFUND_INFO_CARDS.map((card) => (
                    <Grid item xs={12} sm={6} key={card.title}>
                      <Box
                        sx={{
                          bgcolor: BQ.accentSoft,
                          border: `1px solid ${BQ.border}`,
                          borderRadius: "8px",
                          p: 1.25,
                          height: "100%",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mb: 0.5 }}>
                          <InfoOutlinedIcon sx={{ fontSize: 16, color: BQ.actionBlue, mt: 0.1 }} />
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.navy }}>{card.title}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 10, color: BQ.muted, lineHeight: 1.45, pl: 2.75 }}>
                          {card.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: { xs: 1, sm: 2 }, mb: 1.5 }}>
                  {REFUND_TYPES.map((type) => (
                    <FormControlLabel
                      key={type.key}
                      control={
                        <Checkbox
                          checked={refundType === type.key}
                          onChange={() => setRefundType(type.key)}
                          size="small"
                          sx={checkboxSx}
                        />
                      }
                      label={<Typography sx={{ fontSize: 12, fontWeight: 600, color: BQ.text }}>{type.label}</Typography>}
                    />
                  ))}
                </Box>

                <Grid container spacing={1.25} sx={{ mb: 1.5 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: BQ.navy, mb: 0.5 }}>
                      Refund Request ID
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      value={refundRequestId}
                      onChange={(e) => setRefundRequestId(e.target.value)}
                      placeholder="e.g. 465555"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#EEF6FF",
                          borderRadius: "8px",
                          fontSize: 12,
                          "& fieldset": { borderColor: BQ.actionBlue },
                          "&:hover fieldset": { borderColor: BQ.actionBlue },
                          "&.Mui-focused fieldset": { borderColor: BQ.actionBlue, borderWidth: 1 },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: BQ.navy, mb: 0.5 }}>
                      Quoted Amount
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={quotedAmount}
                      onChange={(e) => setQuotedAmount(e.target.value)}
                      placeholder="e.g. 450.5"
                      inputProps={{ min: 0, step: "0.01" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "#EEF6FF",
                          borderRadius: "8px",
                          fontSize: 12,
                          "& fieldset": { borderColor: BQ.actionBlue },
                          "&:hover fieldset": { borderColor: BQ.actionBlue },
                          "&.Mui-focused fieldset": { borderColor: BQ.actionBlue, borderWidth: 1 },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Typography sx={{ fontSize: 12, fontWeight: 600, color: BQ.navy, mb: 0.5 }}>Admin Note</Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="After airline penalty deduction."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#EEF6FF",
                      borderRadius: "8px",
                      fontSize: 12,
                      "& fieldset": { borderColor: BQ.actionBlue },
                      "&:hover fieldset": { borderColor: BQ.actionBlue },
                      "&.Mui-focused fieldset": { borderColor: BQ.actionBlue, borderWidth: 1 },
                    },
                  }}
                />
              </Box>

              {/* Selected Flight Information */}
              <Box sx={{ ...bqCardSx, p: 1.75 }}>
                <Typography sx={sectionTitleSx}>Selected Flight Information</Typography>

                <Box sx={alertSx}>
                  <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: BQ.holdWarn, mt: 0.1, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 11, color: "#8B6914", lineHeight: 1.45 }}>
                    You have the option to choose one or multiple itinerary at once. Reissue this ticket will only impact
                    the selected itinerary based on the airline&apos;s policy.
                  </Typography>
                </Box>

                {isRoundTrip ? (
                  <Box
                    sx={{
                      display: "flex",
                      borderBottom: `1px solid ${BQ.border}`,
                      mb: 1.5,
                    }}
                  >
                    {[
                      { key: "outbound", label: `Outbound ${goDep} → ${goArr}` },
                      { key: "return", label: `Return ${backDep || goArr} → ${backArr || goDep}` },
                    ].map((tab) => {
                      const isActive = activeLeg === tab.key;
                      return (
                        <Box
                          key={tab.key}
                          onClick={() => setActiveLeg(tab.key)}
                          sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                            py: 1,
                            cursor: "pointer",
                            borderBottom: isActive ? `3px solid ${BQ.navy}` : "3px solid transparent",
                            color: isActive ? BQ.navy : BQ.muted,
                          }}
                        >
                          <Checkbox
                            checked={selectedLegs[tab.key]}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleLegToggle(tab.key);
                            }}
                            size="small"
                            sx={checkboxSx}
                          />
                          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{tab.label}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                ) : null}

                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: BQ.actionBlue,
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  {legLabel}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    mb: 1.5,
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: 20, fontWeight: 700, color: BQ.navy }}>{legDep}</Typography>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      bgcolor: BQ.accentSoft,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FlightOutlinedIcon sx={{ color: BQ.navy, fontSize: 18, transform: "rotate(90deg)" }} />
                  </Box>
                  <Typography sx={{ fontSize: 20, fontWeight: 700, color: BQ.navy }}>{legArr}</Typography>
                </Box>

                {currentSegments.length === 0 ? (
                  <Typography sx={{ fontSize: 12, color: BQ.muted, textAlign: "center", py: 2 }}>
                    No flight segments available
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {currentSegments.map((segment, index) => {
                      const logoKey = `${segment.carrierCode}-${activeLeg}-${index}`;
                      const logoUrl = segment.carrierCode
                        ? `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${segment.carrierCode}.png`
                        : "";
                      const hasLogo = Boolean(logoUrl) && !logoErrors[logoKey];
                      const rawSegments = activeLeg === "outbound" ? goSegmentsRaw : backSegmentsRaw;

                      return (
                        <React.Fragment key={`${segment.departTime}-${index}`}>
                          <Box
                            sx={{
                              border: `1px solid ${BQ.border}`,
                              borderRadius: "8px",
                              p: 1.25,
                              bgcolor: BQ.fieldBg,
                            }}
                          >
                            <Box sx={{ display: "flex", gap: 1.25, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 1.5,
                                  bgcolor: hasLogo ? "#fff" : BQ.navy,
                                  border: `1px solid ${BQ.border}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  overflow: "hidden",
                                }}
                              >
                                {hasLogo ? (
                                  <Box
                                    component="img"
                                    src={logoUrl}
                                    alt=""
                                    sx={{ width: 30, height: 30, objectFit: "contain" }}
                                    onError={() => setLogoErrors((p) => ({ ...p, [logoKey]: true }))}
                                  />
                                ) : (
                                  <FlightOutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
                                )}
                              </Box>

                              <Box sx={{ flex: 1, minWidth: 200 }}>
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, flexWrap: "wrap" }}>
                                  <Box>
                                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: BQ.text, lineHeight: 1.2 }}>
                                      {segment.departTime}
                                    </Typography>
                                    <Typography sx={{ fontSize: 10, color: BQ.muted }}>{segment.departDate}</Typography>
                                  </Box>
                                  <ArrowForwardIcon sx={{ color: BQ.actionBlue, mt: 0.35, fontSize: 16 }} />
                                  <Box>
                                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: BQ.text, lineHeight: 1.2 }}>
                                      {segment.arriveTime}
                                    </Typography>
                                    <Typography sx={{ fontSize: 10, color: BQ.muted }}>{segment.arriveDate}</Typography>
                                  </Box>
                                </Box>

                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: BQ.navy, mt: 0.75 }}>
                                  {segment.dep} → {segment.arr}
                                </Typography>
                                <Typography sx={{ fontSize: 10, color: BQ.muted, lineHeight: 1.35 }}>
                                  {segment.depName} → {segment.arrName}
                                </Typography>
                                <Typography sx={{ fontSize: 10, color: BQ.muted, mt: 0.15 }}>{segment.airline}</Typography>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
                                  <BqTagChip>{segment.cabin}</BqTagChip>
                                  <BqTagChip>Check-in {segment.checkInBag}</BqTagChip>
                                  <BqTagChip>Cabin {segment.cabinBag}</BqTagChip>
                                  <BqTagChip>{segment.duration}</BqTagChip>
                                </Box>
                              </Box>
                            </Box>
                          </Box>

                          {index < currentSegments.length - 1 ? (
                            <Typography
                              sx={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: BQ.muted,
                                textAlign: "center",
                                py: 0.25,
                              }}
                            >
                              {getLayoverLabel(rawSegments[index], rawSegments[index + 1]) || "Layover"}
                            </Typography>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Select Passenger Information */}
              <Box sx={{ ...bqCardSx, p: 1.75 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                  <Typography sx={{ ...sectionTitleSx, mb: 0 }}>Select Passenger Information</Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectAllPassengers}
                        onChange={(e) => handleSelectAllPassengers(e.target.checked)}
                        size="small"
                        sx={checkboxSx}
                      />
                    }
                    label={<Typography sx={{ fontSize: 11, fontWeight: 600, color: BQ.muted }}>Select</Typography>}
                    sx={{ mr: 0 }}
                  />
                </Box>

                <Box sx={alertSx}>
                  <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: BQ.holdWarn, mt: 0.1, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 11, color: "#8B6914", lineHeight: 1.45 }}>
                    You have the option to choose one or multiple travelers at once. Refund this ticket will only impact
                    the selected travelers based on the airline&apos;s policy.
                  </Typography>
                </Box>

                {travellers.length === 0 ? (
                  <Typography sx={{ fontSize: 12, color: BQ.muted, textAlign: "center", py: 2 }}>
                    No passenger data available
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {travellers.map((traveller, index) => {
                      const fullName = [
                        getTitle(traveller.gender, traveller.title),
                        traveller.firstName,
                        traveller.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ");
                      const paxType = pricebreakdown[index]?.PaxType || "ADULT";

                      const detailFields = [
                        { label: "Date of Birth", value: formatPaxDate(traveller.dateOfBirth) },
                        { label: "Passport No", value: traveller.passportNumber || "N/A" },
                        { label: "Passport Expiry", value: formatPaxDate(traveller.passportExpireDate) },
                        { label: "Nationality", value: traveller.nationality || traveller.country || "N/A" },
                        { label: "Email", value: traveller.email || bookingData?.contactEmail || "N/A" },
                        { label: "Phone", value: traveller.phone || traveller.mobile || bookingData?.contactPhone || "N/A" },
                      ];

                      return (
                        <Box
                          key={index}
                          sx={{
                            border: `1px solid ${BQ.border}`,
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: BQ.navy,
                              px: 1.5,
                              py: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Checkbox
                              checked={Boolean(selectedPassengers[index])}
                              onChange={() => handlePassengerToggle(index)}
                              size="small"
                              sx={{ color: "rgba(255,255,255,0.5)", "&.Mui-checked": { color: "#fff" }, p: 0.25 }}
                            />
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                bgcolor: "rgba(255,255,255,0.2)",
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.35)",
                                fontWeight: 700,
                                fontSize: 11,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(traveller)}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }} noWrap>
                                {fullName}
                              </Typography>
                              <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.78)" }}>
                                {paxType} · {ticketNo}
                              </Typography>
                            </Box>
                          </Box>

                          <Grid container sx={{ p: 1.5 }}>
                            {detailFields.map((field) => (
                              <Grid item xs={6} sm={4} key={field.label} sx={{ mb: 1 }}>
                                <Typography sx={bqLabelSx}>{field.label}</Typography>
                                <Typography sx={{ ...bqValueSx, mt: 0.2 }}>{field.value}</Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>

              {/* Footer */}
              <Box sx={{ ...bqCardSx, p: 1.75 }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} size="small" sx={checkboxSx} />
                  }
                  label={
                    <Typography sx={{ fontSize: 12, color: BQ.text }}>
                      By creating this Request you agree to our Terms &amp; Conditions
                    </Typography>
                  }
                  sx={{ mb: 1.5, ml: 0 }}
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={submitting}
                    onClick={handleMakeRefundQuotation}
                    sx={makeQuotationBtnSx(true)}
                  >
                    Make Refund Quotation
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={submitting}
                    onClick={handleCancelRefundQuotation}
                    sx={cancelQuotationBtnSx}
                  >
                    Cancel Refund Quotation
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Box
              sx={{
                position: { lg: "sticky" },
                top: { lg: 12 },
              }}
            >
              <BookingQueFareDetails data={bookingData} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <RefundQuotationDialog
        open={quotationDialogOpen}
        onClose={() => setQuotationDialogOpen(false)}
        bookingId={bookingData?.bookingId || bookingId}
        token={superadminToken}
        defaultQuotedAmount={bookingData?.netPrice ?? bookingData?.clientFare ?? quotedAmount}
      />
      <RefundRejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        bookingId={bookingData?.bookingId || bookingId}
        token={superadminToken}
        onSuccess={() =>
          navigate("/dashboard/bookingqueuedetails", {
            state: { bookingId: bookingData?.bookingId || bookingId },
          })
        }
      />
    </Box>
  );
}
