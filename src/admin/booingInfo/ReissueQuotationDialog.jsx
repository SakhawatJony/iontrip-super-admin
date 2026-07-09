import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.js";
import { BQ } from "./bookingQueTheme.js";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    fontSize: 13,
    borderRadius: "6px",
    "& fieldset": { borderColor: BQ.border },
    "&:hover fieldset": { borderColor: BQ.actionBlue },
    "&.Mui-focused fieldset": { borderColor: BQ.actionBlue, borderWidth: 1 },
  },
};

const formatTime = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "—";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
};

const formatChangeDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateString;
  }
};

export default function ReissueQuotationDialog({
  open,
  onClose,
  bookingId,
  reissueRequestId = "",
  token,
  defaultQuotedAmount = "",
  reissueRequest = null,
  onSuccess,
}) {
  const [quotedAmount, setQuotedAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuotedAmount(defaultQuotedAmount ? String(defaultQuotedAmount) : "");
    setAdminNote("");
  }, [open, defaultQuotedAmount]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    const id = String(bookingId || "").trim();
    const amount = parseFloat(quotedAmount);

    if (!id) {
      toast.error("Booking ID is missing.");
      return;
    }
    if (!token) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid quoted amount.");
      return;
    }
    if (!adminNote.trim()) {
      toast.error("Please enter an admin note.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.REISSUE_QUOTE(id)}`,
        {
          quotedAmount: amount,
          adminNote: adminNote.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const message =
        response?.data?.message ??
        response?.data?.data?.message ??
        "Reissue quotation created successfully.";

      toast.success(message);
      onClose();
      onSuccess?.(response?.data);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors[0] : null) ??
        err?.message ??
        "Failed to create reissue quotation. Please try again.";

      toast.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const legs = Array.isArray(reissueRequest?.legs) ? reissueRequest.legs : [];

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: BQ.navy, pb: 1 }}>
        Make Reissue Quotation
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 12, color: BQ.muted, mb: 1.5 }}>
          Booking ID: {bookingId || "—"}
          {reissueRequestId ? ` · Reissue Request: ${reissueRequestId}` : ""}
        </Typography>

        {legs.length > 0 && (
          <Box
            sx={{
              mb: 2.5,
              borderRadius: "8px",
              border: `1px solid ${BQ.border}`,
              overflow: "hidden",
              boxShadow: BQ.shadow,
            }}
          >
            <Box
              sx={{
                px: 1.75,
                py: 1.25,
                bgcolor: BQ.accentSoft,
                borderBottom: `1px solid ${BQ.border}`,
              }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.navy }}>
                Reissue Request Details
              </Typography>
              {reissueRequest?.requestReason && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: BQ.muted,
                    mt: 0.35,
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  &ldquo;{reissueRequest.requestReason}&rdquo;
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, p: 1.5, bgcolor: BQ.card }}>
              {legs.map((legItem, index) => {
                const summary = legItem?.summary || {};
                const departure = summary.departure || "—";
                const arrival = summary.arrival || "—";
                const legKey = `${departure}-${arrival}-${index}`;

                return (
                  <Box
                    key={legKey}
                    sx={{
                      borderRadius: "8px",
                      border: `1px solid ${BQ.border}`,
                      bgcolor: BQ.fieldBg,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        bgcolor: BQ.card,
                        borderBottom: `1px solid ${BQ.border}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          bgcolor: BQ.accentSoft,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FlightOutlinedIcon
                          sx={{ color: BQ.navy, fontSize: 15, transform: "rotate(90deg)" }}
                        />
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: BQ.navy, letterSpacing: 0.5 }}>
                        {departure}
                      </Typography>
                      <ArrowForwardIcon sx={{ color: BQ.actionBlue, fontSize: 16 }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: BQ.navy, letterSpacing: 0.5 }}>
                        {arrival}
                      </Typography>
                    </Box>

                    <Box sx={{ px: 1.5, py: 1.25 }}>
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: BQ.label,
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
                          mb: 0.75,
                        }}
                      >
                        Original schedule
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: BQ.text, lineHeight: 1.2 }}>
                            {formatTime(summary.departureTime)}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: BQ.muted, mt: 0.15 }}>
                            {formatDate(summary.departureTime)}
                          </Typography>
                        </Box>
                        <ArrowForwardIcon sx={{ color: BQ.muted, mt: 0.35, fontSize: 14 }} />
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: BQ.text, lineHeight: 1.2 }}>
                            {formatTime(summary.arrivalTime)}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: BQ.muted, mt: 0.15 }}>
                            {formatDate(summary.arrivalTime)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          mt: 1.25,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: "6px",
                          bgcolor: BQ.accentSoft,
                          border: `1px solid ${BQ.border}`,
                        }}
                      >
                        <EventAvailableOutlinedIcon sx={{ fontSize: 16, color: BQ.actionBlue }} />
                        <Box>
                          <Typography sx={{ fontSize: 10, color: BQ.label, lineHeight: 1.2 }}>
                            Requested new date
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: BQ.actionBlue, lineHeight: 1.3 }}>
                            {formatChangeDate(legItem?.changeDate)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box>
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
              sx={inputSx}
            />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: BQ.navy, mb: 0.5 }}>
              Admin Note
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="After airline penalty and fare difference."
              sx={inputSx}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{ textTransform: "none", color: BQ.muted }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "var(--secondary-color, #024DAF)",
            boxShadow: "none",
            "&:hover": { bgcolor: "var(--secondary-color, #024DAF)", opacity: 0.9 },
          }}
        >
          {submitting ? "Submitting..." : "Submit Quotation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
