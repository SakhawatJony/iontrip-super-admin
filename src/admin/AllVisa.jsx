import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

function showApiErrorToasts(err, fallback = "Failed to load visas.") {
  const data = err?.response?.data;
  if (Array.isArray(data?.message) && data.message.length > 0) {
    data.message.forEach((msg) => toast.error(String(msg)));
    return;
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    toast.error(data.message);
    return;
  }
  if (typeof data?.error === "string" && data.error.trim()) {
    toast.error(data.error);
    return;
  }
  toast.error(err?.message || fallback);
}

function normalizeDocumentRequirements(item) {
  const nested = Array.isArray(item?.requirements) ? item.requirements : null;
  if (
    nested &&
    nested.length > 0 &&
    nested.some(
      (row) =>
        row &&
        typeof row === "object" &&
        (row.occupation != null || Array.isArray(row.requirements)),
    )
  ) {
    return nested
      .map((row) => {
        if (typeof row === "string") {
          const text = row.trim();
          return text
            ? {
                profession: "General",
                documents: text,
                exceptionalCase: "",
                note: "",
                items: [text],
              }
            : null;
        }
        const items = Array.isArray(row?.requirements)
          ? row.requirements.map((text) => String(text || "").trim()).filter(Boolean)
          : String(row?.documents || "")
              .split(/[,;|]/)
              .map((s) => s.trim())
              .filter(Boolean);
        const occupation = String(row?.occupation || row?.profession || "Requirement").trim();
        if (!occupation && items.length === 0) return null;
        return {
          profession: occupation || "Requirement",
          documents: items.join(", "),
          exceptionalCase: row?.exceptionalCase || "",
          note: row?.note || "",
          items,
        };
      })
      .filter(Boolean);
  }

  const raw = item?.visaRequiredDocuments;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .map((row) => {
        if (typeof row === "string") {
          return {
            profession: "Requirement",
            documents: row,
            exceptionalCase: "",
            note: "",
            items: [row],
          };
        }
        const items = Array.isArray(row?.requirements)
          ? row.requirements.map((text) => String(text || "").trim()).filter(Boolean)
          : String(row?.documents || "")
              .split(/[,;|]/)
              .map((s) => s.trim())
              .filter(Boolean);
        return {
          profession: row?.occupation || row?.profession || "Requirement",
          documents: items.join(", ") || row?.documents || "",
          exceptionalCase: row?.exceptionalCase || "",
          note: row?.note || "",
          items,
        };
      })
      .filter(Boolean);
  }
  if (raw && typeof raw === "object" && (raw.profession || raw.documents || raw.exceptionalCase || raw.note || raw.occupation)) {
    return [
      {
        profession: raw.occupation || raw.profession || "Requirement",
        documents: raw.documents || "",
        exceptionalCase: raw.exceptionalCase || "",
        note: raw.note || "",
        items: String(raw.documents || "")
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean),
      },
    ];
  }
  if (Array.isArray(item?.requirements) && item.requirements.length > 0) {
    return item.requirements
      .map((text) => String(text || "").trim())
      .filter(Boolean)
      .map((text) => ({
        profession: "Requirement",
        documents: text,
        exceptionalCase: "",
        note: "",
        items: [text],
      }));
  }
  return [];
}

