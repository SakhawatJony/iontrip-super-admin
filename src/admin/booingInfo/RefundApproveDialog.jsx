import React, { useEffect, useState } from "react";
import {
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

export default function RefundApproveDialog({ open, onClose, bookingId, token, onSuccess }) {
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAdminNote("");
  }, [open]);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    const id = String(bookingId || "").trim();

    if (!id) {
      toast.error("Booking ID is missing.");
      return;
    }
    if (!token) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }
    if (!adminNote.trim()) {
      toast.error("Please enter an admin note.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.REFUND_APPROVE(id)}`,
        { adminNote: adminNote.trim() },
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
        "Refund approved successfully.";

      toast.success(message);
      onClose();
      onSuccess?.(response?.data);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors[0] : null) ??
        err?.message ??
        "Failed to approve refund. Please try again.";

      toast.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700, color: BQ.navy, pb: 1 }}>
        Approve Refund
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 12, color: BQ.muted, mb: 2 }}>
          Booking ID: {bookingId || "—"}
        </Typography>
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
          placeholder="Refund approved; ready for wallet transfer."
          sx={inputSx}
        />
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
          {submitting ? "Approving..." : "Approve Refund"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
