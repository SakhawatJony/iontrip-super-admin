import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
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

const COLUMN_SKIP_KEYS = new Set([
  "__v",
  "password",
  "refreshToken",
  "accessToken",
  "agents",
  "agent",
  "updatedAt",
  "updated_at",
]);

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

const COLUMN_LABELS = {
  id: "ID",
  _id: "ID",
  name: "Name",
  fullName: "Full Name",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  mobile: "Mobile",
  role: "Role",
  department: "Department",
  designation: "Designation",
  status: "Status",
  isActive: "Status",
  type: "Type",
  assignType: "Assign Type",
  peopleType: "People Type",
  createdAt: "Created At",
  updatedAt: "Updated At",
};

const COLUMN_PRIORITY = [
  "id",
  "_id",
  "name",
  "fullName",
  "firstName",
  "lastName",
  "email",
  "phone",
  "mobile",
  "role",
  "department",
  "designation",
  "type",
  "assignType",
  "peopleType",
  "status",
  "isActive",
  "createdAt",
  "updatedAt",
];

function showApiErrorToasts(err, fallback = "Failed to load assign people.") {
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
  if (Array.isArray(value)) return value.length ? String(value.length) : "-";
  if (typeof value === "object") return "-";
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

  return ordered.map((key) => {
    let width = "140px";
    if (key === "id" || key === "_id") width = "70px";
    else if (key === "name" || key === "fullName") width = "180px";
    else if (key === "email") width = "220px";
    else if (key === "phone" || key === "mobile") width = "160px";
    else if (key.includes("At") || key.includes("date")) width = "180px";
    return {
      key,
      label: humanizeColumnKey(key),
      width,
    };
  });
}

function normalizeListResponse(body) {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;
  if (Array.isArray(body?.people)) return body.people;
  if (Array.isArray(body?.items)) return body.items;
  if (Array.isArray(body?.results)) return body.results;
  return [];
}

const tableCellBoxSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  px: 1.5,
  py: 1.25,
  minWidth: 0,
  overflow: "hidden",
  textAlign: "left",
};

const tableHeaderTextSx = {
  fontSize: 13,
  fontWeight: 700,
  color: "#FFFFFF",
  lineHeight: 1.35,
  whiteSpace: "nowrap",
  width: "100%",
  textAlign: "left",
};

const tableCellTextSx = {
  fontSize: 13,
  fontWeight: 500,
  color: "#111827",
  lineHeight: 1.4,
  wordBreak: "break-word",
  overflowWrap: "anywhere",
  whiteSpace: "normal",
  width: "100%",
  textAlign: "left",
};

