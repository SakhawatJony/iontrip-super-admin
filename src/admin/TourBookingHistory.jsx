import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import axios from "axios";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const TOUR_ENQUIRIES_API = "https://api.iontrip.com/admin/tour-package-enquiries";

const C = {
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#0F2F56",
  secondary: "#024DAF",
  secondarySoft: "rgba(2, 77, 175, 0.08)",
};

const toolbarFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: 13,
    bgcolor: "#FAFBFC",
    height: 40,
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: C.secondary, borderWidth: 1 },
  },
};

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.enquiries)) return payload.enquiries;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.enquiries)) return payload.data.enquiries;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function unwrapTotal(payload, listLength) {
  const candidates = [
    payload?.total,
    payload?.totalCount,
    payload?.count,
    payload?.meta?.total,
    payload?.pagination?.total,
    payload?.data?.total,
    payload?.data?.totalCount,
    payload?.data?.meta?.total,
    payload?.data?.pagination?.total,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return listLength;
}

function getItemId(item) {
  return item?.id ?? item?._id ?? item?.enquiryId ?? null;
}

function pickText(...values) {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text, max = 80) {
  const s = String(text || "").trim();
  if (!s) return "";
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

export default function TourBookingHistory() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [enquiryId, setEnquiryId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const [applied, setApplied] = useState({
    enquiryId: "",
    packageId: "",
    email: "",
    phone: "",
    createdFrom: "",
    createdTo: "",
  });

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const tableColumns = useMemo(
    () => [
      { key: "sl", label: "#", width: "48px" },
      { key: "enquiryId", label: "Enquiry ID", width: "130px" },
      { key: "packageId", label: "Package ID", width: "130px" },
      { key: "customer", label: "Customer", width: "minmax(140px, 1.2fr)" },
      { key: "email", label: "Email", width: "minmax(160px, 1.3fr)" },
      { key: "phone", label: "Phone", width: "120px" },
      { key: "message", label: "Message", width: "minmax(160px, 1.5fr)" },
      { key: "createdAt", label: "Created", width: "150px" },
    ],
    [],
  );

  const tableGridTemplate = useMemo(() => fluidGridTemplateFromColumns(tableColumns), [tableColumns]);
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit) || 1);

  const fetchEnquiries = useCallback(async () => {
    const authToken = String(token || localStorage.getItem("adminToken") || "").trim();
    if (!authToken) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      toast.error("Admin token missing. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const params = { page, limit };
      if (applied.enquiryId.trim()) params.enquiryId = applied.enquiryId.trim();
      if (applied.packageId.trim()) params.packageId = applied.packageId.trim();
      if (applied.email.trim()) params.email = applied.email.trim();
      if (applied.phone.trim()) params.phone = applied.phone.trim();
      if (applied.createdFrom.trim()) params.createdFrom = applied.createdFrom.trim();
      if (applied.createdTo.trim()) params.createdTo = applied.createdTo.trim();

      const response = await axios.get(TOUR_ENQUIRIES_API, {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      });

      const list = unwrapList(response.data);
      setRows(list);
      setTotal(unwrapTotal(response.data, list.length));
    } catch (err) {
      console.error("Error fetching tour enquiries:", err);
      setRows([]);
      setTotal(0);
      const msg = err?.response?.data?.message || err?.message || "Failed to load tour booking history.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
    } finally {
      setLoading(false);
    }
  }, [token, applied, page, limit]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleApply = () => {
    setPage(1);
    setApplied({
      enquiryId: enquiryId.trim(),
      packageId: packageId.trim(),
      email: email.trim(),
      phone: phone.trim(),
      createdFrom: createdFrom.trim(),
      createdTo: createdTo.trim(),
    });
  };

  const handleReset = () => {
    setEnquiryId("");
    setPackageId("");
    setEmail("");
    setPhone("");
    setCreatedFrom("");
    setCreatedTo("");
    setApplied({
      enquiryId: "",
      packageId: "",
      email: "",
      phone: "",
      createdFrom: "",
      createdTo: "",
    });
    setPage(1);
  };

  const renderCell = (item, column, rowIndex) => {
    const enqId = pickText(item?.enquiryId, item?.enquiry_id, item?.id);
    const pkgId = pickText(item?.packageId, item?.package_id, item?.tourPackageId);
    const name = pickText(
      item?.customerName,
      item?.name,
      item?.fullName,
      item?.userName,
      [item?.firstName, item?.lastName].filter(Boolean).join(" "),
    );
    const mail = pickText(item?.email, item?.customerEmail, item?.userEmail, item?.user?.email);
    const phoneVal = pickText(item?.phone, item?.mobile, item?.phoneNumber, item?.customerPhone);
    const message = pickText(item?.message, item?.note, item?.remarks, item?.comment);

    if (column.key === "sl") {
      return (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
          {(page - 1) * limit + rowIndex + 1}
        </Typography>
      );
    }

    if (column.key === "enquiryId") {
      return (
        <Typography
          onClick={() => {
            if (!enqId) return;
            navigate(`/dashboard/tour/enquirydetails/${encodeURIComponent(enqId)}`, {
              state: { enquiry: item },
            });
          }}
          sx={{
            fontSize: 12.5,
            fontWeight: 700,
            color: C.secondary,
            cursor: enqId ? "pointer" : "default",
            textDecoration: enqId ? "underline" : "none",
          }}
        >
          {enqId || "—"}
        </Typography>
      );
    }

    if (column.key === "packageId") {
      return (
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>
          {pkgId || "—"}
        </Typography>
      );
    }

    if (column.key === "customer") {
      return (
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: C.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={name || undefined}
        >
          {name || "—"}
        </Typography>
      );
    }

    if (column.key === "email") {
      return (
        <Typography
          sx={{
            fontSize: 12.5,
            color: C.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={mail || undefined}
        >
          {mail || "—"}
        </Typography>
      );
    }

    if (column.key === "phone") {
      return (
        <Typography sx={{ fontSize: 12.5, color: C.text }}>
          {phoneVal || "—"}
        </Typography>
      );
    }

    if (column.key === "message") {
      return (
        <Typography
          sx={{
            fontSize: 12.5,
            color: C.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
          title={message || undefined}
        >
          {truncate(message, 100) || "—"}
        </Typography>
      );
    }

    if (column.key === "createdAt") {
      return (
        <Typography sx={{ fontSize: 12, color: C.text }}>
          {formatDateTime(item?.createdAt || item?.created_at || item?.enquiryDate)}
        </Typography>
      );
    }

    return <Typography sx={{ fontSize: 12, color: C.text }}>—</Typography>;
  };

  return (
    <Box>
      <AdminPageTitleBar
        title="Tour Booking History"
        action={
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={fetchEnquiries}
              sx={{ border: "1px solid rgba(255,255,255,0.35)", color: "#fff", borderRadius: "10px" }}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        }
      />

      <Box
        sx={{
          bgcolor: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(15, 47, 86, 0.06)",
          mb: 2,
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.75,
            borderBottom: `1px solid ${C.border}`,
            background: `linear-gradient(90deg, ${C.secondarySoft} 0%, transparent 55%)`,
          }}
        >
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            <TextField
              size="small"
              placeholder="Enquiry ID"
              value={enquiryId}
              onChange={(e) => setEnquiryId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              sx={{ ...toolbarFieldSx, minWidth: 140 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: C.muted }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              placeholder="Package ID"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              sx={{ ...toolbarFieldSx, minWidth: 140 }}
            />
            <TextField
              size="small"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              sx={{ ...toolbarFieldSx, minWidth: 180 }}
            />
            <TextField
              size="small"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              sx={{ ...toolbarFieldSx, minWidth: 130 }}
            />
            <TextField
              size="small"
              type="date"
              label="From"
              InputLabelProps={{ shrink: true }}
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 150 }}
            />
            <TextField
              size="small"
              type="date"
              label="To"
              InputLabelProps={{ shrink: true }}
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 150 }}
            />
            <Button
              variant="contained"
              onClick={handleApply}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: C.secondary,
                height: 40,
                px: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: C.primary },
              }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: C.muted,
                borderColor: C.border,
                height: 40,
                px: 2,
              }}
            >
              Reset
            </Button>
          </Stack>
        </Box>

        <Box sx={{ width: "100%", minWidth: 0, overflowX: "auto" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: tableGridTemplate,
              alignItems: "stretch",
              minWidth: 980,
              bgcolor: C.secondary,
            }}
          >
            {tableColumns.map((column) => (
              <Box key={column.key} sx={{ px: 2, py: 1.25, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                  }}
                >
                  {column.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={28} sx={{ color: C.secondary }} />
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
              <LuggageOutlinedIcon sx={{ fontSize: 36, color: C.muted, mb: 1 }} />
              <Typography sx={{ fontSize: 13, color: C.muted }}>No tour enquiries found</Typography>
            </Box>
          ) : (
            rows.map((item, index) => (
              <Box
                key={`${getItemId(item) || "enq"}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: tableGridTemplate,
                  alignItems: "stretch",
                  minWidth: 980,
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                {tableColumns.map((column) => (
                  <Box
                    key={`${getItemId(item)}-${column.key}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 2,
                      py: 1.25,
                      borderBottom: `1px solid ${C.border}`,
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    {renderCell(item, column, index)}
                  </Box>
                ))}
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Typography sx={{ fontSize: 12, color: C.muted }}>
          Total: {total} · Page {page} of {totalPages}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box
            onClick={() => page > 1 && setPage(page - 1)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: page > 1 ? C.primary : "#9CA3AF",
              backgroundColor: page > 1 ? "#D1D5DB" : "#E5E7EB",
              cursor: page > 1 ? "pointer" : "not-allowed",
            }}
          >
            ‹
          </Box>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum = i + 1;
            if (totalPages > 5) {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              pageNum = start + i;
            }
            const isActivePage = page === pageNum;
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
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActivePage ? "#FFFFFF" : C.primary,
                  backgroundColor: isActivePage ? C.primary : "#EAF2FF",
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
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: page < totalPages ? C.primary : "#9CA3AF",
              backgroundColor: page < totalPages ? "#D1D5DB" : "#E5E7EB",
              cursor: page < totalPages ? "pointer" : "not-allowed",
            }}
          >
            ›
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
