import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Modal,
  Switch,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const tableColumns = [
  { key: "name", label: "Country Name" },
  { key: "code", label: "Country Code" },
  { key: "isActive", label: "Status" },
  { key: "action", label: "Action" },
];

const tableGridTemplate =
  "minmax(180px, 2.4fr) minmax(120px, 1fr) minmax(110px, 1fr) minmax(110px, 0.9fr)";

const EMPTY_FORM = {
  name: "",
  code: "",
  isActive: true,
};

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

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: 14,
    bgcolor: "#FAFBFD",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: "#024DAF", borderWidth: 2 },
  },
  "& .MuiInputBase-input": {
    fontWeight: 600,
    color: "#0F172A",
  },
};

const fieldLabelSx = {
  fontSize: 11,
  fontWeight: 700,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  mb: 0.75,
};

const COUNTRY_CODE_ALIASES = {
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  uk: "GB",
  "united kingdom": "GB",
  britain: "GB",
  "great britain": "GB",
  uae: "AE",
  "united arab emirates": "AE",
  korea: "KR",
  "south korea": "KR",
  "north korea": "KP",
  russia: "RU",
  "russian federation": "RU",
  vietnam: "VN",
  "viet nam": "VN",
  laos: "LA",
  syria: "SY",
  iran: "IR",
  bolivia: "BO",
  venezuela: "VE",
  tanzania: "TZ",
  moldova: "MD",
  brunei: "BN",
  "czech republic": "CZ",
  czechia: "CZ",
  holland: "NL",
  netherlands: "NL",
};

let countryNameToCodeCache = null;

function buildCountryNameToCodeMap() {
  if (countryNameToCodeCache) return countryNameToCodeCache;

  const map = new Map();
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    for (let a = 65; a <= 90; a += 1) {
      for (let b = 65; b <= 90; b += 1) {
        const code = String.fromCharCode(a, b);
        const name = display.of(code);
        if (!name || name === code) continue;
        map.set(name.toLowerCase(), code);
      }
    }
  } catch {
    // Intl.DisplayNames unavailable — aliases still work
  }

  Object.entries(COUNTRY_CODE_ALIASES).forEach(([name, code]) => {
    map.set(name, code);
  });

  countryNameToCodeCache = map;
  return map;
}

function resolveCountryCodeFromName(name) {
  const key = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!key) return "";

  const map = buildCountryNameToCodeMap();
  if (map.has(key)) return map.get(key);

  if (key.length < 3) return "";

  const matches = [];
  for (const [countryName, code] of map.entries()) {
    if (countryName.startsWith(key)) matches.push(code);
  }

  const unique = [...new Set(matches)];
  return unique.length === 1 ? unique[0] : "";
}

function normalizeCountryRow(item, index) {
  const isActive = item?.isActive ?? item?.is_active ?? true;
  return {
    id: item?.id ?? item?._id ?? index + 1,
    name: String(item?.name || "-"),
    code: String(item?.code || "-").toUpperCase(),
    isActive: Boolean(isActive),
    raw: item,
  };
}

function showApiErrorToasts(err, fallback = "Failed to load countries.") {
  const data = err?.response?.data;
  const message =
    data?.message ||
    data?.error ||
    (Array.isArray(data?.errors) ? data.errors[0] : null) ||
    err?.message ||
    fallback;
  toast.error(typeof message === "string" ? message : fallback);
}

