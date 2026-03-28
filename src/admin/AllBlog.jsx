import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  TextField,
  InputAdornment,
  Stack,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import { API_BASE_URL } from "../config/api.js";

const C = {
  pageBg: "#F4F7F6",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  muted: "#6B7280",
  mutedHeader: "#4B5563",
  primary: "var(--primary-color, #123D6E)",
  primaryDark: "var(--primary-dark, #0F2F56)",
  danger: "#EB5757",
  success: "#39A566",
};

const statusColor = (status) => {
  const s = status?.toLowerCase?.() ?? "";
  return s === "published" ? C.success : C.danger;
};

export default function AllBlog() {
  const navigate = useNavigate();

  const [tab] = useState(0); // kept for compatibility with your UI
  const [action, setAction] = useState("");
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blogs/admin/allBlogs`);
      const data = response.data;

      if (Array.isArray(data)) {
        setBlogs(data);
      } else if (Array.isArray(data?.blogs)) {
        setBlogs(data.blogs);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Pagination handlers
  const handleChangePage = (_event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply filters
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesSearch = blog?.title?.toLowerCase?.().includes(search.toLowerCase());
      const matchesFilter = !filter || blog?.status?.toLowerCase?.() === filter.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [blogs, filter, search]);

  // Paginate
  const paginatedBlogs = useMemo(() => {
    return filteredBlogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredBlogs, page, rowsPerPage]);

  const handleAddNew = () => {
    navigate("/dashboard/addblog");
  };

  const handleEdit = (blog) => {
    navigate(`/dashboard/editblog/${blog.id}`, { state: { blog } });
  };

  const handleView = (blog) => {
    setSelectedBlog(blog);
    setViewModalOpen(true);
  };

  const handleCloseView = () => {
    setViewModalOpen(false);
    setSelectedBlog(null);
  };

  // Handle delete with confirmation
  const handleDelete = async (blogId, blogTitle) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${blogTitle}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/blogs/admin/delete/${blogId}`);
      Swal.fire("Deleted!", "Your blog has been deleted.", "success");
      fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      Swal.fire("Error!", "Failed to delete blog.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", p: 3 }}>
      <Card
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: C.cardBg,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Tabs Header */}
        <Box sx={{ display: "flex", borderBottom: `1px solid ${C.border}`, backgroundColor: "#F8FAFC" }}>
          {["Posts"].map((label, index) => (
            <Box
              key={label}
              onClick={() => {}}
              sx={{
                px: 3,
                py: 1.5,
                cursor: "default",
                borderRight: `1px solid ${C.border}`,
                fontWeight: 500,
                backgroundColor: tab === index ? C.primary : "#FFFFFF",
                borderTop: tab === index ? `2px solid ${C.primary}` : "2px solid transparent",
                color: tab === index ? "#FFFFFF" : C.mutedHeader,
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 2,
            borderBottom: `1px solid ${C.border}`,
            backgroundColor: "#fff",
            flexWrap: "wrap",
            gap: 1.25,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
            <Select size="small" displayEmpty value={action} onChange={(e) => setAction(e.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="">
                <em>Actions</em>
              </MenuItem>
              <MenuItem value="delete">Delete</MenuItem>
              <MenuItem value="draft">Mark as Draft</MenuItem>
              <MenuItem value="publish">Publish</MenuItem>
            </Select>

            <Select size="small" displayEmpty value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ minWidth: 120 }}>
              <MenuItem value="">
                <em>Filter</em>
              </MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </Select>

            <TextField
              size="small"
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250, minWidth: 200 }}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button
              onClick={handleAddNew}
              startIcon={<AddIcon />}
              sx={{
                textTransform: "none",
                background: C.primary,
                fontSize: "12px",
                color: "#FFFFFF",
                "&:hover": { background: C.primaryDark },
              }}
            >
              Create
            </Button>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchBlogs}
              sx={{
                textTransform: "none",
                border: `1px solid ${C.primary}`,
                color: C.primary,
                fontSize: "12px",
                "&:hover": {
                  background: "rgba(18, 61, 110, 0.04)",
                },
              }}
            >
              Reload
            </Button>
          </Stack>
        </Box>

        {/* Table Section */}
        <Box sx={{ p: 2 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "none", border: `1px solid ${C.border}` }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                <TableRow>
                  {["#", "Image", "Title", "Categories", "Tags", "Status", "Date Created", "Operations"].map((header) => (
                    <TableCell
                      key={header}
                      sx={{ fontWeight: 600, color: C.mutedHeader, fontSize: "11px", whiteSpace: "nowrap" }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedBlogs.length > 0 ? (
                  paginatedBlogs.map((row, index) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        "&:hover": { backgroundColor: "#F9FAFB" },
                      }}
                    >
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Avatar src={row.imageUrl || ""} variant="rounded" sx={{ width: 30, height: 25 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: "10px", whiteSpace: "nowrap" }}>{row.title}</TableCell>
                      <TableCell sx={{ color: C.primary, fontSize: "10px", whiteSpace: "nowrap" }}>
                        {row.categories?.length ? row.categories.map((c) => c.name).join(", ") : "—"}
                      </TableCell>
                      <TableCell sx={{ fontSize: "10px", whiteSpace: "nowrap" }}>
                        {row.tags?.length ? row.tags.map((t) => t.name).join(", ") : "—"}
                      </TableCell>
                      <TableCell sx={{ color: statusColor(row.status), fontSize: "10px", whiteSpace: "nowrap" }}>
                        {row.status}
                      </TableCell>
                      <TableCell sx={{ fontSize: "10px", whiteSpace: "nowrap" }}>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button size="small" onClick={() => handleView(row)} sx={{ textTransform: "none", color: C.primary, fontSize: "12px" }}>
                            View
                          </Button>
                          <Button size="small" onClick={() => handleEdit(row)} sx={{ textTransform: "none", color: C.primary, fontSize: "12px" }}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            onClick={() => handleDelete(row.id, row.title)}
                            sx={{ textTransform: "none", color: C.danger, fontSize: "12px" }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No blogs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredBlogs.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </TableContainer>
        </Box>

        {/* View Blog Modal */}
        <Dialog open={viewModalOpen} onClose={handleCloseView} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" component="div">
                Blog Details
              </Typography>
              <IconButton onClick={handleCloseView} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            {selectedBlog && (
              <Box sx={{ mt: 2 }}>
                {selectedBlog.imageUrl && (
                  <Box sx={{ mb: 3, textAlign: "center" }}>
                    <Avatar src={selectedBlog.imageUrl} variant="rounded" sx={{ width: "100%", height: 300, mx: "auto" }} />
                  </Box>
                )}

                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {selectedBlog.title}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {selectedBlog.description && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">{selectedBlog.description}</Typography>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip label={selectedBlog.status} color={selectedBlog.status?.toLowerCase() === "published" ? "success" : "warning"} size="small" />
                </Box>

                {selectedBlog.categories?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Categories
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedBlog.categories.map((category, index) => (
                        <Chip
                          key={index}
                          label={typeof category === "string" ? category : category.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {selectedBlog.tags?.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Tags
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {selectedBlog.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={typeof tag === "string" ? tag : tag.name}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {selectedBlog.permalink && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Permalink
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      component="a"
                      href={`https://epicquest.com.ph/blog/${selectedBlog.permalink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        textDecoration: "underline",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline", opacity: 0.8 },
                      }}
                    >
                      {`https://epicquest.com.ph/blog/${selectedBlog.permalink}`}
                    </Typography>
                  </Box>
                )}

                {selectedBlog.seoTitle && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      SEO Title
                    </Typography>
                    <Typography variant="body2">{selectedBlog.seoTitle}</Typography>
                  </Box>
                )}

                {selectedBlog.seoDescription && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      SEO Description
                    </Typography>
                    <Typography variant="body2">{selectedBlog.seoDescription}</Typography>
                  </Box>
                )}

                {selectedBlog.content && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Content
                    </Typography>
                    <Box
                      dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                      sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, maxHeight: 400, overflow: "auto" }}
                    />
                  </Box>
                )}

                {selectedBlog.createdAt && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Created At
                    </Typography>
                    <Typography variant="body2">{new Date(selectedBlog.createdAt).toLocaleString()}</Typography>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Featured
                  </Typography>
                  <Chip label={selectedBlog.isFeatured ? "Yes" : "No"} color={selectedBlog.isFeatured ? "success" : "default"} size="small" />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Index
                  </Typography>
                  <Chip label={selectedBlog.index ? "Yes" : "No"} color={selectedBlog.index ? "success" : "default"} size="small" />
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseView}>Close</Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  );
}

