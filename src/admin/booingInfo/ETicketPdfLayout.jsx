import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  formatDisplayDuration,
  resolveBaggageAllowance,
  resolveBookingBackSegments,
  resolveBookingGoSegments,
  resolveBookingDisplayStatus,
  resolveSegmentCarrierCode,
  isRoundTripBooking,
} from "../flightItineraryUtils";
import { getStatusStyle } from "./bookingQueDetailsTheme";
import { getAirlineLogoProxyUrl, loadAirlineLogoFromCandidates, loadAirlineLogoSource } from "../flightAmenityUtils";
import AirlineLogoImage from "../AirlineLogoImage";
import { resolveAgentPdfHeader } from "../../utils/resolveAgentPdfInfo";
import { parsePaxType, getPaxCountForFareRow, getTotalTravellerCount, sortTravellersByPaxType } from "./paxTypeUtils";
import {
  isAgentInvoiceDocument,
  isCustomerInvoiceDocument,
  resolveAgentCommissionAmount,
  resolveInvoiceAitVat,
  resolveInvoiceGrandTotal,
  resolveRawAitVat,
  resolveTravellerTitle,
} from "./bookingQueUtils";

const FLIGHT_ICON_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

const FlightPathDivider = ({ color = "#002D85" }) => (
  <Box
    component="svg"
    viewBox="0 0 140 18"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden
    sx={{ width: "100%", height: 18, minWidth: 72, display: "block" }}
  >
    <line x1="0" y1="9" x2="52" y2="9" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
    <g transform="translate(70 9) rotate(90) translate(-12 -12) scale(0.52)">
      <path fill={color} d={FLIGHT_ICON_PATH} />
    </g>
    <line x1="88" y1="9" x2="140" y2="9" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" />
  </Box>
);

const formatLayoverDurationLabel = (duration) => {
  if (!duration) return "";
  return String(duration).replace(/(\d+h)\s+(\d+m)/i, "$1:$2");
};

const buildLayoverLabel = (duration, city, isPlaneChange = true) => {
  const formatted = formatLayoverDurationLabel(duration);
  if (!formatted) return "";
  const place = String(city || "").trim();
  const prefix = isPlaneChange ? "Change of plane" : "Layover";
  return place ? `${prefix} ${formatted} Layover in ${place}` : `${prefix} ${formatted}`;
};

const PDF = {
  primary: "#002D85",
  secondary: "#024DAF",
  airlineBlue: "#0066CC",
  secondaryLight: "#E8F0FB",
  lightBar: "#F0F5FF",
  legBorder: "#DCE4EE",
  pageBg: "#ECECEC",
  slate: "#4A4A4A",
  label: "#6B7280",
  muted: "#94A3B8",
  border: "#D9DEE5",
  surface: "#F8FAFC",
  success: "#28A745",
  white: "#FFFFFF",
};

const pdfIconSx = (size, color = PDF.primary) => ({
  fontSize: size,
  width: size,
  height: size,
  color,
  fill: color,
});

const LayoverDivider = ({ label, lineColor = "#C5CED8", textColor = "#4A5568" }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      my: 0.7,
    }}
  >
    <Box sx={{ flex: 1, height: 0, borderTop: `1px dashed ${lineColor}` }} />
    <Box
      sx={{
        mx: 0.65,
        px: 1.1,
        py: 0.4,
        border: `1px dashed ${lineColor}`,
        borderRadius: "999px",
        bgcolor: PDF.white,
        flexShrink: 0,
        maxWidth: "96%",
      }}
    >
      <Typography
        sx={{
          fontSize: 7.5,
          color: textColor,
          fontWeight: 500,
          lineHeight: 1.35,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
    <Box sx={{ flex: 1, height: 0, borderTop: `1px dashed ${lineColor}` }} />
  </Box>
);

const getAgencyInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "IT";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const SectionTitle = ({ icon, children }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.55, mb: 0.75 }}>
    <Box
      sx={{
        color: PDF.primary,
        fill: PDF.primary,
        display: "flex",
        alignItems: "center",
        "& svg": pdfIconSx(14),
      }}
    >
      {icon}
    </Box>
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 800,
        color: PDF.primary,
        letterSpacing: 0.45,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Typography>
    <Box
      sx={{
        flex: 1,
        borderBottom: `1px dashed #B8C9E0`,
        ml: 0.35,
        minWidth: 20,
        mb: 0.15,
      }}
    />
  </Box>
);

