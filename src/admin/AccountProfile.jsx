import React from "react";
import { Box, Typography } from "@mui/material";

export default function AccountProfile({ title = "Profile" }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{title}</Typography>
    </Box>
  );
}

