import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import { API_BASE_URL } from "../config/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const ALL_TOUR_PACKAGES_API = "https://api.iontrip.com/tour-packages";
const DELETE_TOUR_PACKAGE_API = "https://api.iontrip.com/admin/tour-packages";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const C = {
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#0F2F56",
  secondary: "#024DAF",
  secondarySoft: "rgba(2, 77, 175, 0.08)",
  danger: "#EB5757",
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

const emptyFilters = {
  title: "",
  location: "",
  category: "",
  isActive: "true",
  isFeatured: "true",
};

function readAdminToken(token) {
  return String(token || localStorage.getItem("adminToken") || "").trim();
}

function adminAuthHeaders(token) {
  const authToken = readAdminToken(token);
  return authToken
    ? { Authorization: `Bearer ${authToken}`, Accept: "application/json" }
    : null;
}

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.packages)) return payload.packages;
  if (Array.isArray(payload?.tourPackages)) return payload.tourPackages;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.packages)) return payload.data.packages;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.tourPackages)) return payload.data.tourPackages;
  if (Array.isArray(payload?.data?.rows)) return payload.data.rows;
  if (Array.isArray(payload?.data?.list)) return payload.data.list;
  if (Array.isArray(payload?.data?.records)) return payload.data.records;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.records)) return payload.records;
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
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return listLength;
}

function getItemId(item) {
  return item?.id ?? item?._id ?? item?.packageId ?? null;
}

