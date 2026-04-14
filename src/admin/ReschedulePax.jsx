import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

export default function ReschedulePax() {
  return (
    <Box>
      <AdminPageTitleBar title="Reschedule Pax" />
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography sx={{ color: "text.secondary" }}>Reschedule Pax tools will be added here.</Typography>
      </Paper>
    </Box>
  );
}
