import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Paper,
  FormControlLabel,
  Checkbox,
  Switch,
  Button,
  Divider,
  MenuItem,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import JoditEditor from "jodit-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext.jsx";

const generatePermalink = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const C = {
  pageBg: "#F4F7F6",
  cardBg: "#FFFFFF",
  border: "#E5E7EB",
  mutedHeader: "#4B5563",
  muted: "#6B7280",
  primary: "var(--primary-color, #123D6E)",
  primaryDark: "var(--primary-dark, #0F2F56)",
  danger: "#EB5757",
};

export default function AddBlog() {
  const editor = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: editId } = useParams();
  const { BASE_API_URL } = useAuth();

  const blogFromState = location.state?.blog || null;
  const isEditing = Boolean(editId || blogFromState);

  const [tabValue, setTabValue] = useState(0);

  // Form states
  const [title, setTitle] = useState("");
  const [permalink, setPermalink] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [index, setIndex] = useState(false);
  const [isDraft, setIsDraft] = useState(true);

  // Categories and Tags
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  // Mock data for categories and tags
  const [availableCategories, setAvailableCategories] = useState([
    { id: 1, name: "Budget Travel" },
    { id: 2, name: "Adventure Travel" },
    { id: 3, name: "Food & Traditions" },
    { id: 4, name: "Hidden Gems" },
    { id: 5, name: "Travel Tips" },
  ]);

  const [availableTags, setAvailableTags] = useState([
    { id: 1, name: "Modern" },
    { id: 2, name: "Tips" },
    { id: 3, name: "Foods" },
    { id: 4, name: "EcoQuestTravel" },
    { id: 5, name: "LuxuryRetreats" },
  ]);

  // States for creating new items
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);

  // Auto-generate permalink when title changes (only for create mode)
  useEffect(() => {
    if (!isEditing && title) {
      setPermalink(generatePermalink(title));
    }
  }, [title, isEditing]);

  // Prefill when coming from list page
  useEffect(() => {
    if (!isEditing) return;
    const blog = blogFromState;
    if (!blog) return;

    setTitle(blog.title || "");
    setPermalink(blog.permalink || generatePermalink(blog.title || ""));
    setDescription(blog.description || "");
    setContent(blog.content || "");
    setSeoTitle(blog.seoTitle || "");
    setSeoDescription(blog.seoDescription || "");
    setIsFeatured(Boolean(blog.isFeatured));
    setIndex(Boolean(blog.index));
    setIsDraft((blog.status || "").toLowerCase() === "draft" || !blog.status);
    setImage(blog.imageUrl || null);

    const categoryNames = (blog.categories || []).map((c) => (typeof c === "string" ? c : c?.name)).filter(Boolean);
    const tagNames = (blog.tags || []).map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean);

    setAvailableCategories((prev) => {
      const next = [...prev];
      for (const name of categoryNames) {
        if (!next.some((x) => x.name === name)) {
          next.push({ id: Math.max(...next.map((x) => x.id), 0) + 1, name });
        }
      }
      return next;
    });
    setAvailableTags((prev) => {
      const next = [...prev];
      for (const name of tagNames) {
        if (!next.some((x) => x.name === name)) {
          next.push({ id: Math.max(...next.map((x) => x.id), 0) + 1, name });
        }
      }
      return next;
    });

    // Use temporary selections; after available lists update, these names should still exist.
    setSelectedCategories(categoryNames.map((name, i) => ({ id: i + 1000, name })));
    setSelectedTags(tagNames.map((name, i) => ({ id: i + 2000, name })));
  }, [isEditing, blogFromState]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("permalink", `${permalink}`);
      formData.append("description", description);
      formData.append("content", content);
      formData.append("seoTitle", seoTitle);
      formData.append("seoDescription", seoDescription);
      formData.append("isFeatured", isFeatured);
      formData.append("status", isDraft ? "draft" : "published");
      formData.append("index", index);

      if (selectedCategories.length > 0) {
        const categoryNames = selectedCategories.map((c) => c.name).join(",");
        formData.append("categories", categoryNames);
      }
      if (selectedTags.length > 0) {
        const tagNames = selectedTags.map((t) => t.name).join(",");
        formData.append("tags", tagNames);
      }

      if (imageFile) {
        formData.append("imageUrl", imageFile);
      }

      const createUrl = `${BASE_API_URL}/blogs/admin/create`;

      if (!isEditing) {
        const response = await axios.post(createUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.status < 200 || response.status >= 300) throw new Error("Failed to create blog");
        toast.success("Blog created successfully!");
      } else {
        const blogId = editId || blogFromState?.id;
        if (!blogId) throw new Error("Missing blog id for editing.");

        const updateUrlWithId = `${BASE_API_URL}/blogs/admin/update/${blogId}`;
        const updateUrlNoId = `${BASE_API_URL}/blogs/admin/update`;

        try {
          await axios.post(updateUrlWithId, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (err) {
          // Fallback if backend expects update without id
          await axios.post(updateUrlNoId, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        toast.success("Blog updated successfully!");
      }

      navigate("/dashboard/manage/allblog");
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error(error?.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) => {
      if (prev.some((c) => c.id === category.id)) return prev.filter((c) => c.id !== category.id);
      return [...prev, category];
    });
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) => {
      if (prev.some((t) => t.id === tag.id)) return prev.filter((t) => t.id !== tag.id);
      return [...prev, tag];
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    const newId = Math.max(...availableCategories.map((c) => c.id), 0) + 1;
    const newCategory = { id: newId, name: newCategoryName.trim() };
    setAvailableCategories([...availableCategories, newCategory]);
    setSelectedCategories((prev) => [...prev, newCategory]);
    setNewCategoryName("");
    setShowCategoryInput(false);
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    const newId = Math.max(...availableTags.map((t) => t.id), 0) + 1;
    const newTag = { id: newId, name: newTagName.trim() };
    setAvailableTags([...availableTags, newTag]);
    setSelectedTags((prev) => [...prev, newTag]);
    setNewTagName("");
    setShowTagInput(false);
  };

  const handleDeleteCategory = (categoryId) => {
    setAvailableCategories(availableCategories.filter((c) => c.id !== categoryId));
    setSelectedCategories(selectedCategories.filter((c) => c.id !== categoryId));
  };

  const handleDeleteTag = (tagId) => {
    setAvailableTags(availableTags.filter((t) => t.id !== tagId));
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  return (
    <Box
      sx={{
        bgcolor: C.cardBg,
        minHeight: "100vh",
        p: 3,
        // AdminLayout applies p={{ xs: 2, md: 3 }} to the Outlet wrapper.
        // Negative margins make this page's white background cover the full content area.
        m: { xs: -2, md: -3 },
      }}
    >
      <Box sx={{ mb: 3,bgcolor:"#ffffff" }}>
        <Tabs
          value={tabValue}
          onChange={(_e, val) => setTabValue(val)}
          sx={{
            color: "#ffffff !important",
            borderRadius: 1,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "15px",
              minHeight: "48px",
            },
            "& .Mui-selected": { background: C.primary, color: "#ffffff !important" },
          }}
        >
          <Tab label="Posts" />
        </Tabs>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: "flex-start" }}>
        <Box sx={{ flex: { xs: "1 1 100%", md: "2 1 80%" } }}>
          <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: C.cardBg, border: `1px solid ${C.border}` }}>
            <Typography sx={{ color: C.mutedHeader, fontSize: "20px" }} fontWeight={600} mb={2}>
              Create New Post
            </Typography>
            <Typography sx={{ color: C.mutedHeader, fontSize: "15px" }} fontWeight={600} mb={2}>
              Details
            </Typography>

            <TextField fullWidth size="small" label="Title" variant="outlined" value={title} onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
            <TextField
              size="small"
              fullWidth
              label="Permalink"
              variant="outlined"
              value={permalink}
              onChange={(e) => setPermalink(e.target.value)}
              placeholder="Auto-generated from title"
              helperText="Automatically generated from title, but you can edit it manually"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Description"
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Content
            </Typography>
            <JoditEditor
              ref={editor}
              value={content}
              config={{ readonly: false, height: 300, placeholder: "Write your blog content here..." }}
              tabIndex={1}
              onBlur={(newContent) => setContent(newContent)}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} mb={2}>
              SEO Settings
            </Typography>
            <TextField fullWidth size="small" label="SEO Title" variant="outlined" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} sx={{ mb: 2 }} />
            <TextField
              fullWidth
              size="small"
              label="SEO Description"
              variant="outlined"
              multiline
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="text.secondary">
              SEO Preview:
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography color="primary" variant="body1">
                {seoTitle || title || "Your Blog Title"}
              </Typography>
              <Typography variant="body2" sx={{ color: C.success }}>
                https://epicquest.com.ph/blog/{permalink || "your-permalink"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {seoDescription || description || "Short description of your blog post..."}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 20%" } }}>
          <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: C.cardBg, border: `1px solid ${C.border}` }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Status
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={isDraft ? "draft" : "published"}
              onChange={(e) => setIsDraft(e.target.value === "draft")}
              variant="outlined"
              select
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
            </TextField>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} mb={2}>
              Featured
            </Typography>
            <FormControlLabel
              control={<Switch checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} color="primary" />}
              label={isFeatured ? "Yes" : "No"}
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} mb={2}>
              Index
            </Typography>
            <FormControlLabel control={<Switch checked={index} onChange={(e) => setIndex(e.target.checked)} color="primary" />} label={index ? "Yes" : "No"} />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} mb={2}>
              Categories
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  mb: 2,
                  textTransform: "none",
                  background: C.primary,
                  color: "#ffffff",
                  "&:hover": { background: C.primaryDark },
                }}
                onClick={() => setShowCategoryInput(true)}
              >
                + Create
              </Button>

              {showCategoryInput && (
                <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateCategory();
                    }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleCreateCategory}
                    sx={{ background: C.primary, color: "#ffffff", "&:hover": { background: C.primaryDark } }}
                  >
                    Add
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setShowCategoryInput(false);
                      setNewCategoryName("");
                    }}
                    sx={{ borderColor: C.primary, color: C.primary }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}

              {availableCategories.map((category) => (
                <Box
                  key={category.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: `1px solid ${C.border}`,
                    borderRadius: 1,
                    p: 0.5,
                    mb: 1,
                    "&:hover": { bgcolor: "#F9FAFB" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        bgcolor: "#f1f3f4",
                        borderRadius: "4px",
                        border: `1px solid ${C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "grab",
                        mr: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ☰
                      </Typography>
                    </Box>
                    <Checkbox checked={selectedCategories.some((c) => c.id === category.id)} onChange={() => handleCategoryToggle(category)} size="small" />
                    <Typography variant="body2" fontWeight={500}>
                      {category.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ minWidth: 32, height: 32, borderColor: C.border, color: C.muted }}
                      onClick={(e) => {
                        // UI placeholder for edit; backend integration not implemented here.
                        e.preventDefault();
                      }}
                    >
                      ✎
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ minWidth: 32, height: 32, borderColor: C.border, color: C.danger }}
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      🗑
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} mb={2}>
              Tags
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  mb: 2,
                  textTransform: "none",
                  background: C.primary,
                  color: "#ffffff",
                  "&:hover": { background: C.primaryDark },
                }}
                onClick={() => setShowTagInput(true)}
              >
                + Create
              </Button>

              {showTagInput && (
                <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateTag();
                    }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleCreateTag}
                    sx={{ background: C.primary, color: "#ffffff", "&:hover": { background: C.primaryDark } }}
                  >
                    Add
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setShowTagInput(false);
                      setNewTagName("");
                    }}
                    sx={{ borderColor: C.primary, color: C.primary }}
                  >
                    Cancel
                  </Button>
                </Box>
              )}

              {availableTags.map((tag) => (
                <Box
                  key={tag.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: `1px solid ${C.border}`,
                    borderRadius: 1,
                    p: 0.5,
                    mb: 1,
                    "&:hover": { bgcolor: "#F9FAFB" },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        bgcolor: "#f1f3f4",
                        borderRadius: "4px",
                        border: `1px solid ${C.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "grab",
                        mr: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        ☰
                      </Typography>
                    </Box>
                    <Checkbox checked={selectedTags.some((t) => t.id === tag.id)} onChange={() => handleTagToggle(tag)} size="small" />
                    <Typography variant="body2" fontWeight={500}>
                      {tag.name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button variant="outlined" size="small" sx={{ minWidth: 32, height: 32, borderColor: C.border, color: C.muted }}>
                      ✎
                    </Button>
                    <Button variant="outlined" size="small" sx={{ minWidth: 32, height: 32, borderColor: C.border, color: C.danger }} onClick={() => handleDeleteTag(tag.id)}>
                      🗑
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} mb={1}>
              Image
            </Typography>
            <Box sx={{ border: `2px dashed ${C.border}`, borderRadius: 2, p: 2, textAlign: "center", bgcolor: "#FAFAFA" }}>
              {image ? (
                <Box component="img" src={image} alt="Uploaded" sx={{ width: "100%", borderRadius: 1, mb: 1 }} />
              ) : (
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Choose image or upload new
                </Typography>
              )}
              <Button
                variant="contained"
                component="label"
                disabled={loading}
                sx={{ background: C.primary, color: "#ffffff", "&:hover": { background: C.primaryDark } }}
              >
                Upload New
                <input type="file" hidden onChange={handleImageUpload} />
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ textAlign: "right", mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSave}
          disabled={loading}
          sx={{
            background: C.primary,
            "&:hover": { background: C.primaryDark },
          }}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </Box>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </Box>
  );
}

