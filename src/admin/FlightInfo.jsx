import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

export default function FlightInfo() {
  return (
    <Box>
      <AdminPageTitleBar title="Flight Info" />
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography sx={{ color: "text.secondary" }}>
          Flight info details will be shown here.
        </Typography>
      </Paper>
    </Box>
  );
}
