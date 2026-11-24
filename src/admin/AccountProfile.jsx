import React from "react";
import { Box } from "@mui/material";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

export default function AccountProfile({ title = "Profile" }) {
  return (
    <Box>
      <AdminPageTitleBar title={title} />
    </Box>
  );
}
