import React from "react";
import { Box, Typography } from "@mui/material";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import EmailIcon from "@mui/icons-material/Email";

const BookingQueSupport = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1.5,
        border: "1px solid #E5E7EB",
        p: 1.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <HeadsetMicIcon sx={{ fontSize: 18, color: "#0F2F56" }} />
        <Typography fontSize={11} color="#475569">
          For any assistance visit{" "}
          <Box component="span" sx={{ color: "#0F2F56", fontWeight: 600 }}>
            support center
          </Box>
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <EmailIcon sx={{ fontSize: 18, color: "#0F2F56" }} />
        <Typography fontSize={11} color="#475569">
          Write to us at{" "}
          <Box component="span" sx={{ color: "#0F2F56", fontWeight: 600 }}>
            support@iontrip.tech
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingQueSupport;
