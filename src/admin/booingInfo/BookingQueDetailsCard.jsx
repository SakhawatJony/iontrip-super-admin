import React, { useState } from "react";
import { Box, Divider, Typography, Tab, Tabs } from "@mui/material";
import FlightIcon from "@mui/icons-material/Flight";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { BQ, bqCardSx } from "./bookingQueTheme.js";
import { BqAccentTitle, BqTagChip } from "./bookingQueUi.jsx";
import {
  formatDisplayDuration,
  isRoundTripBooking,
  resolveBookingBackSegments,
  resolveBookingGoSegments,
  resolveSierraLegSummary,
} from "../flightItineraryUtils";

const BookingQueDetailsCard = ({ data }) => {
  const [tab, setTab] = useState(0);
  const [logoErrors, setLogoErrors] = useState({});

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    } catch {
      return "N/A";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "";
    }
  };

  const buildSegments = (segmentsArray) => {
    return segmentsArray.map((segment, index) => {
      const dep = segment.departureAirport || segment.departure || "N/A";
      const arr = segment.arrivalAirport || segment.arrival || "N/A";
      const depName = segment.departureAirportName || segment.departureName || dep;
      const arrName = segment.arrivalAirportName || segment.arrivalName || arr;
      const carrierCode = segment.marketingcareer || segment.marketingCarrier || "";
      const airline =
        `${segment.marketingcareerName || segment.marketingCarrierName || ""} · ${carrierCode} ${segment.marketingflight || segment.marketingFlight || ""}`.trim();
      const cabin = segment.class || segment.cabin || data?.cabinClass || "ECONOMY";
      const baggage = segment.bags || "—";
      const cabinBag = segment.cabinBag || segment.cabinbag || "7KG";
      const duration = formatDisplayDuration(segment.flightduration || segment.duration) || "—";

      return {
        departTime: formatTime(segment.departureTime),
        departDate: formatDate(segment.departureTime),
        arriveTime: formatTime(segment.arrivalTime),
        arriveDate: formatDate(segment.arrivalTime),
        dep,
        arr,
        depName,
        arrName,
        airline,
        cabin: String(cabin).toUpperCase(),
        baggage,
        cabinBag,
        duration,
        carrierCode,
        originalIndex: index,
      };
    });
  };

  const goSegments = resolveBookingGoSegments(data);
  const backSegments = resolveBookingBackSegments(data);
  const processedGo = buildSegments(goSegments);
  const processedBack = buildSegments(backSegments);

  const goSummary = resolveSierraLegSummary(data, 1);
  const backSummary = resolveSierraLegSummary(data, 2);
  const firstGo = goSegments[0] || {};
  const lastGo = goSegments[goSegments.length - 1] || firstGo;
  const firstBack = backSegments[0] || {};
  const lastBack = backSegments[backSegments.length - 1] || firstBack;

  const goDep = data?.godeparture || firstGo?.departure || goSummary?.departure || "—";
  const goArr = data?.goarrival || lastGo?.arrival || goSummary?.arrival || "—";
  const backDep = data?.backdeparture || firstBack?.departure || backSummary?.departure;
  const backArr = data?.backarrival || lastBack?.arrival || backSummary?.arrival;

  const isRoundTrip = isRoundTripBooking(data);
  const currentSegments = tab === 0 ? processedGo : processedBack;
  const legDep = tab === 0 ? goDep : backDep || goArr;
  const legArr = tab === 0 ? goArr : backArr || goDep;

  const tabLabel = (dep, arr, fallback) => {
    if (dep && arr) return `${fallback} ${dep} → ${arr}`;
    return fallback;
  };

  return (
    <Box sx={{ ...bqCardSx, p: 1.75 }}>
      <BqAccentTitle
        title="Flight Itinerary"
        right={
          <Typography
            sx={{ fontSize: 10, fontWeight: 600, color: BQ.muted, letterSpacing: 0.6, textTransform: "uppercase" }}
          >
            {isRoundTrip ? "ROUNDTRIP" : "ONE WAY"}
          </Typography>
        }
      />

      {isRoundTrip ? (
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 36,
            mb: 1.5,
            "& .MuiTabs-indicator": { bgcolor: BQ.navy, height: 3 },
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: 11,
              fontWeight: 600,
              color: BQ.muted,
              minHeight: 36,
              py: 0.75,
              "&.Mui-selected": { color: BQ.navy },
            },
          }}
        >
          <Tab label={tabLabel(goDep, goArr, "Outbound")} />
          <Tab label={tabLabel(backDep, backArr, "Return")} />
        </Tabs>
      ) : null}

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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {currentSegments.map((segment, index) => {
            const logoCode = String(segment.carrierCode || "").toUpperCase();
            const logoKey = `${logoCode}-${tab}-${index}`;
            const logoUrl = logoCode
              ? `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${logoCode}.png`
              : "";
            const hasLogo = Boolean(logoUrl) && !logoErrors[logoKey];

            return (
              <Box
                key={`${segment.departTime}-${index}`}
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
                      <FlightIcon sx={{ color: "#fff", fontSize: 18 }} />
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
                    <Typography sx={{ fontSize: 10, color: BQ.muted, mt: 0.15 }}>
                      {segment.airline}
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
                      <BqTagChip>{segment.cabin}</BqTagChip>
                      <BqTagChip>
                        {segment.baggage} / {segment.cabinBag}
                      </BqTagChip>
                      <BqTagChip>{segment.duration}</BqTagChip>
                    </Box>
                  </Box>
                </Box>

                {index < currentSegments.length - 1 ? <Divider sx={{ mt: 2 }} /> : null}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default BookingQueDetailsCard;
