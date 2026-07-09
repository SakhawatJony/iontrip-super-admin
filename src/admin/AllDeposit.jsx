import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Menu, MenuItem, Typography, CircularProgress, Modal, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import Chip from "@mui/material/Chip";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

// Status mapping from API to display labels
const statusLabelMap = {
  "pending": "Pending",
  "approved": "Approved",
  "rejected": "Rejected",
  "completed": "Completed",
  "cancelled": "Cancelled",
};

const tableColumns = [
  { key: "depositId", label: "Deposit ID", width: "120px" },
  { key: "agentName", label: "Agent Name", width: "150px" },
  { key: "agentEmail", label: "Agent Email", width: "180px" },
  { key: "amount", label: "Amount", width: "120px" },
  { key: "currency", label: "Currency", width: "100px" },
  { key: "paymentMethod", label: "Payment Method", width: "140px" },
  { key: "transaction", label: "Transaction", width: "150px" },
  { key: "depositDate", label: "Deposit Date", width: "150px" },
  { key: "status", label: "Status", width: "110px" },
  { key: "remarks", label: "Remarks", width: "150px" },
  { key: "attachment", label: "Attachment", width: "120px" },
  { key: "action", label: "Action", width: "180px" },
];

const tableGridTemplate = fluidGridTemplateFromColumns(tableColumns);

const STATUS_OPTIONS = [
  { value: "", label: "All Deposits" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
 
];

function capitalizeStatus(statusText) {
  if (!statusText || statusText === "-") return statusText;
  return statusText
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatDepositDate(value) {
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

function formatDepositAmount(deposit) {
  const amount = deposit?.amount ?? deposit?.convertedAmount ?? "0.00";
  const currency = deposit?.currency || "BDT";
  return `${currency} ${amount}`;
}

function DepositDetailField({ label, value, highlight = false }) {
  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: "10px",
        bgcolor: highlight ? "rgba(2, 77, 175, 0.06)" : "#F8FAFC",
        border: "1px solid",
        borderColor: highlight ? "rgba(2, 77, 175, 0.18)" : "#EEF2F7",
        height: "100%",
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", mb: 0.4 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: highlight ? 15 : 14,
          fontWeight: highlight ? 800 : 700,
          color: highlight ? "#024DAF" : "#0F172A",
          whiteSpace: "pre-wrap",
          lineHeight: 1.35,
        }}
      >
        {value || "-"}
      </Typography>
    </Box>
  );
}

function DepositSectionHeading({ icon, title, subtitle }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          bgcolor: "rgba(2, 77, 175, 0.1)",
          color: "#024DAF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#0F2F56", lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ fontSize: 11.5, color: "#64748B", mt: 0.15 }}>{subtitle}</Typography>
        ) : null}
      </Box>
    </Box>
  );
}

