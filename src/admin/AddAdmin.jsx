import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";

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

const AddAdmin = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleChange = (fieldName) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return !newErrors.firstName && !newErrors.lastName && !newErrors.email;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const authToken = token || localStorage.getItem("adminToken") || "";

    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CREATE_ADMIN}`,
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Admin created successfully!");
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
        });
        // Navigate back to All Admin page after a short delay
        setTimeout(() => {
          navigate("/dashboard/settings/alladmin");
        }, 1500);
      }
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to create admin.";
      toast.error(apiMessage);
      console.error("Create admin failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
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
          
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <IconButton
            onClick={() => navigate("/dashboard/settings/alladmin")}
            sx={{
              padding: 1,
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            Add Admin
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography sx={inputLabelSx}>
                First name <span style={{ color: "#d32f2f" }}>*</span>
              </Typography>
              <TextField
                placeholder="Enter first name"
                size="small"
                fullWidth
                required
                sx={fieldSx}
                value={formData?.firstName || ""}
                onChange={handleChange("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={inputLabelSx}>
                Last name <span style={{ color: "#d32f2f" }}>*</span>
              </Typography>
              <TextField
                placeholder="Enter last name"
                size="small"
                fullWidth
                required
                sx={fieldSx}
                value={formData?.lastName || ""}
                onChange={handleChange("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography sx={inputLabelSx}>
                Email <span style={{ color: "#d32f2f" }}>*</span>
              </Typography>
              <TextField
                placeholder="Enter email"
                type="email"
                size="small"
                fullWidth
                required
                sx={fieldSx}
                value={formData?.email || ""}
                onChange={handleChange("email")}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate("/dashboard/settings/alladmin")}
              disabled={loading}
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
              disabled={loading}
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
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: "#fff" }} />
                  <Typography sx={{ fontSize: 14 }}>Creating...</Typography>
                </Box>
              ) : (
                "Create Admin"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddAdmin;
