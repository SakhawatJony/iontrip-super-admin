import React, { useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import Swal from "sweetalert2";

export default function ConfirmHotelRefundCancelledNow() {
  const [bookingId, setBookingId] = useState("");
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const cleanBookingId = bookingId.trim();
    const cleanPnr = pnr.trim();

    if (!cleanBookingId && !cleanPnr) {
      await Swal.fire({
        icon: "error",
        title: "Missing details",
        text: "Please enter Booking ID or PNR.",
        confirmButtonColor: "var(--primary-color)",
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: connect to a backend API endpoint to confirm "refund cancelled now".
      // For now we show the confirmation flow so the route/UI works.
      await Swal.fire({
        icon: "warning",
        title: "Confirm action",
        text: `Confirm refund cancelled now for: ${
          cleanBookingId ? `Booking ID ${cleanBookingId}` : `PNR ${cleanPnr}`
        }?`,
        showCancelButton: true,
        confirmButtonText: "Yes, confirm",
        cancelButtonText: "No",
        confirmButtonColor: "var(--primary-color)",
        cancelButtonColor: "#6B7280",
        reverseButtons: true,
      });

      await Swal.fire({
        icon: "success",
        title: "Confirmed",
        text: "Refund cancelled confirmation has been recorded (UI placeholder).",
        confirmButtonColor: "var(--primary-color)",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBookingId("");
    setPnr("");
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Paper
        sx={{
          maxWidth: 720,
          mx: "auto",
          p: { xs: 2, md: 3 },
          bgcolor: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#0F2F56", mb: 1.5 }}>
          Confirm Refund Cancelled Now (Hotel)
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 2 }}>
          Enter a booking reference to confirm “refund cancelled now”. This page is wired as a route; connect the API when available.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="PNR"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            fullWidth
            size="small"
          />

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={handleReset} disabled={loading}>
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={loading}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "var(--primary-dark, #024DAF)",
                "&:hover": { bgcolor: "rgba(2, 77, 175, 0.95)" },
              }}
            >
              {loading ? "Confirming..." : "Confirm Refund Cancelled Now"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

