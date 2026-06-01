import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
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

function getDocumentEntries(visa) {
  const raw = visa?.visaRequiredDocuments?.documents ?? visa?.documents;
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
  const firstDuration = Array.isArray(item?.durationCosts) ? item.durationCosts[0] : null;
  const visaRequiredDocuments = item?.visaRequiredDocuments || {};
  const documentEntries = getDocumentEntries(item);

  return {
    ...item,
    id: item?._id || item?.id || `visa-${index}`,
    route: [item?.departureCountry, item?.arrivalCountry].filter(Boolean).join(" → ") || "-",
    visaCategory: item?.visaCategory || "-",
    visaType: item?.visaType || "-",
    duration: firstDuration?.duration || "-",
    maxStay: firstDuration?.maximumStay || "-",
    cost: item?.cost ?? firstDuration?.cost ?? "-",
    createdAt: item?.createdAt || item?.updatedAt || null,
    documentEntries,
    visaRequiredDocuments,
  };
}

function DetailField({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", whiteSpace: "pre-wrap" }}>
        {value || "-"}
      </Typography>
    </Box>
  );
}

function VisaViewModal({ open, visa, onClose }) {
  if (!visa) return null;

  const docs = visa.visaRequiredDocuments || {};
  const documentEntries = visa.documentEntries?.length ? visa.documentEntries : getDocumentEntries(visa);

  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          bgcolor: "#fff",
          borderRadius: 2,
          p: 3,
          outline: "none",
          overflowY: "auto",
          boxShadow: "0 20px 50px rgba(15, 47, 86, 0.2)",
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(15, 47, 86, 0.08)",
            "&:hover": { bgcolor: "rgba(15, 47, 86, 0.14)" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#0F2F56", mb: 2 }}>
          Visa details
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
          <DetailField label="Route" value={visa.route} />
          <DetailField label="Category" value={visa.visaCategory} />
          <DetailField label="Visa type" value={visa.visaType} />
          <DetailField label="Base cost" value={visa.cost} />
          <DetailField label="Added date" value={visa.createdAt ? new Date(visa.createdAt).toLocaleString() : "-"} />
        </Box>

        {Array.isArray(visa.durationCosts) && visa.durationCosts.length > 0 ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F2F56", mb: 1.5 }}>
              Duration & pricing
            </Typography>
            {visa.durationCosts.map((row, i) => (
              <Box
                key={`duration-${i}`}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  border: "1px solid #E5E7EB",
                  bgcolor: "#FAFBFC",
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#334155", mb: 1 }}>
                  Option {i + 1}
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                  <DetailField label="Cost" value={row.cost} />
                  <DetailField label="Entry" value={row.entry} />
                  <DetailField label="Duration" value={row.duration} />
                  <DetailField label="Maximum stay" value={row.maximumStay} />
                  <DetailField label="Processing time" value={row.processingTime} />
                  <DetailField label="Interview" value={row.interview} />
                </Box>
              </Box>
            ))}
          </>
        ) : null}

        <Divider sx={{ my: 2 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F2F56", mb: 1.5 }}>
          Required documents
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <DetailField label="Profession" value={docs.profession} />
          <DetailField label="Documents" value={docs.documents} />
          <DetailField label="Exceptional case" value={docs.exceptionalCase} />
          <DetailField label="Note" value={docs.note} />

          {documentEntries.length > 0 ? (
            <Box>
              <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.75 }}>Files / links</Typography>
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
                        color: "#024DAF",
                      }}
                    >
                      {entry}
                    </Button>
                  ) : (
                    <Typography key={`${entry}-${idx}`} sx={{ fontSize: 13, color: "#111827" }}>
                      • {entry}
                    </Typography>
                  );
                })}
              </Box>
            </Box>
          ) : null}
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
      { key: "route", label: "Route", width: "200px" },
      { key: "visaCategory", label: "Category", width: "140px" },
      { key: "visaType", label: "Visa Type", width: "150px" },
      { key: "duration", label: "Duration", width: "130px" },
      { key: "maxStay", label: "Maximum Stay", width: "150px" },
      { key: "cost", label: "Cost", width: "100px" },
      { key: "documents", label: "Documents", width: "90px" },
      { key: "createdAt", label: "Added Date", width: "160px" },
    ],
    [],
  );

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

  const handleOpenView = (visa) => {
    setSelectedVisa(visa);
    setViewOpen(true);
  };

  const handleCloseView = () => {
    setViewOpen(false);
    setSelectedVisa(null);
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const renderCell = (visa, column) => {
    if (column.key === "createdAt") {
      return (
        <Typography sx={{ fontSize: 12, color: "#111827" }}>{formatDate(visa.createdAt)}</Typography>
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
