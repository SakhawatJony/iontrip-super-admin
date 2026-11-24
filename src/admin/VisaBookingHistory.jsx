import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { fixedGridTemplateFromColumns, tableMinWidthFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";
import AdminPagination from "./AdminPagination.jsx";

const C = {
  pageBg: "var(--page-bg, #F4F7FE)",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#111827",
  muted: "#6B7280",
  primary: "#0F2F56",
  secondary: "#024DAF",
  softBlue: "#EAF2FF",
};

const TABLE_COLUMNS = [
  { key: "bookingId", label: "Booking Id", width: "130px" },
  { key: "userEmail", label: "User Email", width: "180px" },
  { key: "applicant", label: "Applicant", width: "140px" },
  { key: "country", label: "Country", width: "110px" },
  { key: "visaType", label: "Visa Type", width: "110px" },
  { key: "amount", label: "Amount", width: "110px" },
  { key: "bookingTime", label: "Booking Time", width: "150px" },
  { key: "status", label: "Status", width: "200px" },
];

const TABLE_GRID = `${fixedGridTemplateFromColumns(TABLE_COLUMNS.slice(0, -1))} minmax(200px, 1fr)`;
const TABLE_MIN_WIDTH = tableMinWidthFromColumns(TABLE_COLUMNS.slice(0, -1)) + 200;

const STATUS_OPTIONS = [
  { value: "", label: "All status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refund", label: "Refund" },
  { value: "completed", label: "Completed" },
];

function pickArray(...candidates) {
  for (const value of candidates) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeVisaBookingsResponse(payload) {
  const root = payload?.data && !Array.isArray(payload.data) ? payload.data : payload;
  const nested =
    root?.data && typeof root.data === "object" && !Array.isArray(root.data) ? root.data : root;

  const items = pickArray(
    nested?.bookings,
    nested?.items,
    nested?.results,
    nested?.records,
    nested?.data,
    root?.bookings,
    root?.items,
    root?.results,
    Array.isArray(root) ? root : null,
    Array.isArray(payload?.data) ? payload.data : null,
  );

  const pagination =
    nested?.pagination || nested?.meta || root?.pagination || root?.meta || payload?.pagination || {};

  const total =
    pagination?.total ?? nested?.total ?? root?.total ?? payload?.total ?? items.length;
  const page = pagination?.page ?? nested?.page ?? root?.page ?? payload?.page ?? 1;
  const limit = pagination?.limit ?? nested?.limit ?? root?.limit ?? payload?.limit ?? 20;
  const totalPages =
    pagination?.totalPages ??
    nested?.totalPages ??
    root?.totalPages ??
    payload?.totalPages ??
    Math.max(1, Math.ceil(Number(total || 0) / Number(limit || 20)));

  return {
    items,
    total: Number(total) || 0,
    page: Number(page) || 1,
    limit: Number(limit) || 20,
    totalPages: Math.max(1, Number(totalPages) || 1),
  };
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmount(item) {
  const amount =
    item?.totalCost ??
    item?.totalAmount ??
    item?.cost ??
    item?.amount ??
    item?.price ??
    item?.durationCost?.cost ??
    item?.visaVariant?.totalPrice ??
    item?.visaVariant?.visaFee ??
    null;
  if (amount == null || amount === "") return "-";
  const currency = item?.currency || item?.farecurrency || item?.visaVariant?.currency || "BDT";
  const numeric = Number(amount);
  if (Number.isFinite(numeric)) {
    return `${currency} ${numeric.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${currency} ${amount}`;
}

function resolveApplicant(item) {
  const applicants = pickArray(
    item?.applicants,
    item?.applicantList,
    item?.travelers,
    item?.passengers,
  );
  const primary = applicants[0] || {};
  return (
    primary.applicantName ||
    primary.name ||
    primary.fullName ||
    item?.applicantName ||
    item?.applicant ||
    item?.name ||
    (applicants.length > 1 ? `${applicants.length} applicants` : "-")
  );
}

function mapRow(item) {
  return {
    bookingId: item?.bookingId || item?.id || item?.visaBookingId || item?.reference || "-",
    userEmail:
      item?.userEmail ||
      item?.user?.email ||
      item?.email ||
      item?.applicantEmail ||
      item?.applicants?.[0]?.applicantEmail ||
      item?.applicants?.[0]?.email ||
      "-",
    applicant: resolveApplicant(item),
    country:
      item?.arrivalCountry ||
      item?.country ||
      item?.destinationCountry ||
      item?.visa?.arrivalCountry ||
      item?.toCountry ||
      "-",
    visaType:
      item?.visaCategory ||
      item?.visaType ||
      item?.category ||
      item?.visa?.visaCategory ||
      item?.visaVariant?.visaType ||
      "-",
    amount: formatAmount(item),
    bookingTime: formatDateTime(
      item?.bookingTime || item?.createdAt || item?.updatedAt || item?.submittedAt,
    ),
    status: item?.status || item?.bookingStatus || "-",
  };
}

function getStatusColors(statusValue) {
  const s = String(statusValue || "").toLowerCase().trim();
  if (!s || s === "-") return { bg: "#F3F4F6", color: "#6B7280" };
  if (s.includes("confirm") || s.includes("complete") || s.includes("approved") || s.includes("success")) {
    return { bg: "#DCFCE7", color: "#166534" };
  }
  if (s.includes("pending") || s.includes("process") || s.includes("hold")) {
    return { bg: "#FEF3C7", color: "#92400E" };
  }
  if (s.includes("cancel") || s.includes("fail") || s.includes("reject")) {
    return { bg: "#FEE2E2", color: "#991B1B" };
  }
  if (s.includes("refund")) return { bg: "#FFE4E6", color: "#9F1239" };
  return { bg: "#EAF2FF", color: "#0F2F56" };
}

const filterShellSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  backgroundColor: C.softBlue,
  borderRadius: 1,
  px: 1.2,
  height: 32,
  minWidth: 170,
};

const filterInputSx = {
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  fontSize: 11.5,
  color: "#1F2A44",
  width: "100%",
  "&::placeholder": { color: "#64748B", opacity: 1 },
};

export default function VisaBookingHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const [userEmailFilter, setUserEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedBookingId, setDebouncedBookingId] = useState("");
  const [debouncedUserEmail, setDebouncedUserEmail] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedBookingId(bookingIdFilter.trim());
      setDebouncedUserEmail(userEmailFilter.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [bookingIdFilter, userEmailFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedBookingId, debouncedUserEmail, statusFilter, limit]);

  const fetchBookings = useCallback(async () => {
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
        page: String(page),
        limit: String(limit),
      });
      if (statusFilter.trim()) params.append("status", statusFilter.trim());
      if (debouncedUserEmail) params.append("userEmail", debouncedUserEmail);
      if (debouncedBookingId) params.append("bookingId", debouncedBookingId);

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.VISA_BOOKINGS_ADMIN}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        },
      );

      const normalized = normalizeVisaBookingsResponse(response?.data);
      setBookings(normalized.items);
      setTotal(normalized.total);
      setTotalPages(normalized.totalPages);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load visa bookings.";
      setError(Array.isArray(message) ? message[0] : message);
      setBookings([]);
      setTotal(0);
      setTotalPages(1);
      toast.error(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, statusFilter, debouncedUserEmail, debouncedBookingId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const rows = useMemo(
    () =>
      bookings.map((item) => ({
        ...mapRow(item),
        _raw: item,
      })),
    [bookings],
  );

  const handleOpenDetails = (row) => {
    const id = String(row?.bookingId || "").trim();
    if (!id || id === "-") return;
    navigate(`/dashboard/visa/bookingdetails/${encodeURIComponent(id)}`, {
      state: { bookingId: id, bookingData: row?._raw || null },
    });
  };

  const handleClearFilters = () => {
    setBookingIdFilter("");
    setUserEmailFilter("");
    setStatusFilter("");
    setDebouncedBookingId("");
    setDebouncedUserEmail("");
    setPage(1);
  };

  const hasFilters = Boolean(bookingIdFilter || userEmailFilter || statusFilter);

  const renderCell = (columnKey, value, row) => {
    if (columnKey === "bookingId") {
      return (
        <Typography
          onClick={() => handleOpenDetails(row)}
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: C.secondary,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 2,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "&:hover": { color: C.primary },
          }}
          title={String(value ?? "")}
        >
          {value == null || value === "" ? "-" : String(value)}
        </Typography>
      );
    }

    if (columnKey === "status") {
      const colors = getStatusColors(value);
      return (
        <Typography
          component="span"
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            color: colors.color,
            backgroundColor: colors.bg,
            borderRadius: "999px",
            px: 1.25,
            py: 0.4,
            display: "inline-block",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          {String(value || "-")}
        </Typography>
      );
    }

    return (
      <Typography
        sx={{
          fontSize: 11,
          color: C.text,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={String(value ?? "")}
      >
        {value == null || value === "" ? "-" : String(value)}
      </Typography>
    );
  };

  return (
    <Box sx={{ bgcolor: C.pageBg, minHeight: "100%", pb: 2 }}>
      <AdminPageTitleBar
        title="Visa Booking History"
        subtitle={total > 0 ? `${total} booking${total === 1 ? "" : "s"}` : "All visa bookings"}
        action={
          <Button
            variant="contained"
            onClick={fetchBookings}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={14} sx={{ color: C.primary }} /> : <RefreshIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#FFFFFF",
              color: C.primary,
              boxShadow: "none",
              "&:hover": { bgcolor: "#EAEFF5" },
            }}
          >
            Refresh
          </Button>
        }
      />

      <Box
        sx={{
          bgcolor: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 2,
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 2.5 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={filterShellSx}>
            <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
            <Box
              component="input"
              placeholder="Booking ID"
              value={bookingIdFilter}
              onChange={(e) => setBookingIdFilter(e.target.value)}
              sx={filterInputSx}
            />
          </Box>
          <Box sx={filterShellSx}>
            <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
            <Box
              component="input"
              placeholder="User Email"
              value={userEmailFilter}
              onChange={(e) => setUserEmailFilter(e.target.value)}
              sx={filterInputSx}
            />
          </Box>
          <Select
            size="small"
            displayEmpty
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              height: 32,
              minWidth: 150,
              fontSize: 11.5,
              bgcolor: C.softBlue,
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value || "all"} value={opt.value} sx={{ fontSize: 12 }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          {hasFilters ? (
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                textTransform: "none",
                fontSize: 11.5,
                fontWeight: 600,
                height: 32,
                px: 1.5,
                borderColor: C.primary,
                color: C.primary,
              }}
            >
              Reset
            </Button>
          ) : null}
        </Box>

        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            border: `1px solid ${C.border}`,
            borderRadius: 1.5,
            overflowX: "auto",
            overflowY: "hidden",
            bgcolor: C.card,
            scrollbarWidth: "thin",
            scrollbarColor: "#94A3B8 #E8EEF5",
            "&::-webkit-scrollbar": { height: 10 },
            "&::-webkit-scrollbar-track": { bgcolor: "#E8EEF5" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#94A3B8",
              borderRadius: 8,
              border: "2px solid #E8EEF5",
            },
          }}
        >
          <Box sx={{ width: "100%", minWidth: TABLE_MIN_WIDTH }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: TABLE_GRID,
              width: "100%",
              backgroundColor: "#024DAF",
            }}
          >
            {TABLE_COLUMNS.map((column) => (
              <Box
                key={column.key}
                sx={{
                  px: 1.5,
                  py: 1,
                  minWidth: 0,
                  backgroundColor: "#024DAF",
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
                  }}
                >
                  {column.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress size={28} sx={{ color: C.primary }} />
            </Box>
          ) : error ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <Typography sx={{ fontSize: 12, color: "#d32f2f" }}>{error}</Typography>
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <Typography sx={{ fontSize: 12, color: C.muted }}>No visa bookings found</Typography>
            </Box>
          ) : (
            rows.map((row, index) => (
              <Box
                key={`${row.bookingId}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: TABLE_GRID,
                  width: "100%",
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                {TABLE_COLUMNS.map((column) => (
                  <Box
                    key={`${row.bookingId}-${column.key}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      px: 1.5,
                      py: 1.25,
                      minWidth: 0,
                      borderBottom: `1px solid ${C.border}`,
                      overflow: "hidden",
                    }}
                  >
                    {renderCell(column.key, row[column.key], row)}
                  </Box>
                ))}
              </Box>
            ))
          )}
          </Box>
        </Box>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          limit={limit}
          total={total}
          itemCount={rows.length}
          onPageChange={setPage}
          itemLabel="bookings"
          showRowsSelector={false}
          showPageNav={false}
        />
      </Box>
    </Box>
  );
}