const SectionTitleBar = ({ icon, children }) => (
  <Box
    sx={{
      bgcolor: PDF.lightBar,
      borderBottom: `1px solid ${PDF.border}`,
      px: 1.1,
      py: 0.7,
      display: "flex",
      alignItems: "center",
      gap: 0.55,
    }}
  >
    <Box
      sx={{
        color: PDF.primary,
        fill: PDF.primary,
        display: "flex",
        alignItems: "center",
        "& svg": pdfIconSx(14),
      }}
    >
      {icon}
    </Box>
    <Typography
      sx={{
        fontSize: 9.5,
        fontWeight: 800,
        color: PDF.primary,
        letterSpacing: 0.4,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Typography>
  </Box>
);

const sectionCardSx = {
  border: `1px solid ${PDF.border}`,
  borderRadius: "8px",
  overflow: "hidden",
  bgcolor: PDF.white,
};

const flightLegBoxSx = {
  bgcolor: PDF.white,
  borderRadius: "10px",
  px: 1.2,
  py: 1,
  mb: 0.9,
};

const metaCardIconSx = {
  ...pdfIconSx(13),
  display: "block",
};

const MetaInfoBox = ({ icon, label, value, sub, valueColor }) => (
  <Box
    sx={{
      bgcolor: PDF.white,
      border: `1px solid ${PDF.border}`,
      borderRadius: "6px",
      px: 1.05,
      py: 0.85,
      minWidth: 110,
      minHeight: 54,
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    }}
  >
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.45,
        mb: 0.35,
        minHeight: 14,
      }}
    >
      <Box
        sx={{
          width: 14,
          height: 14,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 0,
          "& svg": metaCardIconSx,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 6.5,
          color: PDF.primary,
          textTransform: "uppercase",
          letterSpacing: 0.35,
          fontWeight: 700,
          lineHeight: 1,
          pt: "0.5px",
        }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      sx={{
        fontSize: 9.5,
        fontWeight: 800,
        color: valueColor || PDF.primary,
        lineHeight: 1.25,
        wordBreak: "break-word",
        width: "100%",
      }}
    >
      {value}
    </Typography>
    {sub ? (
      <Typography sx={{ fontSize: 6.5, color: PDF.label, mt: 0.28, lineHeight: 1.25, width: "100%" }}>
        {sub}
      </Typography>
    ) : null}
  </Box>
);

const tableSx = {
  border: `1px solid ${PDF.border}`,
  borderRadius: "8px",
  overflow: "hidden",
  borderCollapse: "separate",
  "& .MuiTableCell-root": {
    borderColor: PDF.border,
    py: 0.55,
    px: 0.85,
    fontSize: 8.5,
  },
};

const passengerTableSx = {
  ...tableSx,
  "& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root:first-of-type": {
    borderTopLeftRadius: "8px",
  },
  "& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root:last-of-type": {
    borderTopRightRadius: "8px",
  },
  "& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-root": {
    borderBottom: "none",
  },
};

const fareTableSx = {
  ...passengerTableSx,
  "& .MuiTableHead-root .MuiTableCell-root": {
    textTransform: "uppercase",
    fontSize: 7.5,
    letterSpacing: 0.2,
  },
};

const tableHeadSx = {
  backgroundColor: PDF.primary,
  "& .MuiTableCell-root": {
    color: PDF.white,
    fontWeight: 700,
    fontSize: 8,
    py: 0.6,
    borderBottom: "none",
    textTransform: "none",
  },
};
const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "N/A";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "N/A";
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    return `${formatDate(dateString)}, ${formatTime(dateString)}`;
  } catch {
    return "N/A";
  }
};

const getTitle = (traveller) => resolveTravellerTitle(traveller);

