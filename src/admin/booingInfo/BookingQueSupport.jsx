import React, { useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EmailIcon from "@mui/icons-material/Email";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { BQ, bqCardSx } from "./bookingQueTheme.js";

const BookingQueSupport = ({ data }) => {
  const [agentIdCopied, setAgentIdCopied] = useState(false);
  const agent = data?.agent || {};
  const companyName = agent?.companyName || data?.companyName || agent?.name || data?.agentName || "N/A";
  const agentId = agent?.agentId || data?.agentId || "N/A";
  const email = agent?.email || data?.agentEmail || "N/A";
  const phone = agent?.mobile || data?.agentMobile || "N/A";
  const address = agent?.companyAddress || data?.companyAddress || "N/A";

  const handleCopyAgentId = async () => {
    if (!agentId || agentId === "N/A") return;
    try {
      await navigator.clipboard.writeText(agentId);
      setAgentIdCopied(true);
      setTimeout(() => setAgentIdCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const rowSx = { display: "flex", alignItems: "flex-start", gap: 0.75, mb: 0.75 };
  const iconSx = { fontSize: 15, color: BQ.navy, mt: 0.1, flexShrink: 0 };

  return (
    <Box sx={{ ...bqCardSx, p: 1.5, bgcolor: BQ.supportBg, borderColor: BQ.border }}>
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.navy, mb: 1 }}>
        Agent Information
      </Typography>

      <Box sx={rowSx}>
        <BusinessIcon sx={iconSx} />
        <Typography fontSize={11} color={BQ.muted}>
          <Box component="span" sx={{ color: BQ.actionBlue, fontWeight: 600 }}>
            {companyName}
          </Box>
        </Typography>
      </Box>

      <Box sx={{ ...rowSx, alignItems: "center" }}>
        <BadgeOutlinedIcon sx={iconSx} />
        <Typography fontSize={11} color={BQ.muted} sx={{ flex: 1, minWidth: 0 }}>
          Agent ID: {agentId}
        </Typography>
        <Tooltip title={agentIdCopied ? "Copied!" : "Copy Agent ID"}>
          <IconButton
            size="small"
            onClick={handleCopyAgentId}
            disabled={!agentId || agentId === "N/A"}
            sx={{ p: 0.2, color: BQ.muted, ml: 0.25, flexShrink: 0 }}
          >
            <ContentCopyIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={rowSx}>
        <EmailIcon sx={iconSx} />
        <Typography fontSize={11} color={BQ.muted}>{email}</Typography>
      </Box>

      <Box sx={rowSx}>
        <CallOutlinedIcon sx={iconSx} />
        <Typography fontSize={11} color={BQ.muted}>{phone}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
        <LocationOnOutlinedIcon sx={iconSx} />
        <Typography fontSize={11} color={BQ.muted} sx={{ lineHeight: 1.45 }}>
          {address}
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingQueSupport;