const AllDeposit = ({ title = "Deposit History", buttonLabel = "All Deposit" }) => {
  const { token, user } = useAuth();
  
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusSummary, setStatusSummary] = useState([]);
  const [currency, setCurrency] = useState("BDT");
  const [depositIdFilter, setDepositIdFilter] = useState("");
  const [agentEmailFilter, setAgentEmailFilter] = useState("");
  const [transactionIdFilter, setTransactionIdFilter] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [actionDepositId, setActionDepositId] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const open = Boolean(anchorEl);

  const handleStatusClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setAnchorEl(null);
  };

  const handleStatusSelect = (statusValue) => {
    setStatus(statusValue);
    setPage(1); // Reset to first page when status changes
    handleStatusClose();
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === "depositId") {
      setDepositIdFilter(value);
    } else if (filterType === "agentEmail") {
      setAgentEmailFilter(value);
    } else if (filterType === "transactionId") {
      setTransactionIdFilter(value);
    }
    setPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setDepositIdFilter("");
    setAgentEmailFilter("");
    setTransactionIdFilter("");
    setPage(1);
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const handleOpenModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleOpenDetailsModal = (deposit) => {
    setSelectedDeposit(deposit);
    setDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedDeposit(null);
  };

  const fetchDeposits = useCallback(async () => {
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

      if (status) {
        params.append("status", status);
      }

      if (depositIdFilter && depositIdFilter.trim()) {
        params.append("depositId", depositIdFilter.trim());
      }

      if (agentEmailFilter && agentEmailFilter.trim()) {
        params.append("agentEmail", agentEmailFilter.trim());
      }

      if (transactionIdFilter && transactionIdFilter.trim()) {
        params.append("transactionId", transactionIdFilter.trim());
      }

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.DEPOSIT_LIST}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      // Handle both array response and object with data property
      const depositsData = Array.isArray(response?.data) 
        ? response.data 
        : (response?.data?.data || []);
      const paginationData = response?.data || {};
      const summaryData = response?.data?.statusSummary || [];
      
      const totalCount = paginationData.total || depositsData.length || 0;
      // Calculate totalPages if not provided by API
      const calculatedTotalPages = paginationData.totalPages 
        ? paginationData.totalPages 
        : Math.ceil(totalCount / limit) || 1;
      
      setDeposits(Array.isArray(depositsData) ? depositsData : []);
      setTotalPages(calculatedTotalPages);
      setTotal(totalCount);
      setStatusSummary(Array.isArray(summaryData) ? summaryData : []);
      
      // Extract currency from first deposit if available
      if (depositsData.length > 0 && depositsData[0]?.currency) {
        setCurrency(depositsData[0].currency);
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load deposits.";
      setError(apiMessage);
      setDeposits([]);
      setStatusSummary([]);
      console.error("Fetch deposits failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [status, page, limit, depositIdFilter, agentEmailFilter, transactionIdFilter, token]);

  // Initial fetch and when status/page/limit changes (immediate)
  useEffect(() => {
    if (token) {
      fetchDeposits();
    }
  }, [status, page, limit, fetchDeposits, token]);

  // Debounce text input filters
  useEffect(() => {
    if (!token) return;
    
    const timeoutId = setTimeout(() => {
      fetchDeposits();
    }, 500); // 500ms debounce for text inputs

    return () => clearTimeout(timeoutId);
  }, [depositIdFilter, agentEmailFilter, transactionIdFilter, fetchDeposits]);

  const selectedStatusLabel = STATUS_OPTIONS.find((opt) => opt.value === status)?.label || buttonLabel;

  // Format status summary for display
  const getStatusCards = () => {
    // Define the order of status cards
    const statusOrder = ["pending", "approved", "rejected", "completed", "cancelled"];
    
    // Create a map from status summary
    const summaryMap = new Map();
    statusSummary.forEach((item) => {
      summaryMap.set(item.status?.toLowerCase(), item);
    });
    
    // Build cards in the defined order
    return statusOrder.map((statusKey) => {
      const summaryItem = summaryMap.get(statusKey);
      const label = statusLabelMap[statusKey] || statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
      const amount = summaryItem?.totalAmount || 0;
      const formattedAmount = `${currency} ${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      
      return {
        label,
        amount: formattedAmount,
        count: summaryItem?.count || 0,
        status: statusKey,
      };
    });
  };

  // Map API deposit data to table row format
  const mapDepositToTableRow = (deposit) => {
    // Format deposit date from createdDate
    const depositDate = deposit?.createdDate
      ? new Date(deposit.createdDate).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";
    
    // Get amount and currency
    const amount = deposit?.amount || 0;
    const amountNum = parseFloat(amount) || 0;
    const currencyCode = deposit?.currency || "BDT";
    
    // Format amount with currency
    const formattedAmount = ` ${isNaN(amountNum) ? "0.00" : amountNum.toFixed(2)}`;
    
    // Get payment method details
    const paymentMethod = deposit?.paymentMethod || "-";
    
    // Transaction field - only show transectionId
    const transaction = deposit?.transectionId || "N/A";
    
    return {
      depositId: deposit?.depositId || "-",
      agentName: deposit?.agent?.name || "-",
      agentEmail: deposit?.agent?.email || "-",
      amount: formattedAmount,
      currency: currencyCode,
      paymentMethod: paymentMethod,
      transaction: transaction,
      depositDate: depositDate,
      status: deposit?.status || "-",
      remarks: deposit?.adminNote || deposit?.paymentReason || "-",
      attachment: deposit?.documentImage || null,
    };
  };

  const handleDepositIdClick = (depositId, fullDeposit = null) => {
    if (!depositId || depositId === "-") return;

    if (fullDeposit) {
      handleOpenDetailsModal(fullDeposit);
      return;
    }

    const match = deposits.find(
      (deposit) => String(deposit?.depositId || deposit?.id || "") === String(depositId),
    );

    if (match) {
      handleOpenDetailsModal(match);
    } else {
      toast.error("Deposit details not found.");
    }
  };

  const handleOpenActionDialog = (depositId, action) => {
    // Close the details modal first
    handleCloseDetailsModal();
    // Then open the action dialog
    setActionType(action);
    setActionDepositId(depositId);
    setAdminNote("");
    setActionDialogOpen(true);
  };

  const handleCloseActionDialog = () => {
    setActionDialogOpen(false);
    setActionType("");
    setActionDepositId(null);
    setAdminNote("");
  };

  const handleSubmitAction = async () => {
    if (!actionDepositId) return;

    const authToken = token || localStorage.getItem("adminToken") || "";
    
    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    setActionLoading((prev) => ({ ...prev, [actionDepositId]: true }));

    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.DEPOSIT_REVIEW}/${actionDepositId}`,
        {
          action: actionType,
          adminNote: adminNote.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(`Deposit ${actionType}d successfully!`);
        // Refresh the deposits list
        fetchDeposits();
        // Close dialogs
        handleCloseActionDialog();
        handleCloseDetailsModal();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        `Failed to ${actionType} deposit.`;
      toast.error(apiMessage);
      console.error(`${actionType} deposit failed:`, err?.response?.data || err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionDepositId]: false }));
    }
  };

  // Get status colors based on status value
  const getStatusColors = (statusValue) => {
    if (!statusValue || statusValue === "-") {
      return { bg: "#F3F4F6", color: "#6B7280" };
    }

    const statusLower = statusValue.toLowerCase().trim();
    
    // Map status values to colors
    if (statusLower === "approved" || statusLower === "completed") {
      return { bg: "#10B981", color: "#FFFFFF" };
    }
    if (statusLower === "pending") {
      return { bg: "#FDE68A", color: "#78350F" };
    }
    if (statusLower === "rejected" || statusLower === "cancelled") {
      return { bg: "#FEE2E2", color: "#991B1B" };
    }

    // Default color
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const renderCell = (columnKey, value, depositId = null, depositStatus = null, fullDeposit = null) => {
    if (columnKey === "depositId") {
      return (
        <Typography
          onClick={() => handleDepositIdClick(depositId || value, fullDeposit)}
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--primary-dark, #024DAF)",
            backgroundColor: "#EEF2F6",
            borderRadius: 0.8,
            px: 1,
            py: 0.35,
            width: "fit-content",
            whiteSpace: "nowrap",
            cursor: depositId && depositId !== "-" ? "pointer" : "default",
            textDecoration: depositId && depositId !== "-" ? "underline" : "none",
            "&:hover": {
              backgroundColor: depositId && depositId !== "-" ? "#D1D5DB" : "#EEF2F6",
            },
          }}
        >
          {value}
        </Typography>
      );
    }

    if (columnKey === "action") {
      return (
        <Button
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            if (fullDeposit) {
              handleOpenDetailsModal(fullDeposit);
            } else {
              console.error("Full deposit data not available");
            }
          }}
          sx={{
            textTransform: "none",
            fontSize: 10,
            fontWeight: 600,
            px: 1.5,
            py: 0.5,
            backgroundColor: "#0F2F56",
            "&:hover": { backgroundColor: "#0B2442" },
          }}
        >
          View Details
        </Button>
      );
    }

    if (columnKey === "status") {
      const statusColors = getStatusColors(value);
      // Capitalize status text
      const capitalizeStatus = (statusText) => {
        if (!statusText || statusText === "-") return statusText;
        return statusText
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");
      };
      const capitalizedStatus = capitalizeStatus(value);
      
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
            textTransform: "capitalize",
          }}
        >
          {capitalizedStatus}
        </Typography>
      );
    }

    // Special handling for attachment column
    if (columnKey === "attachment") {
      if (value && value !== "-" && value !== null) {
        return (
          <IconButton
            size="small"
            onClick={() => handleOpenModal(value)}
            aria-label="View attachment"
            sx={{
              width: 32,
              height: 32,
              border: "1px solid #E2E8F0",
              borderRadius: 1,
              color: "#024DAF",
              "&:hover": {
                bgcolor: "rgba(2, 77, 175, 0.08)",
                borderColor: "#024DAF",
              },
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        );
      }
      return (
        <Typography
          sx={{
            fontSize: 11,
            color: "#9CA3AF",
          }}
        >
          N/A
        </Typography>
      );
    }

    // Special handling for remarks column to allow text wrapping
    if (columnKey === "remarks") {
      return (
        <Typography
          sx={{
            fontSize: 11,
            color: "#111827",
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            maxWidth: "100%",
            lineHeight: 1.4,
          }}
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
      <AdminPageTitleBar
        title={title}
        action={
          <Button
            variant="outlined"
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            onClick={handleToggleFilters}
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
            {showFilters ? "Hide Filter" : "More Filter"}
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
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {getStatusCards().map((card) => (
              <Box
                key={card.label}
                sx={{
                  backgroundColor: "#D9ECFF",
                  border: "1px solid #9EC6F1",
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.8,
                  minWidth: 95,
                }}
              >
                <Typography fontSize={10.5} fontWeight={600} color="#0F2F56">
                  {card.label}
                </Typography>
                <Typography fontSize={10.5} color="#1F2A44" mt={0.2}>
                  {card.amount}
                </Typography>
              </Box>
            ))}
            <Button
              variant="contained"
              onClick={handleStatusClick}
              endIcon={
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                </Box>
              }
              sx={{
                textTransform: "none",
                fontSize: 12,
                fontWeight: 600,
                px: 2,
                height: 36,
                backgroundColor: "#0F2F56",
                "&:hover": { backgroundColor: "#0B2442" },
              }}
            >
              {selectedStatusLabel}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleStatusClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handleStatusSelect(option.value)}
                  selected={status === option.value}
                  sx={{
                    fontSize: 12,
                    fontWeight: status === option.value ? 600 : 400,
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

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
                  border: "1px solid var(--primary-dark, #024DAF)",
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Deposit ID"
                  value={depositIdFilter}
                  onChange={(e) => handleFilterChange("depositId", e.target.value)}
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
                  border: "1px solid var(--primary-dark, #024DAF)",
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Agent Email"
                  value={agentEmailFilter}
                  onChange={(e) => handleFilterChange("agentEmail", e.target.value)}
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
                  border: "1px solid var(--primary-dark, #024DAF)",
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Transaction ID"
                  value={transactionIdFilter}
                  onChange={(e) => handleFilterChange("transactionId", e.target.value)}
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
              {(depositIdFilter || agentEmailFilter || transactionIdFilter) && (
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
              {tableColumns?.map((column, columnIndex) => (
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
            ) : deposits.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No deposits found</Typography>
              </Box>
            ) : (
              deposits.map((deposit, index) => {
                const row = mapDepositToTableRow(deposit);
                return (
                  <Box
                    key={`${deposit.depositId || deposit.id || index}-${index}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: tableGridTemplate,
                      alignItems: "stretch",
                      width: "100%",
                    }}
                  >
                    {tableColumns.map((column) => {
                      const value = row[column.key] || "-";
                      const originalDepositId = deposit?.depositId || deposit?.id || null;
                      const depositStatus = deposit?.status || null;
                      return (
                        <Box
                          key={`${deposit.depositId || deposit.id || index}-${column.key}`}
                          sx={{
                            display: "flex",
                            alignItems: column.key === "remarks" ? "flex-start" : "center",
                            px: 2,
                            py: 1.4,
                            borderBottom: "1px solid #E5E7EB",
                            minWidth: 0,
                            overflow: column.key === "remarks" ? "visible" : "hidden",
                            ...(column.key === "remarks" && {
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }),
                          }}
                        >
                          {renderCell(column.key, value, originalDepositId, depositStatus, deposit)}
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
            {/* Previous button */}
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
            
            {/* Page numbers */}
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
            
            {/* Next button */}
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

      {/* Image Modal */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            bgcolor: "white",
            borderRadius: 2,
            p: 2,
            outline: "none",
          }}
        >
          <IconButton
            onClick={handleCloseModal}
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
          {selectedImage && (
            <Box
              component="img"
              src={selectedImage}
              alt="Document"
              sx={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage not found%3C/text%3E%3C/svg%3E";
              }}
            />
          )}
        </Box>
      </Modal>

      {/* Details Modal */}
      <Modal
        open={detailsModalOpen}
        onClose={handleCloseDetailsModal}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          backdropFilter: "blur(2px)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 760,
            maxHeight: "90vh",
            bgcolor: "#fff",
            borderRadius: "16px",
            outline: "none",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(15, 47, 86, 0.22)",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedDeposit ? (
            <>
              <Box
                sx={{
                  px: 2.5,
                  py: 2.25,
                  background: "linear-gradient(135deg, #024DAF 0%, #0F2F56 100%)",
                  color: "#fff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -36,
                    right: 48,
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.07)",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    mb: 1.5,
                    position: "relative",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "12px",
                        bgcolor: "rgba(255,255,255,0.16)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 22, color: "#fff" }} />
                    </Box>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2 }}>
                      Deposit Details
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleCloseDetailsModal}
                    aria-label="Close"
                    sx={{
                      color: "#fff",
                      bgcolor: "rgba(255,255,255,0.14)",
                      flexShrink: 0,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3, position: "relative" }}>
                  {selectedDeposit.depositId || "-"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                    mt: 1.25,
                    position: "relative",
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>
                    {formatDepositAmount(selectedDeposit)}
                  </Typography>
                  {selectedDeposit.status ? (
                    <Chip
                      label={capitalizeStatus(selectedDeposit.status)}
                      size="small"
                      sx={{
                        height: 26,
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: getStatusColors(selectedDeposit.status).bg,
                        color: getStatusColors(selectedDeposit.status).color,
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  ) : null}
                </Box>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  overflowY: "auto",
                  bgcolor: "#FAFBFC",
                  "&::-webkit-scrollbar": { width: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(2, 77, 175, 0.28)",
                    borderRadius: 999,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.25,
                    mb: 2.5,
                  }}
                >
                  <DepositDetailField label="Deposit ID" value={selectedDeposit.depositId} />
                  <DepositDetailField
                    label="Status"
                    value={capitalizeStatus(selectedDeposit.status)}
                  />
                  <DepositDetailField
                    label="Amount"
                    value={formatDepositAmount(selectedDeposit)}
                    highlight
                  />
                  <DepositDetailField label="Currency" value={selectedDeposit.currency} />
                  <DepositDetailField label="Payment Method" value={selectedDeposit.paymentMethod} />
                  <DepositDetailField label="Deposit Type" value={selectedDeposit.depositType} />
                  <DepositDetailField label="Transaction ID" value={selectedDeposit.transectionId || "N/A"} />
                  <DepositDetailField
                    label="Deposit Date"
                    value={formatDepositDate(selectedDeposit.createdDate)}
                  />
                  {selectedDeposit.convertedAmount ? (
                    <DepositDetailField label="Converted Amount" value={selectedDeposit.convertedAmount} />
                  ) : null}
                  {selectedDeposit.conversionRate ? (
                    <DepositDetailField label="Conversion Rate" value={selectedDeposit.conversionRate} />
                  ) : null}
                  {selectedDeposit.updatedAmount ? (
                    <DepositDetailField label="Updated Amount" value={selectedDeposit.updatedAmount} />
                  ) : null}
                  {selectedDeposit.previousAmount ? (
                    <DepositDetailField label="Previous Amount" value={selectedDeposit.previousAmount} />
                  ) : null}
                </Box>

                {selectedDeposit.agent ? (
                  <Box sx={{ mb: 2.5 }}>
                    <DepositSectionHeading
                      icon={<PersonOutlineIcon sx={{ fontSize: 18 }} />}
                      title="Agent Information"
                      subtitle={selectedDeposit.agent.name || selectedDeposit.agent.email || "Agent details"}
                    />
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        bgcolor: "#FFFFFF",
                        boxShadow: "0 2px 8px rgba(15, 47, 86, 0.04)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 1,
                        }}
                      >
                        <DepositDetailField label="Agent Name" value={selectedDeposit.agent.name} />
                        <DepositDetailField label="Agent Email" value={selectedDeposit.agent.email} />
                        <DepositDetailField label="Agent ID" value={selectedDeposit.agent.agentId} />
                        <DepositDetailField label="Company Name" value={selectedDeposit.agent.companyName} />
                        {selectedDeposit.agent.mobile ? (
                          <DepositDetailField label="Mobile" value={selectedDeposit.agent.mobile} />
                        ) : null}
                        {selectedDeposit.agent.companyAddress ? (
                          <DepositDetailField label="Company Address" value={selectedDeposit.agent.companyAddress} />
                        ) : null}
                        {selectedDeposit.agent.businessType ? (
                          <DepositDetailField label="Business Type" value={selectedDeposit.agent.businessType} />
                        ) : null}
                      </Box>
                    </Box>
                  </Box>
                ) : null}

                <Box sx={{ mb: 2.5 }}>
                  <DepositSectionHeading
                    icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
                    title="Additional Information"
                    subtitle="Payment notes, documents, and transfer details"
                  />
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(15, 47, 86, 0.04)",
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {selectedDeposit.paymentReason ? (
                        <DepositDetailField label="Payment Reason" value={selectedDeposit.paymentReason} />
                      ) : null}
                      {selectedDeposit.adminNote ? (
                        <DepositDetailField label="Admin Note" value={selectedDeposit.adminNote} />
                      ) : null}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 1,
                        }}
                      >
                        {selectedDeposit.chequeNumber ? (
                          <DepositDetailField label="Cheque Number" value={selectedDeposit.chequeNumber} />
                        ) : null}
                        {selectedDeposit.chequeBankName ? (
                          <DepositDetailField label="Bank Name" value={selectedDeposit.chequeBankName} />
                        ) : null}
                        {selectedDeposit.chequeIssueDate ? (
                          <DepositDetailField label="Cheque Issue Date" value={selectedDeposit.chequeIssueDate} />
                        ) : null}
                        {selectedDeposit.depositedAccount ? (
                          <DepositDetailField label="Deposited Account" value={selectedDeposit.depositedAccount} />
                        ) : null}
                        {selectedDeposit.depositedFrom ? (
                          <DepositDetailField label="Deposited From" value={selectedDeposit.depositedFrom} />
                        ) : null}
                        {selectedDeposit.transferDate ? (
                          <DepositDetailField label="Transfer Date" value={selectedDeposit.transferDate} />
                        ) : null}
                        {selectedDeposit.updatedDate ? (
                          <DepositDetailField
                            label="Last Updated"
                            value={formatDepositDate(selectedDeposit.updatedDate)}
                          />
                        ) : null}
                      </Box>
                      {selectedDeposit.documentImage ? (
                        <Box sx={{ mt: 0.5 }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", mb: 0.75 }}>
                            Document Image
                          </Typography>
                          <Box
                            component="img"
                            src={selectedDeposit.documentImage}
                            alt="Document"
                            onClick={() => handleOpenModal(selectedDeposit.documentImage)}
                            sx={{
                              width: "100%",
                              maxHeight: 280,
                              objectFit: "contain",
                              cursor: "pointer",
                              borderRadius: "12px",
                              border: "1px solid #E2E8F0",
                              bgcolor: "#F8FAFC",
                              "&:hover": { opacity: 0.9 },
                            }}
                            onError={(e) => {
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage not found%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <DepositSectionHeading
                    icon={<BoltOutlinedIcon sx={{ fontSize: 18 }} />}
                    title="Actions"
                    subtitle={
                      selectedDeposit.status?.toLowerCase() === "pending"
                        ? "Approve or reject this deposit"
                        : "No pending actions"
                    }
                  />
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0",
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(15, 47, 86, 0.04)",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
                      {selectedDeposit.status?.toLowerCase() === "pending" ? (
                        <>
                          <Button
                            variant="contained"
                            onClick={() => handleOpenActionDialog(selectedDeposit.depositId, "approve")}
                            disabled={actionLoading[selectedDeposit.depositId]}
                            sx={{
                              textTransform: "none",
                              fontSize: 13,
                              fontWeight: 700,
                              px: 2.5,
                              py: 0.85,
                              borderRadius: "10px",
                              backgroundColor: "#10B981",
                              boxShadow: "none",
                              "&:hover": { backgroundColor: "#059669" },
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handleOpenActionDialog(selectedDeposit.depositId, "reject")}
                            disabled={actionLoading[selectedDeposit.depositId]}
                            sx={{
                              textTransform: "none",
                              fontSize: 13,
                              fontWeight: 700,
                              px: 2.5,
                              py: 0.85,
                              borderRadius: "10px",
                              backgroundColor: "#DC2626",
                              boxShadow: "none",
                              "&:hover": { backgroundColor: "#B91C1C" },
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Typography sx={{ fontSize: 13, color: "#64748B", fontStyle: "italic" }}>
                          No actions available for this status
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          ) : null}
        </Box>
      </Modal>

      {/* Action Dialog for Admin Note */}
      <Dialog
        open={actionDialogOpen}
        onClose={handleCloseActionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {actionType === "approve" ? "Approve Deposit" : "Reject Deposit"}
            </Typography>
            <IconButton onClick={handleCloseActionDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
              Please provide a reason for {actionType === "approve" ? "approving" : "rejecting"} this deposit:
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Enter reason (optional)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: 14,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseActionDialog}
            sx={{
              textTransform: "none",
              color: "#6B7280",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitAction}
            disabled={actionLoading[actionDepositId]}
            sx={{
              textTransform: "none",
              backgroundColor: actionType === "approve" ? "#10B981" : "#DC2626",
              "&:hover": {
                backgroundColor: actionType === "approve" ? "#059669" : "#B91C1C",
              },
              "&:disabled": {
                backgroundColor: "#9CA3AF",
              },
            }}
          >
            {actionLoading[actionDepositId] ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AllDeposit;
