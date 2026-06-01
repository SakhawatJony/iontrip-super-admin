import React from "react";
import { Box, Typography } from "@mui/material";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import EmailIcon from "@mui/icons-material/Email";
import { BQ, bqCardSx } from "./bookingQueTheme.js";

const BookingQueSupport = () => (
  <Box sx={{ ...bqCardSx, p: 1.5, bgcolor: BQ.supportBg, borderColor: BQ.border }}>
    <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.navy, mb: 1 }}>Need help?</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
      <HeadsetMicIcon sx={{ fontSize: 15, color: BQ.navy }} />
      <Typography fontSize={11} color={BQ.muted}>
        Visit our{" "}
        <Box component="span" sx={{ color: BQ.actionBlue, fontWeight: 600 }}>
          support center
        </Box>
      </Typography>
    </Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <EmailIcon sx={{ fontSize: 15, color: BQ.navy }} />
      <Typography fontSize={11} color={BQ.muted}>
        <Box component="span" sx={{ color: BQ.actionBlue, fontWeight: 600 }}>
          support@iontrip.tech
        </Box>
      </Typography>
    </Box>
  </Box>
);

export default BookingQueSupport;
