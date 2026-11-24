import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const C = {
  pageBg: "var(--page-bg, #F4F7FE)",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  text: "var(--primary-text-color, #202124)",
  muted: "var(--sub, #8F8F98)",
  primary: "var(--primary-color, #0F2F56)",
  secondary: "var(--secondary-color, #024DAF)",
  secondarySoft: "rgba(2, 77, 175, 0.08)",
  danger: "var(--red-dark, #EB5757)",
};

const toolbarFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: 13,
    bgcolor: "#FAFBFC",
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: C.secondary, borderWidth: 2 },
  },
};

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.catagories)) return payload.catagories;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories;
  return [];
}

function resolveImageUrl(item) {
  const raw =
    item?.imageURL ||
    item?.imageUrl ||
    item?.image ||
    item?.img ||
    item?.thumbnail ||
    "";
  const src = String(raw || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("/")) return `${API_BASE_URL}${src}`;
  return `${API_BASE_URL}/${src.replace(/^\/+/, "")}`;
}

function getItemId(item) {
  return item?.id ?? item?._id ?? null;
}

export default function TopDestinations() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const authToken = token || localStorage.getItem("adminToken") || "";

  const [nameFilter, setNameFilter] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("true");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const tableColumns = useMemo(
    () => [
      { key: "sl", label: "#", width: "48px" },
      { key: "image", label: "Image", width: "84px" },
      { key: "name", label: "Name", width: "minmax(140px, 1fr)" },
      { key: "description", label: "Description", width: "minmax(180px, 1.5fr)" },
      { key: "isActive", label: "Status", width: "110px" },
      { key: "createdAt", label: "Created", width: "130px" },
      { key: "actions", label: "Actions", width: "110px" },
    ],
    [],
  );

  const tableGridTemplate = useMemo(() => fluidGridTemplateFromColumns(tableColumns), [tableColumns]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (appliedName.trim()) params.name = appliedName.trim();
      if (isActiveFilter === "true" || isActiveFilter === "false") {
        params.isActive = isActiveFilter === "true";
      }

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY_ADMIN}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        params,
      });
      setItems(unwrapList(response?.data));
    } catch (error) {
      console.error("Error fetching top destinations:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [appliedName, authToken, isActiveFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const name = String(item?.name || "").toLowerCase();
      const description = String(item?.description || "").toLowerCase();
      return name.includes(q) || description.includes(q);
    });
  }, [items, search]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleEdit = (item) => {
    const id = getItemId(item);
    if (!id) return;
    navigate(`/dashboard/manage/topdestinations/edit/${id}`, { state: { category: item } });
  };

  const handleDelete = async (item) => {
    const id = getItemId(item);
    const title = item?.name || "this destination";
    if (!id) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Missing destination ID.",
        confirmButtonColor: C.secondary,
      });
      return;
    }

    const result = await Swal.fire({
      title: "Delete destination?",
      text: `"${title}" will be removed permanently.`,
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
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY_DELETE(id)}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      await Swal.fire({
        icon: "success",
        title: "Deleted",
        timer: 1400,
        showConfirmButton: false,
      });
      fetchCategories();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete destination.";
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: Array.isArray(message) ? message[0] : message,
        confirmButtonColor: C.secondary,
      });
    } finally {
      setLoading(false);
    }
  };

  const actionBtnSx = {
    minWidth: 32,
    width: 32,
    height: 32,
    p: 0,
    borderRadius: 1,
    border: `1px solid ${C.border}`,
    color: C.secondary,
    "&:hover": { bgcolor: C.secondarySoft, borderColor: C.secondary },
  };

  const renderCell = (item, column, rowIndex) => {
    if (column.key === "sl") {
      return (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{rowIndex + 1}</Typography>
      );
    }

    if (column.key === "image") {
      const imageUrl = resolveImageUrl(item);
      return imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt=""
          sx={{
            width: 56,
            height: 40,
            borderRadius: 1,
            objectFit: "cover",
            border: `1px solid ${C.border}`,
            bgcolor: C.secondarySoft,
          }}
        />
      ) : (
        <Box
          sx={{
            width: 56,
            height: 40,
            borderRadius: 1,
            bgcolor: C.secondarySoft,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${C.border}`,
          }}
        >
          <PlaceOutlinedIcon sx={{ fontSize: 18, color: C.secondary }} />
        </Box>
      );
    }

    if (column.key === "name") {
      return (
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: C.primary,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item?.name || ""}
        >
          {item?.name || "—"}
        </Typography>
      );
    }

    if (column.key === "description") {
      return (
        <Typography
          sx={{
            fontSize: 12,
            color: C.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item?.description || ""}
        >
          {item?.description || "—"}
        </Typography>
      );
    }

    if (column.key === "isActive") {
      const active = item?.isActive === true || String(item?.isActive).toLowerCase() === "true";
      return (
        <Chip
          label={active ? "Active" : "Inactive"}
          size="small"
          sx={{
            height: 24,
            fontSize: 11,
            fontWeight: 700,
            bgcolor: active ? "rgba(34, 197, 94, 0.12)" : "rgba(148, 163, 184, 0.18)",
            color: active ? "#15803D" : "#64748B",
          }}
        />
      );
    }

    if (column.key === "createdAt") {
      return (
        <Typography sx={{ fontSize: 12, color: C.text }}>
          {formatDate(item?.createdAt || item?.updatedAt)}
        </Typography>
      );
    }

    if (column.key === "actions") {
      return (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" sx={actionBtnSx} onClick={() => handleEdit(item)} aria-label="Edit">
            <EditOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              ...actionBtnSx,
              color: C.danger,
              "&:hover": { bgcolor: "rgba(235, 87, 87, 0.1)", borderColor: C.danger },
            }}
            onClick={() => handleDelete(item)}
            aria-label="Delete"
          >
            <DeleteOutlineIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Stack>
      );
    }

    return null;
  };

  return (
    <Box sx={{ bgcolor: C.pageBg, minHeight: "100%", pb: 2 }}>
      <AdminPageTitleBar
        title="Top Destinations"
        subtitle={
          filteredItems.length > 0
            ? `${filteredItems.length} destination${filteredItems.length === 1 ? "" : "s"}`
            : "Manage top destination categories"
        }
        action={
          <>
            <Button
              variant="contained"
              onClick={fetchCategories}
              disabled={loading}
              startIcon={<RefreshIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#FFFFFF",
                color: C.secondary,
                boxShadow: "none",
                "&:hover": { bgcolor: "#EAEFF5" },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/manage/topdestinations/add")}
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#FFFFFF",
                color: C.secondary,
                boxShadow: "none",
                "&:hover": { bgcolor: "#EAEFF5" },
              }}
            >
              Add Destination
            </Button>
          </>
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
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
            borderBottom: `1px solid ${C.border}`,
            background: `linear-gradient(90deg, ${C.secondarySoft} 0%, transparent 50%)`,
          }}
        >
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              size="small"
              placeholder="Filter by category name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 200, flex: { xs: "1 1 100%", sm: "1 1 200px" } }}
            />
            <Select
              size="small"
              displayEmpty
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
            <Button
              variant="contained"
              onClick={() => setAppliedName(nameFilter.trim())}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: C.secondary,
                boxShadow: "none",
                "&:hover": { bgcolor: C.primary },
              }}
            >
              Apply
            </Button>
            <TextField
              size="small"
              placeholder="Search in results..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ...toolbarFieldSx, minWidth: 200, flex: { xs: "1 1 100%", sm: "1 1 220px" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: C.muted }} />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ width: "100%", minWidth: 0, overflowX: "auto" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: tableGridTemplate,
              alignItems: "stretch",
              minWidth: 900,
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
          ) : filteredItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
              <PlaceOutlinedIcon sx={{ fontSize: 48, color: C.border, mb: 1 }} />
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: C.primary }}>
                No top destinations found
              </Typography>
              <Typography sx={{ fontSize: 13, color: C.muted, mt: 0.5 }}>
                Create your first destination category.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate("/dashboard/manage/topdestinations/add")}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: C.secondary,
                  "&:hover": { bgcolor: C.primary },
                }}
              >
                Add Destination
              </Button>
            </Box>
          ) : (
            filteredItems.map((item, index) => (
              <Box
                key={item.id || item._id || `${item.name}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: tableGridTemplate,
                  alignItems: "center",
                  minWidth: 900,
                  bgcolor: index % 2 === 0 ? "#fff" : "#FAFBFC",
                  borderBottom: `1px solid ${C.border}`,
                  "&:hover": { bgcolor: C.secondarySoft },
                }}
              >
                {tableColumns.map((column) => (
                  <Box
                    key={`${item.id || item.name}-${column.key}`}
                    sx={{ px: 2, py: 1.35, minWidth: 0, overflow: "hidden" }}
                  >
                    {renderCell(item, column, index)}
                  </Box>
                ))}
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
}
