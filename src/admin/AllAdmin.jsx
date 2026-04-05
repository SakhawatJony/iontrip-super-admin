import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Typography, CircularProgress, Modal, IconButton, Menu, MenuItem, InputAdornment, TextField, Grid, Select, FormControl } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";

const headerTitleSx = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0F172A",
};

const inputLabelSx = {
  fontSize: 13,
  fontWeight: 500,
  color: "#374151",
  mb: 1,
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1,
    fontSize: 14,
    "& fieldset": {
      borderColor: "#D1D5DB",
    },
    "&:hover fieldset": {
      borderColor: "#9CA3AF",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#0F2F56",
    },
  },
};

const tableColumns = [
  { key: "adminId", label: "Admin ID", width: "180px" },
  { key: "name", label: "Name", width: "160px" },
  { key: "email", label: "Email", width: "180px" },
  { key: "password", label: "Password", width: "150px" },
  { key: "role", label: "Role", width: "120px" },
  { key: "status", label: "Status", width: "100px" },
  { key: "createdAt", label: "Created At", width: "150px" },
  { key: "action", label: "Action", width: "120px" },
];

const tableGridTemplate = fluidGridTemplateFromColumns(tableColumns);

const STATUS_OPTIONS = [
  { value: "", label: "All Admins" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "SuperAdmin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
];

const AllAdmin = ({ title = "Admin History" }) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [adminIdFilter, setAdminIdFilter] = useState("");
  const [adminEmailFilter, setAdminEmailFilter] = useState("");
  const [adminNameFilter, setAdminNameFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    status: "",
    role: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const statusMenuOpen = Boolean(statusAnchorEl);
  const roleMenuOpen = Boolean(roleAnchorEl);

  const handleStatusClick = (event) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const handleStatusSelect = (statusValue) => {
    setStatus(statusValue);
    setPage(1);
    handleStatusClose();
  };

  const handleRoleClick = (event) => {
    setRoleAnchorEl(event.currentTarget);
  };

  const handleRoleClose = () => {
    setRoleAnchorEl(null);
  };

  const handleRoleSelect = (roleValue) => {
    setRole(roleValue);
    setPage(1);
    handleRoleClose();
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "adminId") {
      setAdminIdFilter(value);
    } else if (filterType === "adminEmail") {
      setAdminEmailFilter(value);
    } else if (filterType === "adminName") {
      setAdminNameFilter(value);
    }
    setPage(1);
  };

  const handleClearFilters = () => {
    setAdminIdFilter("");
    setAdminEmailFilter("");
    setAdminNameFilter("");
    setStatus("");
    setRole("");
    setPage(1);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleOpenDetailsModal = (admin) => {
    setSelectedAdmin(admin);
    setModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleOpenEditModal = (admin) => {
    setEditAdmin(admin);
    setEditFormData({
      firstName: admin?.firstName || "",
      lastName: admin?.lastName || "",
      email: admin?.email || "",
      status: admin?.status || "Active",
      role: admin?.role || "Admin",
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditAdmin(null);
    setEditFormData({
      firstName: "",
      lastName: "",
      email: "",
      status: "",
      role: "",
    });
    setEditErrors({});
  };

  const handleEditChange = (fieldName) => (e) => {
    const value = e.target.value;
    setEditFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error when user starts typing
    if (editErrors[fieldName]) {
      setEditErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      status: "",
      role: "",
    };

    if (!editFormData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!editFormData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!editFormData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!editFormData.status) {
      newErrors.status = "Status is required";
    }

    if (!editFormData.role) {
      newErrors.role = "Role is required";
    }

    setEditErrors(newErrors);
    return !newErrors.firstName && !newErrors.lastName && !newErrors.email && !newErrors.status && !newErrors.role;
  };

  const handleUpdateAdmin = async () => {
    if (!validateEditForm()) {
      return;
    }

    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Authentication token missing. Please login again.",
        confirmButtonColor: "#0F2F56",
      });
      return;
    }

    setEditLoading(true);

    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.UPDATE_ADMIN}`,
        {
          firstName: editFormData.firstName.trim(),
          lastName: editFormData.lastName.trim(),
          email: editFormData.email.trim(),
          status: editFormData.status,
          role: editFormData.role,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Admin has been updated successfully.",
          confirmButtonColor: "#10B981",
        });
        // Refresh the admin list
        fetchAdmins();
        // Close edit modal
        handleCloseEditModal();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update admin.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonColor: "#EF4444",
      });
      console.error("Update admin failed:", err?.response?.data || err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setAddFormData({
      firstName: "",
      lastName: "",
      email: "",
    });
    setAddErrors({});
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setAddFormData({
      firstName: "",
      lastName: "",
      email: "",
    });
    setAddErrors({});
  };

  const handleAddChange = (fieldName) => (e) => {
    const value = e.target.value;
    setAddFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error when user starts typing
    if (addErrors[fieldName]) {
      setAddErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateAddForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
    };

    if (!addFormData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!addFormData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!addFormData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setAddErrors(newErrors);
    return !newErrors.firstName && !newErrors.lastName && !newErrors.email;
  };

  const handleCreateAdmin = async () => {
    if (!validateAddForm()) {
      return;
    }

    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Authentication token missing. Please login again.",
        confirmButtonColor: "#0F2F56",
      });
      return;
    }

    setAddLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CREATE_ADMIN}`,
        {
          firstName: addFormData.firstName.trim(),
          lastName: addFormData.lastName.trim(),
          email: addFormData.email.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Created!",
          text: "Admin has been created successfully.",
          confirmButtonColor: "#10B981",
        });
        // Refresh the admin list
        fetchAdmins();
        // Close add modal
        handleCloseAddModal();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create admin.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonColor: "#EF4444",
      });
      console.error("Create admin failed:", err?.response?.data || err);
    } finally {
      setAddLoading(false);
    }
  };

  const togglePasswordVisibility = (adminId) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [adminId]: !prev[adminId],
    }));
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success(`${label} copied to clipboard!`);
      } catch (err) {
        toast.error("Failed to copy");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (!admin || !admin.email) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Admin email not found",
        confirmButtonColor: "#0F2F56",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Are you sure you want to delete this account "${admin.firstName} ${admin.lastName}" (${admin.email})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    const authToken = token || localStorage.getItem("adminToken") || "";
    
    // Get super admin email from auth context (from adminData.email in login response)
    let superAdminEmail = "";
    
    // First try from user context (from adminData.email)
    if (user) {
      superAdminEmail = user.email || user.adminData?.email || "";
    }
    
    // Fallback: try to get from localStorage if not in context
    if (!superAdminEmail) {
      try {
        const storedUser = localStorage.getItem("adminUser");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          superAdminEmail = parsedUser.email || parsedUser.adminData?.email || "";
        }
      } catch (err) {
        console.error("Error parsing stored user:", err);
      }
    }

    if (!authToken) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Authentication token missing. Please login again.",
        confirmButtonColor: "#0F2F56",
      });
      return;
    }

    if (!superAdminEmail) {
      // Show detailed error with available user data
      const userInfo = user ? JSON.stringify(user, null, 2) : "No user data found";
      Swal.fire({
        icon: "error",
        title: "Super Admin Email Not Found",
        html: `
          <p>Super admin email could not be found in your account.</p>
          <p style="font-size: 12px; color: #6B7280; margin-top: 10px;">
            Available user data: ${userInfo.substring(0, 200)}...
          </p>
          <p style="font-size: 12px; color: #6B7280; margin-top: 10px;">
            Please check your login credentials or contact support.
          </p>
        `,
        confirmButtonColor: "#0F2F56",
      });
      return;
    }

    setDeleteLoading((prev) => ({ ...prev, [admin.email]: true }));

    try {
      // URL encode the super admin email (API expects super admin email in URL path)
      const encodedSuperAdminEmail = encodeURIComponent(admin.email);
      
      // Pass both emails in request body
      const response = await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.DELETE_ADMIN}/${encodedSuperAdminEmail}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
         
        }
      );

      if (response.status === 200 || response.status === 204) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Admin account has been deleted successfully.",
          confirmButtonColor: "#10B981",
        });
        // Refresh the admin list
        fetchAdmins();
        // Close modal if it's open for the deleted admin
        if (selectedAdmin?.email === admin.email) {
          handleCloseDetailsModal();
        }
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete admin.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonColor: "#EF4444",
      });
      console.error("Delete admin failed:", err?.response?.data || err);
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [admin.email]: false }));
    }
  };

  const fetchAdmins = useCallback(async () => {
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
        page: page.toString(),
        limit: limit.toString(),
      });

      if (adminIdFilter && adminIdFilter.trim()) {
        params.append("adminId", adminIdFilter.trim());
      }

      if (adminEmailFilter && adminEmailFilter.trim()) {
        params.append("email", adminEmailFilter.trim());
      }

      if (adminNameFilter && adminNameFilter.trim()) {
        params.append("name", adminNameFilter.trim());
      }

      if (status && status.trim()) {
        params.append("status", status.trim());
      }

      if (role && role.trim()) {
        params.append("role", role.trim());
      }

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ALL_ADMINS}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      // Handle the actual API response structure
      const adminsData = Array.isArray(response?.data?.data) 
        ? response.data.data 
        : (Array.isArray(response?.data) ? response.data : []);
      const paginationData = response?.data || {};
      
      const totalCount = paginationData.total || adminsData.length || 0;
      const calculatedTotalPages = paginationData.totalPages 
        ? paginationData.totalPages 
        : Math.ceil(totalCount / limit) || 1;
      
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
      setTotalPages(calculatedTotalPages);
      setTotal(totalCount);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load admins.";
      setError(apiMessage);
      setAdmins([]);
      console.error("Fetch admins failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, adminIdFilter, adminEmailFilter, adminNameFilter, status, role, token]);

  useEffect(() => {
    if (token) {
      fetchAdmins();
    }
  }, [page, limit, fetchAdmins, token]);

  useEffect(() => {
    if (token) {
      fetchAdmins();
    }
  }, [status, role, fetchAdmins, token]);

  useEffect(() => {
    if (!token) return;
    
    const timeoutId = setTimeout(() => {
      fetchAdmins();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [adminIdFilter, adminEmailFilter, adminNameFilter, fetchAdmins]);

  const mapAdminToTableRow = (admin) => {
    const createdAt = admin?.createdDate
      ? new Date(admin.createdDate).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    const fullName = admin?.firstName && admin?.lastName
      ? `${admin.firstName} ${admin.lastName}`
      : admin?.firstName || admin?.lastName || admin?.name || "-";

    return {
      adminId: admin?.adminId || admin?.id || "-",
      name: fullName,
      email: admin?.email || "-",
      password: admin?.password || "-",
      role: admin?.role || "-",
      status: admin?.status || "-",
      createdAt: createdAt,
    };
  };

  const getStatusColors = (statusValue) => {
    if (statusValue === "Active") {
      return { bg: "#10B981", color: "#FFFFFF" };
    }
    if (statusValue === "Inactive") {
      return { bg: "#EF4444", color: "#FFFFFF" };
    }
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const renderCell = (columnKey, value, fullAdmin = null) => {
    if (columnKey === "adminId") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, maxWidth: "100%" }}>
          <Typography
            onClick={() => fullAdmin && handleOpenDetailsModal(fullAdmin)}
            sx={{
              fontSize: 11,
              fontWeight: 600,
              color: "#111827",
              backgroundColor: "#EEF2F6",
              borderRadius: 0.8,
              px: 1,
              py: 0.35,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: fullAdmin ? "pointer" : "default",
              "&:hover": {
                backgroundColor: fullAdmin ? "#D1D5DB" : "#EEF2F6",
              },
            }}
            title={value}
          >
            {value}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(value, "Admin ID");
            }}
            sx={{
              padding: 0.5,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ContentCopyIcon sx={{ fontSize: 14, color: "#6B7280" }} />
          </IconButton>
        </Box>
      );
    }

    if (columnKey === "name") {
      return (
        <Typography
          sx={{
            fontSize: 11,
            color: "#111827",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={value}
        >
          {value}
        </Typography>
      );
    }

    if (columnKey === "status") {
      const statusColors = getStatusColors(value);
      return (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: statusColors.color,
            backgroundColor: statusColors.bg,
            borderRadius: 0.8,
            px: 1.2,
            py: 0.4,
            width: "fit-content",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      );
    }

    if (columnKey === "password") {
      const adminId = fullAdmin?.adminId || fullAdmin?.id || "";
      const isVisible = passwordVisibility[adminId] || false;
      const displayPassword = isVisible ? value : "••••••••";
      const actualPassword = fullAdmin?.password || value || "";
      
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            sx={{
              fontSize: 11,
              color: "#111827",
              fontFamily: "monospace",
              letterSpacing: isVisible ? "normal" : "0.1em",
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayPassword}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              togglePasswordVisibility(adminId);
            }}
            sx={{
              padding: 0.5,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            {isVisible ? (
              <VisibilityOff sx={{ fontSize: 16, color: "#6B7280" }} />
            ) : (
              <Visibility sx={{ fontSize: 16, color: "#6B7280" }} />
            )}
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(actualPassword, "Password");
            }}
            sx={{
              padding: 0.5,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ContentCopyIcon sx={{ fontSize: 14, color: "#6B7280" }} />
          </IconButton>
        </Box>
      );
    }

    if (columnKey === "action") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (fullAdmin) {
                handleOpenDetailsModal(fullAdmin);
              }
            }}
            sx={{
              padding: 0.5,
              color: "#0F2F56",
              "&:hover": {
                backgroundColor: "rgba(15, 47, 86, 0.08)",
                color: "#0B2442",
              },
            }}
            title="View Details"
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(fullAdmin);
            }}
            sx={{
              padding: 0.5,
              color: "#10B981",
              "&:hover": {
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                color: "#059669",
              },
            }}
            title="Edit"
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteAdmin(fullAdmin);
            }}
            disabled={deleteLoading[fullAdmin?.email]}
            sx={{
              padding: 0.5,
              color: "#EF4444",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                color: "#DC2626",
              },
              "&:disabled": {
                color: "#9CA3AF",
                backgroundColor: "transparent",
              },
            }}
            title="Delete"
          >
            {deleteLoading[fullAdmin?.email] ? (
              <CircularProgress size={16} sx={{ color: "#EF4444" }} />
            ) : (
              <DeleteIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Box>
      );
    }

    if (columnKey === "email") {
      return (
        <Typography
          sx={{
            fontSize: 11,
            color: "#111827",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={value}
        >
          {value}
        </Typography>
      );
    }

    return (
      <Typography
        sx={{
          fontSize: 11,
          color: "#111827",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 1 },
        py: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          p: 1,
          borderRadius: 1,
          bgcolor: "var(--primary-dark, #024DAF)",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: "#FFFFFF" }}>{title}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleOpenAddModal}
            sx={{
              textTransform: "none",
              fontSize: 14,
              fontWeight: 700,
              bgcolor: "#FFFFFF",
              color: "var(--primary-dark, #024DAF)",
              "&:hover": { bgcolor: "#EAEFF5" },
              height: 36,
              px: 2,
              borderRadius: 1,
              boxShadow: "none",
            }}
            startIcon={<AddIcon />}
          >
            Add Admin
          </Button>
          <Button
            variant="outlined"
            onClick={() => fetchAdmins()}
            sx={{
              textTransform: "none",
              fontSize: 14,
              fontWeight: 700,
              bgcolor: "#FFFFFF",
              color: "var(--primary-dark, #024DAF)",
              borderColor: "rgba(2, 77, 175, 0.35)",
              "&:hover": { bgcolor: "#EAEFF5", borderColor: "rgba(2, 77, 175, 0.45)" },
              height: 36,
              px: 2,
              borderRadius: 1,
            }}
            startIcon={<RefreshIcon />}
          >
            Reload History
          </Button>
        </Box>
      </Box>

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
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          {showFilters && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexWrap: "wrap",
                flex: 1,
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
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Admin ID"
                  value={adminIdFilter}
                  onChange={(e) => handleFilterChange("adminId", e.target.value)}
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "#EAF2FF",
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Admin Email"
                  value={adminEmailFilter}
                  onChange={(e) => handleFilterChange("adminEmail", e.target.value)}
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "#EAF2FF",
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Admin Name"
                  value={adminNameFilter}
                  onChange={(e) => handleFilterChange("adminName", e.target.value)}
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
              {(adminIdFilter || adminEmailFilter || adminNameFilter || status || role) && (
                <Button
                  variant="outlined"
                  onClick={handleClearFilters}
                  sx={{
                    textTransform: "none",
                    fontSize: 11.5,
                    fontWeight: 600,
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
              )}
            </Box>
          )}
          <Button
            variant="contained"
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            onClick={handleToggleFilters}
            sx={{
              textTransform: "none",
              fontSize: 11.5,
              fontWeight: 600,
              height: 32,
              px: 1.5,
              backgroundColor: "var(--primary-dark, #024DAF)",
              "&:hover": { backgroundColor: "rgba(2, 77, 175, 0.95)" },
              ml: "auto",
            }}
          >
            {showFilters ? "Hide Filter" : "More Filter"}
          </Button>
        </Box>

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 1.5,
            backgroundColor: "#FFFFFF",
            overflowX: "hidden",
            maxHeight: { xs: "55vh", md: "65vh" },
            overflowY: "scroll",
            width: "100%",
          }}
          className="table-scrollbar-primary-dark"
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
              {tableColumns?.map((column) => (
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
                <CircularProgress size={24} sx={{ color: "#0F2F56" }} />
              </Box>
            ) : error ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#d32f2f" }}>{error}</Typography>
              </Box>
            ) : admins.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No admins found</Typography>
              </Box>
            ) : (
              admins.map((admin, index) => {
                const row = mapAdminToTableRow(admin);
                return (
                  <Box
                    key={`${admin.adminId || admin.id || index}-${index}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: tableGridTemplate,
                      alignItems: "stretch",
                      width: "100%",
                    }}
                  >
                    {tableColumns.map((column) => {
                      const value = row[column.key] || "-";
                      return (
                        <Box
                          key={`${admin.adminId || admin.id || index}-${column.key}`}
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
                          {renderCell(column.key, value, admin)}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })
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
      </Box>

      {/* Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseDetailsModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "800px",
            maxHeight: "90vh",
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            outline: "none",
            overflowY: "auto",
          }}
        >
          <IconButton
            onClick={handleCloseDetailsModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {selectedAdmin && (() => {
            const adminId = selectedAdmin.adminId || selectedAdmin.id || "";
            const modalPasswordVisible = passwordVisibility[`modal-${adminId}`] || false;
            const fullName = selectedAdmin.firstName && selectedAdmin.lastName
              ? `${selectedAdmin.firstName} ${selectedAdmin.lastName}`
              : selectedAdmin.firstName || selectedAdmin.lastName || selectedAdmin.name || "-";
            
            return (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#0F172A" }}>
                  Admin Details
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Admin ID</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827", flex: 1 }}>
                        {selectedAdmin.adminId || selectedAdmin.id || "-"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(selectedAdmin.adminId || selectedAdmin.id || "", "Admin ID")}
                        sx={{
                          padding: 0.5,
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.04)",
                          },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                      </IconButton>
                    </Box>
                  </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>First Name</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {selectedAdmin.firstName || "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Last Name</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {selectedAdmin.lastName || "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Full Name</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {fullName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Email</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {selectedAdmin.email || "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Password</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#111827",
                            fontFamily: "monospace",
                            letterSpacing: modalPasswordVisible ? "normal" : "0.1em",
                            flex: 1,
                          }}
                        >
                          {modalPasswordVisible ? (selectedAdmin.password || "-") : "••••••••"}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => togglePasswordVisibility(`modal-${adminId}`)}
                          sx={{
                            padding: 0.5,
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          {modalPasswordVisible ? (
                            <VisibilityOff sx={{ fontSize: 18, color: "#6B7280" }} />
                          ) : (
                            <Visibility sx={{ fontSize: 18, color: "#6B7280" }} />
                          )}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(selectedAdmin.password || "", "Password")}
                          sx={{
                            padding: 0.5,
                            "&:hover": {
                              backgroundColor: "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Role</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {selectedAdmin.role || "-"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Status</Typography>
                      {(() => {
                        const adminStatus = selectedAdmin.status || (selectedAdmin.isActive ? "Active" : "Inactive");
                        const statusColors = getStatusColors(adminStatus);
                        return (
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: statusColors.color,
                              backgroundColor: statusColors.bg,
                              borderRadius: 0.8,
                              px: 1.5,
                              py: 0.5,
                              width: "fit-content",
                            }}
                          >
                            {adminStatus}
                          </Typography>
                        );
                      })()}
                    </Box>
                    {selectedAdmin.createdDate && (
                      <Box>
                        <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Created Date</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                          {new Date(selectedAdmin.createdDate).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    )}
                    {selectedAdmin.updatedDate && (
                      <Box>
                        <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Updated Date</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                          {new Date(selectedAdmin.updatedDate).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })(          )}
        </Box>
      </Modal>

      {/* Edit Admin Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "700px",
            maxHeight: "90vh",
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            outline: "none",
            overflowY: "auto",
            width: "90%",
          }}
        >
          <IconButton
            onClick={handleCloseEditModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#0F172A" }}>
            Edit Admin
          </Typography>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleUpdateAdmin(); }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  First name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter first name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editFormData?.firstName || ""}
                  onChange={handleEditChange("firstName")}
                  error={!!editErrors.firstName}
                  helperText={editErrors.firstName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Last name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter last name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editFormData?.lastName || ""}
                  onChange={handleEditChange("lastName")}
                  error={!!editErrors.lastName}
                  helperText={editErrors.lastName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Email <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter email"
                  type="email"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editFormData?.email || ""}
                  onChange={handleEditChange("email")}
                  error={!!editErrors.email}
                  helperText={editErrors.email}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Status <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <Select
                    value={editFormData?.status || "Active"}
                    onChange={handleEditChange("status")}
                    sx={{
                      fontSize: 14,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#D1D5DB",
                      },
                    }}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
                {editErrors.status && (
                  <Typography sx={{ fontSize: 12, color: "#d32f2f", mt: 0.5 }}>
                    {editErrors.status}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Role <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <Select
                    value={editFormData?.role || "Admin"}
                    onChange={handleEditChange("role")}
                    sx={{
                      fontSize: 14,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#D1D5DB",
                      },
                    }}
                  >
                    <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                  </Select>
                </FormControl>
                {editErrors.role && (
                  <Typography sx={{ fontSize: 12, color: "#d32f2f", mt: 0.5 }}>
                    {editErrors.role}
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCloseEditModal}
                disabled={editLoading}
                sx={{
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  minHeight: "40px",
                  borderColor: "#E5E7EB",
                  color: "#6B7280",
                  "&:hover": {
                    borderColor: "#D1D5DB",
                    backgroundColor: "#F9FAFB",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={editLoading}
                sx={{
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  minHeight: "40px",
                  backgroundColor: "#000000",
                  "&:hover": { backgroundColor: "#1a1a1a" },
                  "&:disabled": {
                    backgroundColor: "#D1D5DB",
                    color: "#9CA3AF",
                  },
                }}
              >
                {editLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                    <Typography sx={{ fontSize: 14 }}>Updating...</Typography>
                  </Box>
                ) : (
                  "Update Admin"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "700px",
            maxHeight: "90vh",
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            outline: "none",
            overflowY: "auto",
            width: "90%",
          }}
        >
          <IconButton
            onClick={handleCloseAddModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#0F172A" }}>
            Add Admin
          </Typography>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCreateAdmin(); }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  First name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter first name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addFormData?.firstName || ""}
                  onChange={handleAddChange("firstName")}
                  error={!!addErrors.firstName}
                  helperText={addErrors.firstName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Last name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter last name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addFormData?.lastName || ""}
                  onChange={handleAddChange("lastName")}
                  error={!!addErrors.lastName}
                  helperText={addErrors.lastName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Email <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter email"
                  type="email"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addFormData?.email || ""}
                  onChange={handleAddChange("email")}
                  error={!!addErrors.email}
                  helperText={addErrors.email}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCloseAddModal}
                disabled={addLoading}
                sx={{
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  minHeight: "40px",
                  borderColor: "#E5E7EB",
                  color: "#6B7280",
                  "&:hover": {
                    borderColor: "#D1D5DB",
                    backgroundColor: "#F9FAFB",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={addLoading}
                sx={{
                  textTransform: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  minHeight: "40px",
                  backgroundColor: "#000000",
                  "&:hover": { backgroundColor: "#1a1a1a" },
                  "&:disabled": {
                    backgroundColor: "#D1D5DB",
                    color: "#9CA3AF",
                  },
                }}
              >
                {addLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                    <Typography sx={{ fontSize: 14 }}>Creating...</Typography>
                  </Box>
                ) : (
                  "Create Admin"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AllAdmin;