const formatNumber = (num) => {
  if (num === undefined || num === null) return "0.00";
  const n = parseFloat(num);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getPaxTypeLabel = (value) => {
  const { type } = parsePaxType(value);
  if (type === "Adult") return "ADULT";
  if (type === "Child") return "CHILD";
  if (type === "Infant") return "INFANT";
  const raw = String(value || "").trim();
  return raw ? raw.toUpperCase() : "ADULT";
};

const cityFromLocation = (location) => {
  if (!location) return "";
  return String(location).split(",")[0].trim();
};

const formatCabinClass = (cabin) => {
  if (!cabin) return "Economy Class";
  const label = String(cabin).replace(/_/g, " ").toLowerCase();
  return label.includes("class") ? label.replace(/\b\w/g, (c) => c.toUpperCase()) : `${label.charAt(0).toUpperCase()}${label.slice(1)} Class`;
};

const formatDateLongWithDay = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    const weekday = d.toLocaleString("en-US", { weekday: "short" });
    const day = d.getDate();
    const month = d.toLocaleString("en-US", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${weekday} ${day} ${month} ${year}, ${time}`;
  } catch {
    return "N/A";
  }
};

const resolveTransitDuration = (transit) => {
  if (!transit) return "";
  if (typeof transit === "string") return transit;
  if (typeof transit === "object") return transit.duration || transit.transit1 || "";
  return "";
};

const loadImageAsDataUrl = (url) => loadAirlineLogoSource(url);

const waitForDomImages = (root, timeoutMs = 12000) =>
  new Promise((resolve) => {
    if (!root) {
      resolve();
      return;
    }

    const images = Array.from(root.querySelectorAll("img[src]"));
    if (images.length === 0) {
      resolve();
      return;
    }

    let remaining = images.length;
    let settled = false;

    const finish = () => {
      if (settled) return;
      remaining -= 1;
      if (remaining <= 0) {
        settled = true;
        resolve();
      }
    };

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve();
      }
    }, timeoutMs);

    images.forEach((img) => {
      if (img.complete && img.naturalHeight > 0) {
        finish();
        return;
      }

      img.addEventListener("load", finish, { once: true });
      img.addEventListener("error", finish, { once: true });
    });
  });

const ETicketPdfLayout = ({
  data,
  showFareSummary = true,
  caabInfo = null,
  documentType = "e-ticket",
  agentInfo = null,
  onAssetsReady,
  assetLoadKey = 0,
}) => {
  const [logoDataUrls, setLogoDataUrls] = useState({});
  const [airlineLogosReady, setAirlineLogosReady] = useState(false);
  const [agentLogoDataUrl, setAgentLogoDataUrl] = useState(null);
  const [agentLogoVisible, setAgentLogoVisible] = useState(true);
  const [agentLogoReady, setAgentLogoReady] = useState(false);
  const layoutRef = useRef(null);
  const currency = data?.farecurrency || "BDT";
  const isAgentInvoiceDoc = isAgentInvoiceDocument(documentType);
  const isCustomerInvoiceDoc = isCustomerInvoiceDocument(documentType);
  const headerInfo = resolveAgentPdfHeader(agentInfo, caabInfo, data, {
    includeDefaultCaab: isAgentInvoiceDoc,
  });
  const { agencyName, civilAviationNumber, companyAddress, contactPhone, logoUrl: agentLogoUrl, supportEmail } =
    headerInfo;
  const pricebreakdown = Array.isArray(data?.pricebreakdown) ? data.pricebreakdown : [];
  const rawTravellers = Array.isArray(data?.travellers) ? data.travellers : [];
  const bookingDisplayStatus = resolveBookingDisplayStatus(data);

  const pnrValues = new Set(
    [data?.airlinePNR, data?.gdsPNR]
      .map((v) => String(v || "").trim().toUpperCase())
      .filter(Boolean)
  );

  const getValidEticketNo = (traveller) => {
    const tickets = traveller?.Ticket;
    if (!Array.isArray(tickets) || tickets.length === 0) return "";
    const nos = tickets
      .map((t) => String(t?.TicketNo || "").trim())
      .filter(Boolean)
      .filter((no) => !pnrValues.has(no.toUpperCase()));
    return nos.length > 0 ? nos.join(", ") : "";
  };

  const hasEticketNumbers = rawTravellers.some((t) => Boolean(getValidEticketNo(t)));
  const hasPassportNumbers = rawTravellers.some((t) =>
    Boolean(String(t?.passportNumber || t?.passportNo || "").trim()),
  );
  const showPassengerIdColumn = hasEticketNumbers || hasPassportNumbers;
  const passengerIdColumnLabel = hasEticketNumbers ? "E-Ticket No" : "Passport Number";
  const passengerTableColumns = [
    "Passenger Name",
    "Type",
    ...(showPassengerIdColumn ? [passengerIdColumnLabel] : []),
    "Check-in Baggage",
    "Cabin Baggage",
  ];

  const travellers = sortTravellersByPaxType(rawTravellers, pricebreakdown).map(({ traveller: t, paxType }) => {
    const priceRow = pricebreakdown[0] || {};
    const firstSegment = resolveBookingGoSegments(data)[0] || {};
    const baggage = resolveBaggageAllowance(firstSegment, priceRow, data);
    const eticketNo = getValidEticketNo(t);
    const passportNo = String(t?.passportNumber || t?.passportNo || "").trim();
    return {
      name: `${getTitle(t)} ${(t.firstName || "").trim()} ${(t.lastName || "").trim()}`.trim() || "N/A",
      type: getPaxTypeLabel(paxType),
      idValue: eticketNo || passportNo || "",
      checkBag: baggage.checkin,
      cabinBag: baggage.cabin,
    };
  });

  const buildSegmentsForPdf = (segmentsArray, legMeta = {}) => {
    if (!Array.isArray(segmentsArray)) return [];
    const stopLabel =
      segmentsArray.length <= 1
        ? "Non Stop"
        : `${segmentsArray.length - 1} Stop${segmentsArray.length > 2 ? "s" : ""}`;

    return segmentsArray.map((seg, index, arr) => {
      const carrierCode = resolveSegmentCarrierCode(seg, data);
      const flightNum = seg.marketingflight || seg.marketingFlight || "";
      const departCode = seg.departure || "N/A";
      const arriveCode = seg.arrival || "N/A";
      const departCity = cityFromLocation(seg.departureLocation) || departCode;
      const arriveCity = cityFromLocation(seg.arrivalLocation) || arriveCode;
      const airlineName =
        seg.marketingcareerName || seg.marketingCarrierName || data?.careerName || "Airline";
      const aircraft = seg.aircraft || "";
      const transitRaw = resolveTransitDuration(seg.transit);
      const connectionLayover = formatDisplayDuration(transitRaw);
      const nextSeg = arr[index + 1];
      const nextFlightNum = nextSeg?.marketingflight || nextSeg?.marketingFlight || "";
      const isPlaneChange =
        Boolean(nextSeg) &&
        (resolveSegmentCarrierCode(nextSeg, data) !== carrierCode || nextFlightNum !== flightNum);

      return {
        key: `${legMeta.legKey || "leg"}-${index}-${departCode}-${arriveCode}`,
        carrierCode,
        logoUrl: getAirlineLogoProxyUrl(carrierCode),
        route: `${departCode} - ${arriveCode}`,
        date: formatDate(seg.departureTime),
        stopLabel,
        cabin: formatCabinClass(seg.class || seg.cabin || data?.cabinClass),
        airlineDetail: [airlineName, `${carrierCode} - ${flightNum}`, aircraft].filter(Boolean).join(" | "),
        departCityLabel: `${departCity} (${departCode})`,
        arriveCityLabel: `${arriveCity} (${arriveCode})`,
        departDateTime: formatDateLongWithDay(seg.departureTime),
        arriveDateTime: formatDateLongWithDay(seg.arrivalTime),
        departAirport: (seg.departureAirport || seg.departureLocation || "").trim(),
        arriveAirport: (seg.arrivalAirport || seg.arrivalLocation || "").trim(),
        departTerminal: seg.departureTerminal ? `Terminal: ${seg.departureTerminal}` : "",
        arriveTerminal: seg.arrivalTerminal ? `Terminal: ${seg.arrivalTerminal}` : "",
        duration: formatDisplayDuration(seg.flightduration || seg.duration) || "N/A",
        legLabel: legMeta.legLabel || "",
        connectionLayover: index < arr.length - 1 && connectionLayover ? connectionLayover : "",
        connectionLayoverLabel:
          index < arr.length - 1 && connectionLayover
            ? buildLayoverLabel(connectionLayover, arriveCity, isPlaneChange)
            : "",
        isLastInLeg: index === arr.length - 1,
      };
    });
  };

  const goSegments = resolveBookingGoSegments(data);
  const backSegments = resolveBookingBackSegments(data);
  const isRoundTrip = isRoundTripBooking(data);
  const segmentGroups = [
    { legKey: "go", legLabel: isRoundTrip ? "Outbound" : "", segments: buildSegmentsForPdf(goSegments, { legKey: "go", legLabel: isRoundTrip ? "Outbound" : "" }) },
  ];
  if (backSegments.length > 0) {
    segmentGroups.push({
      legKey: "back",
      legLabel: "Return",
      segments: buildSegmentsForPdf(backSegments, { legKey: "back", legLabel: "Return" }),
    });
  }
  const segments = segmentGroups.flatMap((g) => g.segments);

  const carrierCodes = useMemo(
    () => [...new Set(segments.map((s) => s.carrierCode).filter(Boolean))],
    [segments]
  );

  useEffect(() => {
    setLogoDataUrls({});
    setAirlineLogosReady(false);
    setAgentLogoDataUrl(null);
    setAgentLogoVisible(true);
    setAgentLogoReady(!agentLogoUrl);
  }, [assetLoadKey, agentLogoUrl]);

  useEffect(() => {
    let cancelled = false;

    const loadOne = async (code) => {
      const dataUrl = await loadAirlineLogoFromCandidates(code);
      return dataUrl ? { code, dataUrl } : null;
    };

    if (carrierCodes.length === 0) {
      setLogoDataUrls({});
      setAirlineLogosReady(true);
      return undefined;
    }

    Promise.all(carrierCodes.map(loadOne)).then((results) => {
      if (cancelled) return;
      const next = {};
      results.filter(Boolean).forEach((r) => {
        next[r.code.toUpperCase()] = r.dataUrl;
      });
      setLogoDataUrls(next);
      setAirlineLogosReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [carrierCodes.join(","), assetLoadKey]);

  useEffect(() => {
    if (!onAssetsReady || !airlineLogosReady || !agentLogoReady) return undefined;

    let cancelled = false;

    const notifyReady = async () => {
      await waitForDomImages(layoutRef.current);
      if (!cancelled) {
        requestAnimationFrame(() => {
          if (!cancelled) onAssetsReady();
        });
      }
    };

    const frameId = requestAnimationFrame(() => {
      notifyReady();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [
    assetLoadKey,
    onAssetsReady,
    airlineLogosReady,
    agentLogoReady,
    logoDataUrls,
    agentLogoDataUrl,
    carrierCodes.join(","),
  ]);

  useEffect(() => {
    setAgentLogoVisible(true);
    setAgentLogoDataUrl(null);

    if (!agentLogoUrl) {
      setAgentLogoReady(true);
      return undefined;
    }

    let cancelled = false;
    setAgentLogoReady(false);

    loadImageAsDataUrl(agentLogoUrl).then((dataUrl) => {
      if (cancelled) return;
      if (dataUrl) setAgentLogoDataUrl(dataUrl);
      setAgentLogoReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [agentLogoUrl, assetLoadKey]);

  const totalBaseFare = pricebreakdown.reduce((sum, item) => {
    const paxCount = getPaxCountForFareRow(item, rawTravellers, pricebreakdown);
    return sum + parseFloat(item.BaseFare || 0) * paxCount;
  }, 0);
  const totalTax = pricebreakdown.reduce((sum, item) => {
    const paxCount = getPaxCountForFareRow(item, rawTravellers, pricebreakdown);
    return sum + parseFloat(item.Tax || 0) * paxCount;
  }, 0);
  const totalTravelerCount = getTotalTravellerCount(rawTravellers, pricebreakdown);
  const rawAitVat = resolveRawAitVat(data);
  const displayAitVat = resolveInvoiceAitVat(data, documentType);
  const extraBaggage = parseFloat(data?.extraBaggage ?? data?.extraBaggageMealSeat ?? 0);
  const bundleCost = parseFloat(data?.bundleCost ?? 0);
  const commissionAmount = isAgentInvoiceDoc ? resolveAgentCommissionAmount(data) : 0;
  const fareSubtotal = totalBaseFare + totalTax;
  const grandTotal = resolveInvoiceGrandTotal(
    data,
    documentType,
    fareSubtotal + rawAitVat + extraBaggage + bundleCost,
  );

  const documentTitle = isAgentInvoiceDoc
      ? "Agent Invoice"
      : isCustomerInvoiceDoc
        ? documentType.includes("booking")
          ? "Booking Invoice"
          : "Customer Invoice"
        : "E-Ticket";

  const bookingDate = formatDateTime(
    data?.createdAt ?? data?.created_at ?? data?.lastTicketTime ?? data?.updatedAt
  );

  const rawStatus = bookingDisplayStatus;
  const bookingStatus = rawStatus === "CANCELED" ? "CANCELLED" : rawStatus;
  const statusStyle = getStatusStyle(bookingStatus);
  const displayStatus =
    bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1).toLowerCase();

  const showUnpaidWatermark = ["HOLD", "BOOKED", "CONFIRMED"].includes(
    String(data?.status || "").toUpperCase()
  ) && bookingStatus !== "TICKETED";

  const renderLegHeader = (group) => {
    const first = group.segments[0];
    if (!first) return null;

    return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          gap: 0.7,
          mb: 0.7,
            flexWrap: "wrap",
          bgcolor: PDF.lightBar,
          borderRadius: "6px",
          px: 0.85,
          py: 0.55,
        }}
      >
        {group.legLabel ? (
          <Box
            sx={{
              bgcolor: PDF.primary,
              color: PDF.white,
              borderRadius: "999px",
              px: 0.95,
              py: 0.32,
              fontSize: 7,
              fontWeight: 800,
              letterSpacing: 0.45,
              textTransform: "uppercase",
              flexShrink: 0,
              lineHeight: 1.1,
            }}
          >
            {group.legLabel}
          </Box>
        ) : null}
        <Typography sx={{ fontSize: 8.5, fontWeight: 700, color: PDF.primary, lineHeight: 1.3 }}>
          {first.route} | {first.date} | {first.stopLabel} | {first.cabin}
          </Typography>
        </Box>
    );
  };

  const renderDetailLine = (icon, text, alignRight = false) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 0.35,
        mt: 0.22,
        justifyContent: alignRight ? "flex-end" : "flex-start",
      }}
    >
      <Box
        sx={{
          color: PDF.primary,
          fill: PDF.primary,
          display: "flex",
          alignItems: "center",
          mt: 0.05,
          flexShrink: 0,
          "& svg": pdfIconSx(10),
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 7.5,
          color: PDF.primary,
          lineHeight: 1.35,
          textAlign: alignRight ? "right" : "left",
          fontWeight: 500,
        }}
      >
        {text}
      </Typography>
    </Box>
  );

  const renderFlightSegment = (s, segmentIndex = 0) => {
    const carrierCode = String(s.carrierCode || "").toUpperCase();
    const preloadedLogo = logoDataUrls[carrierCode] || "";

    return (
      <Box
        key={s.key}
        sx={{
          pt: segmentIndex > 0 ? 0.15 : 0,
          mt: segmentIndex > 0 ? 0.15 : 0,
        }}
      >
        <Typography
          sx={{
            fontSize: 8.5,
            fontWeight: 800,
            color: PDF.primary,
            textTransform: "uppercase",
            letterSpacing: 0.15,
            mb: 0.65,
            lineHeight: 1.3,
          }}
        >
          {s.airlineDetail}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.75 }}>
          <Box sx={{ display: "flex", gap: 0.75, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: `1.5px solid ${PDF.primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
                bgcolor: PDF.white,
              }}
            >
              <AirlineLogoImage
                carrierCode={carrierCode}
                preloadedSrc={preloadedLogo}
                alt={s.airlineDetail}
                size={32}
                fallbackIconSize={19}
                codeFallbackSx={{ color: PDF.primary }}
                iconSx={pdfIconSx(19)}
              />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: PDF.primary, lineHeight: 1.2 }}>
                {s.departCityLabel}
              </Typography>
              {renderDetailLine(<EventOutlinedIcon sx={pdfIconSx(10)} />, s.departDateTime)}
              {s.departAirport
                ? renderDetailLine(<LocationOnOutlinedIcon sx={pdfIconSx(10)} />, s.departAirport)
                : null}
              {s.departTerminal
                ? renderDetailLine(<VisibilityOutlinedIcon sx={pdfIconSx(10)} />, s.departTerminal)
                : null}
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              px: 0.5,
              flexShrink: 0,
              minWidth: 96,
              pt: 0.45,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: PDF.primary, mb: 0.2, lineHeight: 1 }}>
              {s.duration}
            </Typography>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <FlightPathDivider color={PDF.primary} />
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, textAlign: "right" }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 800, color: PDF.primary, lineHeight: 1.2 }}>
              {s.arriveCityLabel}
            </Typography>
            {renderDetailLine(<EventOutlinedIcon sx={pdfIconSx(10)} />, s.arriveDateTime, true)}
            {s.arriveAirport
              ? renderDetailLine(<LocationOnOutlinedIcon sx={pdfIconSx(10)} />, s.arriveAirport, true)
              : null}
            {s.arriveTerminal
              ? renderDetailLine(<VisibilityOutlinedIcon sx={pdfIconSx(10)} />, s.arriveTerminal, true)
              : null}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderLegGroup = (group) => (
    <Box key={group.legKey} sx={flightLegBoxSx}>
      {renderLegHeader(group)}
      {group.segments.map((s, idx) => (
        <React.Fragment key={s.key}>
          {renderFlightSegment(s, idx)}
          {s.connectionLayoverLabel ? <LayoverDivider label={s.connectionLayoverLabel} /> : null}
        </React.Fragment>
      ))}
    </Box>
  );

  const reminders = [
    { title: "Flight Status", text: "Before your flight, check your flight status on the airline website using your PNR or call airline support." },
    { title: "Government ID", text: "Carry a government-issued photo ID with your e-ticket for verification during check-in." },
    { title: "Online Check-in", text: "Online check-in may be available on the airline website before departure." },
    { title: "Baggage Drop", text: "Arrive at the check-in baggage drop counter before it closes for document verification." },
    { title: "Emergency Exit", text: "Passengers in emergency exit rows must meet airline safety requirements." },
    {
      title: "Airport Arrival",
      text: "Please arrive at the airport at least 3 hours before departure to allow sufficient time for check-in, immigration, and security procedures.",
    },
  ];

  const agentLogoSrc = agentLogoVisible
    ? agentLogoDataUrl || agentLogoUrl
    : null;

  return (
    <Box
      ref={layoutRef}
      sx={{
        width: 720,
        margin: "0 auto",
        bgcolor: PDF.pageBg,
        p: 1.25,
        fontFamily: "'Inter', 'Segoe UI', Roboto, Tahoma, Geneva, Verdana, sans-serif",
        fontSize: 9,
      }}
    >
      <Box
        sx={{
          bgcolor: PDF.white,
        color: PDF.primary,
        border: `1px solid ${PDF.border}`,
          borderRadius: "10px",
        overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            pt: 1.5,
            pb: 1,
            borderBottom: `1px solid ${PDF.border}`,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.75 }}>
            <Box sx={{ display: "flex", gap: 1, flex: 1.15, minWidth: 0 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  bgcolor: PDF.primary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
              {agentLogoSrc ? (
                <Box
                  component="img"
                  src={agentLogoSrc}
                  alt={agencyName}
                  loading="eager"
                  decoding="sync"
                  onError={() => setAgentLogoVisible(false)}
                    sx={{ width: 38, height: 38, objectFit: "contain", display: "block" }}
                />
              ) : (
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: PDF.white, lineHeight: 1 }}>
                  {getAgencyInitials(agencyName)}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: PDF.primary,
                    lineHeight: 1.25,
                    letterSpacing: 0.1,
                  }}
                >
                  {agencyName}
                </Typography>
              {civilAviationNumber ? (
                  <Typography sx={{ fontSize: 7.5, color: PDF.muted, mt: 0.2 }}>
                    CAAB No: {civilAviationNumber}
                  </Typography>
              ) : null}
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, mt: 0.4 }}>
                  <EmailOutlinedIcon sx={pdfIconSx(11)} />
                  <Typography sx={{ fontSize: 8, color: PDF.primary, lineHeight: 1.35 }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>Ticket Support:</Box> {supportEmail}
                  </Typography>
                </Box>
              {companyAddress ? (
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.4, mt: 0.25 }}>
                    <LocationOnOutlinedIcon sx={{ ...pdfIconSx(11), mt: 0.05 }} />
                    <Typography sx={{ fontSize: 8, color: PDF.primary, lineHeight: 1.35 }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>Address:</Box> {companyAddress}
                </Typography>
                  </Box>
              ) : null}
            </Box>
          </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.6,
                flexShrink: 0,
                bgcolor: PDF.primary,
                borderRadius: "8px",
                px: 1.1,
                py: 0.75,
                alignSelf: "center",
              }}
            >
              <SupportAgentOutlinedIcon sx={pdfIconSx(22, PDF.white)} />
            <Box>
                <Typography sx={{ fontSize: 7, color: "rgba(255,255,255,0.92)", lineHeight: 1.2 }}>
                  Emergency Assistance
                </Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: PDF.white, lineHeight: 1.2 }}>
                  {contactPhone}
                </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

        <Box sx={{ px: 2, pt: 1.15, pb: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              mb: 0.95,
            }}
          >
            <Box sx={{ py: 0.35, pr: 0.5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: PDF.primary, letterSpacing: 0.2, lineHeight: 1.1 }}>
                {documentTitle.toUpperCase()}
              </Typography>
              <Typography sx={{ fontSize: 8.5, color: PDF.label, mt: 0.3, fontWeight: 500 }}>
                Passenger Information
              </Typography>
          </Box>
            <Box
              sx={{
                display: "flex",
                gap: 0.6,
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "stretch",
                maxWidth: 410,
              }}
            >
              <MetaInfoBox
                icon={<FlightOutlinedIcon sx={pdfIconSx(13)} />}
                label="Airline PNR"
                value={data?.airlinePNR ?? data?.gdsPNR ?? "N/A"}
              />
              <MetaInfoBox
                icon={<AssignmentOutlinedIcon sx={pdfIconSx(13)} />}
                label="Booking ID"
                value={data?.bookingId ?? "N/A"}
              />
              <MetaInfoBox
                icon={<CheckCircleOutlineIcon sx={pdfIconSx(13)} />}
                label="Status"
                value={displayStatus}
                sub={bookingDate}
                valueColor={statusStyle.color || PDF.success}
              />
          </Box>
        </Box>

          <Table size="small" sx={passengerTableSx}>
          <TableHead>
              <TableRow sx={tableHeadSx}>
                {passengerTableColumns.map((h) => (
                  <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {travellers.length === 0 ? (
                <TableRow sx={{ bgcolor: PDF.white }}>
                  <TableCell colSpan={passengerTableColumns.length} sx={{ fontSize: 8, color: PDF.primary }}>
                    No passenger data
                  </TableCell>
                </TableRow>
            ) : (
              travellers.map((p, i) => (
                  <TableRow key={i} sx={{ bgcolor: PDF.white }}>
                    <TableCell sx={{ fontWeight: 800, color: PDF.primary, fontSize: 8.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.45 }}>
                        <PersonOutlineIcon sx={pdfIconSx(13)} />
                        {p.name}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: PDF.primary, fontWeight: 600, fontSize: 8.5 }}>{p.type}</TableCell>
                    {showPassengerIdColumn ? (
                      <TableCell sx={{ color: PDF.primary, fontWeight: 600, fontSize: 8.5 }}>{p.idValue || "-"}</TableCell>
                    ) : null}
                    <TableCell sx={{ color: PDF.primary, fontWeight: 600, fontSize: 8.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <LuggageOutlinedIcon sx={pdfIconSx(12)} />
                        {p.checkBag}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: PDF.primary, fontWeight: 600, fontSize: 8.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                        <ShoppingBagOutlinedIcon sx={pdfIconSx(12)} />
                        {p.cabinBag}
                      </Box>
                    </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </Box>

        <Box sx={{ px: 2, pb: 1.5 }}>
        <Box sx={{ position: "relative", mt: 0.25 }}>
          {showUnpaidWatermark ? (
            <Typography
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 700,
                color: "rgba(11,59,120,0.05)",
                transform: "rotate(-20deg)",
                pointerEvents: "none",
              }}
            >
              UNPAID BOOKING
            </Typography>
          ) : null}
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <SectionTitle icon={<FlightOutlinedIcon sx={pdfIconSx(14)} />}>
              Flight Itinerary
            </SectionTitle>
            {segments.length === 0 ? (
              <Typography sx={{ fontSize: 8, color: PDF.muted }}>No flight segments available</Typography>
            ) : (
              segmentGroups.map((group) => renderLegGroup(group))
            )}
          </Box>
        </Box>

        {showFareSummary && (
          <Box sx={{ ...sectionCardSx, mt: 1.25 }}>
            <SectionTitleBar icon={<ReceiptLongOutlinedIcon sx={pdfIconSx(14)} />}>
              {isAgentInvoiceDoc ? "Agent Fare Summary" : "Fare Summary"}
            </SectionTitleBar>
            <Box sx={{ p: 1 }}>
              <Table size="small" sx={fareTableSx}>
              <TableHead>
                  <TableRow sx={tableHeadSx}>
                  {["Passenger Type", "Base Fare", "Taxes", "Total Pax", "Total Fare"].map((h) => (
                      <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {pricebreakdown.length === 0 ? (
                    <TableRow sx={{ bgcolor: PDF.white }}>
                      <TableCell sx={{ color: PDF.slate, fontSize: 8.5 }}>ADULT</TableCell>
                      <TableCell sx={{ color: PDF.slate, fontSize: 8.5 }}>{formatNumber(totalBaseFare)}</TableCell>
                      <TableCell sx={{ color: PDF.slate, fontSize: 8.5 }}>{formatNumber(totalTax)}</TableCell>
                      <TableCell sx={{ color: PDF.slate, fontSize: 8.5 }}>{totalTravelerCount}</TableCell>
                      <TableCell sx={{ color: PDF.primary, fontWeight: 800, fontSize: 8.5 }}>
                        {formatNumber(totalBaseFare + totalTax)}
                      </TableCell>
                  </TableRow>
                ) : (
                  pricebreakdown.map((item, idx) => {
                    const paxCount = getPaxCountForFareRow(item, rawTravellers, pricebreakdown);
                      const total =
                        parseFloat(item.BaseFare || 0) * paxCount + parseFloat(item.Tax || 0) * paxCount;
                    return (
                        <TableRow key={idx} sx={{ bgcolor: PDF.white }}>
                          <TableCell sx={{ color: PDF.slate, fontSize: 8.5 }}>{getPaxTypeLabel(item.PaxType)}</TableCell>
                          <TableCell sx={{ color: PDF.slate, fontSize: 8.5 }}>{formatNumber(item.BaseFare)}</TableCell>
                          <TableCell sx={{ color: PDF.slate, fontSize: 8.5 }}>{formatNumber(item.Tax)}</TableCell>
                          <TableCell sx={{ color: PDF.slate, fontSize: 8.5 }}>{paxCount}</TableCell>
                          <TableCell sx={{ color: PDF.primary, fontWeight: 800, fontSize: 8.5 }}>
                            {formatNumber(total)}
                          </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.85, gap: 1.1, alignItems: "flex-end" }}>
              <Box sx={{ textAlign: "right" }}>
                  {isAgentInvoiceDoc ? (
                    <Typography sx={{ fontSize: 8, color: PDF.label, lineHeight: 1.65 }}>
                      Commission
                    </Typography>
                  ) : null}
                  <Typography sx={{ fontSize: 8, color: PDF.label, lineHeight: 1.65 }}>AIT & VAT</Typography>
                  <Typography sx={{ fontSize: 8, color: PDF.label, lineHeight: 1.65 }}>
                    Extra Baggage / Meal / Seat
                  </Typography>
                  <Typography sx={{ fontSize: 8, color: PDF.label, lineHeight: 1.65 }}>Bundle Cost</Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                  {isAgentInvoiceDoc ? (
                    <Typography sx={{ fontSize: 8, color: "#DC2626", fontWeight: 600, lineHeight: 1.65 }}>
                      - {formatNumber(commissionAmount)} {currency}
                    </Typography>
                  ) : null}
                  <Typography sx={{ fontSize: 8, color: PDF.slate, lineHeight: 1.65 }}>
                    + {formatNumber(displayAitVat)} {currency}
                  </Typography>
                  <Typography sx={{ fontSize: 8, color: PDF.slate, lineHeight: 1.65 }}>
                    {formatNumber(extraBaggage)} {currency}
                  </Typography>
                  <Typography sx={{ fontSize: 8, color: PDF.slate, lineHeight: 1.65 }}>
                    {formatNumber(bundleCost)} {currency}
                  </Typography>
              </Box>
                <Box
                  sx={{
                    bgcolor: PDF.primary,
                    color: PDF.white,
                    borderRadius: "8px",
                    px: 1.5,
                    py: 0.8,
                    minWidth: 152,
                    textAlign: "left",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 7,
                      color: "rgba(255,255,255,0.88)",
                      letterSpacing: 0.45,
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    GRAND TOTAL
                  </Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, lineHeight: 1.15, mt: 0.2 }}>
                    {formatNumber(grandTotal)} {currency}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ ...sectionCardSx, mt: 1.25, p: 1.1, pb: 1.25 }}>
          <SectionTitle icon={<NotificationsNoneOutlinedIcon sx={pdfIconSx(14)} />}>
            Important Reminders
          </SectionTitle>
          {reminders.map((item, i) => (
            <Box key={i} sx={{ display: "flex", gap: 0.75, mt: 0.55, alignItems: "flex-start" }}>
              <Box
                sx={{
                  width: 17,
                  height: 17,
                  minWidth: 17,
                  bgcolor: PDF.primary,
                  color: PDF.white,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 7.5,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 8, fontWeight: 800, color: PDF.primary, lineHeight: 1.35 }}>
                  {item.title}:
                </Typography>
                <Typography sx={{ fontSize: 7.5, color: PDF.primary, lineHeight: 1.45, mt: 0.1, fontWeight: 400 }}>
                  {item.text}
                </Typography>
              </Box>
            </Box>
          ))}
          <Typography
            sx={{
              fontSize: 7.5,
              color: PDF.primary,
              mt: 0.85,
              lineHeight: 1.45,
              borderLeft: `3px solid ${PDF.primary}`,
              pl: 0.75,
            }}
          >
            This electronic ticket receipt / itinerary is your travel document and forms part of your contract of
            carriage.
          </Typography>
        </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ETicketPdfLayout;
