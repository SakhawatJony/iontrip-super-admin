import React from "react";
import { Box, Typography } from "@mui/material";
import { BQ } from "./bookingQueTheme.js";

export function BqAccentTitle({ title, right }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        flexWrap: "wrap",
        mb: 1.25,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 3,
            height: 16,
            borderRadius: 1,
            bgcolor: BQ.navy,
            flexShrink: 0,
          }}
        />
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: BQ.text }}>{title}</Typography>
      </Box>
      {right ? <Box sx={{ flexShrink: 0 }}>{right}</Box> : null}
    </Box>
  );
}

export function BqStatusPill({ children, variant = "expired" }) {
  const styles =
    variant === "holdActive"
      ? { bg: BQ.holdOrangeBg, color: "#B45309", border: `1px solid ${BQ.holdWarn}` }
      : variant === "hold"
        ? { bg: BQ.holdWarnBg, color: BQ.holdWarn, border: "none" }
        : { bg: BQ.expiredBg, color: BQ.expired, border: "none" };
  return (
    <Box
      component="span"
      sx={{
        fontSize: 10,
        fontWeight: 700,
        px: 1,
        py: 0.35,
        borderRadius: "4px",
        bgcolor: styles.bg,
        color: styles.color,
        border: styles.border,
        whiteSpace: "nowrap",
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      {children}
    </Box>
  );
}

export function BqTagChip({ children }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: 9,
        fontWeight: 600,
        px: 0.75,
        py: 0.2,
        borderRadius: "4px",
        bgcolor: BQ.accentSoft,
        color: BQ.navy,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
  );
}
