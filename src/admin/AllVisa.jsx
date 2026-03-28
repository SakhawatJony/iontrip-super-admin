import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate } from "react-router-dom";

export default function AllVisa() {
  const navigate = useNavigate();

  const STORAGE_KEY = "visa_items";

  const tableColumns = useMemo(
    () => [
      { key: "visaType", label: "Visa Type", width: "170px" },
      { key: "duration", label: "Duration", width: "170px" },
      { key: "maxStay", label: "Maximum Stay", width: "190px" },
      { key: "cost", label: "Cost", width: "140px" },
      { key: "createdAt", label: "Added Date", width: "180px" },
      { key: "actions", label: "Action", width: "120px" },
    ],
    [],
  );

  const tableGridTemplate = tableColumns.map((col) => col.width).join(" ");

  const [loading, setLoading] = useState(true);
  const [visas, setVisas] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(visas.length / limit) || 1), [visas.length, limit]);

  const pagedVisas = useMemo(() => {
    const start = (page - 1) * limit;
    return visas.slice(start, start + limit);
  }, [visas, page, limit]);

  const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setVisas(Array.isArray(items) ? items : []);
    } catch {
      setVisas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVisa = (id) => {
    const next = visas.filter((v) => v.id !== id);
    setVisas(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <Box>
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
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#FFFFFF" }}>
          Visa History
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/dashboard/visa/addvisa")}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            bgcolor: "#FFFFFF",
            color: "var(--primary-dark, #0F2F56)",
            "&:hover": { bgcolor: "#EAEFF5" },
          }}
          startIcon={<AddCircleOutlineIcon />}
        >
          Add Visa
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
        <Box sx={{ minWidth: 950 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: tableGridTemplate,
              alignItems: "stretch",
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
                }}
              >
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#FFFFFF" }}>
                  {column.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <CircularProgress size={24} sx={{ color: "var(--primary-dark, #0F2F56)" }} />
            </Box>
          ) : visas.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>No visa found</Typography>
            </Box>
          ) : (
            pagedVisas.map((visa, index) => (
              <Box
                key={`${visa.id}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: tableGridTemplate,
                  alignItems: "stretch",
                }}
              >
                {tableColumns.map((column) => {
                  const value = visa?.[column.key];
                  return (
                    <Box
                      key={`${visa.id}-${column.key}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                        py: 1.4,
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      {column.key === "createdAt" ? (
                        <Typography sx={{ fontSize: 12, color: "#111827" }}>{formatDate(visa.createdAt)}</Typography>
                      ) : column.key === "actions" ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => deleteVisa(visa.id)}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                          startIcon={<RemoveIcon />}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Typography sx={{ fontSize: 12, color: "#111827" }}>{value || "-"}</Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))
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
            const pageNum = totalPages <= 5 ? i + 1 : i + 1;
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

