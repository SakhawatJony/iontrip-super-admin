import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const COLUMN_SKIP_KEYS = new Set(["__v", "password", "refreshToken", "accessToken"]);

const COLUMN_LABELS = {
  id: "ID",
  _id: "ID",
  email: "Email",
  agentEmail: "Agent Email",
  userEmail: "User Email",
  name: "Name",
  agentName: "Agent Name",
  origin: "Origin",
  destination: "Destination",
  from: "From",
  to: "To",
  departureDate: "Departure Date",
  returnDate: "Return Date",
  tripType: "Trip Type",
  cabinClass: "Cabin Class",
  adults: "Adults",
  children: "Children",
  infants: "Infants",
  searchCount: "Search Count",
  createdAt: "Created At",
  updatedAt: "Updated At",
};

const COLUMN_PRIORITY = [
  "id",
  "_id",
  "email",
  "agentEmail",
  "userEmail",
  "name",
  "agentName",
  "origin",
  "from",
  "destination",
  "to",
  "departureDate",
  "returnDate",
  "tripType",
  "cabinClass",
  "adults",
  "children",
  "infants",
  "searchCount",
  "createdAt",
  "updatedAt",
];

function showApiErrorToasts(err, fallback = "Failed to load search reports.") {
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

function humanizeColumnKey(key) {
  return (
    COLUMN_LABELS[key] ||
    String(key)
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function formatCellValue(key, value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (/At$|_at$|date|Date/i.test(key)) {
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
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object") return "-";
  return String(value);
}

function buildColumnsFromRows(rows) {
  if (!rows.length) {
    return [
      { key: "id", label: "ID", width: "70px" },
      { key: "email", label: "Email", width: "200px" },
      { key: "createdAt", label: "Created At", width: "180px" },
    ];
  }

  const keys = new Set();
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      if (!COLUMN_SKIP_KEYS.has(key) && typeof row[key] !== "object") {
        keys.add(key);
      }
    });
  });

  const ordered = [];
  COLUMN_PRIORITY.forEach((key) => {
    if (keys.has(key)) {
      ordered.push(key);
      keys.delete(key);
    }
  });
  [...keys].sort().forEach((key) => ordered.push(key));

  return ordered.map((key) => {
    let width = "140px";
    if (key === "id" || key === "_id") width = "70px";
    else if (key.includes("email") || key.includes("Email")) width = "200px";
    else if (key.includes("Name") || key.includes("name")) width = "160px";
    else if (key.includes("At") || key.includes("date") || key.includes("Date")) width = "180px";
    return { key, label: humanizeColumnKey(key), width };
  });
}

function normalizeListResponse(body) {
  if (Array.isArray(body)) return { list: body, total: body.length, totalPages: 1 };
  if (Array.isArray(body?.data)) {
    return {
      list: body.data,
      total: Number(body.total ?? body.data.length) || body.data.length,
      totalPages: Number(body.totalPages) || 1,
    };
  }
  if (Array.isArray(body?.data?.data)) {
    return {
      list: body.data.data,
      total: Number(body.data.total ?? body.total ?? body.data.data.length) || body.data.data.length,
      totalPages: Number(body.data.totalPages ?? body.totalPages) || 1,
    };
  }
  if (Array.isArray(body?.reports)) {
    return {
      list: body.reports,
      total: Number(body.total ?? body.reports.length) || body.reports.length,
      totalPages: Number(body.totalPages) || 1,
    };
  }
  if (Array.isArray(body?.items)) {
    return {
      list: body.items,
      total: Number(body.total ?? body.items.length) || body.items.length,
      totalPages: Number(body.totalPages) || 1,
    };
  }
  return { list: [], total: 0, totalPages: 1 };
}

const tableCellBoxSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  px: 2,
  py: 1.4,
  minWidth: 0,
  overflow: "hidden",
  textAlign: "left",
};

const tableHeaderBoxSx = {
  display: "flex",
  alignItems: "center",
  px: 2,
  py: 1,
  minWidth: 0,
  overflow: "hidden",
  backgroundColor: "var(--primary-dark, #024DAF)",
};

const tableHeaderTextSx = {
  fontSize: 11,
  fontWeight: 600,
  color: "#FFFFFF",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  width: "100%",
};

