import React from "react";
import { Box, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getVisiblePages(page, totalPages, maxVisible = 5) {
  const count = Math.min(totalPages, maxVisible);
  return Array.from({ length: count }, (_, i) => {
    if (totalPages <= maxVisible) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - maxVisible + 1 + i;
    return page - 2 + i;
  });
}

export default function AdminPagination({
  page,
  totalPages,
  limit,
  total,
  itemCount,
  onPageChange,
  onLimitChange,
  itemLabel = "records",
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showRowsSelector = true,
}) {
  const safeTotal = Number(total) || 0;
  const showingFrom = safeTotal === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = safeTotal === 0 ? 0 : Math.min(page * limit, safeTotal);
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
        pt: 1.25,
        pb: 0.5,
        px: 0.5,
        borderTop: "1px solid #E8EEF5",
        mt: 0.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>
          {safeTotal === 0
            ? `Showing 0 ${itemLabel}`
            : itemCount != null
              ? `Showing ${itemCount} of ${safeTotal} ${itemLabel}`
              : `Showing ${showingFrom}-${showingTo} of ${safeTotal} ${itemLabel}`}
        </Typography>

        {showRowsSelector && onLimitChange ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#94A3B8" }}>Rows:</Typography>
            {pageSizeOptions.map((size) => {
              const isActive = limit === size;
              return (
                <Box
                  key={size}
                  onClick={() => onLimitChange(size)}
                  sx={{
                    minWidth: 32,
                    px: 1,
                    py: 0.45,
                    borderRadius: 1,
                    fontSize: 11,
                    fontWeight: 700,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    color: isActive ? "#FFFFFF" : "#1F2A44",
                    bgcolor: isActive ? "#0F2F56" : "#EAF2FF",
                    border: `1px solid ${isActive ? "#0F2F56" : "#BFDBFE"}`,
                    boxShadow: isActive ? "0 2px 8px rgba(15, 47, 86, 0.25)" : "none",
                    "&:hover": {
                      bgcolor: isActive ? "#0B2442" : "#DBEAFE",
                    },
                  }}
                >
                  {size}
                </Box>
              );
            })}
          </Box>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box
          onClick={() => page > 1 && onPageChange(page - 1)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: page > 1 ? "pointer" : "not-allowed",
            color: page > 1 ? "#FFFFFF" : "#94A3B8",
            bgcolor: page > 1 ? "var(--primary-dark, #024DAF)" : "#E5E7EB",
            transition: "all 0.15s ease",
            "&:hover": page > 1 ? { bgcolor: "#0B2442" } : {},
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </Box>

        {visiblePages.map((pageNum) => {
          const isActive = page === pageNum;
          return (
            <Box
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                color: isActive ? "#FFFFFF" : "#1F2A44",
                bgcolor: isActive ? "#0F2F56" : "#EAF2FF",
                border: `1px solid ${isActive ? "#0F2F56" : "#BFDBFE"}`,
                boxShadow: isActive ? "0 2px 8px rgba(15, 47, 86, 0.2)" : "none",
                "&:hover": {
                  bgcolor: isActive ? "#0B2442" : "#DBEAFE",
                },
              }}
            >
              {pageNum}
            </Box>
          );
        })}

        <Box
          onClick={() => page < totalPages && onPageChange(page + 1)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: page < totalPages ? "pointer" : "not-allowed",
            color: page < totalPages ? "#FFFFFF" : "#94A3B8",
            bgcolor: page < totalPages ? "var(--primary-dark, #024DAF)" : "#E5E7EB",
            transition: "all 0.15s ease",
            "&:hover": page < totalPages ? { bgcolor: "#0B2442" } : {},
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>
    </Box>
  );
}
