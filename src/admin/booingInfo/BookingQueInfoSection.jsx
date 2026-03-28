import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, IconButton, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const COPYABLE_FIELDS = ["Booking Id", "PNR", "Airlines PNR"];

const BookingQueInfoSection = ({ data }) => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

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

  useEffect(() => {
    if (!data?.lastTicketTime) return;

    const tick = () => {
      const now = new Date();
      const end = new Date(data.lastTicketTime);
      const diff = end - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setExpired(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data?.lastTicketTime]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = date.getDate();
    const suffix = getDaySuffix(day);
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const rawStatus = data?.status?.toUpperCase() || "HOLD";
  const bookingStatus = rawStatus === "BOOKED" ? "HOLD" : rawStatus;
  const bookingReference = data?.bookingId || "N/A";
  const pnr = data?.gdsPNR || "N/A";
  const airlinePNR = data?.airlinePNR || pnr || "N/A";
  const fareType = data?.refundable || "N/A";
  const cancellationTime = formatDate(data?.lastTicketTime) || "N/A";

  const infoFields = [
    { label: "Booking Status", value: bookingStatus },
    { label: "Booking Id", value: bookingReference },
    { label: "PNR", value: pnr },
    { label: "Airlines PNR", value: airlinePNR },
    { label: "Fare Type", value: fareType },
   
  ].map((f) => ({ ...f, copyable: COPYABLE_FIELDS.includes(f.label) }));

  return (
    <Box
      sx={{
        border: "1px solid #E5E7EB",
        borderRadius: "6px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
     

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#F3F4F6",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: "#1F2937",
          }}
        >
          Booking Information
        </Typography>
         {/* Expiry countdown banner */}
      {data?.lastTicketTime && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1,
            py: 1,
            background: "#F8D9A9",
            borderRadius: "10px",
          }}
        >
          <InfoOutlinedIcon
            sx={{
              fontSize: 15,
              color: "#B42318",
              flexShrink: 0,
            }}
          />
          <Typography sx={{ fontSize: 12, color: "#1F2937", fontWeight: 500 }}>
            {expired
              ? "The booking has expired."
              : `The Booking will expire in ${countdown.days} day(s), ${countdown.hours} hour(s), ${countdown.minutes} minute(s), and ${countdown.seconds} second(s).`}
          </Typography>
        </Box>
      )}
      </Box>

      {/* Content */}
      <Grid container spacing={1.5} sx={{ p: 1 }}>
        {infoFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={field.label}>
            <Box
              sx={{
                background: "#DAEBFF",
                borderRadius: "4px",
                px: 1,
                py: 1,
                minHeight:"60px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                // justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--primary-color)",
                  }}
                >
                  {field.label}
                </Typography>
                {field.copyable && (
                  <Tooltip title={copiedField === field.label ? "Copied!" : "Copy"}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(field.label, field.value)}
                      sx={{
                        p: 0.25,
                        color: "var(--primary-color)",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                      }}
                    >
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: field.label === "Booking Status" ? "#FFFFFF" : "#4D4B4B",
                  alignSelf: field.label === "Booking Status" ? "center" : "flex-start",
                  ...(field.label === "Booking Status" && {
                    backgroundColor: "var(--primary-color)",
                    textTransform: "capitalize",
                    color: "#FFFFFF",
                    px: 1,
                    py: 0.5,
                    borderRadius: "4px",
                    display: "inline-block",
                  }),
                }}
              >
                {field.label === "Booking Status" && field.value
                  ? field.value.charAt(0).toUpperCase() + field.value.slice(1).toLowerCase()
                  : field.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BookingQueInfoSection;