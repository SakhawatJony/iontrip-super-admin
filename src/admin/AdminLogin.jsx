import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const primaryDark = "var(--primary-dark, #024DAF)";
const primaryDarkHover = "#013A94";
const sidebarBg = "var(--sidebar-bg, #0A2B76)";

const outlinedFieldSx = {
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#D1D9E6",
  },
  "& .MuiOutlinedInput-notchedOutline legend": {
    display: "none",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#F8FAFC",
    height: 48,
    minHeight: 48,
    transition: "box-shadow 0.2s, background-color 0.2s",
  },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
    py: 0,
    height: 48,
    boxSizing: "border-box",
    fontSize: "0.9375rem",
  },
  "& .MuiOutlinedInput-root:hover": {
    bgcolor: "#fff",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryDark,
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    bgcolor: "#fff",
    boxShadow: "0 0 0 3px rgba(2, 77, 175, 0.12)",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryDark,
    borderWidth: 1.5,
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "#94A3B8",
    opacity: 1,
  },
  "& .MuiInputLabel-root": {
    position: "static",
    transform: "none",
    display: "block",
    mb: 0.75,
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "#334155",
    letterSpacing: "0.02em",
    "&.Mui-focused": { color: "#334155" },
    "&.MuiInputLabel-shrink": {
      transform: "none",
      color: "#334155",
    },
  },
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!adminId.trim()) {
      toast.error("Please enter Admin ID");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter Password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN_LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: adminId.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");

        const tokenData = data.access_token || data.token || data.accessToken;
        const adminData = data.adminData || {};
        const superAdminEmail = adminData.email || data.email || "";

        const userData = {
          adminId: adminData.uuid || data.adminId || adminId.trim(),
          email: superAdminEmail,
          name: adminData.name || data.name || "",
          role: adminData.role || data.role || "",
          uuid: adminData.uuid || "",
          adminData: adminData,
          ...data.user,
          ...data.admin,
        };

        delete userData.password;
        delete userData.token;
        delete userData.accessToken;
        delete userData.access_token;

        login(tokenData, userData);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        const errorMessage = data.message || data.error || "Login failed. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleLogin();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#F4F7FE",
      }}
    >
      {/* Left branding panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 6,
          background: `linear-gradient(145deg, ${sidebarBg} 0%, ${primaryDark} 55%, #1a6fd4 100%)`,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.06)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.04)",
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            maxWidth: 400,
          }}
        >
          <Box
            component="img"
            src="/logo.jpeg"
            alt="IonTrip"
            sx={{
              width: "100%",
              maxWidth: 280,
              height: "auto",
              mb: 4,
              borderRadius: 1.5,
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            }}
          />
          <Typography
            sx={{
              color: "#fff",
              fontSize: "1.75rem",
              fontWeight: 700,
              mb: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            Super Admin Portal
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
          >
            Manage flights, agents, bookings and more — all in one place.
          </Typography>
          <Box
            sx={{
              mt: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <FlightTakeoffIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.8125rem" }}>
              Secure admin access only
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: { xs: 1, md: "0 0 480px", lg: "0 0 520px" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1.5,
              mb: 4,
            }}
          >
            <Box
              component="img"
              src="/favicon.jpeg"
              alt="IonTrip"
              sx={{ width: 44, height: 44, borderRadius: 1.5 }}
            />
            <Box>
              <Typography sx={{ fontWeight: 700, color: primaryDark, fontSize: "1.125rem" }}>
                ionTrip
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>
                Super Admin Portal
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#0F172A",
              mb: 0.75,
              fontSize: { xs: "1.5rem", sm: "1.625rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </Typography>
          <Typography sx={{ color: "#64748B", mb: 4, fontSize: "0.9375rem" }}>
            Sign in to your admin account
          </Typography>

          <TextField
            fullWidth
            label="Admin ID"
            variant="outlined"
            placeholder="Enter your admin ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            onKeyDown={handleKeyDown}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon sx={{ color: primaryDark, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2.5, ...outlinedFieldSx }}
          />
          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            InputLabelProps={{ shrink:  true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: primaryDark, fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    sx={{ color: "#64748B" }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ ...outlinedFieldSx }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            disableElevation
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              bgcolor: primaryDark,
              boxShadow: "0 4px 14px rgba(2, 77, 175, 0.35)",
              "&:hover": {
                bgcolor: primaryDarkHover,
                boxShadow: "0 6px 20px rgba(2, 77, 175, 0.45)",
              },
              "&:disabled": { bgcolor: "#94A3B8", boxShadow: "none" },
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Sign In"
            )}
          </Button>

          <Typography
            sx={{
              mt: 4,
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#94A3B8",
            }}
          >
            © {new Date().getFullYear()} ionTrip. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