export default function VisaSetting() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchBar, setSearchBar] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editRow, setEditRow] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [codeManualEdit, setCodeManualEdit] = useState(false);

  const authHeaders = useCallback(() => {
    const authToken = token || localStorage.getItem("adminToken") || "";
    return {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  const fetchCountries = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      setLoading(false);
      setCountries([]);
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      const q = searchBar.trim();
      if (q) params.append("search", q);

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.COUNTRIES}?${params.toString()}`, {
        headers: authHeaders(),
      });

      const body = response?.data || {};
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body?.countries)
            ? body.countries
            : [];

      const rows = list.map((item, index) => normalizeCountryRow(item, index));
      const totalCount = Number(body.total ?? body.totalCount ?? rows.length) || 0;
      const pages = Number(body.totalPages) || Math.ceil(totalCount / limit) || 1;

      setCountries(rows);
      setTotal(totalCount);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      showApiErrorToasts(err);
      setCountries([]);
      setTotal(0);
      setTotalPages(1);
      console.error("Fetch countries failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchBar, token, authHeaders]);

  useEffect(() => {
    const delay = searchBar.trim() ? 350 : 0;
    const timeoutId = setTimeout(() => {
      fetchCountries();
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [fetchCountries, searchBar]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const filteredCountries = useMemo(() => {
    const q = searchBar.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((row) => {
      return row.name.toLowerCase().includes(q) || row.code.toLowerCase().includes(q);
    });
  }, [countries, searchBar]);

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditRow(null);
    setFormData(EMPTY_FORM);
    setCodeManualEdit(false);
    setFormOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormMode("edit");
    setEditRow(row);
    setFormData({
      name: row?.name === "-" ? "" : row?.name || "",
      code: row?.code === "-" ? "" : row?.code || "",
      isActive: Boolean(row?.isActive),
    });
    setCodeManualEdit(true);
    setFormOpen(true);
  };

  const handleCloseForm = (force = false) => {
    if (formLoading && !force) return;
    setFormOpen(false);
    setFormMode("add");
    setEditRow(null);
    setFormData(EMPTY_FORM);
    setCodeManualEdit(false);
  };

  const handleCountryNameChange = (value) => {
    const trimmed = String(value || "");
    if (!trimmed.trim()) {
      setCodeManualEdit(false);
      setFormData((prev) => ({ ...prev, name: value, code: "" }));
      return;
    }

    const resolvedCode = resolveCountryCodeFromName(value);
    setFormData((prev) => ({
      ...prev,
      name: value,
      code: codeManualEdit ? prev.code : resolvedCode || prev.code,
    }));
  };

  const handleCountryCodeChange = (value) => {
    setCodeManualEdit(true);
    setFormData((prev) => ({ ...prev, code: String(value || "").toUpperCase() }));
  };

  const handleSaveForm = async () => {
    const name = String(formData.name || "").trim();
    const code = String(formData.code || "").trim().toUpperCase();

    if (!name) {
      toast.error("Country name is required.");
      return;
    }
    if (!code) {
      toast.error("Country code is required.");
      return;
    }

    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    const payload = {
      name,
      code,
      isActive: Boolean(formData.isActive),
    };

    setFormLoading(true);
    try {
      if (formMode === "edit") {
        const rowId = Number(editRow?.id);
        if (!Number.isFinite(rowId)) {
          toast.error("Country ID not found.");
          setFormLoading(false);
          return;
        }
        await axios.patch(`${API_BASE_URL}${API_ENDPOINTS.COUNTRY_BY_ID(rowId)}`, payload, {
          headers: authHeaders(),
        });
        toast.success("Country updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}${API_ENDPOINTS.COUNTRIES}`, payload, {
          headers: authHeaders(),
        });
        toast.success("Country added successfully.");
      }
      setFormLoading(false);
      handleCloseForm(true);
      fetchCountries();
    } catch (err) {
      showApiErrorToasts(err, formMode === "edit" ? "Failed to update country." : "Failed to add country.");
      console.error("Save country failed:", err?.response?.data || err);
      setFormLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const rowId = Number(row?.id);
    if (!Number.isFinite(rowId)) {
      toast.error("Country ID not found.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete country?",
      text: `"${row?.name || row?.code || "This country"}" will be removed permanently.`,
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

    try {
      setDeletingId(rowId);
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.COUNTRY_BY_ID(rowId)}`, {
        headers: authHeaders(),
      });
      toast.success("Country deleted successfully.");
      if (countries.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchCountries();
      }
    } catch (err) {
      showApiErrorToasts(err, "Failed to delete country.");
      console.error("Delete country failed:", err?.response?.data || err);
    } finally {
      setDeletingId(null);
    }
  };

  const renderCell = (row, column) => {
    if (column.key === "name") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              bgcolor: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <PublicOutlinedIcon sx={{ fontSize: 16, color: "#024DAF" }} />
          </Box>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: "#111827",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.name}
          </Typography>
        </Box>
      );
    }

    if (column.key === "code") {
      return (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: "#0F172A",
            bgcolor: "#F1F5F9",
            borderRadius: 0.8,
            px: 1,
            py: 0.35,
            width: "fit-content",
          }}
        >
          {row.code}
        </Typography>
      );
    }

    if (column.key === "isActive") {
      return (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "#FFFFFF",
            bgcolor: row.isActive ? "#10B981" : "#EF4444",
            borderRadius: 999,
            px: 1.25,
            py: 0.35,
            width: "fit-content",
          }}
        >
          {row.isActive ? "Active" : "Inactive"}
        </Typography>
      );
    }

    if (column.key === "action") {
      const isDeleting = deletingId === Number(row.id);
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
          <IconButton
            size="small"
            onClick={() => handleOpenEdit(row)}
            aria-label="Edit country"
            sx={actionBtnSx}
          >
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row)}
            disabled={isDeleting}
            aria-label="Delete country"
            sx={{
              ...actionBtnSx,
              color: "#DC2626",
              "&:hover": { bgcolor: "rgba(220, 38, 38, 0.08)", borderColor: "#DC2626" },
            }}
          >
            {isDeleting ? <CircularProgress size={14} sx={{ color: "#DC2626" }} /> : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      );
    }

    return (
      <Typography sx={{ fontSize: 12, color: "#111827" }}>{row[column.key] ?? "-"}</Typography>
    );
  };

  return (
    <Box>
      <AdminPageTitleBar
        title="Visa Setting"
        subtitle={total > 0 ? `${total} countr${total === 1 ? "y" : "ies"}` : undefined}
        action={
          <>
            <Button
              variant="contained"
              onClick={() => fetchCountries()}
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
              onClick={handleOpenAdd}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "#FFFFFF",
                color: "var(--primary-dark, #0F2F56)",
                "&:hover": { bgcolor: "#EAEFF5" },
              }}
              startIcon={<AddCircleOutlineIcon />}
            >
              Add Country
            </Button>
          </>
        }
      />

      <Box
        sx={{
          backgroundColor: "#FFFFFF",
          borderRadius: 1.5,
          border: "1px solid #E5E7EB",
          px: { xs: 1.5, md: 2 },
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search country or code…"
          value={searchBar}
          onChange={(e) => {
            setSearchBar(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon sx={{ color: "var(--primary-dark, #024DAF)", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { xs: "100%", sm: 420 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              bgcolor: "#FAFBFC",
            },
          }}
        />

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 1.5,
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
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
                    py: 1.1,
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#FFFFFF",
                      whiteSpace: "nowrap",
                      lineHeight: 1.3,
                    }}
                  >
                    {column.label}
                  </Typography>
                </Box>
              ))}
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 5 }}>
                <CircularProgress size={28} sx={{ color: "#0F2F56" }} />
              </Box>
            ) : filteredCountries.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 5 }}>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No countries found</Typography>
              </Box>
            ) : (
              filteredCountries.map((row, index) => (
                <Box
                  key={`${row.id}-${index}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: tableGridTemplate,
                    alignItems: "stretch",
                    width: "100%",
                    "&:hover": { bgcolor: "#F8FAFC" },
                  }}
                >
                  {tableColumns.map((column) => (
                    <Box
                      key={`${row.id}-${column.key}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: column.key === "action" ? "center" : "flex-start",
                        px: 2,
                        py: 1.35,
                        borderBottom: "1px solid #E5E7EB",
                        minWidth: 0,
                        overflow: "hidden",
                      }}
                    >
                      {renderCell(row, column)}
                    </Box>
                  ))}
                </Box>
              ))
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>
            Showing {filteredCountries.length} of {total} countries
          </Typography>

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
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;

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
      </Box>

      <Modal
        open={formOpen}
        onClose={() => handleCloseForm()}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          sx={{
            width: "min(440px, 100%)",
            bgcolor: "#FFFFFF",
            borderRadius: 2,
            outline: "none",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(15, 47, 86, 0.22)",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              bgcolor: "var(--primary-dark, #024DAF)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
              {formMode === "edit" ? "Edit Country" : "Add Country"}
            </Typography>
            <IconButton
              onClick={() => handleCloseForm()}
              size="small"
              sx={{ color: "#FFFFFF", bgcolor: "rgba(255,255,255,0.14)" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography sx={fieldLabelSx}>Country Name</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Malaysia"
                value={formData.name}
                onChange={(e) => handleCountryNameChange(e.target.value)}
                disabled={formLoading}
                sx={fieldSx}
              />
            </Box>
            <Box>
              <Typography sx={fieldLabelSx}>Code</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. MY"
                value={formData.code}
                onChange={(e) => handleCountryCodeChange(e.target.value)}
                disabled={formLoading}
                inputProps={{ maxLength: 8 }}
                sx={fieldSx}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(formData.isActive)}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  disabled={formLoading}
                  color="primary"
                />
              }
              label={
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                  {formData.isActive ? "Active" : "Inactive"}
                </Typography>
              }
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 0.5 }}>
              <Button
                variant="outlined"
                onClick={() => handleCloseForm()}
                disabled={formLoading}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "#CBD5E1",
                  color: "#475569",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveForm}
                disabled={formLoading}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "var(--primary-dark, #024DAF)",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#0B2442", boxShadow: "none" },
                }}
              >
                {formLoading ? "Saving..." : formMode === "edit" ? "Update" : "Add Country"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