export default function AllAssignPeople({ title = "Assign People" }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allRows, setAllRows] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [editRow, setEditRow] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const total = allRows.length;
  const rows = allRows;

  const tableColumns = useMemo(() => {
    const dataColumns = buildColumnsFromRows(allRows).filter((col) => col.key !== "empty");
    const columns = dataColumns.length
      ? dataColumns
      : [
          { key: "id", label: "ID", width: "70px" },
          { key: "name", label: "Name", width: "180px" },
          { key: "email", label: "Email", width: "220px" },
          { key: "phone", label: "Phone", width: "160px" },
          { key: "createdAt", label: "Created At", width: "180px" },
        ];
    return [...columns, { key: "action", label: "Action", width: "110px" }];
  }, [allRows]);

  const tableGridTemplate = useMemo(
    () => fluidGridTemplateFromColumns(tableColumns),
    [tableColumns],
  );

  const fetchAssignPeople = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      setLoading(false);
      setAllRows([]);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ASSIGN_PEOPLE}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const list = normalizeListResponse(response?.data);
      const normalized = list.map((item, index) => ({
        ...item,
        id: item?.id ?? item?._id ?? index,
      }));
      setAllRows(normalized);
    } catch (err) {
      showApiErrorToasts(err);
      setAllRows([]);
      console.error("Fetch assign people failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAssignPeople();
  }, [fetchAssignPeople]);

  const handleOpenAdd = () => {
    setFormMode("add");
    setEditRow(null);
    setFormData(EMPTY_FORM);
    setFormOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormMode("edit");
    setEditRow(row);
    setFormData({
      name: row?.name || "",
      email: row?.email || "",
      phone: row?.phone || row?.mobile || "",
    });
    setFormOpen(true);
  };

  const handleCloseForm = (force = false) => {
    if (formLoading && !force) return;
    setFormOpen(false);
    setFormMode("add");
    setEditRow(null);
    setFormData(EMPTY_FORM);
  };

  const handleFormChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required.");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone is required.");
      return false;
    }
    return true;
  };

  const handleSaveForm = async () => {
    if (!validateForm()) return;

    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    };

    setFormLoading(true);
    try {
      if (formMode === "edit") {
        const rowId = Number(editRow?.id ?? editRow?._id);
        if (!Number.isFinite(rowId)) {
          toast.error("Record ID not found.");
          setFormLoading(false);
          return;
        }
        await axios.patch(`${API_BASE_URL}${API_ENDPOINTS.ASSIGN_PEOPLE_BY_ID(rowId)}`, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("People updated successfully.");
      } else {
        await axios.post(`${API_BASE_URL}${API_ENDPOINTS.ASSIGN_PEOPLE}`, payload, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("People added successfully.");
      }
      setFormLoading(false);
      handleCloseForm(true);
      fetchAssignPeople();
    } catch (err) {
      showApiErrorToasts(err, formMode === "edit" ? "Failed to update people." : "Failed to add people.");
      console.error("Save assign people failed:", err?.response?.data || err);
      setFormLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const rowId = Number(row?.id ?? row?._id);
    if (!Number.isFinite(rowId)) {
      toast.error("Record ID not found.");
      return;
    }

    const result = await Swal.fire({
      title: "Delete people?",
      text: `"${row?.name || row?.email || "This record"}" will be removed permanently.`,
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
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.ASSIGN_PEOPLE_BY_ID(rowId)}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("People deleted successfully.");
      fetchAssignPeople();
    } catch (err) {
      showApiErrorToasts(err, "Failed to delete people.");
      console.error("Delete assign people failed:", err?.response?.data || err);
      setLoading(false);
    }
  };

  const renderCell = (row, column) => {
    if (column.key === "action") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <IconButton
            size="small"
            sx={actionBtnSx}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            aria-label="Edit people"
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
            aria-label="Delete people"
          >
            <DeleteOutlineIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      );
    }

    const value = row?.[column.key];

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
            fontSize: 12,
            fontWeight: 700,
            color: isActive ? "#FFFFFF" : "#92400E",
            bgcolor: isActive ? "#10B981" : "#FEF3C7",
            borderRadius: 0.8,
            px: 1.25,
            py: 0.4,
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
              onClick={() => fetchAssignPeople()}
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
              Add
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
                  ...tableCellBoxSx,
                  justifyContent: column.key === "action" ? "center" : tableCellBoxSx.justifyContent,
                }}
              >
                <Typography
                  sx={{
                    ...tableHeaderTextSx,
                    textAlign: column.key === "action" ? "center" : tableHeaderTextSx.textAlign,
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
          ) : rows.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                No assign people found
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
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                {tableColumns.map((column) => (
                  <Box
                    key={`${row.id}-${column.key}`}
                    sx={{
                      ...tableCellBoxSx,
                      borderBottom: "1px solid #E5E7EB",
                      justifyContent:
                        column.key === "action" ? "center" : tableCellBoxSx.justifyContent,
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

      <Modal open={formOpen} onClose={() => handleCloseForm()}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(480px, 92vw)",
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
              onClick={() => handleCloseForm()}
              aria-label="Close"
              disabled={formLoading}
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
                  flexShrink: 0,
                }}
              >
                <PersonAddAlt1OutlinedIcon sx={{ color: "#024DAF", fontSize: 28 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
                  {formMode === "edit" ? "Edit People" : "Add People"}
                </Typography>
                <Typography sx={{ fontSize: 12.5, opacity: 0.88, mt: 0.35 }}>
                  {formMode === "edit"
                    ? "Update assign people details"
                    : "Create a new assign people record"}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ px: 3, py: 2.5, bgcolor: "#F4F7FB" }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography sx={fieldLabelSx}>Name</Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Mr. RAZU BM"
                  value={formData.name}
                  onChange={handleFormChange("name")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography sx={fieldLabelSx}>Email</Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="travelplanners16@gmail.com"
                  value={formData.email}
                  onChange={handleFormChange("email")}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography sx={fieldLabelSx}>Phone</Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="+60 14-266 0039"
                  value={formData.phone}
                  onChange={handleFormChange("phone")}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2.5 }}>
              <Button
                onClick={() => handleCloseForm()}
                disabled={formLoading}
                sx={{ textTransform: "none", color: "#64748B", fontWeight: 600 }}
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
                  bgcolor: "#024DAF",
                  "&:hover": { bgcolor: "#0F2F56" },
                }}
              >
                {formLoading ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