function getDocumentEntries(visa) {
  const nestedGroups = normalizeDocumentRequirements(visa);
  if (nestedGroups.length > 0) {
    const fromGroups = nestedGroups.flatMap((group) =>
      Array.isArray(group.items) && group.items.length > 0
        ? group.items
        : String(group.documents || "")
            .split(/[,;|]/)
            .map((s) => s.trim())
            .filter(Boolean),
    );
    if (fromGroups.length > 0) return fromGroups;
  }

  if (Array.isArray(visa?.requirements) && visa.requirements.length > 0) {
    return visa.requirements
      .flatMap((row) => {
        if (typeof row === "string") return [row.trim()];
        if (Array.isArray(row?.requirements)) {
          return row.requirements.map((text) => String(text || "").trim());
        }
        return [String(row?.documents || row?.requirement || "").trim()];
      })
      .filter(Boolean);
  }

  const raw = visa?.documents;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string") {
    return raw
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

function getFirstVariant(item) {
  if (Array.isArray(item?.variants) && item.variants.length > 0) {
    return item.variants[0];
  }
  const legacy = Array.isArray(item?.durationCosts) ? item.durationCosts[0] : null;
  if (!legacy) return null;
  return {
    visaType: legacy.processingFee || item?.visaType || "",
    entryType: legacy.entry || "",
    durationDays: legacy.duration || "",
    processingSpeed: legacy.processingTime || "",
    visaFee: legacy.embassyFee,
    commission: legacy.agentFee,
    totalPrice: legacy.cost,
    currency: legacy.serviceCharge || "NPR",
  };
}

function getVariantOptions(item) {
  if (Array.isArray(item?.variants) && item.variants.length > 0) {
    return item.variants;
  }
  if (!Array.isArray(item?.durationCosts) || item.durationCosts.length === 0) {
    return [];
  }
  return item.durationCosts.map((row) => ({
    visaType: row?.processingFee || item?.visaType || "",
    entryType: row?.entry || "",
    durationDays: row?.duration || "",
    processingSpeed: row?.processingTime || "",
    visaFee: row?.embassyFee,
    commission: row?.agentFee,
    totalPrice: row?.cost,
    currency: row?.serviceCharge || "NPR",
  }));
}

function isDocumentUrl(value) {
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

function resolveDocumentHref(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return value;
}

function normalizeVisaRow(item, index) {
  const variant = getFirstVariant(item);
  const documentRequirements = normalizeDocumentRequirements(item);
  const documentEntries = getDocumentEntries(item);
  const variantOptions = getVariantOptions(item);

  const costDisplay = variant
    ? [formatCost(variant.totalPrice ?? variant.visaFee), variant.currency]
        .filter((value) => value && value !== "-")
        .join(" ")
    : item?.cost != null
      ? formatCost(item.cost)
      : "-";

  return {
    ...item,
    id: item?.visaId ?? item?.id ?? item?._id ?? `visa-${index}`,
    route: [item?.departureCountry, item?.arrivalCountry].filter(Boolean).join(" → ") || "-",
    entryType: variant?.entryType || "-",
    visaCategory: variant?.entryType || item?.visaCategory || "-",
    visaType: variant?.visaType || item?.visaType || "-",
    duration: variant?.durationDays ? `${variant.durationDays} days` : "-",
    processingSpeed: variant?.processingSpeed || "-",
    maxStay: variant?.processingSpeed || "-",
    cost: costDisplay,
    variants: variantOptions,
    createdAt: item?.createdAt || item?.updatedAt || null,
    documentEntries,
    documentRequirements,
    visaRequiredDocuments: documentRequirements,
  };
}

function formatCost(value) {
  if (value === "-" || value == null || value === "") return "-";
  const num = Number(value);
  if (!Number.isNaN(num)) return num.toLocaleString();
  return String(value);
}

function DetailField({ label, value, highlight = false }) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: "10px",
        bgcolor: highlight ? "rgba(2, 77, 175, 0.06)" : "#F8FAFC",
        border: "1px solid",
        borderColor: highlight ? "rgba(2, 77, 175, 0.18)" : "#EEF2F7",
        height: "100%",
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", mb: 0.4, letterSpacing: 0.2 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: highlight ? 15 : 14,
          fontWeight: highlight ? 800 : 700,
          color: highlight ? "#024DAF" : "#0F172A",
          whiteSpace: "pre-wrap",
          lineHeight: 1.35,
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          bgcolor: "rgba(2, 77, 175, 0.1)",
          color: "#024DAF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#0F2F56", lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ fontSize: 11.5, color: "#64748B", mt: 0.15 }}>{subtitle}</Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function VisaViewModal({ open, visa, onClose }) {
  if (!visa) return null;

  const documentRequirements = visa.documentRequirements?.length
    ? visa.documentRequirements
    : normalizeDocumentRequirements(visa);
  const documentEntries = (visa.documentEntries?.length ? visa.documentEntries : getDocumentEntries(visa)).filter(
    (entry) => isDocumentUrl(entry),
  );
  const variantOptions = visa.variants?.length ? visa.variants : getVariantOptions(visa);
  const firstVariant = variantOptions[0] || null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        backdropFilter: "blur(2px)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 760,
          maxHeight: "90vh",
          bgcolor: "#fff",
          borderRadius: "16px",
          outline: "none",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(15, 47, 86, 0.22)",
          border: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            pt: 2,
            pb: 2.25,
            background: "linear-gradient(135deg, #024DAF 0%, #0F2F56 100%)",
            color: "#fff",
            position: "relative",
            overflow: "visible",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -36,
              right: 48,
              width: 140,
              height: 140,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.07)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1.5,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, minWidth: 0, flex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  bgcolor: "rgba(255,255,255,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mt: 0.15,
                }}
              >
                <FlightTakeoffIcon sx={{ fontSize: 22, color: "#fff" }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1, pt: 0.15 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    letterSpacing: 0.2,
                    color: "rgba(255,255,255,0.82)",
                    mb: 0.55,
                  }}
                >
                  Visa details
                </Typography>
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 800,
                    lineHeight: 1.35,
                    letterSpacing: -0.2,
                    color: "#FFFFFF",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {visa.route || "-"}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              aria-label="Close"
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.14)",
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {(firstVariant?.entryType && firstVariant.entryType !== "-") ||
          (visa.visaCategory && visa.visaCategory !== "-") ||
          (visa.visaType && visa.visaType !== "-") ? (
            <Stack
              direction="row"
              spacing={0.75}
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 1.5, position: "relative", zIndex: 1 }}
            >
              {(firstVariant?.entryType || visa.visaCategory) && (firstVariant?.entryType || visa.visaCategory) !== "-" ? (
                <Chip
                  label={firstVariant?.entryType || visa.visaCategory}
                  size="small"
                  sx={{
                    height: 26,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: "rgba(255,255,255,0.16)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.22)",
                  }}
                />
              ) : null}
              {visa.visaType && visa.visaType !== "-" ? (
                <Chip
                  label={firstVariant?.visaType || visa.visaType}
                  size="small"
                  sx={{
                    height: 26,
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                />
              ) : null}
            </Stack>
          ) : null}
        </Box>

        <Box
          sx={{
            p: 2.5,
            overflowY: "auto",
            bgcolor: "#FAFBFC",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "rgba(2, 77, 175, 0.28)",
              borderRadius: 999,
            },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" },
              gap: 1.25,
              mb: 2.5,
            }}
          >
            <DetailField label="Route" value={visa.route} />
            <DetailField label="Entry type" value={firstVariant?.entryType || visa.visaCategory} />
            <DetailField label="Visa type" value={firstVariant?.visaType || visa.visaType} />
            <DetailField label="Total cost" value={visa.cost} highlight />
          </Box>

          {variantOptions.length > 0 ? (
            <Box sx={{ mb: 2.5 }}>
              <SectionHeading
                icon={<ScheduleOutlinedIcon sx={{ fontSize: 18 }} />}
                title="Pricing variants"
                subtitle={`${variantOptions.length} variant${variantOptions.length === 1 ? "" : "s"} available`}
              />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {variantOptions.map((row, i) => (
                  <Box
                    key={`variant-${i}`}
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(15, 47, 86, 0.04)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
                      <Chip
                        label={row.visaType || `Variant ${i + 1}`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: "#EAF2FF",
                          color: "#024DAF",
                        }}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#024DAF" }}>
                        <PaymentsOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                          {[formatCost(row.totalPrice ?? row.visaFee), row.currency].filter(Boolean).join(" ")}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                        gap: 1,
                      }}
                    >
                      <DetailField label="Entry type" value={row.entryType} />
                      <DetailField label="Duration" value={row.durationDays ? `${row.durationDays} days` : "-"} />
                      <DetailField label="Processing" value={row.processingSpeed} />
                      <DetailField label="Visa fee" value={formatCost(row.visaFee)} />
                      <DetailField label="Commission" value={formatCost(row.commission)} />
                      <DetailField label="Currency" value={row.currency} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : null}

          <Box>
            <SectionHeading
              icon={<DescriptionOutlinedIcon sx={{ fontSize: 18 }} />}
              title="Requirements"
              subtitle={
                documentEntries.length > 0
                  ? `${documentEntries.length} requirement${documentEntries.length === 1 ? "" : "s"}`
                  : documentRequirements.length > 0
                    ? `${documentRequirements.length} profession group${documentRequirements.length === 1 ? "" : "s"}`
                    : "No requirements added"
              }
            />

            {documentRequirements.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {documentRequirements.map((docs, idx) => (
                  <Box
                    key={`doc-req-${idx}`}
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(15, 47, 86, 0.04)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
                      <WorkOutlineIcon sx={{ fontSize: 17, color: "#024DAF" }} />
                      <Chip
                        label={docs.profession || `Occupation ${idx + 1}`}
                        size="small"
                        sx={{
                          height: 26,
                          fontSize: 11,
                          fontWeight: 700,
                          bgcolor: "#EAF2FF",
                          color: "#024DAF",
                        }}
                      />
                    </Box>
                    {Array.isArray(docs.items) && docs.items.length > 0 ? (
                      <Box component="ul" sx={{ m: 0, pl: 2.25, display: "flex", flexDirection: "column", gap: 0.5 }}>
                        {docs.items.map((item, itemIdx) => (
                          <Typography
                            component="li"
                            key={`${item}-${itemIdx}`}
                            sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.4 }}
                          >
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <DetailField label="Documents" value={docs.documents} />
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                          <DetailField label="Exceptional case" value={docs.exceptionalCase} />
                          <DetailField label="Note" value={docs.note} />
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  py: 3,
                  px: 2,
                  textAlign: "center",
                  borderRadius: "12px",
                  border: "1px dashed #CBD5E1",
                  bgcolor: "#FFFFFF",
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 28, color: "#94A3B8", mb: 0.75 }} />
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                  No document requirements listed
                </Typography>
              </Box>
            )}

            {documentEntries.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <SectionHeading
                  icon={<AttachFileOutlinedIcon sx={{ fontSize: 18 }} />}
                  title="Files & links"
                  subtitle={`${documentEntries.length} attachment${documentEntries.length === 1 ? "" : "s"}`}
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {documentEntries.map((entry, idx) => {
                    const href = isDocumentUrl(entry) ? resolveDocumentHref(entry) : "";
                    return href ? (
                      <Button
                        key={`${entry}-${idx}`}
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#024DAF",
                          bgcolor: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: "10px",
                          px: 1.5,
                          py: 1,
                          "&:hover": { bgcolor: "#F0F7FF", borderColor: "#BFDBFE" },
                        }}
                      >
                        {entry}
                      </Button>
                    ) : (
                      <Box
                        key={`${entry}-${idx}`}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: "10px",
                          bgcolor: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        <Typography sx={{ fontSize: 13, color: "#111827" }}>• {entry}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default function AllVisa() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const tableColumns = useMemo(
    () => [
      { key: "route", label: "Route", width: "180px" },
      { key: "visaCategory", label: "Entry Type", width: "120px" },
      { key: "visaType", label: "Visa Type", width: "130px" },
      { key: "duration", label: "Duration", width: "110px" },
      { key: "maxStay", label: "Processing", width: "130px" },
      { key: "cost", label: "Cost", width: "110px" },
      { key: "documents", label: "Requirements", width: "100px" },
      { key: "action", label: "Action", width: "100px" },
    ],
    [],
  );

  const actionBtnSx = {
    minWidth: 32,
    width: 32,
    height: 32,
    p: 0,
    borderRadius: 1,
    border: "1px solid #E2E8F0",
    color: "#024DAF",
    "&:hover": { bgcolor: "rgba(2, 77, 175, 0.08)", borderColor: "#024DAF" },
  };

  const tableGridTemplate = useMemo(
    () => fluidGridTemplateFromColumns(tableColumns),
    [tableColumns],
  );

  const [loading, setLoading] = useState(true);
  const [visas, setVisas] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [deletingVisaId, setDeletingVisaId] = useState(null);

  const handleOpenView = (visa) => {
    setSelectedVisa(visa);
    setViewOpen(true);
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedVisa(null);
  };

  const handleEditVisa = (visa) => {
    navigate("/dashboard/visa/addvisa", { state: { visa, editMode: true } });
  };

  const fetchVisas = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      setLoading(false);
      setVisas([]);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.FIND_ALL_VISA}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const body = response?.data || {};
      const list = Array.isArray(body) ? body : body.data || [];
      const rows = list.map((item, index) => normalizeVisaRow(item, index));

      const totalCount = body.total ?? rows.length ?? 0;
      const pages =
        body.totalPages ?? (Math.ceil(Number(totalCount) / limit) || 1);

      setVisas(rows);
      setTotal(totalCount);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      showApiErrorToasts(err);
      setVisas([]);
      setTotal(0);
      setTotalPages(1);
      console.error("Fetch visas failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, token]);

  useEffect(() => {
    fetchVisas();
  }, [fetchVisas]);

  const handleDeleteVisa = async (visa) => {
    const visaId = visa?.visaId ?? visa?.id ?? visa?._id;
    if (visaId == null || String(visaId).startsWith("visa-")) {
      toast.error("Visa ID not found.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete visa?",
      text: `"${visa.route}" will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    const visaIdText = String(visaId);

    try {
      setDeletingVisaId(visaIdText);
      const response = await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.DELETE_VISA(visaIdText)}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201 || response.status === 204) {
        Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });

        if (viewOpen && String(selectedVisa?.id) === visaIdText) {
          handleCloseView();
        }

        if (visas.length === 1 && page > 1) {
          setPage((current) => Math.max(1, current - 1));
        } else {
          fetchVisas();
        }
      }
    } catch (err) {
      showApiErrorToasts(err, "Failed to delete visa.");
      console.error("Delete visa failed:", err?.response?.data || err);
    } finally {
      setDeletingVisaId(null);
    }
  };

  const renderCell = (visa, column) => {
    if (column.key === "action") {
      return (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <IconButton
            size="small"
            sx={actionBtnSx}
            onClick={(e) => {
              e.stopPropagation();
              handleEditVisa(visa);
            }}
            aria-label="Edit visa"
          >
            <EditOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              ...actionBtnSx,
              color: "#EF4444",
              "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)", borderColor: "#EF4444" },
            }}
            disabled={deletingVisaId === String(visa?.visaId ?? visa?.id ?? visa?._id)}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteVisa(visa);
            }}
            aria-label="Delete visa"
          >
            {deletingVisaId === String(visa?.visaId ?? visa?.id ?? visa?._id) ? (
              <CircularProgress size={16} sx={{ color: "#EF4444" }} />
            ) : (
              <DeleteOutlineIcon sx={{ fontSize: 17 }} />
            )}
          </IconButton>
        </Stack>
      );
    }

    if (column.key === "cost") {
      const value = visa.cost;
      const text = value === "-" ? "-" : typeof value === "number" ? value : String(value);
      return <Typography sx={{ fontSize: 12, color: "#111827" }}>{text}</Typography>;
    }

    if (column.key === "documents") {
      return (
        <Button
          variant="outlined"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenView(visa);
          }}
          sx={{
            textTransform: "none",
            fontSize: 10,
            fontWeight: 600,
            minWidth: 52,
            px: 1.25,
            py: 0.25,
            borderColor: "#024DAF",
            color: "#024DAF",
            "&:hover": { borderColor: "#0A2B76", bgcolor: "#F0F7FF" },
          }}
        >
          View
        </Button>
      );
    }

    return (
      <Typography
        sx={{
          fontSize: 12,
          color: "#111827",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          width: "100%",
        }}
      >
        {visa[column.key] ?? "-"}
      </Typography>
    );
  };

  return (
    <Box>
      <AdminPageTitleBar
        title="Visa History"
        subtitle={total > 0 ? `${total} visa record${total === 1 ? "" : "s"}` : undefined}
        action={
          <>
            <Button
              variant="contained"
              onClick={() => fetchVisas()}
              disabled={loading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#FFFFFF",
                color: "var(--primary-dark, #0F2F56)",
                "&:hover": { bgcolor: "#EAEFF5" },
              }}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/visa/addvisa")}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "#FFFFFF",
                color: "var(--primary-dark, #0F2F56)",
                "&:hover": { bgcolor: "#EAEFF5" },
              }}
              startIcon={<AddCircleOutlineIcon />}
            >
              Add Visa
            </Button>
          </>
        }
      />

      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 1.5,
          backgroundColor: "#FFFFFF",
          overflowX: "hidden",
          width: "100%",
        }}
      >
        <Box sx={{ width: "100%", minWidth: 0 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: tableGridTemplate,
              alignItems: "stretch",
              width: "100%",
              backgroundColor: "var(--primary-dark, #024DAF)",
            }}
          >
            {tableColumns.map((column) => (
              <Box
                key={column.key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: column.key === "action" ? "center" : "flex-start",
                  px: 2,
                  py: 1,
                  borderBottom: "1px solid #E5E7EB",
                  backgroundColor: "var(--primary-dark, #024DAF)",
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                >
                  {column.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <CircularProgress size={24} sx={{ color: "var(--primary-dark, #0F2F56)" }} />
            </Box>
          ) : visas.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No visa found</Typography>
            </Box>
          ) : (
            visas.map((visa, index) => (
              <Box
                key={`${visa.id}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: tableGridTemplate,
                  alignItems: "stretch",
                  width: "100%",
                }}
              >
                {tableColumns.map((column) => (
                  <Box
                    key={`${visa.id}-${column.key}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: column.key === "action" ? "center" : "flex-start",
                      px: 2,
                      py: 1.4,
                      borderBottom: "1px solid #E5E7EB",
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    {renderCell(visa, column)}
                  </Box>
                ))}
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box
            onClick={() => page > 1 && setPage(page - 1)}
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: page > 1 ? "#1F2A44" : "#9CA3AF",
              backgroundColor: page > 1 ? "#D1D5DB" : "#E5E7EB",
              cursor: page > 1 ? "pointer" : "not-allowed",
            }}
          >
            ‹
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
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? "#FFFFFF" : "#1F2A44",
                  backgroundColor: isActive ? "var(--primary-dark, #0F2F56)" : "#EAF2FF",
                  cursor: "pointer",
                }}
              >
                {pageNum}
              </Box>
            );
          })}

          <Box
            onClick={() => page < totalPages && setPage(page + 1)}
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: page < totalPages ? "#1F2A44" : "#9CA3AF",
              backgroundColor: page < totalPages ? "#D1D5DB" : "#E5E7EB",
              cursor: page < totalPages ? "pointer" : "not-allowed",
            }}
          >
            ›
          </Box>
        </Box>
      </Box>

      <VisaViewModal open={viewOpen} visa={selectedVisa} onClose={handleCloseView} />
    </Box>
  );
}
