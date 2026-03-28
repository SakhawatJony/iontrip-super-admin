import React from "react";
import { Box, Paper, Typography } from "@mui/material";

export default function ReschedulePax() {
  return (
    <Box>
      <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>Reschedule Pax</Typography>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography sx={{ color: "text.secondary" }}>Reschedule Pax tools will be added here.</Typography>
      </Paper>
    </Box>
  );
}