const tableCellTextSx = {
  fontSize: 11,
  color: "#111827",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  width: "100%",
};

export default function SearchReport({ title = "Search Report" }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [emailFilter, setEmailFilter] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const tableColumns = useMemo(() => buildColumnsFromRows(rows), [rows]);
  const tableGridTemplate = useMemo(
    () => fluidGridTemplateFromColumns(tableColumns),
    [tableColumns],
  );

  const fetchSearchReports = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      setLoading(false);
      setRows([]);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (emailFilter.trim()) {
        params.append("email", emailFilter.trim());
      }

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.SEARCH_REPORTS}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      const { list, total: totalCount, totalPages: pages } = normalizeListResponse(response?.data);
      const normalized = list.map((item, index) => ({
        ...item,
        id: item?.id ?? item?._id ?? index,
      }));

      setRows(normalized);
      setTotal(totalCount);
      setTotalPages(Math.max(1, pages || Math.ceil(totalCount / limit) || 1));
    } catch (err) {
      showApiErrorToasts(err);
      setRows([]);
      setTotal(0);
      setTotalPages(1);
      console.error("Fetch search reports failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, emailFilter]);

  useEffect(() => {
    fetchSearchReports();
  }, [fetchSearchReports]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleSearch = () => {
    setPage(1);
    setEmailFilter(emailInput.trim());
  };

  const handleClearFilter = () => {
    setEmailInput("");
    setEmailFilter("");
    setPage(1);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 1 },
        py: 4,
      }}
    >
      <AdminPageTitleBar
        title={title}
        action={
          <Button
            variant="outlined"
            onClick={() => fetchSearchReports()}
            disabled={loading}
            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: "none",
              fontSize: 12,
              fontWeight: 700,
              bgcolor: "#FFFFFF",
              color: "var(--primary-dark, #024DAF)",
              borderColor: "rgba(2, 77, 175, 0.35)",
              "&:hover": { bgcolor: "#EAEFF5", borderColor: "rgba(2, 77, 175, 0.45)" },
              height: 34,
              px: 1.8,
              borderRadius: 1,
            }}
          >
            Refresh
          </Button>
        }
      />

      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 2,
          border: "1px solid #E5E7EB",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 3 },
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "#EAF2FF",
              borderRadius: 1,
              px: 1.2,
              height: 32,
              minWidth: 220,
            }}
          >
            <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
            <Box
              component="input"
              placeholder="Filter by email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              sx={{
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                fontSize: 11.5,
                color: "#1F2A44",
                width: "100%",
              }}
            />
          </Box>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            sx={{
              textTransform: "none",
              fontSize: 11.5,
              fontWeight: 700,
              bgcolor: "#0F2F56",
              boxShadow: "none",
              height: 32,
              px: 1.8,
              "&:hover": { bgcolor: "#0B2442", boxShadow: "none" },
            }}
          >
            Search
          </Button>
          {emailFilter ? (
            <Button
              variant="outlined"
              onClick={handleClearFilter}
              disabled={loading}
              sx={{
                textTransform: "none",
                fontSize: 11.5,
                fontWeight: 700,
                height: 32,
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
                    ...tableHeaderBoxSx,
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <Typography sx={tableHeaderTextSx}>{column.label}</Typography>
                </Box>
              ))}
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ color: "#0F2F56" }} />
              </Box>
            ) : rows.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                  No search reports found
                </Typography>
              </Box>
            ) : (
              rows.map((row, index) => (
                <Box
                  key={`${row.id}-${index}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: tableGridTemplate,
                    alignItems: "stretch",
                    width: "100%",
                  }}
                >
                  {tableColumns.map((column) => (
                    <Box
                      key={`${row.id}-${column.key}`}
                      sx={{
                        ...tableCellBoxSx,
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      <Typography
                        sx={tableCellTextSx}
                        title={formatCellValue(column.key, row?.[column.key])}
                      >
                        {formatCellValue(column.key, row?.[column.key])}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {totalPages > 1 ? (
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
                      backgroundColor: isActive ? "#0F2F56" : "#EAF2FF",
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
        ) : null}
      </Box>
    </Box>
  );
}
