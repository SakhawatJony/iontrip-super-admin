import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { BQ, bqCardSx, bqLabelSx, bqValueSx, getAirlineNameFromBooking } from "./bookingQueTheme.js";
import { BqStatusPill } from "./bookingQueUi.jsx";
import { formatCountdownTo, getAirlineLogoUrl } from "./bookingQueUtils.js";
import { resolveBookingGoSegments } from "../flightItineraryUtils.js";

const FIELD_META = [
  { label: "Booking ID", key: "bookingId", icon: ConfirmationNumberOutlinedIcon, copyable: true },
  { label: "PNR", key: "gdsPNR", icon: TagOutlinedIcon, copyable: true },
  { label: "Airlines PNR", key: "airlinePNR", icon: FlightOutlinedIcon, copyable: true, fallback: "gdsPNR" },
  { label: "Fare Type", key: "refundable", icon: InfoOutlinedIcon, copyable: false },
];

const BookingQueInfoSection = ({ data }) => {
  const [countdown, setCountdown] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!data?.lastTicketTime) {
      setCountdown(null);
      return;
    }
    const tick = () => setCountdown(formatCountdownTo(data.lastTicketTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.lastTicketTime]);

  const handleCopy = async (label, value) => {
    if (!value || value === "N/A") return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const rawStatus = (data?.status || "HOLD").toUpperCase().replace(/\s+/g, "");
  const isHoldActive = rawStatus === "HOLD" || rawStatus === "BOOKED";
  const isExpiredStatus =
    ["EXPIRED", "CANCELLED", "CANCELED"].includes(rawStatus) || countdown?.expired;
  const airlineName = getAirlineNameFromBooking(data);
  const seg = resolveBookingGoSegments(data)[0] || {};
  const logoUrl =
    getAirlineLogoUrl(data) ||
    (seg.marketingcareer || seg.marketingCarrier
      ? `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${String(seg.marketingcareer || seg.marketingCarrier).toUpperCase()}.png`
      : "");

  const getFieldValue = (field) => {
    if (field.key === "airlinePNR") {
      return data?.airlinePNR || data?.gdsPNR || "N/A";
    }
    if (field.key === "refundable") {
      const ref = data?.refundable;
      if (ref === true || ref === "true" || String(ref).toLowerCase() === "refundable") return "Refundable";
      if (ref === false || ref === "false" || String(ref).toLowerCase() === "non-refundable") return "Non-Refundable";
      return ref ? String(ref) : "N/A";
    }
    return data?.[field.key] || "N/A";
  };

  return (
    <Box sx={bqCardSx}>
      <Box
        sx={{
          bgcolor: BQ.navy,
          px: 1.75,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          {logoUrl && !logoError ? (
            <Box
              component="img"
              src={logoUrl}
              alt=""
              onError={() => setLogoError(true)}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "6px",
                bgcolor: "#fff",
                objectFit: "contain",
                p: 0.35,
                flexShrink: 0,
              }}
            />
          ) : null}
          <Box>
            <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.72)", fontWeight: 500, lineHeight: 1.2 }}>
              Booking Overview
            </Typography>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: 0.2,
                lineHeight: 1.25,
                mt: 0.1,
              }}
            >
              {airlineName}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
          {isHoldActive && !isExpiredStatus ? <BqStatusPill variant="holdActive">Hold</BqStatusPill> : null}
          {isExpiredStatus ? <BqStatusPill variant="expired">Expired</BqStatusPill> : null}
          {data?.lastTicketTime && countdown && !countdown.expired ? (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.4,
                bgcolor: BQ.timerPillBg,
                color: "#fff",
                fontSize: 11,
                fontWeight: 600,
                px: 1,
                py: 0.35,
                borderRadius: "6px",
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 13 }} />
              {countdown.label}
            </Box>
          ) : null}
          {data?.lastTicketTime && countdown?.expired && isHoldActive ? (
            <BqStatusPill variant="hold">
              <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
                <AccessTimeIcon sx={{ fontSize: 11 }} />
                Hold expired
              </Box>
            </BqStatusPill>
          ) : null}
        </Box>
      </Box>

      <Grid container spacing={1.25} sx={{ p: 1.5 }}>
        {FIELD_META.map((field) => {
          const Icon = field.icon;
          const value = getFieldValue(field);
          return (
            <Grid item xs={12} sm={6} md={3} key={field.label}>
              <Box
                sx={{
                  border: `1px solid ${BQ.border}`,
                  borderRadius: "6px",
                  bgcolor: BQ.fieldBg,
                  px: 1.25,
                  py: 1,
                  minHeight: 52,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.35 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                    <Icon sx={{ fontSize: 13, color: BQ.actionBlue, flexShrink: 0 }} />
                    <Typography sx={bqLabelSx}>{field.label}</Typography>
                  </Box>
                  {field.copyable ? (
                    <Tooltip title={copiedField === field.label ? "Copied!" : "Copy"}>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(field.label, value)}
                        sx={{ p: 0.15, color: BQ.muted, mt: -0.25 }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Box>
                <Typography sx={{ ...bqValueSx, wordBreak: "break-all" }}>{value}</Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default BookingQueInfoSection;
