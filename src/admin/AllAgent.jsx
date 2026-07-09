import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Modal,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import BusinessIcon from "@mui/icons-material/Business";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import MoneyOffOutlinedIcon from "@mui/icons-material/MoneyOffOutlined";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { fixedGridTemplateFromColumns, tableMinWidthFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const MAX_MARKUP_PERCENT = 7;

const tableColumns = [
  { key: "agentId", label: "Agent ID", width: "110px" },
  { key: "name", label: "Agent Name", width: "130px" },
  { key: "email", label: "Email", width: "160px" },
  { key: "mobile", label: "Mobile", width: "120px" },
  { key: "companyName", label: "Company", width: "130px" },
  { key: "businessType", label: "Business Type", width: "120px" },
  { key: "address", label: "Address", width: "180px" },
  { key: "markup", label: "Markup", width: "80px" },
  { key: "isActive", label: "Status", width: "90px" },
  { key: "isVerified", label: "Verified", width: "100px" },
  { key: "action", label: "Action", width: "100px" },
];

const tableGridTemplate = fixedGridTemplateFromColumns(tableColumns);
const tableMinWidth = tableMinWidthFromColumns(tableColumns);

const tableCellBoxSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  px: 1,
  py: 0.75,
  minWidth: 0,
  overflow: "hidden",
  textAlign: "center",
};

const tableHeaderTextSx = {
  fontSize: 10,
  fontWeight: 600,
  color: "#FFFFFF",
  lineHeight: 1.25,
  wordBreak: "break-word",
  overflowWrap: "anywhere",
  whiteSpace: "normal",
  width: "100%",
  textAlign: "center",
};

const tableCellTextSx = {
  fontSize: 11,
  color: "#111827",
  lineHeight: 1.35,
  wordBreak: "break-word",
  overflowWrap: "anywhere",
  whiteSpace: "normal",
  width: "100%",
  textAlign: "center",
};