function resolveImageUrl(item) {
  const raw =
    item?.coverImageURL ||
    item?.coverImage ||
    item?.coverUrl ||
    item?.imageURL ||
    item?.image ||
    item?.thumbnail ||
    "";
  const src = String(raw || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("/")) return `${API_BASE_URL}${src}`;
  return `${API_BASE_URL}/${src.replace(/^\/+/, "")}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function isPackageActive(tour) {
  if (typeof tour?.isActive === "boolean") return tour.isActive;
  if (typeof tour?.active === "boolean") return tour.active;
  if (tour?.is_active === true || tour?.is_active === false || tour?.is_active === 0 || tour?.is_active === 1) {
    return Boolean(tour.is_active);
  }
  const status = String(tour?.status || "").trim().toLowerCase();
  if (status === "active") return true;
  if (status === "inactive") return false;
  // GET /tour-packages omits isActive. Those rows are active packages.
  return true;
}

function formatMoney(amount, currency = "BDT") {
  if (amount === null || amount === undefined || amount === "") return "—";
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  return `${currency} ${n.toLocaleString()}`;
}

function showApiError(err, fallback = "Failed to load tour packages.") {
  const data = err?.response?.data;
  if (Array.isArray(data?.message) && data.message.length) {
    data.message.forEach((msg) => toast.error(String(msg)));
    return;
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    toast.error(data.message);
    return;
  }
  toast.error(err?.message || fallback);
}

export default function AllTour() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const tableColumns = useMemo(
    () => [
      { key: "sl", label: "#", width: "48px" },
      { key: "image", label: "Cover", width: "72px" },
      { key: "packageId", label: "Package ID", width: "120px" },
      { key: "title", label: "Title", width: "minmax(160px, 1.4fr)" },
      { key: "location", label: "Location", width: "minmax(110px, 1fr)" },
      { key: "country", label: "Country", width: "100px" },
      { key: "category", label: "Category", width: "110px" },
      { key: "duration", label: "Duration", width: "100px" },
      { key: "price", label: "Price", width: "120px" },
      { key: "status", label: "Status", width: "140px" },
      { key: "createdAt", label: "Added", width: "110px" },
      { key: "actions", label: "Action", width: "100px" },
    ],
    [],
  );

  const tableGridTemplate = useMemo(() => fluidGridTemplateFromColumns(tableColumns), [tableColumns]);
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit) || 1);

  const fetchTours = useCallback(async () => {
    const headers = adminAuthHeaders(token);
    if (!headers) {
      setTours([]);
      setTotal(0);
      setLoading(false);
      toast.error("Admin token missing. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const params = {
        isActive: true,
        isFeatured: true,
        page,
        limit,
      };
      ["title", "location", "category"].forEach((key) => {
        const value = String(applied[key] ?? "").trim();
        if (value) params[key] = value;
      });

      const response = await axios.get(ALL_TOUR_PACKAGES_API, {
        params,
        headers,
      });

      const list = unwrapList(response.data);
      setTours(list);
      setTotal(unwrapTotal(response.data, list.length));
    } catch (err) {
      console.error("Error fetching tour packages:", err);
      setTours([]);
      setTotal(0);
      showApiError(err);
    } finally {
      setLoading(false);
    }
  }, [token, applied, page, limit]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    setPage(1);
    setApplied({ ...filters });
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  };

  const handleDelete = async (item) => {
    const packageId = String(item?.packageId || getItemId(item) || "").trim();
    if (!packageId) {
      toast.error("Package id missing.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete tour package?",
      text: `"${item?.title || packageId}" will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: C.danger,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const headers = adminAuthHeaders(token);
      if (!headers) {
        toast.error("Admin token missing. Please login again.");
        setLoading(false);
        return;
      }
      await axios.delete(`${DELETE_TOUR_PACKAGE_API}/${encodeURIComponent(packageId)}`, {
        headers,
      });
      toast.success("Tour package deleted.");
      fetchTours();
    } catch (err) {
      showApiError(err, "Failed to delete tour package.");
      setLoading(false);
    }
  };

  const renderCell = (tour, column, rowIndex) => {
    const id = getItemId(tour);
    const currency = tour?.currency || "BDT";

    if (column.key === "sl") {
      return (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
          {(page - 1) * limit + rowIndex + 1}
        </Typography>
      );
    }

    if (column.key === "image") {
      const src = resolveImageUrl(tour);
      return src ? (
        <Box
          component="img"
          src={src}
          alt={tour?.title || "cover"}
          sx={{ width: 48, height: 36, objectFit: "cover", borderRadius: 1, border: `1px solid ${C.border}` }}
        />
      ) : (
        <Typography sx={{ fontSize: 12, color: C.muted }}>—</Typography>
      );
    }

    if (column.key === "packageId") {
      const pid = tour?.packageId || id;
      return (
        <Typography
          onClick={() => {
            if (!pid) return;
            navigate(`/dashboard/tour/packagedetails/${encodeURIComponent(pid)}`, {
              state: { packageId: pid, packageData: tour },
            });
          }}
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: C.secondary,
            cursor: pid ? "pointer" : "default",
            textDecoration: pid ? "underline" : "none",
            "&:hover": pid ? { color: C.primary } : undefined,
          }}
        >
          {pid || "—"}
        </Typography>
      );
    }

    if (column.key === "title") {
      return (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tour?.title || "—"}
          </Typography>
          {tour?.subtitle ? (
            <Typography sx={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {tour.subtitle}
            </Typography>
          ) : null}
        </Box>
      );
    }

    if (column.key === "location") {
      return <Typography sx={{ fontSize: 12, color: C.text }}>{tour?.location || "—"}</Typography>;
    }

    if (column.key === "country") {
      return <Typography sx={{ fontSize: 12, color: C.text }}>{tour?.country || "—"}</Typography>;
    }

    if (column.key === "category") {
      return <Typography sx={{ fontSize: 12, color: C.text }}>{tour?.category || "—"}</Typography>;
    }

    if (column.key === "duration") {
      const days = tour?.durationDays;
      const nights = tour?.durationNights;
      if (days == null && nights == null) return <Typography sx={{ fontSize: 12, color: C.muted }}>—</Typography>;
      return (
        <Typography sx={{ fontSize: 12, color: C.text }}>
          {days != null ? `${days}D` : ""}
          {days != null && nights != null ? " / " : ""}
          {nights != null ? `${nights}N` : ""}
        </Typography>
      );
    }

    if (column.key === "price") {
      return (
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.text }}>
          {formatMoney(tour?.pricePerPerson ?? tour?.price, currency)}
        </Typography>
      );
    }

    if (column.key === "status") {
      const active = isPackageActive(tour);
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={active ? "Active" : "Inactive"}
            sx={{
              height: 22,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: active ? "#DCFCE7" : "#F1F5F9",
              color: active ? "#166534" : C.muted,
            }}
          />
          {tour?.isFeatured ? (
            <Chip size="small" label="Featured" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: "#E8F1FF", color: C.secondary }} />
          ) : null}
          {tour?.isBestseller ? (
            <Chip size="small" label="Bestseller" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: "#FFF4E5", color: "#B45309" }} />
          ) : null}
        </Stack>
      );
    }

    if (column.key === "createdAt") {
      return <Typography sx={{ fontSize: 12, color: C.text }}>{formatDate(tour?.createdAt || tour?.created_at)}</Typography>;
    }

    if (column.key === "actions") {
      const pid = tour?.packageId || id;
      return (
        <Stack direction="row" spacing={0.75}>
          <IconButton
            size="small"
            onClick={() => {
              if (!pid) return toast.error("Package id missing.");
              navigate(`/dashboard/tour/edittour/${encodeURIComponent(pid)}`, {
                state: { packageId: pid, packageData: tour },
              });
            }}
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 1,
              color: C.secondary,
              width: 32,
              height: 32,
            }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(tour)}
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 1,
              color: C.danger,
              width: 32,
              height: 32,
            }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      );
    }

    return <Typography sx={{ fontSize: 12, color: C.text }}>—</Typography>;
  };

  return (
    <Box>
      <AdminPageTitleBar
        title="All Tour Packages"
        action={
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={fetchTours}
              sx={{ border: `1px solid rgba(255,255,255,0.35)`, color: "#fff", borderRadius: "10px" }}
            >
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/tour/addtour")}
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#FFFFFF",
                color: C.primary,
                "&:hover": { bgcolor: "#EAEFF5" },
              }}
            >
              Add Tour
            </Button>
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
              placeholder="Search by title..."
              value={filters.title}
              onChange={(e) => updateFilter("title", e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 200, flex: { xs: "1 1 100%", sm: "1 1 200px" } }}
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
              placeholder="Location"
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 140 }}
            />
            <TextField
              size="small"
              placeholder="Category"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 140 }}
            />
            <Select
              size="small"
              displayEmpty
              value={filters.isActive}
              onChange={(e) => updateFilter("isActive", e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 130 }}
            >
              <MenuItem value="">Active: All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
            <Select
              size="small"
              displayEmpty
              value={filters.isFeatured}
              onChange={(e) => updateFilter("isFeatured", e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 140 }}
            >
              <MenuItem value="">Featured: All</MenuItem>
              <MenuItem value="true">Featured</MenuItem>
              <MenuItem value="false">Not Featured</MenuItem>
            </Select>
            <Button
              variant="contained"
              onClick={handleApply}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: C.secondary,
                boxShadow: "none",
                height: 40,
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
                borderColor: C.border,
                color: C.muted,
                height: 40,
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
              minWidth: 1100,
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
          ) : tours.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
              <Typography sx={{ fontSize: 13, color: C.muted }}>No tour packages found</Typography>
            </Box>
          ) : (
            tours.map((tour, index) => (
              <Box
                key={`${getItemId(tour) || "tour"}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: tableGridTemplate,
                  alignItems: "stretch",
                  minWidth: 1100,
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                {tableColumns.map((column) => (
                  <Box
                    key={`${getItemId(tour)}-${column.key}`}
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
                    {renderCell(tour, column, index)}
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
                  fontSize: 12,
                  fontWeight: 700,
                  color: isActive ? "#FFFFFF" : C.primary,
                  backgroundColor: isActive ? C.primary : "#EAF2FF",
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
