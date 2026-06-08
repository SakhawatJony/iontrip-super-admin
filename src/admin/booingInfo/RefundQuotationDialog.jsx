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

export default function RefundQuotationDialog({
  open,
  onClose,
  bookingId,
  token,
  defaultQuotedAmount = "",
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
        `${API_BASE_URL}${API_ENDPOINTS.REFUND_QUOTE(id)}`,
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
        "Refund quotation created successfully.";

      toast.success(message);
      onClose();
      onSuccess?.(response?.data);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors[0] : null) ??
        err?.message ??
        "Failed to create refund quotation. Please try again.";

      toast.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: BQ.navy, pb: 1 }}>
        Make Refund Quotation
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 12, color: BQ.muted, mb: 2 }}>
          Booking ID: {bookingId || "—"}
        </Typography>
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
              placeholder="After airline penalty deduction."
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
          Cancel
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
