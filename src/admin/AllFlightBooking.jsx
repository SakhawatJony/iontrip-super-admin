import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Menu, MenuItem, Typography, CircularProgress, Modal, IconButton } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import RefreshIcon from "@mui/icons-material/Refresh";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";

// Status mapping from API to display labels
const statusLabelMap = {
  "ticketed": "Ticketed",
  "reissue": "Reissue",
  "refund": "Refund",
  "void": "Void",
  "hold": "Hold",
  "issueinprocess": "Issue in Process",
  "booked": "Booked",
};

const tableColumns = [
  { key: "bookingId", label: "Booking ID", width: "120px" },
  { key: "customer", label: "Customer", width: "150px" },
  { key: "route", label: "Route", width: "150px" },
  { key: "type", label: "Type", width: "100px" },
  { key: "pnr", label: "PNR", width: "100px" },
  { key: "bookingTime", label: "Booking Time", width: "150px" },
  { key: "dueAmount", label: "Due Amount", width: "120px" },
  { key: "grossFare", label: "Base Fare", width: "120px" },
  { key: "ticketFare", label: "Ticket Fare", width: "120px" },
  { key: "pax", label: "PAX", width: "80px" },
  { key: "airline", label: "Airline", width: "150px" },
  { key: "flightDate", label: "Flight Date", width: "120px" },
  { key: "lastTicketTime", label: "Last Ticket Time", width: "150px" },
  { key: "status", label: "Status", width: "110px" },
];

const tableGridTemplate = fluidGridTemplateFromColumns(tableColumns);

const STATUS_OPTIONS = [
  { value: "", label: "All Booking" },
  { value: "booked", label: "Booked" },
  { value: "ticketed", label: "Ticketed" },
  { value: "reissue", label: "Reissue" },
  { value: "refund", label: "Refund" },
  { value: "hold", label: "Hold" },
  { value: "void", label: "Void" },
  { value: "issueinprocess", label: "Issue in Process" },
];

