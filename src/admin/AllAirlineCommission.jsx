import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import {
  fixedGridTemplateFromColumns,
  tableMinWidthFromColumns,
} from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const COLUMN_SKIP_KEYS = new Set(["__v", "password", "refreshToken", "accessToken"]);

const COLUMN_LABELS = {
  id: "ID",
  airlineCode: "Airline Code",
  carrierCode: "Carrier Code",
  airlineName: "Airline Name",
  career: "Airline Code",
  careerName: "Airline Name",
  route: "Route",
  origin: "Origin",
  destination: "Destination",
  commission: "Commission",
  commissionPercent: "Commission %",
  commissionPercentage: "Commission %",
  commissionType: "Commission Type",
  markup: "Markup",
  markupPercent: "Markup %",
  markupPercentage: "Markup %",
  markupType: "Markup Type",
  cabinClass: "Cabin Class",
  fareType: "Fare Type",
  currency: "Currency",
  isActive: "Status",
  status: "Status",
  actionBy: "Action By",
  createdBy: "Created By",
  createdAt: "Created At",
  updatedAt: "Updated At",
};

const COLUMN_PRIORITY = [
  "id",
  "airlineCode",
  "carrierCode",
  "career",
  "airlineName",
  "careerName",
  "route",
  "origin",
  "destination",
  "commission",
  "commissionPercent",
  "commissionPercentage",
  "markup",
  "markupPercent",
  "markupPercentage",
  "commissionType",
  "markupType",
  "cabinClass",
  "fareType",
  "currency",
  "isActive",
  "status",
  "actionBy",
  "createdBy",
  "createdAt",
  "updatedAt",
];

