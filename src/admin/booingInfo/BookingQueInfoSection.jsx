import React from "react";
import { Box, Typography, Grid } from "@mui/material";

const BookingQueInfoSection = ({ data }) => {

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

  const bookingStatus = data?.status?.toUpperCase() || "HOLD";
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
    { label: "Time Limit", value: cancellationTime },
  ];

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
      </Box>

      {/* Content */}
      <Grid container spacing={1.5} sx={{ p: 1 }}>
        {infoFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={field.label}>
            <Box
              sx={{
                background: "#DAEBFF",
                borderRadius: "4px",
                px: 1,
                py: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--primary-color)",
                  mb: 0.5,
                }}
              >
                {field.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#4D4B4B",
                }}
              >
                {field.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BookingQueInfoSection;