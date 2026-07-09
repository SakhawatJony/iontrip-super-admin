import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { fluidGridTemplateFromColumns } from "./tableGridUtils.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const LedgerReport = ({ title = "Transaction History" }) => {
  const { token } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableColumns, setTableColumns] = useState([]);
  const [tableGridTemplate, setTableGridTemplate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState("");
  const [currency, setCurrency] = useState("");
  const [agentEmail, setAgentEmail] = useState("");

  const fetchTransactions = useCallback(async () => {
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

      if (type && type.trim()) {
        params.append("type", type.trim());
      }

      if (currency && currency.trim()) {
        params.append("currency", currency.trim());
      }

      if (agentEmail && agentEmail.trim()) {
        params.append("agentEmail", agentEmail.trim());
      }

      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.TRANSACTION_LIST}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        // Handle response structure: { data: [], total, page, limit, totalPages }
        const transactionData = Array.isArray(response.data) 
          ? response.data 
          : response.data.data || [];
        setTransactions(Array.isArray(transactionData) ? transactionData : []);

        // Handle pagination
        const paginationData = response.data;
        if (paginationData.total !== undefined) {
          setTotal(paginationData.total);
        }
        if (paginationData.totalPages !== undefined) {
          setTotalPages(paginationData.totalPages);
        } else if (paginationData.total !== undefined) {
          setTotalPages(Math.ceil(paginationData.total / limit));
        }

        const columns = [
          { key: "tranId", label: "Transaction ID", width: "150px" },
          { key: "agentName", label: "Agent Name", width: "150px" },
          { key: "agentEmail", label: "Agent Email", width: "180px" },
          { key: "type", label: "Type", width: "150px" },
          { key: "currency", label: "Currency", width: "100px" },
          { key: "amount", label: "Amount", width: "120px" },
          { key: "referenceId", label: "Reference ID", width: "150px" },
          { key: "description", label: "Description", width: "200px" },
          { key: "previousAmount", label: "Previous Amount", width: "140px" },
          { key: "updatedAmount", label: "Updated Amount", width: "140px" },
          { key: "createdAt", label: "Created At", width: "150px" },
        ];
        setTableColumns(columns);
        setTableGridTemplate(fluidGridTemplateFromColumns(columns));
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to fetch transactions.";
      setError(apiMessage);
      toast.error(apiMessage);
      console.error("Fetch transactions failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, type, currency, agentEmail]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    const typeQuery = type.trim().toLowerCase();
    const currencyQuery = currency.trim().toLowerCase();
    const emailQuery = agentEmail.trim().toLowerCase();

    return transactions.filter((transaction) => {
      if (typeQuery) {
        const value = String(transaction?.type || "").toLowerCase();
        if (!value.includes(typeQuery)) return false;
      }
      if (currencyQuery) {
        const value = String(transaction?.currency || "").toLowerCase();
        if (!value.includes(currencyQuery)) return false;
      }
      if (emailQuery) {
        const value = String(
          transaction?.agent?.email || transaction?.agentEmail || "",
        ).toLowerCase();
        if (!value.includes(emailQuery)) return false;
      }
      return true;
    });
  }, [transactions, type, currency, agentEmail]);

  const handleFilterChange = (filterType, value) => {
    if (filterType === "type") {
      setType(value);
    } else if (filterType === "currency") {
      setCurrency(value);
    } else if (filterType === "agentEmail") {
      setAgentEmail(value);
    }
    setPage((prev) => (prev === 1 ? prev : 1));
  };

  const handleClearFilters = () => {
    setType("");
    setCurrency("");
    setAgentEmail("");
    setPage((prev) => (prev === 1 ? prev : 1));
  };

  const mapTransactionToTableRow = (transaction) => {
    const createdAt = transaction?.createdAt
      ? new Date(transaction.createdAt).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    return {
      tranId: transaction?.tranId || "-",
      agentName: transaction?.agent?.name || "-",
      agentEmail: transaction?.agent?.email || "-",
      type: transaction?.type || "-",
      currency: transaction?.currency || "-",
      amount: transaction?.amount || 0,
      referenceId: transaction?.referenceId || "-",
      description: transaction?.description || "-",
      previousAmount: transaction?.previousAmount || "0",
      updatedAmount: transaction?.updatedAmount || "0",
      createdAt: createdAt,
    };
  };

  const renderCell = (columnKey, value) => {
    if (value === null || value === undefined) {
      return (
        <Typography sx={{ fontSize: 11, color: "#6B7280" }}>-</Typography>
      );
    }

    // Format date values
    if (columnKey === "createdAt") {
      return (
        <Typography sx={{ fontSize: 11, color: "#111827" }}>
          {String(value)}
        </Typography>
      );
    }

    // Format currency/amount values
    if (columnKey === "amount" || columnKey === "previousAmount" || columnKey === "updatedAmount") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(numValue)) {
        return (
          <Typography sx={{ fontSize: 11, color: "#111827", fontWeight: 600 }}>
            {numValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        );
      }
    }

    // Format type with styling
    if (columnKey === "type") {
      return (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "#0F2F56",
            backgroundColor: "#EAF2FF",
            borderRadius: 0.8,
            px: 1.2,
            py: 0.4,
            width: "fit-content",
            whiteSpace: "nowrap",
          }}
        >
          {String(value).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
        </Typography>
      );
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
      <AdminPageTitleBar title={title} />

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
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Transaction Type"
                  value={type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  sx={{
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 11.5,
                    color: "#1F2A44",
                    width: "100%",
                    "&::placeholder": { color: "#64748B", opacity: 1 },
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
                  placeholder="Currency (e.g. MYR)"
                  value={currency}
                  onChange={(e) => handleFilterChange("currency", e.target.value)}
                  sx={{
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 11.5,
                    color: "#1F2A44",
                    width: "100%",
                    "&::placeholder": { color: "#64748B", opacity: 1 },
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
                  placeholder="Agent Email"
                  value={agentEmail}
                  onChange={(e) => handleFilterChange("agentEmail", e.target.value)}
                  sx={{
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    fontSize: 11.5,
                    color: "#1F2A44",
                    width: "100%",
                    "&::placeholder": { color: "#64748B", opacity: 1 },
                  }}
                />
              </Box>
              {(type || currency || agentEmail) && (
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

        <Box
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 1.5,
            backgroundColor: "#FFFFFF",
            overflowX: "hidden",
            width: "100%",
          }}
        >
          {tableColumns.length > 0 && (
            <Box sx={{ width: "100%", minWidth: 0 }}>
              {/* Table Header */}
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

              {/* Table Body */}
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                  <CircularProgress size={24} sx={{ color: "#0F2F56" }} />
                </Box>
              ) : error ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                  <Typography sx={{ fontSize: 12, color: "#d32f2f" }}>{error}</Typography>
                </Box>
              ) : filteredTransactions.length === 0 ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                  <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No transactions found</Typography>
                </Box>
              ) : (
                filteredTransactions.map((transaction, index) => {
                  const row = mapTransactionToTableRow(transaction);
                  return (
                    <Box
                      key={transaction?.id || index}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: tableGridTemplate,
                        alignItems: "stretch",
                        width: "100%",
                      }}
                    >
                      {tableColumns.map((column) => {
                        const value = row[column.key];
                        return (
                          <Box
                            key={`${transaction?.id || index}-${column.key}`}
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
                  );
                })
              )}
            </Box>
          )}

          {!loading && !error && filteredTransactions.length === 0 && tableColumns.length === 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No transactions found</Typography>
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
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
        )}
      </Box>
    </Box>
  );
};

export default LedgerReport;