function showApiErrorToasts(err, fallback = "Failed to load airline commissions.") {
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
  if (typeof value === "boolean") return value ? "Active" : "Inactive";
  if (key === "isActive" && (value === 1 || value === "1")) return "Active";
  if (key === "isActive" && (value === 0 || value === "0")) return "Inactive";
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
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function buildColumnsFromRows(rows) {
  if (!rows.length) {
    return [{ key: "empty", label: "No Data", width: "160px" }];
  }

  const keys = new Set();
  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      if (!COLUMN_SKIP_KEYS.has(key)) keys.add(key);
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

  return ordered.map((key) => ({
    key,
    label: humanizeColumnKey(key),
    width: key.includes("Name") || key.includes("At") ? "160px" : "120px",
  }));
}

function normalizeCommissionRow(item, index) {
  return {
    ...item,
    id: item?.id ?? item?._id ?? index,
    airlineCode: item?.airlineCode || item?.carrierCode || item?.career || "-",
    airlineName: item?.airlineName || item?.careerName || "-",
  };
}

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

export default function AllAirlineCommission({ title = "Airline Commission" }) {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("edit");
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({
    airlineCode: "",
    airlineName: "",
    markup: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  useEffect(() => {
    setLogoLoadFailed(false);
  }, [editForm.airlineCode]);

  const total = allRows.length;
  const totalPages = Math.max(1, Math.ceil(allRows.length / limit) || 1);

  const rows = useMemo(() => {
    const start = (page - 1) * limit;
    return allRows.slice(start, start + limit);
  }, [allRows, page, limit]);

  const tableColumns = useMemo(() => {
    const dataColumns = buildColumnsFromRows(allRows).filter((col) => col.key !== "empty");
    if (!dataColumns.length) {
      return [{ key: "action", label: "Action", width: "100px" }];
    }
    return [...dataColumns, { key: "action", label: "Action", width: "100px" }];
  }, [allRows]);
  const tableGridTemplate = useMemo(
    () => fixedGridTemplateFromColumns(tableColumns),
    [tableColumns],
  );
  const tableMinWidth = useMemo(
    () => tableMinWidthFromColumns(tableColumns),
    [tableColumns],
  );

  const fetchCommissions = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      setLoading(false);
      setAllRows([]);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.AIRLINE_MARKUP}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const body = response?.data || {};
      const list = Array.isArray(body)
        ? body
        : body.data || body.markups || body.commissions || body.items || [];
      const normalized = list.map((item, index) => normalizeCommissionRow(item, index));
      setAllRows(normalized);
      setPage(1);
    } catch (err) {
      showApiErrorToasts(err);
      setAllRows([]);
      console.error("Fetch airline markup failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditRow(null);
    setEditForm({ airlineCode: "", airlineName: "", markup: "" });
    setFormOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormMode("edit");
    setEditRow(row);
    setEditForm({
      airlineCode: row?.airlineCode || row?.carrierCode || row?.career || "",
      airlineName: row?.airlineName || row?.careerName || "",
      markup: row?.markup != null ? String(row.markup) : "",
    });
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditRow(null);
    setEditForm({ airlineCode: "", airlineName: "", markup: "" });
  };

  const validateForm = () => {
    if (!editForm.airlineName.trim()) {
      toast.error("Airline name is required.");
      return false;
    }
    if (!editForm.airlineCode.trim()) {
      toast.error("Airline code is required.");
      return false;
    }
    const markupValue = editForm.markup.trim();
    if (markupValue === "" || Number.isNaN(Number(markupValue))) {
      toast.error("Please enter a valid markup value.");
      return false;
    }
    return true;
  };

  const buildMarkupPayload = () => ({
    airlineName: editForm.airlineName.trim(),
    airlineCode: editForm.airlineCode.trim().toUpperCase(),
    markup: Number(editForm.markup.trim()),
  });

  const handleSaveForm = async () => {
    if (!validateForm()) return;

    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    const payload = buildMarkupPayload();

    setFormLoading(true);
    try {
      if (formMode === "add") {
        await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AIRLINE_MARKUP}`, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Airline markup added successfully.");
      } else {
        const rowId = editRow?.id;
        if (rowId == null) {
          toast.error("Record ID not found.");
          return;
        }
        await axios.patch(`${API_BASE_URL}${API_ENDPOINTS.AIRLINE_MARKUP_BY_ID(rowId)}`, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Airline markup updated successfully.");
      }
      handleCloseForm();
      fetchCommissions();
    } catch (err) {
      showApiErrorToasts(
        err,
        formMode === "add" ? "Failed to add airline markup." : "Failed to update airline markup.",
      );
      console.error("Save airline markup failed:", err?.response?.data || err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const rowId = row?.id;
    if (rowId == null) {
      toast.error("Record ID not found.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete airline markup?",
      text: `"${row.airlineName || row.airlineCode}" will be removed permanently.`,
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
      setLoading(true);
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.AIRLINE_MARKUP_BY_ID(rowId)}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
      fetchCommissions();
    } catch (err) {
      showApiErrorToasts(err, "Failed to delete airline markup.");
      console.error("Delete airline markup failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (row, column) => {
    if (column.key === "action") {
      return (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <IconButton
            size="small"
            sx={actionBtnSx}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            aria-label="Edit airline markup"
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
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            aria-label="Delete airline markup"
          >
            <DeleteOutlineIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Stack>
      );
    }

    const value = row?.[column.key];

    if (column.key === "airlineCode" || column.key === "carrierCode" || column.key === "career") {
      const code = row.airlineCode || value || "-";
      const logoCode = String(code).toUpperCase();
      const logoUrl =
        logoCode && logoCode !== "-"
          ? `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${logoCode}.png`
          : "";

      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
          {logoUrl ? (
            <Box
              component="img"
              src={logoUrl}
              alt={logoCode}
              sx={{ width: 24, height: 16, objectFit: "contain", flexShrink: 0 }}
            />
          ) : null}
          <Typography sx={{ ...tableCellTextSx, fontWeight: 700 }}>{code}</Typography>
        </Box>
      );
    }

    if (column.key === "isActive" || column.key === "status") {
      const label = formatCellValue(column.key, value);
      const isActive =
        value === true ||
        value === 1 ||
        value === "1" ||
        String(value).toLowerCase() === "active";
      return (
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 700,
            color: isActive ? "#FFFFFF" : "#92400E",
            bgcolor: isActive ? "#10B981" : "#FEF3C7",
            borderRadius: 0.8,
            px: 1,
            py: 0.35,
            width: "fit-content",
          }}
        >
          {label}
        </Typography>
      );
    }

    return <Typography sx={tableCellTextSx}>{formatCellValue(column.key, value)}</Typography>;
  };

  return (
    <Box>
      <AdminPageTitleBar
        title={title}
        subtitle={total > 0 ? `${total} record${total === 1 ? "" : "s"}` : undefined}
        action={
          <>
            <Button
              variant="contained"
              onClick={() => fetchCommissions()}
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
                fontWeight: 700,
                bgcolor: "#FFFFFF",
                color: "var(--primary-dark, #0F2F56)",
                "&:hover": { bgcolor: "#EAEFF5" },
              }}
              startIcon={<AddCircleOutlineIcon />}
            >
              Add Markup
            </Button>
          </>
        }
      />

      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 1.5,
          backgroundColor: "#FFFFFF",
          overflowX: "auto",
          width: "100%",
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
            {tableColumns.map((column) => (
              <Box
                key={column.key}
                sx={{
                  ...tableCellBoxSx,
                  borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
                  justifyContent: column.key === "action" ? "center" : tableCellBoxSx.justifyContent,
                }}
              >
                <Typography sx={tableHeaderTextSx}>{column.label}</Typography>
              </Box>
            ))}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <CircularProgress size={24} sx={{ color: "var(--primary-dark, #0F2F56)" }} />
            </Box>
          ) : rows.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                No airline commission found
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
                      justifyContent: column.key === "action" ? "center" : tableCellBoxSx.justifyContent,
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

      <Modal open={formOpen} onClose={handleCloseForm}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(520px, 92vw)",
            bgcolor: "#FFFFFF",
            borderRadius: 3,
            boxShadow: "0 24px 60px rgba(15, 47, 86, 0.22)",
            outline: "none",
            overflow: "hidden",
            border: "1px solid #E2E8F0",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2.5,
              background: "linear-gradient(135deg, #024DAF 0%, #0F2F56 100%)",
              color: "#FFFFFF",
              position: "relative",
            }}
          >
            <IconButton
              onClick={handleCloseForm}
              aria-label="Close"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#FFFFFF",
                "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75, pr: 5 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                  border: "2px solid rgba(255,255,255,0.35)",
                }}
              >
                {editForm.airlineCode.trim() && !logoLoadFailed ? (
                  <Box
                    component="img"
                    src={`https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${editForm.airlineCode.trim().toUpperCase()}.png`}
                    alt={editForm.airlineCode}
                    onError={() => setLogoLoadFailed(true)}
                    sx={{ width: 36, height: 24, objectFit: "contain" }}
                  />
                ) : (
                  <FlightTakeoffOutlinedIcon sx={{ color: "#024DAF", fontSize: 28 }} />
                )}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
                  {formMode === "add" ? "Add Airline Markup" : "Edit Airline Markup"}
                </Typography>
                <Typography sx={{ fontSize: 12.5, opacity: 0.88, mt: 0.35 }}>
                  {formMode === "add"
                    ? "Configure airline commission markup"
                    : "Update existing markup details"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ px: 3, py: 2.5, bgcolor: "#F4F7FB" }}>
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E8EEF5",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography sx={fieldLabelSx}>Airline Name</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Saudi Arabian Airlines"
                    value={editForm.airlineName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, airlineName: e.target.value }))}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={fieldLabelSx}>Airline Code</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="SV"
                    value={editForm.airlineCode}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        airlineCode: e.target.value.toUpperCase(),
                      }))
                    }
                    inputProps={{ maxLength: 3 }}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography sx={fieldLabelSx}>Markup</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="7"
                    value={editForm.markup}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, markup: e.target.value }))}
                    inputProps={{ inputMode: "decimal" }}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>

              {editForm.airlineCode.trim() || editForm.airlineName.trim() ? (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: "#EAF2FF",
                    border: "1px solid #BFDBFE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                    <TagOutlinedIcon sx={{ fontSize: 18, color: "#024DAF" }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#0F2F56" }} noWrap>
                      {editForm.airlineName.trim() || "Airline name"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <PercentOutlinedIcon sx={{ fontSize: 16, color: "#024DAF" }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#024DAF" }}>
                      {editForm.markup.trim() || "0"}% markup
                    </Typography>
                  </Box>
                </Box>
              ) : null}
            </Box>
          </Box>

          <Box
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid #E8EEF5",
              bgcolor: "#FFFFFF",
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.25,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseForm}
              disabled={formLoading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                minWidth: 96,
                borderColor: "#CBD5E1",
                color: "#475569",
                "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveForm}
              disabled={formLoading}
              startIcon={formMode === "add" ? <AddCircleOutlineIcon /> : <EditOutlinedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                minWidth: 130,
                bgcolor: "#024DAF",
                boxShadow: "0 4px 14px rgba(2, 77, 175, 0.35)",
                "&:hover": { bgcolor: "#0B2442", boxShadow: "0 6px 18px rgba(2, 77, 175, 0.4)" },
              }}
            >
              {formLoading
                ? "Saving..."
                : formMode === "add"
                  ? "Add Markup"
                  : "Save Changes"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          pt: 0.75,
        }}
      >
        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
          Showing {rows.length} of {total} records
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
    </Box>
  );
}