function pickAgentField(agent, ...keys) {
  for (const key of keys) {
    const value = agent?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

function pickDocumentUrl(agent, field) {
  return pickAgentField(agent, field.key, ...(field.altKeys || []));
}

const AGENT_DOCUMENT_FIELDS = [
  { key: "logoUrl", altKeys: ["logo", "logo_url"], label: "Logo" },
  { key: "tinCopy", label: "TIN Copy" },
  { key: "nidCopy", label: "NID Copy" },
  { key: "civilAviationCopy", label: "Civil Aviation Copy" },
];

const AGENT_DETAIL_SKIP_KEYS = new Set([
  "id",
  "logoUrl",
  "logo",
  "logo_url",
  "passengers",
  "tinCopy",
  "nidCopy",
  "civilAviationCopy",
  "statusSummary",
  "vendorTicket",
  "password",
  "refreshToken",
  "accessToken",
  "token",
  "otp",
]);

const AGENT_DETAIL_LABELS = {
  id: "ID",
  agentId: "Agent ID",
  name: "Agent Name",
  email: "Email",
  mobile: "Mobile",
  companyName: "Company Name",
  businessType: "Business Type",
  companyAddress: "Company Address",
  isActive: "Account Active",
  isVerified: "Verified",
  emailVerified: "Email Verified",
  markup: "Markup",
  caabNumber: "CAAB Number",
  civilAviationNumber: "CAAB Number",
  createdAt: "Created At",
  updatedAt: "Updated At",
  logoUrl: "Logo",
  logo: "Logo",
  passengers: "Passengers",
};

const AGENT_IMAGE_FIELD_KEYS = new Set(["logoUrl", "logo", "profileImage", "profile_image", "avatar"]);

const AGENT_DOCUMENT_PDF_KEYS = new Set(["tinCopy", "nidCopy", "civilAviationCopy"]);

const NESTED_DETAIL_SKIP_KEYS = new Set(["id"]);

const AGENT_MODAL_SECTIONS = [
  {
    title: "Basic Information",
    icon: BusinessIcon,
    keys: ["agentId", "agent_id", "name", "email", "mobile"],
  },
  {
    title: "Company Details",
    icon: BusinessIcon,
    keys: [
      "companyName",
      "company_name",
      "businessType",
      "business_type",
      "companyAddress",
      "company_address",
      "address",
      "city",
      "state",
      "country",
      "zipCode",
      "postalCode",
    ],
  },
  {
    title: "Account & Settings",
    icon: TuneIcon,
    keys: [
      "isVerified",
      "is_verified",
      "isActive",
      "is_active",
      "emailVerified",
      "email_verified",
      "markup",
      "caabNumber",
      "civilAviationNumber",
      "wallet",
    ],
  },
  {
    title: "Timeline",
    icon: RefreshIcon,
    keys: ["createdAt", "created_at", "updatedAt", "updated_at"],
  },
];

const modalDetailCardSx = {
  p: 1.75,
  borderRadius: 1.5,
  border: "1px solid #E8EEF5",
  bgcolor: "#FAFBFD",
  height: "100%",
};

const modalFieldLabelSx = {
  fontSize: 11,
  fontWeight: 600,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  mb: 0.75,
};

const AGENT_DETAIL_PRIORITY = [
  "id",
  "agentId",
  "agent_id",
  "name",
  "email",
  "mobile",
  "companyName",
  "company_name",
  "businessType",
  "business_type",
  "companyAddress",
  "company_address",
  "address",
  "city",
  "state",
  "country",
  "zipCode",
  "postalCode",
  "isActive",
  "is_active",
  "isVerified",
  "is_verified",
  "emailVerified",
  "email_verified",
  "markup",
  "caabNumber",
  "civilAviationNumber",
  "createdAt",
  "created_at",
  "updatedAt",
  "updated_at",
];

function humanizeAgentKey(key) {
  return (
    AGENT_DETAIL_LABELS[key] ||
    String(key)
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatScalarDetailValue(key, value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key === "markup") return `${value}%`;
  if (/At$|_at$|date/i.test(key)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  if (typeof value === "object") return "-";
  return String(value);
}

function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function isPdfUrl(value) {
  if (!isHttpUrl(value)) return false;
  const path = String(value).split("?")[0].split("#")[0].toLowerCase();
  return path.endsWith(".pdf");
}

function resolveAgentDocumentType(url, fieldKey) {
  if (!url) return "empty";
  if (isImageField(fieldKey, url) && !isPdfUrl(url)) return "image";
  if (isPdfUrl(url) || AGENT_DOCUMENT_PDF_KEYS.has(fieldKey)) return "pdf";
  if (isHttpUrl(url)) return "link";
  return "empty";
}

function isImageField(key, value) {
  return AGENT_IMAGE_FIELD_KEYS.has(key) || (isHttpUrl(value) && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(value));
}

function renderAgentDetailValue(key, value) {
  if (value === null || value === undefined || value === "") {
    return (
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", m: 0 }}>-</Typography>
    );
  }

  if (isImageField(key, value) && isHttpUrl(value)) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="img"
          src={value}
          alt={humanizeAgentKey(key)}
          onClick={() => window.open(value, "_blank")}
          sx={{
            width: 120,
            height: 80,
            objectFit: "contain",
            border: "1px solid #E5E7EB",
            borderRadius: 1,
            cursor: "pointer",
            bgcolor: "#F9FAFB",
          }}
        />
        <Typography
          component="a"
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: "#024DAF",
            wordBreak: "break-all",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          View image
        </Typography>
      </Box>
    );
  }

  if (isHttpUrl(value)) {
    return (
      <Typography
        component="a"
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: "#024DAF",
          wordBreak: "break-all",
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {value}
      </Typography>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", m: 0 }}>-</Typography>
      );
    }

    if (value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {value.map((item, index) => (
            <Box
              key={item.id ?? index}
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: 1,
                p: 1.5,
                bgcolor: "#F9FAFB",
              }}
            >
              {Object.entries(item)
                .filter(([itemKey]) => !NESTED_DETAIL_SKIP_KEYS.has(itemKey))
                .map(([itemKey, itemValue]) => (
                <Box
                  key={itemKey}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" },
                    gap: 0.5,
                    py: 0.35,
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                    {humanizeAgentKey(itemKey)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111827",
                      wordBreak: "break-word",
                    }}
                  >
                    {formatScalarDetailValue(itemKey, itemValue)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      );
    }

    return (
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", m: 0 }}>
        {value.map((item) => formatScalarDetailValue(key, item)).join(", ")}
      </Typography>
    );
  }

  if (typeof value === "object") {
    const nestedEntries = Object.entries(value).filter(
      ([itemKey]) => !NESTED_DETAIL_SKIP_KEYS.has(itemKey)
    );

    if (nestedEntries.length === 0) {
      return (
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", m: 0 }}>-</Typography>
      );
    }

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1,
          border: "1px solid #E5E7EB",
          borderRadius: 1,
          p: 1.5,
          bgcolor: "#F9FAFB",
        }}
      >
        {nestedEntries.map(([itemKey, itemValue]) => (
          <Box key={itemKey}>
            <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.25 }}>
              {humanizeAgentKey(itemKey)}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827", wordBreak: "break-word" }}>
              {formatScalarDetailValue(itemKey, itemValue)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 600,
        color: "#111827",
        m: 0,
        wordBreak: "break-word",
        overflowWrap: "anywhere",
      }}
    >
      {formatScalarDetailValue(key, value)}
    </Typography>
  );
}

function buildAgentDetailEntries(agent) {
  if (!agent || typeof agent !== "object") return [];

  const entries = [];
  const used = new Set();

  const addEntry = (key) => {
    if (used.has(key) || AGENT_DETAIL_SKIP_KEYS.has(key)) return;
    if (!(key in agent)) return;
    entries.push([key, agent[key]]);
    used.add(key);
  };

  AGENT_DETAIL_PRIORITY.forEach(addEntry);
  Object.keys(agent)
    .sort()
    .forEach(addEntry);

  return entries;
}

function buildAgentModalSections(agent) {
  const allEntries = buildAgentDetailEntries(agent);
  const entryMap = new Map(allEntries);
  const used = new Set();
  const sections = [];

  AGENT_MODAL_SECTIONS.forEach((section) => {
    const items = section.keys
      .filter((key) => entryMap.has(key) && !used.has(key))
      .map((key) => {
        used.add(key);
        return [key, entryMap.get(key)];
      });

    if (items.length > 0) {
      sections.push({ title: section.title, icon: section.icon, items });
    }
  });

  const remaining = allEntries.filter(([key]) => !used.has(key));
  if (remaining.length > 0) {
    sections.push({ title: "Additional Information", icon: BusinessIcon, items: remaining });
  }

  return sections;
}

function isFullWidthAgentField(key, value) {
  return (
    key === "companyAddress" ||
    key === "address" ||
    (typeof value === "object" && value !== null) ||
    (typeof value === "string" && value.length > 80)
  );
}

/** Status shows Active only when the agent is verified and active; otherwise Inactive. */
function getAgentEffectiveStatusLabel(agent) {
  if (agent?.isVerified === true && agent?.isActive === true) return "Active";
  return "Inactive";
}

function formatAgentCurrency(amount, currency = "BDT") {
  const num = Number(amount);
  const safeAmount = Number.isFinite(num) ? num : 0;
  return `${currency} ${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function capitalizeStatusLabel(status) {
  if (!status) return "-";
  return String(status)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getAgentStatusSummaryCards(agent) {
  const summary = Array.isArray(agent?.statusSummary) ? agent.statusSummary : [];
  return summary.map((item) => ({
    status: item?.status || "-",
    label: capitalizeStatusLabel(item?.status),
    count: Number(item?.count) || 0,
    totalAmount: Number(item?.totalAmount) || 0,
  }));
}

function getAgentVendorTicketMetrics(agent) {
  const vendor = agent?.vendorTicket || {};
  return [
    {
      key: "count",
      label: "Ticket Count",
      value: Number(vendor.count) || 0,
      isCurrency: false,
      icon: ConfirmationNumberOutlinedIcon,
      color: "#024DAF",
      bg: "#EAF2FF",
    },
    {
      key: "totalInvoiceAmount",
      label: "Total Invoice",
      value: Number(vendor.totalInvoiceAmount) || 0,
      isCurrency: true,
      icon: ReceiptLongOutlinedIcon,
      color: "#7551FF",
      bg: "#EDE7F6",
    },
    {
      key: "totalDealAmount",
      label: "Total Deal",
      value: Number(vendor.totalDealAmount) || 0,
      isCurrency: true,
      icon: AccountBalanceWalletOutlinedIcon,
      color: "#0891B2",
      bg: "#E0F7FA",
    },
    {
      key: "profitLoss",
      label: "Profit / Loss",
      value: Number(vendor.profitLoss) || 0,
      isCurrency: true,
      highlight: true,
      icon: null,
      color: "#059669",
      bg: "#ECFDF5",
    },
  ];
}

const AGENT_STATUS_GROUPS = [
  {
    title: "Booking",
    icon: FlightTakeoffOutlinedIcon,
    color: "#024DAF",
    bg: "#EAF2FF",
    border: "#BFDBFE",
    statuses: ["booked", "issue in process", "ticketed", "hold", "cancelled", "void"],
  },
  {
    title: "Refund",
    icon: MoneyOffOutlinedIcon,
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    statuses: [
      "refund request",
      "refund quoted",
      "refund processing",
      "refunded",
      "refund failed",
    ],
  },
  {
    title: "Reissue",
    icon: AutorenewOutlinedIcon,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    statuses: [
      "reissue request",
      "reissue quoted",
      "reissue processing",
      "reissued",
      "reissue failed",
    ],
  },
];

function getAgentSummaryTotals(statusCards) {
  return statusCards.reduce(
    (acc, card) => ({
      count: acc.count + card.count,
      amount: acc.amount + card.totalAmount,
    }),
    { count: 0, amount: 0 }
  );
}

function groupAgentStatusCards(statusCards) {
  const cardMap = new Map(statusCards.map((card) => [card.status.toLowerCase(), card]));

  return AGENT_STATUS_GROUPS.map((group) => ({
    ...group,
    items: group.statuses
      .map((status) => cardMap.get(status.toLowerCase()))
      .filter(Boolean),
  })).filter((group) => group.items.length > 0);
}

function getStatusCardAccent(status) {
  const key = String(status || "").toLowerCase();
  if (key.includes("ticketed") || key.includes("reissued") || key.includes("refunded")) {
    return { color: "#059669", bg: "#ECFDF5" };
  }
  if (key.includes("failed") || key.includes("cancelled") || key.includes("void")) {
    return { color: "#DC2626", bg: "#FEF2F2" };
  }
  if (key.includes("process") || key.includes("quoted") || key.includes("request")) {
    return { color: "#D97706", bg: "#FFFBEB" };
  }
  if (key.includes("hold")) {
    return { color: "#7C3AED", bg: "#F5F3FF" };
  }
  return { color: "#024DAF", bg: "#EFF6FF" };
}

function renderAgentSummarySection(agent) {
  const currency = pickAgentField(agent, "currency") || "BDT";
  const statusCards = getAgentStatusSummaryCards(agent);
  const vendorMetrics = getAgentVendorTicketMetrics(agent);
  const statusGroups = groupAgentStatusCards(statusCards);
  const totals = getAgentSummaryTotals(statusCards);
  const walletAmount = Number(agent?.wallet?.amount) || 0;
  const hasStatusSummary = Array.isArray(agent?.statusSummary) && agent.statusSummary.length > 0;
  const hasVendorTicket = Boolean(agent?.vendorTicket && typeof agent.vendorTicket === "object");

  if (!hasStatusSummary && !hasVendorTicket) {
    return (
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <AssessmentOutlinedIcon sx={{ fontSize: 18, color: "var(--primary-dark, #024DAF)" }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Agent Summary</Typography>
        </Box>
        <Box
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #E8EEF5",
            borderRadius: 2.5,
            p: 3,
            textAlign: "center",
          }}
        >
          <AssessmentOutlinedIcon sx={{ fontSize: 40, color: "#CBD5E1", mb: 1 }} />
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}>
            No booking summary available
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: 0.5 }}>
            Summary data will appear once this agent has bookings.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssessmentOutlinedIcon sx={{ fontSize: 18, color: "var(--primary-dark, #024DAF)" }} />
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Agent Summary</Typography>
        </Box>
        {hasStatusSummary && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Box
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#024DAF",
                bgcolor: "#EAF2FF",
                border: "1px solid #BFDBFE",
                borderRadius: 999,
                px: 1.25,
                py: 0.35,
              }}
            >
              {totals.count} Total Bookings
            </Box>
            <Box
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#0F2F56",
                bgcolor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: 999,
                px: 1.25,
                py: 0.35,
              }}
            >
              {formatAgentCurrency(totals.amount, currency)}
            </Box>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E8EEF5",
          borderRadius: 2.5,
          overflow: "hidden",
          boxShadow: "0px 4px 18px rgba(112, 144, 176, 0.08)",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            background: "linear-gradient(90deg, rgba(2, 77, 175, 0.08) 0%, rgba(15, 47, 86, 0.03) 55%, transparent 100%)",
            borderBottom: "1px solid #E8EEF5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: "0.02em" }}>
            Performance Overview
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#64748B" }}>
            Wallet Balance:{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#024DAF" }}>
              {formatAgentCurrency(walletAmount, currency)}
            </Box>
          </Typography>
        </Box>

        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2.25 }}>
          {hasVendorTicket && (
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  mb: 1.25,
                }}
              >
                Vendor Ticket
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                  gap: 1.25,
                }}
              >
                {vendorMetrics.map((metric) => {
                  const isProfitLoss = metric.highlight;
                  const profitLossPositive = metric.value >= 0;
                  const MetricIcon =
                    isProfitLoss
                      ? profitLossPositive
                        ? TrendingUpOutlinedIcon
                        : TrendingDownOutlinedIcon
                      : metric.icon;
                  const iconColor = isProfitLoss
                    ? profitLossPositive
                      ? "#059669"
                      : "#DC2626"
                    : metric.color;
                  const iconBg = isProfitLoss
                    ? profitLossPositive
                      ? "#ECFDF5"
                      : "#FEF2F2"
                    : metric.bg;

                  return (
                    <Box
                      key={metric.key}
                      sx={{
                        border: "1px solid",
                        borderColor: isProfitLoss
                          ? profitLossPositive
                            ? "#A7F3D0"
                            : "#FECACA"
                          : "#E8EEF5",
                        borderRadius: 2,
                        p: 1.5,
                        bgcolor: "#FAFBFD",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.25,
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0px 6px 16px rgba(15, 47, 86, 0.08)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 1.5,
                          bgcolor: iconBg,
                          color: iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {MetricIcon && <MetricIcon sx={{ fontSize: 20 }} />}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: "#64748B", mb: 0.35 }}>
                          {metric.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: isProfitLoss
                              ? profitLossPositive
                                ? "#059669"
                                : "#DC2626"
                              : "#0F172A",
                            lineHeight: 1.25,
                            wordBreak: "break-word",
                          }}
                        >
                          {metric.isCurrency
                            ? formatAgentCurrency(metric.value, currency)
                            : metric.value.toLocaleString("en-US")}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {hasStatusSummary && statusGroups.length > 0 && (
            <Box>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  mb: 1.25,
                }}
              >
                Booking Status Summary
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                {statusGroups.map((group) => {
                  const GroupIcon = group.icon;
                  const groupTotal = group.items.reduce(
                    (acc, item) => ({
                      count: acc.count + item.count,
                      amount: acc.amount + item.totalAmount,
                    }),
                    { count: 0, amount: 0 }
                  );

                  return (
                    <Box
                      key={group.title}
                      sx={{
                        border: `1px solid ${group.border}`,
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: "#FFFFFF",
                      }}
                    >
                      <Box
                        sx={{
                          px: 1.5,
                          py: 1,
                          bgcolor: group.bg,
                          borderBottom: `1px solid ${group.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: "#FFFFFF",
                              color: group.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <GroupIcon sx={{ fontSize: 16 }} />
                          </Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 800, color: group.color }}>
                            {group.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontSize: 11, color: "#64748B" }}>
                            {groupTotal.count} bookings
                          </Typography>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: group.color }}>
                            {formatAgentCurrency(groupTotal.amount, currency)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          p: 1.25,
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
                          gap: 1,
                        }}
                      >
                        {group.items.map((card) => {
                          const accent = getStatusCardAccent(card.status);
                          const isEmpty = card.count === 0 && card.totalAmount === 0;

                          return (
                            <Box
                              key={card.status}
                              sx={{
                                border: "1px solid #E8EEF5",
                                borderRadius: 1.5,
                                p: 1.15,
                                bgcolor: isEmpty ? "#FAFBFD" : "#FFFFFF",
                                opacity: isEmpty ? 0.72 : 1,
                                display: "flex",
                                gap: 1,
                                alignItems: "stretch",
                                transition: "box-shadow 0.2s, border-color 0.2s",
                                "&:hover": {
                                  borderColor: accent.color,
                                  boxShadow: "0px 4px 12px rgba(15, 47, 86, 0.06)",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 4,
                                  borderRadius: 999,
                                  bgcolor: accent.color,
                                  flexShrink: 0,
                                }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 0.75,
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: 11.5,
                                      fontWeight: 700,
                                      color: "#0F172A",
                                      lineHeight: 1.3,
                                    }}
                                  >
                                    {card.label}
                                  </Typography>
                                  <Box
                                    sx={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      color: accent.color,
                                      bgcolor: accent.bg,
                                      borderRadius: 999,
                                      px: 0.85,
                                      py: 0.2,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {card.count}
                                  </Box>
                                </Box>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: card.totalAmount > 0 ? "#024DAF" : "#94A3B8",
                                  }}
                                >
                                  {formatAgentCurrency(card.totalAmount, currency)}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const AllAgent = ({ title = "Agent History" }) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchBar, setSearchBar] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [markupInput, setMarkupInput] = useState("");
  const [markupUpdateLoading, setMarkupUpdateLoading] = useState(false);
  const [assignPeople, setAssignPeople] = useState([]);
  const [assignPersonId, setAssignPersonId] = useState(0);
  const [assignPeopleLoading, setAssignPeopleLoading] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState("");
  const [pdfViewerTitle, setPdfViewerTitle] = useState("Document");

  const handleSearchBarChange = (value) => {
    setSearchBar(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchBar("");
    setPage(1);
  };

  const fetchAssignPeople = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      setAssignPeople([]);
      return;
    }

    setAssignPeopleLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ASSIGN_PEOPLE}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const body = response?.data;
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body?.people)
            ? body.people
            : [];
      setAssignPeople(list);
    } catch (err) {
      console.error("Fetch assign people failed:", err?.response?.data || err);
      setAssignPeople([]);
    } finally {
      setAssignPeopleLoading(false);
    }
  }, [token]);

  const handleOpenDetailsModal = (agent) => {
    setSelectedAgent(agent);
    setMarkupInput(agent?.markup != null && agent?.markup !== "" ? String(agent.markup) : "");
    const existingAssignId = Number(agent?.assignPersonId ?? agent?.assign_person_id ?? 0);
    setAssignPersonId(Number.isFinite(existingAssignId) ? existingAssignId : 0);
    setModalOpen(true);
    fetchAssignPeople();
  };

  const handleCloseDetailsModal = () => {
    setModalOpen(false);
    setSelectedAgent(null);
    setMarkupInput("");
    setAssignPersonId(0);
    setPdfViewerOpen(false);
    setPdfViewerUrl("");
    setPdfViewerTitle("Document");
  };

  const handleOpenPdfViewer = (url, title) => {
    if (!url) return;
    setPdfViewerUrl(url);
    setPdfViewerTitle(title || "Document");
    setPdfViewerOpen(true);
  };

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false);
    setPdfViewerUrl("");
    setPdfViewerTitle("Document");
  };

  const renderAgentDocumentPreview = (field, docUrl) => {
    const { label, key } = field;
    const docType = resolveAgentDocumentType(docUrl, key);

    if (docType === "image") {
      return (
        <Box
          component="img"
          src={docUrl}
          alt={label}
          onClick={() => window.open(docUrl, "_blank")}
          sx={{
            width: "100%",
            height: 160,
            objectFit: "contain",
            cursor: "pointer",
            bgcolor: "#FFFFFF",
            p: 1,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        />
      );
    }

    if (docType === "pdf") {
      return (
        <Box
          sx={{
            height: 160,
            display: "flex",
            flexDirection: "column",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              borderBottom: "1px solid #E8EEF5",
              bgcolor: "#F8FAFC",
              overflow: "hidden",
            }}
          >
            <Box
              component="iframe"
              src={`${docUrl}#toolbar=0&navpanes=0`}
              title={label}
              sx={{
                width: "100%",
                height: "100%",
                border: 0,
                display: "block",
                bgcolor: "#FFFFFF",
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 0.75,
              px: 1,
              py: 0.85,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <PictureAsPdfOutlinedIcon sx={{ fontSize: 18, color: "#DC2626", flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#475569",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                PDF Document
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleOpenPdfViewer(docUrl, label)}
                startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: "none",
                  fontSize: 10.5,
                  fontWeight: 600,
                  minWidth: 0,
                  px: 1,
                  py: 0.35,
                  bgcolor: "var(--primary-dark, #024DAF)",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#0B2442", boxShadow: "none" },
                }}
              >
                View
              </Button>
              <IconButton
                size="small"
                onClick={() => window.open(docUrl, "_blank")}
                aria-label={`Open ${label} in new tab`}
                sx={{ color: "#64748B" }}
              >
                <OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      );
    }

    if (docType === "link") {
      return (
        <Box
          sx={{
            height: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            px: 2,
            bgcolor: "#FFFFFF",
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 32, color: "#94A3B8" }} />
          <Button
            size="small"
            variant="outlined"
            onClick={() => window.open(docUrl, "_blank")}
            startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{
              textTransform: "none",
              fontSize: 11,
              fontWeight: 600,
              borderColor: "#CBD5E1",
              color: "#024DAF",
            }}
          >
            Open File
          </Button>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Typography sx={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>
          Not uploaded
        </Typography>
      </Box>
    );
  };

  const handleMarkupInputChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setMarkupInput("");
      return;
    }
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;

    const num = parseFloat(value);
    if (!isNaN(num) && num > MAX_MARKUP_PERCENT) return;

    setMarkupInput(value);
  };

  const handleAddMarkup = async () => {
    if (!selectedAgent) return;
    const value = markupInput.trim();
    if (value === "") {
      toast.error("Please enter a markup value.");
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      toast.error("Please enter a valid markup percentage.");
      return;
    }
    if (num > MAX_MARKUP_PERCENT) {
      toast.error(`Markup cannot exceed ${MAX_MARKUP_PERCENT}%.`);
      return;
    }
    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }
    if (!selectedAgent.email) {
      toast.error("Agent email is missing.");
      setMarkupUpdateLoading(false);
      return;
    }
    setMarkupUpdateLoading(true);
    try {
      const encodedEmail = encodeURIComponent(selectedAgent.email);
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.VERIFY_AGENT}?email=${encodedEmail}`,
        { markup: num, isVerified: selectedAgent.isVerified ?? false },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        setSelectedAgent((prev) => (prev ? { ...prev, markup: num } : null));
        setMarkupInput(String(num));
        toast.success("Markup updated successfully!");
        fetchAgents();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors[0] : null);
      toast.error(apiMessage || "Failed to update markup.");
      console.error("Update markup failed:", err?.response?.data || err);
    } finally {
      setMarkupUpdateLoading(false);
    }
  };

  const handleUpdateAgentStatus = async (isActive) => {
    if (!selectedAgent) return;

    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }
    if (!selectedAgent.email) {
      toast.error("Agent email is missing.");
      return;
    }

    setStatusUpdateLoading(true);

    try {
      const encodedEmail = encodeURIComponent(selectedAgent.email);
      const payload = isActive
        ? {
            isActive: true,
            assignPersonId: Number.isFinite(Number(assignPersonId)) ? Number(assignPersonId) : 0,
          }
        : { isActive: false };

      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.VERIFY_AGENT}?email=${encodedEmail}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(`Agent status updated to ${isActive ? "Active" : "Deactive"} successfully!`);
        fetchAgents();
        handleCloseDetailsModal();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update agent status.";
      toast.error(apiMessage);
      console.error("Update agent status failed:", err?.response?.data || err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleVerifyAgent = async (isApproved) => {
    if (!selectedAgent) return;

    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    if (!selectedAgent.email) {
      toast.error("Agent email is missing.");
      return;
    }

    setStatusUpdateLoading(true);

    try {
      const encodedEmail = encodeURIComponent(selectedAgent.email);
      const markup = selectedAgent.markup != null && selectedAgent.markup !== "" ? Number(selectedAgent.markup) : 0;

      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.VERIFY_AGENT}?email=${encodedEmail}`,
        { markup, isVerified: isApproved },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(`Agent ${isApproved ? "approved" : "rejected"} successfully!`);
        // Refresh the agents list
        fetchAgents();
        // Close the modal
        handleCloseDetailsModal();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        `Failed to ${isApproved ? "approve" : "reject"} agent.`;
      toast.error(apiMessage);
      console.error("Verify agent failed:", err?.response?.data || err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const fetchAgents = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      setError("Authentication token missing. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const q = searchBar.trim();
      if (q) {
        if (q.includes("@")) {
          params.append("email", q);
        } else if (/IOTA/i.test(q) || (/[0-9]/.test(q) && !/\s/.test(q))) {
          params.append("agentId", q);
        } else {
          params.append("name", q);
        }
      }

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ALL_AGENTS}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const responseData = response?.data;
      const agentsData = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
          ? responseData.data
          : [];
      const paginationData = Array.isArray(responseData) ? {} : responseData || {};

      const totalCount = Number(paginationData.total) || agentsData.length || 0;
      const calculatedTotalPages =
        Number(paginationData.totalPages) || Math.ceil(totalCount / limit) || 1;

      let pagedAgents = agentsData;
      if (agentsData.length > limit) {
        const start = (page - 1) * limit;
        pagedAgents = agentsData.slice(start, start + limit);
      }

      setAgents(Array.isArray(pagedAgents) ? pagedAgents : []);
      setTotalPages(Math.max(1, calculatedTotalPages));
      setTotal(totalCount);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load agents.";
      setError(apiMessage);
      setAgents([]);
      console.error("Fetch agents failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchBar, token]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (!token) return undefined;

    const delay = searchBar.trim() ? 350 : 0;
    const timeoutId = setTimeout(() => {
      fetchAgents();
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [page, limit, searchBar, fetchAgents, token]);

  const filteredAgents = useMemo(() => {
    const q = searchBar.trim().toLowerCase();
    if (!q) return agents;

    return agents.filter((agent) => {
      const agentId = String(pickAgentField(agent, "agentId", "agent_id") || "").toLowerCase();
      const name = String(pickAgentField(agent, "name", "agentName", "agent_name") || "").toLowerCase();
      const email = String(pickAgentField(agent, "email") || "").toLowerCase();
      const company = String(
        pickAgentField(agent, "companyName", "company_name") || "",
      ).toLowerCase();
      const mobile = String(
        pickAgentField(agent, "mobile", "phone", "phoneNumber", "phone_number") || "",
      ).toLowerCase();

      return (
        agentId.includes(q) ||
        name.includes(q) ||
        email.includes(q) ||
        company.includes(q) ||
        mobile.includes(q)
      );
    });
  }, [agents, searchBar]);

  const mapAgentToTableRow = (agent) => {
    const markup = pickAgentField(agent, "markup");

    return {
      agentId: pickAgentField(agent, "agentId", "agent_id") || "-",
      name: pickAgentField(agent, "name", "agentName", "agent_name") || "-",
      email: pickAgentField(agent, "email") || "-",
      companyName: pickAgentField(agent, "companyName", "company_name") || "-",
      mobile: pickAgentField(agent, "mobile", "phone", "phoneNumber", "phone_number") || "-",
      businessType: pickAgentField(agent, "businessType", "business_type") || "-",
      address: pickAgentField(agent, "companyAddress", "company_address", "address") || "-",
      markup: markup != null && markup !== "" ? `${markup}%` : "-",
      isActive: getAgentEffectiveStatusLabel(agent),
      isVerified: agent?.isVerified ? "Verified" : "Not Verified",
    };
  };

  const getStatusColors = (statusValue) => {
    if (statusValue === "Active") {
      return { bg: "#10B981", color: "#FFFFFF" };
    }
    if (statusValue === "Inactive") {
      return { bg: "#EF4444", color: "#FFFFFF" };
    }
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const getVerifiedColors = (verifiedValue) => {
    if (verifiedValue === "Verified") {
      return { bg: "#10B981", color: "#FFFFFF" };
    }
    if (verifiedValue === "Not Verified") {
      return { bg: "#F59E0B", color: "#FFFFFF" };
    }
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const renderAgentModalField = (key, value) => {
    if (key === "markup") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder={`e.g. ${MAX_MARKUP_PERCENT}`}
            value={markupInput}
            onChange={handleMarkupInputChange}
            inputProps={{ inputMode: "decimal", min: 0, max: MAX_MARKUP_PERCENT, step: 0.01 }}
            type="text"
            sx={{
              width: 96,
              bgcolor: "#FFFFFF",
              "& .MuiInputBase-input": { fontSize: 14, fontWeight: 600 },
            }}
          />
          <Typography sx={{ fontSize: 14, color: "#64748B", fontWeight: 600 }}>%</Typography>
          <Button
            variant="contained"
            size="small"
            onClick={handleAddMarkup}
            disabled={markupUpdateLoading}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "var(--primary-dark, #024DAF)",
              boxShadow: "none",
              "&:hover": { bgcolor: "#0B2442", boxShadow: "none" },
            }}
          >
            {markupUpdateLoading ? "..." : "Save"}
          </Button>
        </Box>
      );
    }

    if (key === "isVerified" || key === "is_verified") {
      const isVerified = selectedAgent?.isVerified ?? selectedAgent?.is_verified;
      const verifiedLabel = isVerified ? "Verified" : "Not Verified";
      const verifiedColors = getVerifiedColors(verifiedLabel);
      return (
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: verifiedColors.color,
            backgroundColor: verifiedColors.bg,
            borderRadius: 999,
            px: 1.5,
            py: 0.45,
            width: "fit-content",
          }}
        >
          {verifiedLabel}
        </Typography>
      );
    }

    if (key === "isActive" || key === "is_active") {
      const isActive = selectedAgent?.isActive ?? selectedAgent?.is_active;
      return (
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: isActive ? "#059669" : "#DC2626" }}>
          {isActive ? "Yes" : "No"}
        </Typography>
      );
    }

    return renderAgentDetailValue(key, value);
  };

  const renderCell = (columnKey, value, fullAgent = null) => {
    if (columnKey === "agentId") {
      return (
        <Typography
          onClick={() => fullAgent && handleOpenDetailsModal(fullAgent)}
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "#111827",
            backgroundColor: "#EEF2F6",
            borderRadius: 0.8,
            px: 1,
            py: 0.35,
            width: "fit-content",
            whiteSpace: "nowrap",
            cursor: fullAgent ? "pointer" : "default",
            "&:hover": {
              backgroundColor: fullAgent ? "#D1D5DB" : "#EEF2F6",
            },
          }}
        >
          {value}
        </Typography>
      );
    }

    if (columnKey === "isActive") {
      const statusColors = getStatusColors(value);
      return (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: statusColors.color,
            backgroundColor: statusColors.bg,
            borderRadius: 0.8,
            px: 1.2,
            py: 0.4,
            width: "fit-content",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      );
    }

    if (columnKey === "isVerified") {
      const verifiedColors = getVerifiedColors(value);
      return (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: verifiedColors.color,
            backgroundColor: verifiedColors.bg,
            borderRadius: 0.8,
            px: 1.2,
            py: 0.4,
            width: "fit-content",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      );
    }

    if (columnKey === "address") {
      return (
        <Typography sx={tableCellTextSx}>
          {value}
        </Typography>
      );
    }

    if (columnKey === "markup") {
      return (
        <Typography sx={{ ...tableCellTextSx, fontWeight: 600 }}>
          {value}
        </Typography>
      );
    }

    if (columnKey === "action") {
      return (
        <Button
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (fullAgent) {
              handleOpenDetailsModal(fullAgent);
            }
          }}
          sx={{
            textTransform: "none",
            fontSize: 10,
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            backgroundColor: "#0F2F56",
            "&:hover": { backgroundColor: "#0B2442" },
          }}
        >
          View Details
        </Button>
      );
    }

    return (
      <Typography sx={tableCellTextSx}>
        {value}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 1 },
        py: 2,
      }}
    >
      <AdminPageTitleBar
        title={title}
        action={
          <Button
            variant="outlined"
            onClick={() => fetchAgents()}
            sx={{
              textTransform: "none",
              fontSize: 14,
              fontWeight: 700,
              bgcolor: "#FFFFFF",
              color: "var(--primary-dark, #024DAF)",
              borderColor: "rgba(2, 77, 175, 0.35)",
              "&:hover": { bgcolor: "#EAEFF5", borderColor: "rgba(2, 77, 175, 0.45)" },
              height: 36,
              px: 2,
              borderRadius: 1,
            }}
            startIcon={<RefreshIcon />}
          >
            Reload History
          </Button>
        }
      />
      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1,
          border: "1px solid #E5E7EB",
          px: { xs: 2, md: 1.5 },
          py: { xs: 2.5, md: 1 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
       

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by Agent ID, email, or name…"
          value={searchBar}
          onChange={(e) => handleSearchBarChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ color: "var(--primary-dark, #024DAF)", fontSize: 22 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { xs: "100%", sm: 480 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              bgcolor: "#FAFBFC",
              "& fieldset": {
                borderColor: "rgba(2, 77, 175, 0.35)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(2, 77, 175, 0.55)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--primary-dark, #024DAF)",
              },
            },
            "& .MuiInputBase-input": {
              fontSize: 14,
              py: 1.1,
            },
          }}
        />
          {searchBar ? (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                fontSize: 11.5,
                fontWeight: 600,
                height: 40,
                px: 1.5,
                borderColor: "#0F2F56",
                color: "#0F2F56",
                "&:hover": {
                  borderColor: "#0B2442",
                  backgroundColor: "#F0F4F8",
                },
              }}
            >
              Reset
            </Button>
          ) : null}
        </Box>

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 1.5,
            backgroundColor: "#FFFFFF",
            overflowX: "auto",
            overflowY: "auto",
            width: "100%",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "rgba(2, 77, 175, 0.18)",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "var(--primary-dark, #024DAF)",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "var(--primary-dark, #024DAF) !important",
              filter: "brightness(1.1)",
            },
            scrollbarWidth: "thin",
            scrollbarColor: "var(--primary-dark, #024DAF) rgba(13, 48, 95, 0.18) !important",
          }}
        >
          <Box sx={{ width: "100%", minWidth: tableMinWidth }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: tableGridTemplate,
                alignItems: "stretch",
                width: "100%",
                backgroundColor: "var(--primary-dark, #024DAF)",
              }}
            >
              {tableColumns?.map((column) => (
                <Box
                  key={column.key}
                  sx={{
                    ...tableCellBoxSx,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
                    backgroundColor: "transparent",
                  }}
                >
                  <Typography sx={tableHeaderTextSx}>
                    {column.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ color: "#0F2F56" }} />
              </Box>
            ) : error ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#d32f2f" }}>{error}</Typography>
              </Box>
            ) : filteredAgents.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No agents found</Typography>
              </Box>
            ) : (
              filteredAgents.map((agent, index) => {
                const row = mapAgentToTableRow(agent);
                return (
                  <Box
                    key={`${agent.agentId || agent.id || index}-${index}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: tableGridTemplate,
                      alignItems: "stretch",
                      width: "100%",
                    }}
                  >
                    {tableColumns.map((column) => {
                      const value = row[column.key] || "-";
                      return (
                        <Box
                          key={`${agent.agentId || agent.id || index}-${column.key}`}
                          sx={{
                            ...tableCellBoxSx,
                            borderBottom: "1px solid #E5E7EB",
                          }}
                        >
                          {renderCell(column.key, value, agent)}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            pt: 1.25,
            pb: 0.5,
            px: 0.5,
            borderTop: "1px solid #E8EEF5",
            mt: 0.5,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>
            Showing {filteredAgents.length} of {total} agents
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              onClick={() => page > 1 && setPage(page - 1)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: page > 1 ? "pointer" : "not-allowed",
                color: page > 1 ? "#FFFFFF" : "#94A3B8",
                bgcolor: page > 1 ? "var(--primary-dark, #024DAF)" : "#E5E7EB",
              }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </Box>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              const isActive = page === pageNum;
              return (
                <Box
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    color: isActive ? "#FFFFFF" : "#1F2A44",
                    bgcolor: isActive ? "#0F2F56" : "#EAF2FF",
                    border: `1px solid ${isActive ? "#0F2F56" : "#BFDBFE"}`,
                  }}
                >
                  {pageNum}
                </Box>
              );
            })}

            <Box
              onClick={() => page < totalPages && setPage(page + 1)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: page < totalPages ? "pointer" : "not-allowed",
                color: page < totalPages ? "#FFFFFF" : "#94A3B8",
                bgcolor: page < totalPages ? "var(--primary-dark, #024DAF)" : "#E5E7EB",
              }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseDetailsModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "min(920px, 100%)",
            maxHeight: "92vh",
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            outline: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 60px rgba(15, 47, 86, 0.22)",
          }}
        >
          {selectedAgent && (
            <>
              <Box
                sx={{
                  px: { xs: 2.5, sm: 3 },
                  py: 2.5,
                  background: "linear-gradient(135deg, #024DAF 0%, #0F2F56 100%)",
                  color: "#FFFFFF",
                  position: "relative",
                }}
              >
                <IconButton
                  onClick={handleCloseDetailsModal}
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: "rgba(255,255,255,0.14)",
                    color: "#FFFFFF",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, pr: 5 }}>
                  {pickDocumentUrl(selectedAgent, AGENT_DOCUMENT_FIELDS[0]) ? (
                    <Box
                      component="img"
                      src={pickDocumentUrl(selectedAgent, AGENT_DOCUMENT_FIELDS[0])}
                      alt="Agent logo"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        objectFit: "contain",
                        bgcolor: "rgba(255,255,255,0.95)",
                        border: "2px solid rgba(255,255,255,0.35)",
                        p: 0.5,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 2,
                        bgcolor: "rgba(255,255,255,0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <BusinessIcon sx={{ fontSize: 32, opacity: 0.9 }} />
                    </Box>
                  )}

                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                      {pickAgentField(selectedAgent, "name", "agentName") || "Agent Details"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, opacity: 0.88, mb: 1.25 }}>
                      {pickAgentField(selectedAgent, "agentId", "agent_id") || "-"}
                      {pickAgentField(selectedAgent, "companyName", "company_name")
                        ? ` · ${pickAgentField(selectedAgent, "companyName", "company_name")}`
                        : ""}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {(() => {
                        const statusLabel = getAgentEffectiveStatusLabel(selectedAgent);
                        const statusColors = getStatusColors(statusLabel);
                        return (
                          <Typography
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: statusColors.color,
                              bgcolor: statusColors.bg,
                              borderRadius: 999,
                              px: 1.25,
                              py: 0.35,
                            }}
                          >
                            {statusLabel}
                          </Typography>
                        );
                      })()}
                      {(() => {
                        const isVerified = selectedAgent.isVerified ?? selectedAgent.is_verified;
                        const verifiedLabel = isVerified ? "Verified" : "Not Verified";
                        const verifiedColors = getVerifiedColors(verifiedLabel);
                        return (
                          <Typography
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: verifiedColors.color,
                              bgcolor: verifiedColors.bg,
                              borderRadius: 999,
                              px: 1.25,
                              py: 0.35,
                            }}
                          >
                            {verifiedLabel}
                          </Typography>
                        );
                      })()}
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: { xs: 2, sm: 3 },
                  py: 2.5,
                  bgcolor: "#F4F7FB",
                }}
              >
                {buildAgentModalSections(selectedAgent).flatMap((section) => {
                  const SectionIcon = section.icon;
                  const sectionEl = (
                    <Box key={section.title} sx={{ mb: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                        <SectionIcon sx={{ fontSize: 18, color: "var(--primary-dark, #024DAF)" }} />
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                          {section.title}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 1.5,
                        }}
                      >
                        {section.items.map(([key, value]) => {
                          const fullWidth = isFullWidthAgentField(key, value);
                          return (
                            <Box
                              key={key}
                              sx={{
                                ...modalDetailCardSx,
                                gridColumn: fullWidth ? "1 / -1" : undefined,
                              }}
                            >
                              <Typography sx={modalFieldLabelSx}>{humanizeAgentKey(key)}</Typography>
                              {renderAgentModalField(key, value)}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  );

                  if (section.title === "Account & Settings") {
                    return [
                      <React.Fragment key="agent-summary">
                        {renderAgentSummarySection(selectedAgent)}
                      </React.Fragment>,
                      sectionEl,
                    ];
                  }

                  return [sectionEl];
                })}

                <Box
                  sx={{
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E8EEF5",
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "var(--primary-dark, #024DAF)" }} />
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                      Documents
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
                      gap: 1.5,
                    }}
                  >
                    {AGENT_DOCUMENT_FIELDS.map((field) => {
                      const docUrl = pickDocumentUrl(selectedAgent, field);
                      const { label } = field;
                      return (
                        <Box
                          key={field.key}
                          sx={{
                            border: "1px solid #E8EEF5",
                            borderRadius: 1.5,
                            overflow: "hidden",
                            bgcolor: "#FAFBFD",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#64748B",
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              px: 1.25,
                              py: 1,
                              borderBottom: "1px solid #E8EEF5",
                              bgcolor: "#FFFFFF",
                            }}
                          >
                            {label}
                          </Typography>
                          {docUrl ? (
                            renderAgentDocumentPreview(field, docUrl)
                          ) : (
                            <Box
                              sx={{
                                height: 160,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                px: 2,
                              }}
                            >
                              <Typography sx={{ fontSize: 12, color: "#94A3B8", fontStyle: "italic" }}>
                                Not uploaded
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  borderTop: "1px solid #E8EEF5",
                  bgcolor: "#F8FAFC",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Box
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 360 },
                    maxWidth: { xs: "100%", sm: 420 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: 1.5,
                  }}
                >
                  {selectedAgent?.isVerified === true ? (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 14px rgba(15, 47, 86, 0.06)",
                        minWidth: 0,
                        overflow: "hidden",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1.25,
                            bgcolor: "rgba(2, 77, 175, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <PersonOutlineIcon sx={{ fontSize: 16, color: "#024DAF" }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0F172A",
                              lineHeight: 1.2,
                            }}
                          >
                            Assign Person
                          </Typography>
                          <Typography sx={{ fontSize: 11, color: "#64748B", lineHeight: 1.3 }}>
                            Select person before activate
                          </Typography>
                        </Box>
                      </Box>
                      <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
                        <Select
                          value={assignPersonId}
                          onChange={(e) => setAssignPersonId(Number(e.target.value) || 0)}
                          disabled={statusUpdateLoading || assignPeopleLoading}
                          displayEmpty
                          renderValue={(selected) => {
                            const selectedId = Number(selected) || 0;
                            let label = assignPeopleLoading ? "Loading..." : "None (0)";
                            if (selectedId > 0) {
                              const person = assignPeople.find(
                                (item) => Number(item?.id ?? item?._id) === selectedId,
                              );
                              label = person
                                ? [person?.name, person?.email, person?.phone]
                                    .filter(Boolean)
                                    .join(" · ") || `Person #${selectedId}`
                                : `Person #${selectedId}`;
                            }
                            return (
                              <Typography
                                component="span"
                                noWrap
                                title={label}
                                sx={{
                                  display: "block",
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#0F172A",
                                }}
                              >
                                {label}
                              </Typography>
                            );
                          }}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                maxWidth: 360,
                                maxHeight: 280,
                              },
                            },
                          }}
                          sx={{
                            bgcolor: "#F8FAFC",
                            fontSize: 13,
                            fontWeight: 600,
                            borderRadius: 1.5,
                            maxWidth: "100%",
                            "& .MuiSelect-select": {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              pr: 4,
                            },
                            "& .MuiOutlinedInput-notchedOutline": { borderColor: "#DCE5F0" },
                            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94A3B8" },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#024DAF",
                              borderWidth: 1.5,
                            },
                          }}
                        >
                          <MenuItem value={0} sx={{ maxWidth: "100%" }}>
                            <Typography noWrap sx={{ fontSize: 13 }}>
                              {assignPeopleLoading ? "Loading..." : "None (0)"}
                            </Typography>
                          </MenuItem>
                          {assignPeople.map((person) => {
                            const id = Number(person?.id ?? person?._id);
                            if (!Number.isFinite(id)) return null;
                            const label =
                              [person?.name, person?.email, person?.phone]
                                .filter(Boolean)
                                .join(" · ") || `Person #${id}`;
                            return (
                              <MenuItem
                                key={id}
                                value={id}
                                sx={{
                                  maxWidth: "100%",
                                  display: "block",
                                  overflow: "hidden",
                                }}
                              >
                                <Typography
                                  noWrap
                                  title={label}
                                  sx={{
                                    fontSize: 13,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {label}
                                </Typography>
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Box>
                  ) : null}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1.25,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleCloseDetailsModal}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#CBD5E1",
                        color: "#475569",
                        bgcolor: "#FFFFFF",
                        "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
                      }}
                    >
                      Close
                    </Button>
                    {selectedAgent?.isVerified === true ? (
                      <>
                        <Button
                          variant="contained"
                          onClick={() => handleUpdateAgentStatus(true)}
                          disabled={statusUpdateLoading || selectedAgent?.isActive === true}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: "#10B981",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#059669", boxShadow: "none" },
                            "&:disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                          }}
                        >
                          {statusUpdateLoading ? "Updating..." : "Activate"}
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleUpdateAgentStatus(false)}
                          disabled={statusUpdateLoading || selectedAgent?.isActive === false}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: "#EF4444",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#DC2626", boxShadow: "none" },
                            "&:disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                          }}
                        >
                          {statusUpdateLoading ? "Updating..." : "Deactivate"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          onClick={() => handleVerifyAgent(true)}
                          disabled={statusUpdateLoading}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: "#10B981",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#059669", boxShadow: "none" },
                            "&:disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                          }}
                        >
                          {statusUpdateLoading ? "Processing..." : "Approve"}
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleVerifyAgent(false)}
                          disabled={statusUpdateLoading}
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: "#EF4444",
                            boxShadow: "none",
                            "&:hover": { bgcolor: "#DC2626", boxShadow: "none" },
                            "&:disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                          }}
                        >
                          {statusUpdateLoading ? "Processing..." : "Reject"}
                        </Button>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={pdfViewerOpen}
        onClose={handleClosePdfViewer}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 1.5, sm: 2 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "min(960px, 100%)",
            height: "min(88vh, 820px)",
            bgcolor: "#FFFFFF",
            borderRadius: 2,
            outline: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 60px rgba(15, 47, 86, 0.22)",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid #E8EEF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              bgcolor: "#F8FAFC",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <PictureAsPdfOutlinedIcon sx={{ fontSize: 20, color: "#DC2626", flexShrink: 0 }} />
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0F172A",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {pdfViewerTitle}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
              {pdfViewerUrl ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => window.open(pdfViewerUrl, "_blank")}
                  startIcon={<OpenInNewOutlinedIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    textTransform: "none",
                    fontSize: 11.5,
                    fontWeight: 600,
                    borderColor: "#CBD5E1",
                    color: "#024DAF",
                  }}
                >
                  Open in New Tab
                </Button>
              ) : null}
              <IconButton onClick={handleClosePdfViewer} size="small" aria-label="Close PDF viewer">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          {pdfViewerUrl ? (
            <Box
              component="iframe"
              src={pdfViewerUrl}
              title={pdfViewerTitle}
              sx={{
                flex: 1,
                width: "100%",
                border: 0,
                bgcolor: "#FFFFFF",
              }}
            />
          ) : null}
        </Box>
      </Modal>
    </Box>
  );
};

export default AllAgent;
