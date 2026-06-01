import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Switch,
  Button,
  Divider,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  CircularProgress,
} from "@mui/material";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import JoditEditor from "jodit-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

function showApiErrorToasts(err, fallback = "Request failed.") {
  const data = err?.response?.data;
  if (Array.isArray(data?.message) && data.message.length > 0) {
    data.message.forEach((msg) => toast.error(String(msg)));
    return;
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    toast.error(data.message);
    return;
  }
  if (typeof data?.error === "string" && data.error.trim()) {
    toast.error(data.error);
    return;
  }
  toast.error(err?.message || fallback);
}

function showApiSuccessToast(response, fallback = "Saved successfully.") {
  const msg = response?.data?.message;
  if (typeof msg === "string" && msg.trim()) {
    toast.success(msg);
    return;
  }
  if (Array.isArray(msg) && msg.length > 0) {
    toast.success(String(msg[0]));
    return;
  }
  toast.success(fallback);
}

function normalizeTaxonomyItem(item) {
  if (!item) return null;
  if (typeof item === "string") return { id: item, name: item };
  const id = item.id ?? item._id;
  const name = item.name ?? item.title ?? String(id ?? "");
  if (!id) return null;
  return { id: String(id), name: String(name) };
}

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.tags)) return data.tags;
  return [];
}

function buildBlogFormData({
  title,
  permalink,
  description,
  content,
  seoTitle,
  seoDescription,
  isFeatured,
  index,
  status,
  selectedCategories,
  selectedTags,
  imageFile,
}) {
  const formData = new FormData();
  formData.append("title", title.trim());
  formData.append("permalink", permalink.trim());
  if (description) formData.append("description", description);
  if (content) formData.append("content", content);
  if (seoTitle) formData.append("seoTitle", seoTitle);
  if (seoDescription) formData.append("seoDescription", seoDescription);
  formData.append("isFeatured", String(Boolean(isFeatured)));
  formData.append("index", String(Boolean(index)));
  formData.append("status", status);
  selectedCategories.forEach((c) => {
    if (c?.id) formData.append("categories", String(c.id));
  });
  selectedTags.forEach((t) => {
    if (t?.id) formData.append("tags", String(t.id));
  });
  if (imageFile) formData.append("imageUrl", imageFile);
  return formData;
}

const generatePermalink = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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
};

const labelSx = {
  fontSize: 13,
  fontWeight: 600,
  color: C.primary,
  mb: 0.75,
  display: "block",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: 14,
    bgcolor: "#FAFBFC",
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: C.secondary, borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: C.secondary },
};

const switchSx = {
  "& .MuiSwitch-switchBase.Mui-checked": { color: C.secondary },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    bgcolor: C.secondary,
    opacity: 0.85,
  },
};

