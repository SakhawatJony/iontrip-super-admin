import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

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
  success: "#22C55E",
  warning: "#F59E0B",
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

function taxLabel(item) {
  if (!item) return "";
  return typeof item === "string" ? item : item.name || item.title || "";
}

function StatusChip({ status }) {
  const s = (status || "draft").toLowerCase();
  const isPublished = s === "published";
  return (
    <Chip
      label={isPublished ? "Published" : "Draft"}
      size="small"
      sx={{
        height: 24,
        fontSize: 11,
        fontWeight: 700,
        bgcolor: isPublished ? "rgba(34, 197, 94, 0.12)" : "rgba(245, 158, 11, 0.12)",
        color: isPublished ? "#15803D" : "#B45309",
        border: `1px solid ${isPublished ? "rgba(34, 197, 94, 0.35)" : "rgba(245, 158, 11, 0.35)"}`,
      }}
    />
  );
}

function MiniChips({ items, max = 2 }) {
  if (!items?.length) {
    return (
      <Typography sx={{ fontSize: 12, color: C.muted }}>—</Typography>
    );
  }
  const labels = items.map(taxLabel).filter(Boolean);
  const shown = labels.slice(0, max);
  const extra = labels.length - shown.length;
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {shown.map((label, i) => (
        <Chip
          key={`${label}-${i}`}
          label={label}
          size="small"
          sx={{
            height: 22,
            fontSize: 10,
            fontWeight: 600,
            bgcolor: C.secondarySoft,
            color: C.secondary,
            maxWidth: 100,
            "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
          }}
        />
      ))}
      {extra > 0 ? (
        <Chip label={`+${extra}`} size="small" sx={{ height: 22, fontSize: 10, bgcolor: "#F1F5F9", color: C.muted }} />
      ) : null}
    </Stack>
  );
}

function BlogViewModal({ open, blog, onClose }) {
  if (!blog) return null;

  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          bgcolor: "#fff",
          borderRadius: 2,
          outline: "none",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(15, 47, 86, 0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.75,
            bgcolor: C.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Blog details</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: "#fff", bgcolor: "rgba(255,255,255,0.15)" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 2.5, overflowY: "auto" }}>
          {blog.imageUrl ? (
            <Box
              component="img"
              src={blog.imageUrl}
              alt=""
              sx={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 1.5, mb: 2 }}
            />
          ) : null}

          <Typography sx={{ fontSize: 20, fontWeight: 700, color: C.primary, mb: 1 }}>{blog.title}</Typography>
          <StatusChip status={blog.status} />

          {blog.description ? (
            <Typography sx={{ fontSize: 14, color: C.muted, mt: 2, lineHeight: 1.5 }}>{blog.description}</Typography>
          ) : null}

          <Divider sx={{ my: 2 }} />

          {blog.categories?.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, color: C.muted, mb: 0.75 }}>Categories</Typography>
              <MiniChips items={blog.categories} max={10} />
            </Box>
          ) : null}

          {blog.tags?.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, color: C.muted, mb: 0.75 }}>Tags</Typography>
              <MiniChips items={blog.tags} max={10} />
            </Box>
          ) : null}

          {blog.permalink ? (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, color: C.muted, mb: 0.5 }}>Permalink</Typography>
              <Typography sx={{ fontSize: 13, color: C.secondary, fontWeight: 600 }}>
                https://iontrip.com/blog/{blog.permalink}
              </Typography>
            </Box>
          ) : null}

          {blog.content ? (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 12, color: C.muted, mb: 0.75 }}>Content</Typography>
              <Box
                sx={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 1.5,
                  p: 2,
                  maxHeight: 280,
                  overflow: "auto",
                  fontSize: 14,
                  bgcolor: "#FAFBFC",
                }}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </Box>
          ) : null}

          {blog.createdAt ? (
            <Typography sx={{ fontSize: 12, color: C.muted }}>
              Created {new Date(blog.createdAt).toLocaleString()}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Modal>
  );
}

