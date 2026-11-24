import { Children } from "react";
import { Box, Typography } from "@mui/material";

/**
 * Page title strip — same visual as /dashboard/customer/allagent (Agent History).
 * Pass only `title` (and optional `subtitle` / `action`) per route.
 */
export default function AdminPageTitleBar({ title, subtitle, action }) {
  const hasAction = action != null && action !== false;
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        p: 1,
        borderRadius: 1,
        bgcolor: "var(--primary-dark, #024DAF)",
        gap: 2,
      }}
    >
      <Box sx={{ minWidth: 0, flex: hasAction ? 1 : undefined }}>
        <Typography component="h1" sx={{ fontSize: 18, fontWeight: 500, color: "#FFFFFF" }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.85)", mt: 0.5 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {hasAction ? (
        <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {Children.toArray(action)}
        </Box>
      ) : null}
    </Box>
  );
}
