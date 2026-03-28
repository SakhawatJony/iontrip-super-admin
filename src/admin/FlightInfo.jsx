import React from "react";
import { Box, Paper, Typography } from "@mui/material";

export default function FlightInfo() {
  return (
    <Box>
      <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 2 }}>Flight Info</Typography>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography sx={{ color: "text.secondary" }}>
          Flight info details will be shown here.
        </Typography>
      </Paper>
    </Box>
  );
}