export default function AllBlog() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const authToken = token || localStorage.getItem("adminToken") || "";

  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const tableColumns = useMemo(
    () => [
      { key: "sl", label: "#", width: "48px" },
      { key: "image", label: "Image", width: "72px" },
      { key: "title", label: "Title", width: "minmax(160px, 1.4fr)" },
      { key: "categories", label: "Categories", width: "minmax(120px, 1fr)" },
      { key: "tags", label: "Tags", width: "minmax(120px, 1fr)" },
      { key: "status", label: "Status", width: "110px" },
      { key: "createdAt", label: "Date", width: "130px" },
      { key: "actions", label: "Actions", width: "140px" },
    ],
    [],
  );

  const tableGridTemplate = useMemo(() => fluidGridTemplateFromColumns(tableColumns), [tableColumns]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.BLOG_ALL}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      const data = response.data;
      if (Array.isArray(data)) setBlogs(data);
      else if (Array.isArray(data?.blogs)) setBlogs(data.blogs);
      else if (Array.isArray(data?.data)) setBlogs(data.data);
      else setBlogs([]);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch =
        !search.trim() ||
        blog?.title?.toLowerCase?.().includes(search.toLowerCase()) ||
        blog?.permalink?.toLowerCase?.().includes(search.toLowerCase());
      const matchesFilter = !filter || blog?.status?.toLowerCase?.() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [blogs, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / rowsPerPage));
  const paginatedBlogs = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredBlogs.slice(start, start + rowsPerPage);
  }, [filteredBlogs, page, rowsPerPage]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleDelete = async (blogId, blogTitle) => {
    const result = await Swal.fire({
      title: "Delete blog?",
      text: `"${blogTitle}" will be removed permanently.`,
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
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.BLOG_DELETE}/${blogId}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false });
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      Swal.fire("Error", "Failed to delete blog.", "error");
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

  const renderCell = (blog, column, rowIndex) => {
    if (column.key === "sl") {
      return (
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.muted }}>
          {(page - 1) * rowsPerPage + rowIndex + 1}
        </Typography>
      );
    }

    if (column.key === "image") {
      return (
        <Box
          component="img"
          src={blog.imageUrl || ""}
          alt=""
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          sx={{
            width: 48,
            height: 36,
            borderRadius: 1,
            objectFit: "cover",
            bgcolor: C.secondarySoft,
            border: `1px solid ${C.border}`,
            display: blog.imageUrl ? "block" : "none",
          }}
        />
      );
    }

    if (column.key === "title") {
      return (
        <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 1 }}>
          {!blog.imageUrl ? (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: C.secondarySoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ArticleOutlinedIcon sx={{ fontSize: 18, color: C.secondary }} />
            </Box>
          ) : null}
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: C.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={blog.title}
          >
            {blog.title || "—"}
          </Typography>
        </Box>
      );
    }

    if (column.key === "categories") return <MiniChips items={blog.categories} />;
    if (column.key === "tags") return <MiniChips items={blog.tags} />;
    if (column.key === "status") return <StatusChip status={blog.status} />;

    if (column.key === "createdAt") {
      return <Typography sx={{ fontSize: 12, color: C.text }}>{formatDate(blog.createdAt)}</Typography>;
    }

    if (column.key === "actions") {
      return (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" sx={actionBtnSx} onClick={() => { setSelectedBlog(blog); setViewOpen(true); }} aria-label="View">
            <VisibilityOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={actionBtnSx}
            onClick={() => navigate(`/dashboard/editblog/${blog.id}`, { state: { blog } })}
            aria-label="Edit"
          >
            <EditOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{ ...actionBtnSx, color: C.danger, "&:hover": { bgcolor: "rgba(235, 87, 87, 0.1)", borderColor: C.danger } }}
            onClick={() => handleDelete(blog.id, blog.title)}
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
    <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", m: { xs: -2, md: -3 }, p: { xs: 2, md: 3 } }}>
      <AdminPageTitleBar
        title="All Blog"
        subtitle={
          filteredBlogs.length > 0
            ? `${filteredBlogs.length} post${filteredBlogs.length === 1 ? "" : "s"}`
            : "Manage blog posts"
        }
        action={
          <>
            <Button
              variant="contained"
              onClick={fetchBlogs}
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
              onClick={() => navigate("/dashboard/addblog")}
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
              Add Blog
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
            justifyContent: "space-between",
            borderBottom: `1px solid ${C.border}`,
            background: `linear-gradient(90deg, ${C.secondarySoft} 0%, transparent 50%)`,
          }}
        >
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              size="small"
              placeholder="Search by title or permalink..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              sx={{ ...toolbarFieldSx, minWidth: 220, flex: { xs: "1 1 100%", sm: "1 1 240px" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 20, color: C.muted }} />
                  </InputAdornment>
                ),
              }}
            />
            <Select
              size="small"
              displayEmpty
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              sx={{ ...toolbarFieldSx, minWidth: 140 }}
            >
              <MenuItem value="">All status</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </Select>
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
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
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
          ) : paginatedBlogs.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
              <ArticleOutlinedIcon sx={{ fontSize: 48, color: C.border, mb: 1 }} />
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: C.primary }}>No blogs found</Typography>
              <Typography sx={{ fontSize: 13, color: C.muted, mt: 0.5 }}>
                {search || filter ? "Try changing search or filter." : "Create your first blog post."}
              </Typography>
              {!search && !filter ? (
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => navigate("/dashboard/addblog")}
                  sx={{
                    mt: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: C.secondary,
                    "&:hover": { bgcolor: C.primary },
                  }}
                >
                  Add Blog
                </Button>
              ) : null}
            </Box>
          ) : (
            paginatedBlogs.map((blog, index) => (
              <Box
                key={blog.id || index}
                sx={{
                  display: "grid",
                  gridTemplateColumns: tableGridTemplate,
                  alignItems: "center",
                  minWidth: 900,
                  bgcolor: index % 2 === 0 ? "#fff" : "#FAFBFC",
                  borderBottom: `1px solid ${C.border}`,
                  transition: "background-color 0.15s",
                  "&:hover": { bgcolor: C.secondarySoft },
                }}
              >
                {tableColumns.map((column) => (
                  <Box key={`${blog.id}-${column.key}`} sx={{ px: 2, py: 1.35, minWidth: 0, overflow: "hidden" }}>
                    {renderCell(blog, column, index)}
                  </Box>
                ))}
              </Box>
            ))
          )}
        </Box>
      </Box>

      {!loading && filteredBlogs.length > 0 ? (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Typography sx={{ fontSize: 12, color: C.muted }}>
            Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredBlogs.length)} of {filteredBlogs.length}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box
              onClick={() => page > 1 && setPage(page - 1)}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600,
                color: page > 1 ? C.primary : C.muted,
                bgcolor: page > 1 ? "#E2E8F0" : "#F1F5F9",
                cursor: page > 1 ? "pointer" : "not-allowed",
              }}
            >
              ‹
            </Box>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              const isActive = page === pageNum;
              return (
                <Box
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: isActive ? "#fff" : C.primary,
                    bgcolor: isActive ? C.secondary : "#EAF2FF",
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
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600,
                color: page < totalPages ? C.primary : C.muted,
                bgcolor: page < totalPages ? "#E2E8F0" : "#F1F5F9",
                cursor: page < totalPages ? "pointer" : "not-allowed",
              }}
            >
              ›
            </Box>
          </Box>
        </Box>
      ) : null}

      <BlogViewModal open={viewOpen} blog={selectedBlog} onClose={() => { setViewOpen(false); setSelectedBlog(null); }} />
    </Box>
  );
}
