import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, Typography, CircularProgress, Modal, IconButton } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";

const headerTitleSx = {
  fontSize: 22,
  fontWeight: 700,
  color: "#0F172A",
};

const tableColumns = [
  { key: "agentId", label: "Agent ID", width: "120px" },
  { key: "name", label: "Agent Name", width: "150px" },
  { key: "email", label: "Email", width: "180px" },
  { key: "companyName", label: "Company", width: "150px" },
  { key: "mobile", label: "Mobile", width: "130px" },
  { key: "businessType", label: "Business Type", width: "140px" },
  { key: "address", label: "Address", width: "200px" },
  { key: "isActive", label: "Status", width: "100px" },
  { key: "isVerified", label: "Verified", width: "100px" },
  { key: "action", label: "Action", width: "120px" },
];

const tableGridTemplate = tableColumns.map((col) => col.width).join(" ");

const AllAgent = ({ title = "All Agent" }) => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [agentIdFilter, setAgentIdFilter] = useState("");
  const [agentEmailFilter, setAgentEmailFilter] = useState("");
  const [agentNameFilter, setAgentNameFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const handleFilterChange = (filterType, value) => {
    if (filterType === "agentId") {
      setAgentIdFilter(value);
    } else if (filterType === "agentEmail") {
      setAgentEmailFilter(value);
    } else if (filterType === "agentName") {
      setAgentNameFilter(value);
    }
    setPage(1);
  };

  const handleClearFilters = () => {
    setAgentIdFilter("");
    setAgentEmailFilter("");
    setAgentNameFilter("");
    setPage(1);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleOpenDetailsModal = (agent) => {
    setSelectedAgent(agent);
    setModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setModalOpen(false);
    setSelectedAgent(null);
  };

  const handleUpdateAgentStatus = async (isActive) => {
    if (!selectedAgent) return;

    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    setStatusUpdateLoading(true);

    try {
      const response = await axios.patch(
        `${API_BASE_URL}${API_ENDPOINTS.UPDATE_AGENT_STATUS}/${selectedAgent.agentId || selectedAgent.id}`,
        {
          isActive: isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(`Agent status updated to ${isActive ? "Active" : "Deactive"} successfully!`);
        // Update the selected agent in state
        setSelectedAgent({ ...selectedAgent, isActive: isActive });
        // Refresh the agents list
        fetchAgents();
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update agent status.";
      toast.error(apiMessage);
      console.error("Update agent status failed:", err?.response?.data || err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const fetchAgents = useCallback(async () => {
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

      if (agentIdFilter && agentIdFilter.trim()) {
        params.append("agentId", agentIdFilter.trim());
      }

      if (agentEmailFilter && agentEmailFilter.trim()) {
        params.append("email", agentEmailFilter.trim());
      }

      if (agentNameFilter && agentNameFilter.trim()) {
        params.append("name", agentNameFilter.trim());
      }

      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.ALL_AGENTS}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const agentsData = Array.isArray(response?.data) 
        ? response.data 
        : (response?.data?.data || []);
      const paginationData = response?.data || {};
      
      const totalCount = paginationData.total || agentsData.length || 0;
      const calculatedTotalPages = paginationData.totalPages 
        ? paginationData.totalPages 
        : Math.ceil(totalCount / limit) || 1;
      
      setAgents(Array.isArray(agentsData) ? agentsData : []);
      setTotalPages(calculatedTotalPages);
      setTotal(totalCount);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load agents.";
      setError(apiMessage);
      setAgents([]);
      console.error("Fetch agents failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, agentIdFilter, agentEmailFilter, agentNameFilter, token]);

  useEffect(() => {
    if (token) {
      fetchAgents();
    }
  }, [page, limit, fetchAgents, token]);

  useEffect(() => {
    if (!token) return;
    
    const timeoutId = setTimeout(() => {
      fetchAgents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [agentIdFilter, agentEmailFilter, agentNameFilter, fetchAgents]);

  const mapAgentToTableRow = (agent) => {
    return {
      agentId: agent?.agentId || "-",
      name: agent?.name || "-",
      email: agent?.email || "-",
      companyName: agent?.companyName || "-",
      mobile: agent?.mobile || "-",
      businessType: agent?.businessType || "-",
      address: agent?.companyAddress || "-",
      isActive: agent?.isActive ? "Active" : "Inactive",
      isVerified: agent?.isVerified ? "Verified" : "Not Verified",
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

  const getVerifiedColors = (verifiedValue) => {
    if (verifiedValue === "Verified") {
      return { bg: "#10B981", color: "#FFFFFF" };
    }
    if (verifiedValue === "Not Verified") {
      return { bg: "#F59E0B", color: "#FFFFFF" };
    }
    return { bg: "#F3F4F6", color: "#6B7280" };
  };

  const renderCell = (columnKey, value, fullAgent = null) => {
    if (columnKey === "agentId") {
      return (
        <Typography
          onClick={() => fullAgent && handleOpenDetailsModal(fullAgent)}
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "#111827",
            backgroundColor: "#EEF2F6",
            borderRadius: 0.8,
            px: 1,
            py: 0.35,
            width: "fit-content",
            whiteSpace: "nowrap",
            cursor: fullAgent ? "pointer" : "default",
            "&:hover": {
              backgroundColor: fullAgent ? "#D1D5DB" : "#EEF2F6",
            },
          }}
        >
          {value}
        </Typography>
      );
    }

    if (columnKey === "isActive") {
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

    if (columnKey === "isVerified") {
      const verifiedColors = getVerifiedColors(value);
      return (
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: verifiedColors.color,
            backgroundColor: verifiedColors.bg,
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

    if (columnKey === "address") {
      return (
        <Typography
          sx={{
            fontSize: 11,
            color: "#111827",
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            maxWidth: "200px",
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
            if (fullAgent) {
              handleOpenDetailsModal(fullAgent);
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
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Agent ID"
                  value={agentIdFilter}
                  onChange={(e) => handleFilterChange("agentId", e.target.value)}
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
                  borderRadius: 1,
                  px: 1.2,
                  height: 32,
                  minWidth: 170,
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 16, color: "#1F4D8B" }} />
                <Box
                  component="input"
                  placeholder="Enter Agent Name"
                  value={agentNameFilter}
                  onChange={(e) => handleFilterChange("agentName", e.target.value)}
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
              {(agentIdFilter || agentEmailFilter || agentNameFilter) && (
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
              backgroundColor: "#0F2F56",
              "&:hover": { backgroundColor: "#0B2442" },
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
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          <Box sx={{ minWidth: 1200 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: tableGridTemplate,
                alignItems: "stretch",
                backgroundColor: "#F8FAFC",
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
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "var(--primary-color, #123D6E)" }}>
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
            ) : agents.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No agents found</Typography>
              </Box>
            ) : (
              agents.map((agent, index) => {
                const row = mapAgentToTableRow(agent);
                return (
                  <Box
                    key={`${agent.agentId || agent.id || index}-${index}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: tableGridTemplate,
                      alignItems: "stretch",
                    }}
                  >
                    {tableColumns.map((column) => {
                      const value = row[column.key] || "-";
                      return (
                        <Box
                          key={`${agent.agentId || agent.id || index}-${column.key}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            px: 2,
                            py: 1.4,
                            borderBottom: "1px solid #E5E7EB",
                          }}
                        >
                          {renderCell(column.key, value, agent)}
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

          {selectedAgent && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#0F172A" }}>
                Agent Details
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Agent ID</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.agentId || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Agent Name</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.name || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Email</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.email || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Mobile</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.mobile || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Company Name</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.companyName || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Business Type</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.businessType || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Company Address</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.companyAddress || "-"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Status</Typography>
                    {(() => {
                      const statusColors = getStatusColors(selectedAgent.isActive ? "Active" : "Inactive");
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
                          {selectedAgent.isActive ? "Active" : "Inactive"}
                        </Typography>
                      );
                    })()}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Verified</Typography>
                    {(() => {
                      const verifiedColors = getVerifiedColors(selectedAgent.isVerified ? "Verified" : "Not Verified");
                      return (
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: verifiedColors.color,
                            backgroundColor: verifiedColors.bg,
                            borderRadius: 0.8,
                            px: 1.5,
                            py: 0.5,
                            width: "fit-content",
                          }}
                        >
                          {selectedAgent.isVerified ? "Verified" : "Not Verified"}
                        </Typography>
                      );
                    })()}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Email Verified</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.emailVerified ? "Yes" : "No"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Markup</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                      {selectedAgent.markup || "-"}%
                    </Typography>
                  </Box>
                  {selectedAgent.createdAt && (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Created At</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {new Date(selectedAgent.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                  )}
                  {selectedAgent.updatedAt && (
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.5 }}>Updated At</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                        {new Date(selectedAgent.updatedAt).toLocaleString("en-US", {
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

              {/* Action Buttons */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 3,
                  pt: 3,
                  borderTop: "1px solid #E5E7EB",
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => handleUpdateAgentStatus(true)}
                  disabled={statusUpdateLoading || selectedAgent?.isActive === true}
                  sx={{
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    backgroundColor: "#10B981",
                    "&:hover": { backgroundColor: "#059669" },
                    "&:disabled": {
                      backgroundColor: "#D1D5DB",
                      color: "#9CA3AF",
                    },
                  }}
                >
                  {statusUpdateLoading ? "Updating..." : "Active"}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleUpdateAgentStatus(false)}
                  disabled={statusUpdateLoading || selectedAgent?.isActive === false}
                  sx={{
                    textTransform: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    backgroundColor: "#EF4444",
                    "&:hover": { backgroundColor: "#DC2626" },
                    "&:disabled": {
                      backgroundColor: "#D1D5DB",
                      color: "#9CA3AF",
                    },
                  }}
                >
                  {statusUpdateLoading ? "Updating..." : "Deactive"}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AllAgent;
