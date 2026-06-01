import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { BQ, bqCardSx } from "./bookingQueTheme.js";
import { formatCountdownTo } from "./bookingQueUtils.js";

const BookingQueSessionTime = ({ data }) => {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!data?.lastTicketTime) return;
    const tick = () => setCountdown(formatCountdownTo(data.lastTicketTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.lastTicketTime]);

  if (!data?.lastTicketTime || !countdown) return null;

  const expired = countdown.expired;
  const progress = expired
    ? 0
    : Math.min(100, Math.max(8, 100 - (new Date(data.lastTicketTime) - Date.now()) / (7 * 24 * 3600 * 1000) * 100));

  return (
    <Box
      sx={{
        ...bqCardSx,
        p: 1.25,
        display: "flex",
        gap: 1.25,
        alignItems: "center",
        borderColor: expired ? BQ.expiredBg : BQ.border,
      }}
    >
      <Box sx={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <CircularProgress
          variant="determinate"
          value={progress}
          size={40}
          thickness={4}
          sx={{ color: expired ? BQ.expired : BQ.navy }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: 8, fontWeight: 700, color: expired ? BQ.expired : BQ.navy }}>
            {expired ? "!" : "⏱"}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: expired ? BQ.expired : BQ.navy,
            lineHeight: 1.3,
          }}
        >
          {expired ? "Hold expired" : `${countdown.label} left`}
        </Typography>
        <Typography sx={{ fontSize: 10, color: BQ.muted, mt: 0.15 }}>
          Issue ticket before deadline
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingQueSessionTime;
