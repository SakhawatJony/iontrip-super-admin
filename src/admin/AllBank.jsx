import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Typography, CircularProgress, IconButton, Modal, TextField, Grid, Select, FormControl, MenuItem } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";

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

const AllBank = ({ title = "All Bank" }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableColumns, setTableColumns] = useState([]);
  const [tableGridTemplate, setTableGridTemplate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [addBankModalOpen, setAddBankModalOpen] = useState(false);
  const [addBankFormData, setAddBankFormData] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    branchName: "",
    swiftCode: "",
    routingNumber: "",
    currency: "MYR",
    label: "",
    displayOrder: 0,
    isActive: true,
  });
  const [addBankErrors, setAddBankErrors] = useState({});
  const [addBankLoading, setAddBankLoading] = useState(false);
  const [editBankModalOpen, setEditBankModalOpen] = useState(false);
  const [editBank, setEditBank] = useState(null);
  const [editBankFormData, setEditBankFormData] = useState({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    branchName: "",
    swiftCode: "",
    routingNumber: "",
    currency: "MYR",
    label: "",
    displayOrder: 0,
    isActive: true,
  });
  const [editBankErrors, setEditBankErrors] = useState({});
  const [editBankLoading, setEditBankLoading] = useState(false);

  const fetchBanks = useCallback(async () => {
    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      setError("Authentication token missing. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.BANK_INFO}?activeOnly=true`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Handle array response or object with data property
        const bankData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || [];
        setBanks(bankData);

        // Generate table columns dynamically from first bank object
        if (bankData.length > 0) {
          const firstBank = bankData[0];
          const columns = Object.keys(firstBank).map((key) => ({
            key: key,
            label: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim(),
            width: "150px",
          }));
          // Add action column
          columns.push({ key: "action", label: "Action", width: "120px" });
          setTableColumns(columns);
          setTableGridTemplate(columns.map((col) => col.width).join(" "));
        }
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to fetch bank information.";
      setError(apiMessage);
      toast.error(apiMessage);
      console.error("Fetch banks failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleOpenDetailsModal = (bank) => {
    setSelectedBank(bank);
    setModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setModalOpen(false);
    setSelectedBank(null);
  };

  const handleOpenEditBankModal = (bank) => {
    setEditBank(bank);
    setEditBankFormData({
      bankName: bank?.bankName || "",
      accountHolderName: bank?.accountHolderName || "",
      accountNumber: bank?.accountNumber || "",
      branchName: bank?.branchName || "",
      swiftCode: bank?.swiftCode || "",
      routingNumber: bank?.routingNumber || "",
      currency: bank?.currency || "MYR",
      label: bank?.label || "",
      displayOrder: bank?.displayOrder || 0,
      isActive: bank?.isActive !== undefined ? bank.isActive : true,
    });
    setEditBankErrors({});
    setEditBankModalOpen(true);
  };

  const handleCloseEditBankModal = () => {
    setEditBankModalOpen(false);
    setEditBank(null);
    setEditBankFormData({
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      branchName: "",
      swiftCode: "",
      routingNumber: "",
      currency: "MYR",
      label: "",
      displayOrder: 0,
      isActive: true,
    });
    setEditBankErrors({});
  };

  const handleEditBankChange = (fieldName) => (e) => {
    const value = e.target.value;
    setEditBankFormData((prev) => ({
      ...prev,
      [fieldName]: fieldName === "displayOrder" ? parseInt(value) || 0 : fieldName === "isActive" ? value === "true" : value,
    }));
    // Clear error when user starts typing
    if (editBankErrors[fieldName]) {
      setEditBankErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateEditBankForm = () => {
    const newErrors = {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      branchName: "",
      swiftCode: "",
      routingNumber: "",
      currency: "",
      label: "",
      displayOrder: "",
    };

    if (!editBankFormData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!editBankFormData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    if (!editBankFormData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    if (!editBankFormData.branchName.trim()) {
      newErrors.branchName = "Branch name is required";
    }

    if (!editBankFormData.swiftCode.trim()) {
      newErrors.swiftCode = "SWIFT code is required";
    }

    if (!editBankFormData.routingNumber.trim()) {
      newErrors.routingNumber = "Routing number is required";
    }

    if (!editBankFormData.currency.trim()) {
      newErrors.currency = "Currency is required";
    }

    if (!editBankFormData.label.trim()) {
      newErrors.label = "Label is required";
    }

    setEditBankErrors(newErrors);
    return !newErrors.bankName && !newErrors.accountHolderName && !newErrors.accountNumber && 
           !newErrors.branchName && !newErrors.swiftCode && !newErrors.routingNumber && 
           !newErrors.currency && !newErrors.label;
  };

  const handleUpdateBank = async () => {
    if (!validateEditBankForm()) {
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

    if (!editBank || (!editBank.id && !editBank.bankId)) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Bank ID not found",
        confirmButtonColor: "#0F2F56",
      });
      return;
    }

    const bankId = editBank.id || editBank.bankId;
    setEditBankLoading(true);

    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.UPDATE_BANK}/${bankId}`,
        {
          bankName: editBankFormData.bankName.trim(),
          accountHolderName: editBankFormData.accountHolderName.trim(),
          accountNumber: editBankFormData.accountNumber.trim(),
          branchName: editBankFormData.branchName.trim(),
          swiftCode: editBankFormData.swiftCode.trim(),
          routingNumber: editBankFormData.routingNumber.trim(),
          currency: editBankFormData.currency,
          label: editBankFormData.label.trim(),
          displayOrder: editBankFormData.displayOrder,
          isActive: editBankFormData.isActive,
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
          text: "Bank has been updated successfully.",
          confirmButtonColor: "#10B981",
        });
        // Refresh the bank list
        fetchBanks();
        // Close edit modal
        handleCloseEditBankModal();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update bank.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonColor: "#EF4444",
      });
      console.error("Update bank failed:", err?.response?.data || err);
    } finally {
      setEditBankLoading(false);
    }
  };

  const handleOpenAddBankModal = () => {
    setAddBankFormData({
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      branchName: "",
      swiftCode: "",
      routingNumber: "",
      currency: "MYR",
      label: "",
      displayOrder: 0,
      isActive: true,
    });
    setAddBankErrors({});
    setAddBankModalOpen(true);
  };

  const handleCloseAddBankModal = () => {
    setAddBankModalOpen(false);
    setAddBankFormData({
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      branchName: "",
      swiftCode: "",
      routingNumber: "",
      currency: "MYR",
      label: "",
      displayOrder: 0,
      isActive: true,
    });
    setAddBankErrors({});
  };

  const handleAddBankChange = (fieldName) => (e) => {
    const value = e.target.value;
    setAddBankFormData((prev) => ({
      ...prev,
      [fieldName]: fieldName === "displayOrder" ? parseInt(value) || 0 : fieldName === "isActive" ? value === "true" : value,
    }));
    // Clear error when user starts typing
    if (addBankErrors[fieldName]) {
      setAddBankErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateAddBankForm = () => {
    const newErrors = {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      branchName: "",
      swiftCode: "",
      routingNumber: "",
      currency: "",
      label: "",
      displayOrder: "",
    };

    if (!addBankFormData.bankName.trim()) {
      newErrors.bankName = "Bank name is required";
    }

    if (!addBankFormData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }

    if (!addBankFormData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    if (!addBankFormData.branchName.trim()) {
      newErrors.branchName = "Branch name is required";
    }

    if (!addBankFormData.swiftCode.trim()) {
      newErrors.swiftCode = "SWIFT code is required";
    }

    if (!addBankFormData.routingNumber.trim()) {
      newErrors.routingNumber = "Routing number is required";
    }

    if (!addBankFormData.currency.trim()) {
      newErrors.currency = "Currency is required";
    }

    if (!addBankFormData.label.trim()) {
      newErrors.label = "Label is required";
    }

    setAddBankErrors(newErrors);
    return !newErrors.bankName && !newErrors.accountHolderName && !newErrors.accountNumber && 
           !newErrors.branchName && !newErrors.swiftCode && !newErrors.routingNumber && 
           !newErrors.currency && !newErrors.label;
  };

  const handleCreateBank = async () => {
    if (!validateAddBankForm()) {
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

    setAddBankLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CREATE_BANK}`,
        {
          bankName: addBankFormData.bankName.trim(),
          accountHolderName: addBankFormData.accountHolderName.trim(),
          accountNumber: addBankFormData.accountNumber.trim(),
          branchName: addBankFormData.branchName.trim(),
          swiftCode: addBankFormData.swiftCode.trim(),
          routingNumber: addBankFormData.routingNumber.trim(),
          currency: addBankFormData.currency,
          label: addBankFormData.label.trim(),
          displayOrder: addBankFormData.displayOrder,
          isActive: addBankFormData.isActive,
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
          text: "Bank has been created successfully.",
          confirmButtonColor: "#10B981",
        });
        // Refresh the bank list
        fetchBanks();
        // Close add modal
        handleCloseAddBankModal();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create bank.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonColor: "#EF4444",
      });
      console.error("Create bank failed:", err?.response?.data || err);
    } finally {
      setAddBankLoading(false);
    }
  };

  const handleDeleteBank = async (bank) => {
    if (!bank) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Bank information not found",
        confirmButtonColor: "#0F2F56",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Are you sure you want to delete this bank information?`,
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

    const bankId = bank.id || bank.bankId || "";
    
    if (!bankId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Bank ID not found",
        confirmButtonColor: "#0F2F56",
      });
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

    setDeleteLoading((prev) => ({ ...prev, [bankId]: true }));

    try {
      const response = await axios.delete(
        `${API_BASE_URL}${API_ENDPOINTS.DELETE_BANK}/${bankId}`,
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
          text: "Bank information has been deleted successfully.",
          confirmButtonColor: "#10B981",
        });
        // Refresh the bank list
        fetchBanks();
        // Close modal if it's open for the deleted bank
        if (selectedBank?.id === bankId || selectedBank?.bankId === bankId) {
          handleCloseDetailsModal();
        }
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete bank information.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: apiMessage,
        confirmButtonColor: "#EF4444",
      });
      console.error("Delete bank failed:", err?.response?.data || err);
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [bankId]: false }));
    }
  };

  const getStatusColors = (statusValue) => {
    if (statusValue === "Active" || statusValue === true) {
      return { bg: "#10B981", color: "#FFFFFF" };
    }
    if (statusValue === "Inactive" || statusValue === false) {
      return { bg: "#EF4444", color: "#FFFFFF" };
    }
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const renderCell = (columnKey, value) => {
    if (value === null || value === undefined) {
      return (
        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>-</Typography>
      );
    }

    // Handle action column
    if (columnKey === "action") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (value) {
                handleOpenDetailsModal(value);
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
              handleOpenEditBankModal(value);
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
              handleDeleteBank(value);
            }}
            disabled={deleteLoading[value?.id || value?.bankId || ""]}
            sx={{
              padding: 0.5,
              color: "#EF4444",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                color: "#DC2626",
              },
              "&:disabled": {
                color: "#D1D5DB",
              },
            }}
            title="Delete"
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      );
    }

    // Handle active column - show Active/Inactive with styling
    if (columnKey.toLowerCase() === "active" || columnKey.toLowerCase() === "isactive") {
      const isActive = value === true || value === "true" || String(value).toLowerCase() === "active";
      const statusText = isActive ? "Active" : "Inactive";
      const statusColors = getStatusColors(isActive);
      
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
          {statusText}
        </Typography>
      );
    }

    // Format date values
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return (
            <Typography sx={{ fontSize: 11, color: "#111827" }}>
              {date.toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          );
        }
      } catch (e) {
        // Not a valid date, continue with normal rendering
      }
    }

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
        title={String(value)}
      >
        {String(value)}
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
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={headerTitleSx}>{title}</Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddBankModal}
              sx={{
                textTransform: "none",
                fontSize: 13,
                fontWeight: 600,
                px: 2.5,
                py: 1,
                height: 36,
                backgroundColor: "#000000",
                "&:hover": { backgroundColor: "#1a1a1a" },
              }}
            >
              Add Bank
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 1.5,
            backgroundColor: "#FFFFFF",
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          {tableColumns.length > 0 && (
            <Box sx={{ minWidth: tableColumns.length * 150 }}>
              {/* Table Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: tableGridTemplate,
                  alignItems: "stretch",
                  backgroundColor: "#F8FAFC",
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
                      backgroundColor: "#F8FAFC",
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "var(--primary-color, #123D6E)" }}>
                      {column.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Table Body */}
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                  <CircularProgress size={24} sx={{ color: "#0F2F56" }} />
                </Box>
              ) : error ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                  <Typography sx={{ fontSize: 12, color: "#d32f2f" }}>{error}</Typography>
                </Box>
              ) : banks.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                  <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No bank information found</Typography>
                </Box>
              ) : (
                banks.map((bank, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: tableGridTemplate,
                      alignItems: "stretch",
                    }}
                  >
                    {tableColumns.map((column) => {
                      const value = column.key === "action" ? bank : bank[column.key];
                      return (
                        <Box
                          key={`${index}-${column.key}`}
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
                          {renderCell(column.key, value)}
                        </Box>
                      );
                    })}
                  </Box>
                ))
              )}
            </Box>
          )}

          {!loading && !error && banks.length === 0 && tableColumns.length === 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No bank information found</Typography>
            </Box>
          )}
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
            width: "90%",
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

          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#0F172A" }}>
            Bank Details
          </Typography>

          {selectedBank && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {Object.entries(selectedBank).map(([key, value]) => (
                <Box key={key}>
                  <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim()}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                    {value !== null && value !== undefined ? String(value) : "N/A"}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Modal>

      {/* Add Bank Modal */}
      <Modal
        open={addBankModalOpen}
        onClose={handleCloseAddBankModal}
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
            onClick={handleCloseAddBankModal}
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
            Add Bank
          </Typography>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCreateBank(); }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Bank Name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter bank name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addBankFormData?.bankName || ""}
                  onChange={handleAddBankChange("bankName")}
                  error={!!addBankErrors.bankName}
                  helperText={addBankErrors.bankName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Account Holder Name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter account holder name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addBankFormData?.accountHolderName || ""}
                  onChange={handleAddBankChange("accountHolderName")}
                  error={!!addBankErrors.accountHolderName}
                  helperText={addBankErrors.accountHolderName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Account Number <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter account number"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addBankFormData?.accountNumber || ""}
                  onChange={handleAddBankChange("accountNumber")}
                  error={!!addBankErrors.accountNumber}
                  helperText={addBankErrors.accountNumber}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Branch Name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter branch name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addBankFormData?.branchName || ""}
                  onChange={handleAddBankChange("branchName")}
                  error={!!addBankErrors.branchName}
                  helperText={addBankErrors.branchName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  SWIFT Code <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter SWIFT code"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addBankFormData?.swiftCode || ""}
                  onChange={handleAddBankChange("swiftCode")}
                  error={!!addBankErrors.swiftCode}
                  helperText={addBankErrors.swiftCode}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Routing Number <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter routing number"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addBankFormData?.routingNumber || ""}
                  onChange={handleAddBankChange("routingNumber")}
                  error={!!addBankErrors.routingNumber}
                  helperText={addBankErrors.routingNumber}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Currency <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <Select
                    value={addBankFormData?.currency || "MYR"}
                    onChange={handleAddBankChange("currency")}
                    sx={{
                      fontSize: 14,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#D1D5DB",
                      },
                    }}
                  >
                    <MenuItem value="MYR">MYR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="SGD">SGD</MenuItem>
                    <MenuItem value="BDT">BDT</MenuItem>
                  </Select>
                </FormControl>
                {addBankErrors.currency && (
                  <Typography sx={{ fontSize: 12, color: "#d32f2f", mt: 0.5 }}>
                    {addBankErrors.currency}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Label <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter label"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={addBankFormData?.label || ""}
                  onChange={handleAddBankChange("label")}
                  error={!!addBankErrors.label}
                  helperText={addBankErrors.label}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Display Order
                </Typography>
                <TextField
                  type="number"
                  placeholder="Enter display order"
                  size="small"
                  fullWidth
                  sx={fieldSx}
                  value={addBankFormData?.displayOrder || 0}
                  onChange={handleAddBankChange("displayOrder")}
                  error={!!addBankErrors.displayOrder}
                  helperText={addBankErrors.displayOrder}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Status <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <Select
                    value={addBankFormData?.isActive ? "true" : "false"}
                    onChange={handleAddBankChange("isActive")}
                    sx={{
                      fontSize: 14,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#D1D5DB",
                      },
                    }}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCloseAddBankModal}
                disabled={addBankLoading}
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
                disabled={addBankLoading}
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
                {addBankLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                    <Typography sx={{ fontSize: 14 }}>Creating...</Typography>
                  </Box>
                ) : (
                  "Create Bank"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Edit Bank Modal */}
      <Modal
        open={editBankModalOpen}
        onClose={handleCloseEditBankModal}
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
            onClick={handleCloseEditBankModal}
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
            Edit Bank
          </Typography>

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleUpdateBank(); }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Bank Name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter bank name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editBankFormData?.bankName || ""}
                  onChange={handleEditBankChange("bankName")}
                  error={!!editBankErrors.bankName}
                  helperText={editBankErrors.bankName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Account Holder Name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter account holder name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editBankFormData?.accountHolderName || ""}
                  onChange={handleEditBankChange("accountHolderName")}
                  error={!!editBankErrors.accountHolderName}
                  helperText={editBankErrors.accountHolderName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Account Number <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter account number"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editBankFormData?.accountNumber || ""}
                  onChange={handleEditBankChange("accountNumber")}
                  error={!!editBankErrors.accountNumber}
                  helperText={editBankErrors.accountNumber}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Branch Name <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter branch name"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editBankFormData?.branchName || ""}
                  onChange={handleEditBankChange("branchName")}
                  error={!!editBankErrors.branchName}
                  helperText={editBankErrors.branchName}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  SWIFT Code <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter SWIFT code"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editBankFormData?.swiftCode || ""}
                  onChange={handleEditBankChange("swiftCode")}
                  error={!!editBankErrors.swiftCode}
                  helperText={editBankErrors.swiftCode}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Routing Number <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter routing number"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editBankFormData?.routingNumber || ""}
                  onChange={handleEditBankChange("routingNumber")}
                  error={!!editBankErrors.routingNumber}
                  helperText={editBankErrors.routingNumber}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Currency <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <Select
                    value={editBankFormData?.currency || "MYR"}
                    onChange={handleEditBankChange("currency")}
                    sx={{
                      fontSize: 14,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#D1D5DB",
                      },
                    }}
                  >
                    <MenuItem value="MYR">MYR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="SGD">SGD</MenuItem>
                    <MenuItem value="BDT">BDT</MenuItem>
                  </Select>
                </FormControl>
                {editBankErrors.currency && (
                  <Typography sx={{ fontSize: 12, color: "#d32f2f", mt: 0.5 }}>
                    {editBankErrors.currency}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Label <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <TextField
                  placeholder="Enter label"
                  size="small"
                  fullWidth
                  required
                  sx={fieldSx}
                  value={editBankFormData?.label || ""}
                  onChange={handleEditBankChange("label")}
                  error={!!editBankErrors.label}
                  helperText={editBankErrors.label}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Display Order
                </Typography>
                <TextField
                  type="number"
                  placeholder="Enter display order"
                  size="small"
                  fullWidth
                  sx={fieldSx}
                  value={editBankFormData?.displayOrder || 0}
                  onChange={handleEditBankChange("displayOrder")}
                  error={!!editBankErrors.displayOrder}
                  helperText={editBankErrors.displayOrder}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography sx={inputLabelSx}>
                  Status <span style={{ color: "#d32f2f" }}>*</span>
                </Typography>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <Select
                    value={editBankFormData?.isActive ? "true" : "false"}
                    onChange={handleEditBankChange("isActive")}
                    sx={{
                      fontSize: 14,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#D1D5DB",
                      },
                    }}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCloseEditBankModal}
                disabled={editBankLoading}
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
                disabled={editBankLoading}
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
                {editBankLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: "#fff" }} />
                    <Typography sx={{ fontSize: 14 }}>Updating...</Typography>
                  </Box>
                ) : (
                  "Update Bank"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AllBank;
