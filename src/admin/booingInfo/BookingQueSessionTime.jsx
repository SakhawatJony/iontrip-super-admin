import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const BookingQueSessionTime = ({ data }) => {
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!data?.lastTicketTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const lastTicketTime = new Date(data.lastTicketTime);
      const diff = lastTicketTime - now;

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        setProgress(0);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });

      // Calculate progress (assuming 24 hours total time)
      const totalHours = 24;
      const elapsedHours = (now - (lastTicketTime - totalHours * 60 * 60 * 1000)) / (1000 * 60 * 60);
      const progressValue = Math.max(0, Math.min(100, (elapsedHours / totalHours) * 100));
      setProgress(100 - progressValue);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [data?.lastTicketTime]);

  const formatTime = () => {
    if (timeRemaining.hours === 0 && timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
      return "00:00";
    }
    return `${String(timeRemaining.hours).padStart(2, "0")}:${String(timeRemaining.minutes).padStart(2, "0")}`;
  };

  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1.5,
        border: "1px solid #E5E7EB",
        p: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Box>
        <Typography fontSize={12} color="#0F172A" fontWeight={700}>
          Time Remaining {formatTime()}
        </Typography>
        <Typography fontSize={10} color="#64748B">
          For security reason your session will close automatically
        </Typography>
      </Box>
      <CircularProgress
        variant="determinate"
        value={progress}
        size={32}
        thickness={5}
        sx={{ color: "#0F2F56" }}
      />
    </Box>
  );
};

export default BookingQueSessionTime;