const checkboxSx = {
  color: "#94A3B8",
  "&.Mui-checked": { color: C.secondary },
};

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${C.border}`,
        bgcolor: C.cardBg,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(15, 47, 86, 0.06)",
        mb: 2.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          background: `linear-gradient(90deg, ${C.secondarySoft} 0%, transparent 60%)`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            bgcolor: C.secondary,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: C.primary, lineHeight: 1.3 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography sx={{ fontSize: 12, color: C.muted, mt: 0.25 }}>{subtitle}</Typography>
          ) : null}
        </Box>
      </Box>
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>{children}</Box>
    </Box>
  );
}

export default function AddBlog() {
  const editor = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: editId } = useParams();
  const { token } = useAuth();
  const authToken = token || (typeof localStorage !== "undefined" ? localStorage.getItem("adminToken") : "") || "";

  const blogFromState = location.state?.blog || null;
  const isEditing = Boolean(editId || blogFromState);

  const [title, setTitle] = useState("");
  const [permalink, setPermalink] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [index, setIndex] = useState(false);
  const [isDraft, setIsDraft] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing && title) setPermalink(generatePermalink(title));
  }, [title, isEditing]);

  useEffect(() => {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    const fetchTaxonomy = async () => {
      setTaxonomyLoading(true);
      try {
        const [catRes, tagRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.BLOG_CATEGORIES}`, { headers }),
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.BLOG_TAGS}`, { headers }),
        ]);

        let categories = [];
        let tags = [];

        if (catRes.status === "fulfilled") {
          categories = unwrapList(catRes.value?.data).map(normalizeTaxonomyItem).filter(Boolean);
        }
        if (tagRes.status === "fulfilled") {
          tags = unwrapList(tagRes.value?.data).map(normalizeTaxonomyItem).filter(Boolean);
        }

        if (categories.length === 0 || tags.length === 0) {
          const blogsRes = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.BLOG_ALL}`, { headers });
          const blogs = unwrapList(blogsRes.data);
          const catMap = new Map();
          const tagMap = new Map();
          blogs.forEach((blog) => {
            (blog.categories || []).forEach((c) => {
              const n = normalizeTaxonomyItem(c);
              if (n) catMap.set(n.id, n);
            });
            (blog.tags || []).forEach((t) => {
              const n = normalizeTaxonomyItem(t);
              if (n) tagMap.set(n.id, n);
            });
          });
          if (categories.length === 0) categories = [...catMap.values()];
          if (tags.length === 0) tags = [...tagMap.values()];
        }

        setAvailableCategories(categories);
        setAvailableTags(tags);
      } catch (err) {
        console.error("Failed to load categories/tags:", err);
        setAvailableCategories([]);
        setAvailableTags([]);
      } finally {
        setTaxonomyLoading(false);
      }
    };

    fetchTaxonomy();
  }, [authToken]);

  useEffect(() => {
    if (!isEditing || !blogFromState) return;
    const blog = blogFromState;

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

    const cats = (blog.categories || []).map(normalizeTaxonomyItem).filter(Boolean);
    const tgs = (blog.tags || []).map(normalizeTaxonomyItem).filter(Boolean);
    setSelectedCategories(cats);
    setSelectedTags(tgs);
  }, [isEditing, blogFromState]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!permalink.trim()) {
      toast.error("Permalink is required.");
      return;
    }
    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const formData = buildBlogFormData({
        title,
        permalink,
        description,
        content,
        seoTitle,
        seoDescription,
        isFeatured,
        index,
        status: isDraft ? "draft" : "published",
        selectedCategories,
        selectedTags,
        imageFile,
      });

      const headers = {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "multipart/form-data",
      };

      if (!isEditing) {
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.BLOG_CREATE}`, formData, { headers });
        if (response.status < 200 || response.status >= 300) throw new Error("Failed to create blog");
        showApiSuccessToast(response, "Blog created successfully!");
      } else {
        const blogId = editId || blogFromState?.id;
        if (!blogId) throw new Error("Missing blog id for editing.");
        try {
          const response = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.BLOG_UPDATE}/${blogId}`,
            formData,
            { headers },
          );
          showApiSuccessToast(response, "Blog updated successfully!");
        } catch {
          const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.BLOG_UPDATE}`, formData, { headers });
          showApiSuccessToast(response, "Blog updated successfully!");
        }
      }
      navigate("/dashboard/manage/allblog");
    } catch (error) {
      console.error("Error saving blog:", error?.response?.data || error);
      showApiErrorToasts(error, isEditing ? "Failed to update blog." : "Failed to create blog.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.some((c) => String(c.id) === String(category.id))
        ? prev.filter((c) => String(c.id) !== String(category.id))
        : [...prev, category],
    );
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.some((t) => String(t.id) === String(tag.id))
        ? prev.filter((t) => String(t.id) !== String(tag.id))
        : [...prev, tag],
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (!authToken) {
      toast.error("Please login to create categories.");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.BLOG_CATEGORIES}`,
        { name },
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } },
      );
      const created = normalizeTaxonomyItem(res?.data?.data ?? res?.data?.category ?? res?.data);
      if (created) {
        setAvailableCategories((prev) => (prev.some((c) => c.id === created.id) ? prev : [...prev, created]));
        setSelectedCategories((prev) => (prev.some((c) => c.id === created.id) ? prev : [...prev, created]));
        toast.success("Category created.");
      } else {
        toast.success("Category created. Refresh the list if it does not appear.");
      }
      setNewCategoryName("");
      setShowCategoryInput(false);
    } catch (err) {
      showApiErrorToasts(err, "Could not create category. Select from existing list or check API.");
    }
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) return;
    if (!authToken) {
      toast.error("Please login to create tags.");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.BLOG_TAGS}`,
        { name },
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } },
      );
      const created = normalizeTaxonomyItem(res?.data?.data ?? res?.data?.tag ?? res?.data);
      if (created) {
        setAvailableTags((prev) => (prev.some((t) => t.id === created.id) ? prev : [...prev, created]));
        setSelectedTags((prev) => (prev.some((t) => t.id === created.id) ? prev : [...prev, created]));
        toast.success("Tag created.");
      } else {
        toast.success("Tag created. Refresh the list if it does not appear.");
      }
      setNewTagName("");
      setShowTagInput(false);
    } catch (err) {
      showApiErrorToasts(err, "Could not create tag. Select from existing list or check API.");
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setAvailableCategories(availableCategories.filter((c) => c.id !== categoryId));
    setSelectedCategories(selectedCategories.filter((c) => c.id !== categoryId));
  };

  const handleDeleteTag = (tagId) => {
    setAvailableTags(availableTags.filter((t) => t.id !== tagId));
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const listItemSx = (selected) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: `1px solid ${selected ? C.secondary : C.border}`,
    borderRadius: 1.5,
    p: 0.75,
    mb: 1,
    bgcolor: selected ? C.secondarySoft : "#FAFBFC",
    transition: "border-color 0.15s, background-color 0.15s",
    "&:hover": { bgcolor: selected ? C.secondarySoft : "#F1F5F9" },
  });

  const smallBtnPrimary = {
    textTransform: "none",
    fontWeight: 600,
    fontSize: 13,
    bgcolor: C.secondary,
    color: "#fff",
    boxShadow: "none",
    "&:hover": { bgcolor: C.primary, boxShadow: "none" },
  };

  const smallBtnOutline = {
    textTransform: "none",
    fontWeight: 600,
    fontSize: 13,
    borderColor: C.secondary,
    color: C.secondary,
    "&:hover": { borderColor: C.primary, bgcolor: C.secondarySoft },
  };

  return (
    <Box
      sx={{
        bgcolor: C.pageBg,
        minHeight: "100vh",
        m: { xs: -2, md: -3 },
        p: { xs: 2, md: 3 },
      }}
    >
      <AdminPageTitleBar
        title={isEditing ? "Edit Blog" : "Add Blog"}
        subtitle={isEditing ? "Update post content and settings" : "Create a new blog post for your website"}
        action={
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard/manage/allblog")}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.5)",
              "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
            }}
            variant="outlined"
            size="small"
          >
            All blogs
          </Button>
        }
      />

      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid item xs={12} lg={8}>
          <SectionCard
            icon={<ArticleOutlinedIcon />}
            title="Post details"
            subtitle="Title, permalink, description and main content"
          >
            <Typography component="label" sx={labelSx}>
              Title
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ ...fieldSx, mb: 2 }}
            />

            <Typography component="label" sx={labelSx}>
              Permalink
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={permalink}
              onChange={(e) => setPermalink(e.target.value)}
              placeholder="auto-generated-from-title"
              helperText="Auto-generated from title — you can edit manually"
              sx={{ ...fieldSx, mb: 2 }}
            />

            <Typography component="label" sx={labelSx}>
              Short description
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Brief summary for listings and SEO"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ ...fieldSx, mb: 2.5 }}
            />

            <Typography component="label" sx={labelSx}>
              Content
            </Typography>
            <Box
              sx={{
                borderRadius: 1.5,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                "& .jodit-container": { border: "none !important" },
              }}
            >
              <JoditEditor
                ref={editor}
                value={content}
                config={{ readonly: false, height: 320, placeholder: "Write your blog content here..." }}
                tabIndex={1}
                onBlur={(newContent) => setContent(newContent)}
              />
            </Box>
          </SectionCard>

          <SectionCard
            icon={<SearchOutlinedIcon />}
            title="SEO settings"
            subtitle="How this post appears in search results"
          >
            <Typography component="label" sx={labelSx}>
              SEO title
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              sx={{ ...fieldSx, mb: 2 }}
            />

            <Typography component="label" sx={labelSx}>
              SEO description
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              sx={{ ...fieldSx, mb: 2 }}
            />

            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 1.5,
                bgcolor: "#FAFBFC",
                border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${C.secondary}`,
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: C.muted, mb: 1, textTransform: "uppercase" }}>
                Search preview
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: C.secondary, lineHeight: 1.35 }}>
                {seoTitle || title || "Your blog title"}
              </Typography>
              <Typography sx={{ fontSize: 12, color: C.success, mt: 0.5 }}>
                https://iontrip.com/blog/{permalink || "your-permalink"}
              </Typography>
              <Typography sx={{ fontSize: 13, color: C.muted, mt: 0.5, lineHeight: 1.45 }}>
                {seoDescription || description || "Short description of your blog post will appear here..."}
              </Typography>
            </Box>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 16 } }}>
            <SectionCard icon={<TuneOutlinedIcon />} title="Publish" subtitle="Status and visibility">
              <Typography component="label" sx={labelSx}>
                Status
              </Typography>
              <TextField
                fullWidth
                size="small"
                select
                value={isDraft ? "draft" : "published"}
                onChange={(e) => setIsDraft(e.target.value === "draft")}
                sx={{ ...fieldSx, mb: 2 }}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>

              <FormControlLabel
                control={<Switch checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} sx={switchSx} />}
                label={<Typography sx={{ fontSize: 14, color: C.text }}>Featured post</Typography>}
                sx={{ display: "flex", mb: 0.5 }}
              />
              <FormControlLabel
                control={<Switch checked={index} onChange={(e) => setIndex(e.target.checked)} sx={switchSx} />}
                label={<Typography sx={{ fontSize: 14, color: C.text }}>Allow search indexing</Typography>}
              />
            </SectionCard>

            <SectionCard icon={<CategoryOutlinedIcon />} title="Categories" subtitle="Select category IDs (from API)">
              <Button
                variant="contained"
                size="small"
                sx={{ ...smallBtnPrimary, mb: 1.5 }}
                onClick={() => setShowCategoryInput(true)}
                disabled={taxonomyLoading}
              >
                + Add category
              </Button>

              {showCategoryInput ? (
                <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                  <TextField
                    size="small"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                    sx={{ ...fieldSx, flex: 1, minWidth: 120 }}
                  />
                  <Button size="small" variant="contained" sx={smallBtnPrimary} onClick={handleCreateCategory}>
                    Add
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={smallBtnOutline}
                    onClick={() => {
                      setShowCategoryInput(false);
                      setNewCategoryName("");
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : null}

              {selectedCategories.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
                  {selectedCategories.map((c) => (
                    <Chip
                      key={c.id}
                      label={c.name}
                      size="small"
                      onDelete={() => handleCategoryToggle(c)}
                      sx={{ bgcolor: C.secondarySoft, color: C.secondary, fontWeight: 600 }}
                    />
                  ))}
                </Box>
              ) : null}

              {taxonomyLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} sx={{ color: C.secondary }} />
                </Box>
              ) : availableCategories.length === 0 ? (
                <Typography sx={{ fontSize: 12, color: C.muted, mb: 1 }}>
                  No categories loaded. Create one above or ensure `/blogs/admin/categories` is available.
                </Typography>
              ) : null}

              {availableCategories.map((category) => {
                const selected = selectedCategories.some((c) => String(c.id) === String(category.id));
                return (
                  <Box key={category.id} sx={listItemSx(selected)}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                      <Checkbox
                        checked={selected}
                        onChange={() => handleCategoryToggle(category)}
                        size="small"
                        sx={checkboxSx}
                      />
                      <Typography sx={{ fontSize: 13, fontWeight: selected ? 600 : 500, color: C.text }} noWrap>
                        {category.name}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteCategory(category.id)}
                      sx={{ color: C.danger, p: 0.5 }}
                      aria-label="Delete category"
                    >
                      🗑
                    </IconButton>
                  </Box>
                );
              })}
            </SectionCard>

            <SectionCard icon={<LocalOfferOutlinedIcon />} title="Tags" subtitle="Select tag IDs (from API)">
              <Button
                variant="contained"
                size="small"
                sx={{ ...smallBtnPrimary, mb: 1.5 }}
                onClick={() => setShowTagInput(true)}
                disabled={taxonomyLoading}
              >
                + Add tag
              </Button>

              {showTagInput ? (
                <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                  <TextField
                    size="small"
                    placeholder="Tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                    sx={{ ...fieldSx, flex: 1, minWidth: 120 }}
                  />
                  <Button size="small" variant="contained" sx={smallBtnPrimary} onClick={handleCreateTag}>
                    Add
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={smallBtnOutline}
                    onClick={() => {
                      setShowTagInput(false);
                      setNewTagName("");
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : null}

              {selectedTags.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
                  {selectedTags.map((t) => (
                    <Chip
                      key={t.id}
                      label={t.name}
                      size="small"
                      onDelete={() => handleTagToggle(t)}
                      sx={{ bgcolor: C.secondarySoft, color: C.secondary, fontWeight: 600 }}
                    />
                  ))}
                </Box>
              ) : null}

              {taxonomyLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                  <CircularProgress size={24} sx={{ color: C.secondary }} />
                </Box>
              ) : availableTags.length === 0 ? (
                <Typography sx={{ fontSize: 12, color: C.muted, mb: 1 }}>
                  No tags loaded. Create one above or ensure `/blogs/admin/tags` is available.
                </Typography>
              ) : null}

              {availableTags.map((tag) => {
                const selected = selectedTags.some((t) => String(t.id) === String(tag.id));
                return (
                  <Box key={tag.id} sx={listItemSx(selected)}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                      <Checkbox checked={selected} onChange={() => handleTagToggle(tag)} size="small" sx={checkboxSx} />
                      <Typography sx={{ fontSize: 13, fontWeight: selected ? 600 : 500, color: C.text }} noWrap>
                        {tag.name}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => handleDeleteTag(tag.id)} sx={{ color: C.danger, p: 0.5 }} aria-label="Delete tag">
                      🗑
                    </IconButton>
                  </Box>
                );
              })}
            </SectionCard>

            <SectionCard icon={<ImageOutlinedIcon />} title="Featured image">
              <Box
                sx={{
                  border: `2px dashed ${image ? C.secondary : C.border}`,
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  bgcolor: image ? C.secondarySoft : "#FAFBFC",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
              >
                {image ? (
                  <Box
                    component="img"
                    src={image}
                    alt="Preview"
                    sx={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 1.5, mb: 1.5 }}
                  />
                ) : (
                  <>
                    <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: C.secondary, mb: 0.5 }} />
                    <Typography sx={{ fontSize: 13, color: C.muted, mb: 1.5 }}>
                      JPG, PNG or WebP — recommended 1200×630
                    </Typography>
                  </>
                )}
                <Button variant="contained" component="label" disabled={loading} sx={smallBtnPrimary}>
                  {image ? "Change image" : "Upload image"}
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
              </Box>
            </SectionCard>
          </Box>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: 1,
          p: 2,
          borderRadius: 2,
          bgcolor: C.cardBg,
          border: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          flexWrap: "wrap",
          boxShadow: "0 -2px 12px rgba(15, 47, 86, 0.06)",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard/manage/allblog")}
          disabled={loading}
          sx={{ ...smallBtnOutline, px: 3, py: 1 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          disabled={loading}
          sx={{
            ...smallBtnPrimary,
            px: 3,
            py: 1,
            minWidth: 140,
          }}
        >
          {loading ? "Saving..." : isEditing ? "Update post" : "Save post"}
        </Button>
      </Box>

      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