const AllFlightBooking = ({ title = "All Flight Booking", buttonLabel = "All Booking", defaultStatus = "" }) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [status, setStatus] = useState(defaultStatus);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusSummary, setStatusSummary] = useState([]);
  const [currency, setCurrency] = useState("BDT");
  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const [pnrFilter, setPnrFilter] = useState("");
  const [airlinesFilter, setAirlinesFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [logoErrors, setLogoErrors] = useState({});
  const open = Boolean(anchorEl);

  const handleStatusClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setAnchorEl(null);
  };

  const handleStatusSelect = (statusValue) => {
    setStatus(statusValue);
    setPage(1);
    handleStatusClose();
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "bookingId") {
      setBookingIdFilter(value);
    } else if (filterType === "pnr") {
      setPnrFilter(value);
    } else if (filterType === "airlines") {
      setAirlinesFilter(value);
    }
    setPage(1);
  };

  const handleClearFilters = () => {
    setBookingIdFilter("");
    setPnrFilter("");
    setAirlinesFilter("");
    setPage(1);
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handleOpenDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setModalOpen(false);
    setSelectedBooking(null);
  };

  const fetchBookings = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      setError("Authentication token missing. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      if (bookingIdFilter && bookingIdFilter.trim()) {
        params.append("bookingId", bookingIdFilter.trim());
      }

      if (pnrFilter && pnrFilter.trim()) {
        params.append("pnr", pnrFilter.trim());
      }

      if (airlinesFilter && airlinesFilter.trim()) {
        params.append("airlines", airlinesFilter.trim());
      }

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.FLIGHT_BOOKING_LIST}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const bookingsData = Array.isArray(response?.data) 
        ? response.data 
        : (response?.data?.data || []);
      const paginationData = response?.data || {};
      const summaryData = response?.data?.statusSummary || [];
      
      const totalCount = paginationData.total || bookingsData.length || 0;
      const calculatedTotalPages = paginationData.totalPages 
        ? paginationData.totalPages 
        : Math.ceil(totalCount / limit) || 1;
      
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setTotalPages(calculatedTotalPages);
      setTotal(totalCount);
      setStatusSummary(Array.isArray(summaryData) ? summaryData : []);
      
      if (bookingsData.length > 0 && bookingsData[0]?.farecurrency) {
        setCurrency(bookingsData[0].farecurrency);
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load bookings.";
      setError(apiMessage);
      setBookings([]);
      setStatusSummary([]);
      console.error("Fetch bookings failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [status, page, limit, bookingIdFilter, pnrFilter, airlinesFilter, token]);

  // Keep internal filter in sync with route-provided default.
  useEffect(() => {
    if (defaultStatus !== undefined && defaultStatus !== status) {
      setStatus(defaultStatus);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultStatus]);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [status, page, limit, fetchBookings, token]);

  useEffect(() => {
    if (!token) return;
    
    const timeoutId = setTimeout(() => {
      fetchBookings();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [bookingIdFilter, pnrFilter, airlinesFilter, fetchBookings]);

  const selectedStatusLabel = STATUS_OPTIONS.find((opt) => opt.value === status)?.label || buttonLabel;
  const headerText = defaultStatus ? title : "Booking History";

  const getStatusCards = () => {
    const statusOrder = ["ticketed", "reissue", "refund", "void", "hold", "issueinprocess", "booked"];
    const summaryMap = new Map();
    statusSummary.forEach((item) => {
      summaryMap.set(item.status?.toLowerCase(), item);
    });
    
    return statusOrder.map((statusKey) => {
      const summaryItem = summaryMap.get(statusKey);
      const label = statusLabelMap[statusKey] || statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
      const amount = summaryItem?.totalAmount || 0;
      const formattedAmount = `${currency} ${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      
      return {
        label,
        amount: formattedAmount,
        count: summaryItem?.count || 0,
        status: statusKey,
      };
    });
  };

  const airlineCodeMap = {
    "SINGAPORE AIRLINES": "SQ",
    "SINGAPORE AIRLINE": "SQ",
    "SINGAPORE": "SQ",
    "EMIRATES": "EK",
    "CHINA SOUTHERN AIRLINES": "CZ",
    "CHINA SOUTHERN": "CZ",
    "QATAR AIRWAYS": "QR",
    "QATAR": "QR",
    "THAI AIRWAYS": "TG",
    "THAI": "TG",
    "MALAYSIA AIRLINES": "MH",
    "MALAYSIA": "MH",
    "AIR ASIA": "AK",
    "AIRASIA": "AK",
    "CATHAY PACIFIC": "CX",
    "CATHAY": "CX",
    "JAPAN AIRLINES": "JL",
    "JAL": "JL",
    "ALL NIPPON AIRWAYS": "NH",
    "ANA": "NH",
    "OMAN AIR": "WY",
    "BIMAN BANGLADESH AIRLINES": "BG",
    "BIMAN": "BG",
    "SRILANKAN AIRLINES": "UL",
    "SRILANKAN": "UL",
    "SAUDI ARABIAN AIRLINES": "SV",
    "SAUDI ARABIAN": "SV",
    "FLYDUBAI": "FZ",
    "KUWAIT AIRWAYS": "KU",
    "AIR INDIA": "AI",
    "ETHIOPIAN AIRLINES": "ET",
    "ETHIOPIAN": "ET",
    "HAHN AIR TECHNOLOGIES": "HR",
    "HAHN AIR": "HR",
  };

  const getCarrierCodeFromName = (airlineName) => {
    if (!airlineName) return "";
    const upperName = airlineName.toUpperCase().trim();
    return airlineCodeMap[upperName] || "";
  };

  const getAirlineLogoUrl = (airlineName) => {
    const code = getCarrierCodeFromName(airlineName);
    if (!code) return "";
    return `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${code}.png`;
  };

  const mapBookingToTableRow = (booking) => {
    const firstTraveller = booking?.travellers?.[0] || {};
    const customerName = firstTraveller.firstName && firstTraveller.lastName
      ? `${firstTraveller.firstName} ${firstTraveller.lastName}`
      : "-";
    
    const route = booking?.godeparture && booking?.goarrival
      ? `${booking.godeparture} → ${booking.goarrival}`
      : "-";
    
    const tripType = booking?.triptype 
      ? booking.triptype.charAt(0).toUpperCase() + booking.triptype.slice(1)
      : "-";
    
    const pnr = booking?.gdsPNR || booking?.airlinePNR || "-";
    
    const bookingTime = booking?.bookingDateTime
      ? new Date(booking.bookingDateTime).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";
    
    const lastTicketTime = booking?.lastTicketTime
      ? new Date(booking.lastTicketTime).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";
    
    const grossFare = booking?.netPrice || 0;
    const ticketFare = booking?.agentFare || 0;
    const grossFareNum = parseFloat(grossFare) || 0;
    const ticketFareNum = parseFloat(ticketFare) || 0;
    const dueAmount = 0;
    const currencyCode = booking?.farecurrency || currency || "BDT";
    
    const paxCount = booking?.travellers?.length || booking?.segment || 0;
    
    const formattedDueAmount = isNaN(dueAmount) ? "0.00" : Math.abs(dueAmount).toFixed(2);
    
    return {
      bookingId: booking?.bookingId || "-",
      customer: customerName,
      route: route,
      type: tripType,
      pnr: pnr,
      bookingTime: bookingTime,
      dueAmount: `${currencyCode} ${formattedDueAmount}`,
      grossFare: `${currencyCode} ${isNaN(grossFareNum) ? "0.00" : grossFareNum.toFixed(2)}`,
      ticketFare: `${currencyCode} ${isNaN(ticketFareNum) ? "0.00" : ticketFareNum.toFixed(2)}`,
      pax: paxCount,
      airline: booking?.careerName || booking?.career || "-",
      carrierCode: booking?.careerCode || booking?.career || booking?.careerName?.substring(0, 2).toUpperCase() || "",
      flightDate: booking?.godepartureDate || "-",
      lastTicketTime: lastTicketTime,
      status: booking?.status || "-",
    };
  };

  const handleBookingIdClick = (bookingId) => {
    if (bookingId && bookingId !== "-") {
      const adminEmail = user?.email || "";
      navigate("/dashboard/bookingqueuedetails", {
        state: {
          bookingId,
          email: adminEmail,
        },
      });
    }
  };

  const getStatusColors = (statusValue) => {
    if (!statusValue || statusValue === "-") {
      return { bg: "#F3F4F6", color: "#6B7280" };
    }

    const statusLower = statusValue.toLowerCase().trim();
    
    if (statusLower.includes("expired") || statusLower === "booking expired") {
      return { bg: "#000000", color: "#FFFFFF" };
    }
    if (statusLower.includes("cancelled") || statusLower === "booking cancelled" || statusLower === "cancelled") {
      return { bg: "#FEF3C7", color: "#92400E" };
    }
    if (statusLower.includes("ticketed") || statusLower === "ticketed") {
      return { bg: "#10B981", color: "#FFFFFF" };
    }
    if (statusLower.includes("reissue") && statusLower.includes("completed")) {
      return { bg: "#84CC16", color: "#FFFFFF" };
    }
    if (statusLower.includes("refund") && statusLower.includes("expired")) {
      return { bg: "#E9D5FF", color: "#6B21A8" };
    }
    if (statusLower.includes("reissue")) {
      return { bg: "#DBEAFE", color: "#1E40AF" };
    }
    if (statusLower.includes("refund")) {
      return { bg: "#FEE2E2", color: "#991B1B" };
    }
    if (statusLower.includes("void")) {
      return { bg: "#F3F4F6", color: "#4B5563" };
    }
    if (statusLower.includes("hold")) {
      return { bg: "#FEF3C7", color: "#92400E" };
    }
    if (statusLower.includes("booked")) {
      return { bg: "#DBEAFE", color: "#1E40AF" };
    }
    if (statusLower.includes("issue") || statusLower.includes("process")) {
      return { bg: "#FDE68A", color: "#78350F" };
    }

    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const renderCell = (columnKey, value, bookingId = null, carrierCode = null, fullBooking = null) => {
    if (columnKey === "bookingId") {
      return (
        <Typography
          onClick={() => handleBookingIdClick(bookingId || value)}
          sx={{
            fontSize: 10,
            fontWeight: 600,
            color: "#111827",
            backgroundColor: "#EEF2F6",
            borderRadius: 0.8,
            px: 0.75,
            py: 0.25,
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
            cursor: bookingId && bookingId !== "-" ? "pointer" : "default",
            "&:hover": {
              backgroundColor: bookingId && bookingId !== "-" ? "#D1D5DB" : "#EEF2F6",
            },
          }}
        >
          {value}
        </Typography>
      );
    }

    if (columnKey === "status") {
      const statusColors = getStatusColors(value);
      const capitalizeStatus = (statusText) => {
        if (!statusText || statusText === "-") return statusText;
        return statusText
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      };
      const capitalizedStatus = capitalizeStatus(value);
      
      return (
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 600,
            color: statusColors.color,
            backgroundColor: statusColors.bg,
            borderRadius: 0.8,
            px: 1,
            py: 0.3,
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textTransform: "capitalize",
          }}
        >
          {capitalizedStatus}
        </Typography>
      );
    }

    if (columnKey === "airline") {
      const airlineName = value || "";
      const airlineCode = carrierCode || getCarrierCodeFromName(airlineName);
      const logoUrl = airlineCode 
        ? `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${airlineCode.toUpperCase()}.png`
        : getAirlineLogoUrl(airlineName);
      const fallbackText = airlineCode || (airlineName ? airlineName.substring(0, 2).toUpperCase() : "-");
      const hasLogoError = logoErrors[airlineCode] || false;

      const capitalizeAirline = (name) => {
        if (!name || name === "-") return name;
        return name
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      };
      const capitalizedAirline = capitalizeAirline(airlineName);

      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            minWidth: 0,
            width: "100%",
          }}
        >
          {logoUrl && airlineCode && !hasLogoError ? (
            <Box
              component="img"
              src={logoUrl}
              alt={capitalizedAirline || "Airline"}
              onError={() => {
                if (airlineCode) {
                  setLogoErrors((prev) => ({ ...prev, [airlineCode]: true }));
                }
              }}
              sx={{
                width: 26,
                height: 16,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 26,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#E6EEF7",
                borderRadius: 0.5,
                fontSize: 9,
                fontWeight: 700,
                color: "#6B7A90",
                flexShrink: 0,
              }}
            >
              {fallbackText}
            </Box>
          )}
          <Typography
            sx={{
              fontSize: 10,
              color: "#111827",
              whiteSpace: "nowrap",
              textTransform: "capitalize",
              lineHeight: 1.2,
              minWidth: 0,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {capitalizedAirline}
          </Typography>
        </Box>
      );
    }

    return (
      <Typography
        sx={{
          fontSize: 10,
          color: "#111827",
          lineHeight: 1.25,
          minWidth: 0,
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 1 },
        py: 4,
      }}
    >
      <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            p: 1,
            borderRadius: 1,
            bgcolor: "var(--primary-dark, #024DAF)",
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 500, color: "#FFFFFF" }}>
            {headerText}
          </Typography>
          <Button
            variant="contained"
            onClick={() => fetchBookings()}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#FFFFFF",
              color: "var(--primary-dark, #0F2F56)",
              "&:hover": { bgcolor: "#EAEFF5" },
            }}
            startIcon={<RefreshIcon />}
          >
            Reload History
          </Button>
        </Box>

      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          border: "1px solid #E5E7EB",
          px: { xs: 2, md: 1.5 },
          py: { xs: 2.5, md: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 1.75,
        }}
      >
        
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", minWidth: 0 }}>
            {getStatusCards().map((card) => (
              <Box
                key={card.label}
                sx={{
                  backgroundColor: "#D9ECFF",
                  border: "1px solid #9EC6F1",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.8,
                  minWidth: 95,
                }}
              >
                <Typography fontSize={10.5} fontWeight={600} color="#0F2F56">
                  {card.label}
                </Typography>
                <Typography fontSize={10.5} color="#1F2A44" mt={0.2}>
                  {card.amount}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              flexShrink: 0,
            }}
          >
            <Button
              variant="contained"
              onClick={handleStatusClick}
              endIcon={
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                </Box>
              }
              sx={{
                textTransform: "none",
                fontSize: 12,
                fontWeight: 600,
                px: 2,
                height: 36,
                backgroundColor: "var(--primary-dark, #024DAF)",
                "&:hover": { backgroundColor: "rgba(2, 77, 175, 0.95)" },
              }}
            >
              {selectedStatusLabel}
            </Button>

            <Button
              variant="contained"
              startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
              onClick={handleToggleFilters}
              sx={{
                textTransform: "none",
                fontSize: 11.5,
                fontWeight: 600,
                height: 32,
                px: 1.5,
                backgroundColor: "var(--primary-dark, #024DAF)",
                "&:hover": { backgroundColor: "rgba(2, 77, 175, 0.95)" },
              }}
            >
              {showFilters ? "Hide Filter" : "More Filter"}
            </Button>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleStatusClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleStatusSelect(option.value)}
              selected={status === option.value}
              sx={{
                fontSize: 12,
                fontWeight: status === option.value ? 600 : 400,
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          {showFilters && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "#EAF2FF",
                  border: "1px solid var(--primary-dark, #024DAF)",
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Booking ID"
                  value={bookingIdFilter}
                  onChange={(e) => handleFilterChange("bookingId", e.target.value)}
                  sx={{
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 11.5,
                    color: "#1F2A44",
                    width: "100%",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "#EAF2FF",
                  border: "1px solid var(--primary-dark, #024DAF)",
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter PNR"
                  value={pnrFilter}
                  onChange={(e) => handleFilterChange("pnr", e.target.value)}
                  sx={{
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 11.5,
                    color: "#1F2A44",
                    width: "100%",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "#EAF2FF",
                  border: "1px solid var(--primary-dark, #024DAF)",
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Airlines"
                  value={airlinesFilter}
                  onChange={(e) => handleFilterChange("airlines", e.target.value)}
                  sx={{
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 11.5,
                    color: "#1F2A44",
                    width: "100%",
                  }}
                />
              </Box>
              {(bookingIdFilter || pnrFilter || airlinesFilter) && (
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{
                    textTransform: "none",
                    fontSize: 11.5,
                    fontWeight: 600,
                    height: 32,
                    px: 1.5,
                    borderColor: "#0F2F56",
                    color: "#0F2F56",
                    "&:hover": {
                      borderColor: "#0B2442",
                      backgroundColor: "#F0F4F8",
                    },
                  }}
                >
                  Reset
                </Button>
              )}
            </Box>
          )}
          
        </Box>

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 1.5,
            backgroundColor: "#FFFFFF",
            overflowX: "hidden",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%", minWidth: 0 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: tableGridTemplate,
                alignItems: "stretch",
                width: "100%",
                backgroundColor: "var(--primary-dark, #024DAF)",
              }}
            >
              {tableColumns?.map((column) => (
                <Box
                  key={column.key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.25,
                    py: 0.5,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
                    backgroundColor: "transparent",
                    minWidth: 0,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#FFFFFF",
                      lineHeight: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {column.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ color: "#0F2F56" }} />
              </Box>
            ) : error ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#d32f2f" }}>{error}</Typography>
              </Box>
            ) : bookings.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No bookings found</Typography>
              </Box>
            ) : (
              bookings.map((booking, index) => {
                const row = mapBookingToTableRow(booking);
                return (
                  <Box
                    key={`${booking.bookingId || booking.id || index}-${index}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: tableGridTemplate,
                      alignItems: "stretch",
                      width: "100%",
                    }}
                  >
                    {tableColumns.map((column) => {
                      const value = row[column.key] || "-";
                      const originalBookingId = booking?.bookingId || booking?.id || null;
                      const carrierCode = row.carrierCode || null;
                      return (
                        <Box
                          key={`${booking.bookingId || booking.id || index}-${column.key}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 1.25,
                            py: 0.65,
                            borderBottom: "1px solid #E5E7EB",
                            minWidth: 0,
                            overflow: "hidden",
                          }}
                        >
                          {renderCell(column.key, value, originalBookingId, carrierCode, booking)}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box
              onClick={() => page > 1 && setPage(page - 1)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: page > 1 ? "#FFFFFF" : "#9CA3AF",
                backgroundColor: page > 1 ? "var(--primary-dark, #024DAF)" : "#E5E7EB",
                cursor: page > 1 ? "pointer" : "not-allowed",
              }}
            >
              ‹
            </Box>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              const isActive = page === pageNum;
              return (
                <Box
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: isActive ? "#FFFFFF" : "#1F2A44",
                    backgroundColor: isActive ? "var(--primary-dark, #024DAF)" : "rgba(2, 77, 175, 0.08)",
                    cursor: "pointer",
                  }}
                >
                  {pageNum}
                </Box>
              );
            })}
            
            <Box
              onClick={() => page < totalPages && setPage(page + 1)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: page < totalPages ? "#FFFFFF" : "#9CA3AF",
                backgroundColor: page < totalPages ? "var(--primary-dark, #024DAF)" : "#E5E7EB",
                cursor: page < totalPages ? "pointer" : "not-allowed",
              }}
            >
              ›
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseDetailsModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "800px",
            maxHeight: "90vh",
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            outline: "none",
            overflowY: "auto",
          }}
        >
          <IconButton
            onClick={handleCloseDetailsModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {selectedBooking && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#0F172A" }}>
                Booking Details
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Booking ID</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedBooking.bookingId || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Status</Typography>
                    {(() => {
                      const statusColors = getStatusColors(selectedBooking.status);
                      const capitalizeStatus = (statusText) => {
                        if (!statusText || statusText === "-") return statusText;
                        return statusText
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(" ");
                      };
                      const capitalizedStatus = capitalizeStatus(selectedBooking.status);
                      return (
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: statusColors.color,
                            backgroundColor: statusColors.bg,
                            borderRadius: 0.8,
                            px: 1.5,
                            py: 0.5,
                            width: "fit-content",
                            textTransform: "capitalize",
                          }}
                        >
                          {capitalizedStatus}
                        </Typography>
                      );
                    })()}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>PNR</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedBooking.gdsPNR || selectedBooking.airlinePNR || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Trip Type</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedBooking.triptype ? selectedBooking.triptype.charAt(0).toUpperCase() + selectedBooking.triptype.slice(1) : "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Route</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedBooking.godeparture && selectedBooking.goarrival
                        ? `${selectedBooking.godeparture} → ${selectedBooking.goarrival}`
                        : "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Flight Date</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedBooking.godepartureDate || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Last Ticket Time</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedBooking.lastTicketTime
                        ? new Date(selectedBooking.lastTicketTime).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Base Fare</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedBooking.farecurrency || "BDT"} {selectedBooking.netPrice || "0.00"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Ticket Fare</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedBooking.farecurrency || "BDT"} {selectedBooking.agentFare || "0.00"}
                    </Typography>
                  </Box>
                </Box>

                {selectedBooking.travellers && selectedBooking.travellers.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #E5E7EB" }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: "#0F172A" }}>
                      Travellers Information
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {selectedBooking.travellers.map((traveller, index) => (
                        <Box key={index} sx={{ p: 1.5, bgcolor: "#F8FAFC", borderRadius: 1 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                            {traveller.firstName} {traveller.lastName}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                            {traveller.passportNumber && `Passport: ${traveller.passportNumber}`}
                            {traveller.dateOfBirth && ` | DOB: ${traveller.dateOfBirth}`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AllFlightBooking;
