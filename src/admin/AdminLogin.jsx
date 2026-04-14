import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const primaryDark = "var(--primary-dark, #024DAF)";
const primaryDarkHover = "#013A94";

const outlinedFieldSx = {
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryDark,
  },
  "& .MuiOutlinedInput-notchedOutline legend": {
    display: "none",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 0.9,
    bgcolor: "#fff",
    height: 35,
    minHeight: 35
  },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
    py: 0,
    height: 35,
    boxSizing: "border-box",
  },
  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryDark,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: primaryDark,
    borderWidth: 1,
  },
  "& .MuiOutlinedInput-input::placeholder": {
    color: "#6B7280",
    opacity: 1,
  },
  "& .MuiInputLabel-root": {
    position: "static",
    transform: "none",
    display: "block",
    mb: 0.5,
  
    fontSize: "0.875rem",
    fontWeight: 500,
    color: primaryDark,
    "&.Mui-focused": { color: primaryDark },
    "&.MuiInputLabel-shrink": {
      transform: "none",
      color: primaryDark,
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

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    // Validate inputs
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: adminId.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        
        // Save token and user data to AuthContext
        const tokenData = data.access_token || data.token || data.accessToken;
        const adminData = data.adminData || {};
        
        // Extract super admin email from adminData.email
        const superAdminEmail = adminData.email || data.email || "";
        
        const userData = {
          adminId: adminData.uuid || data.adminId || adminId.trim(),
          email: superAdminEmail, // Super admin email from adminData.email
          name: adminData.name || data.name || "",
          role: adminData.role || data.role || "",
          uuid: adminData.uuid || "",
          adminData: adminData, // Keep full adminData object
          ...data.user,
          ...data.admin,
        };
        
        // Remove sensitive fields from userData if needed
        delete userData.password;
        delete userData.token;
        delete userData.accessToken;
        delete userData.access_token;
        
        // Store in AuthContext (which also saves to localStorage)
        login(tokenData, userData);
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        // Handle error response
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

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
       mt:"100px"
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 1,
          p: { xs: 3, sm: 4 },
          
          bgcolor:"white",
        }}
      >
        <Box
          component="img"
          src="/src/assets/logo.jpeg"
          alt="IonTrip"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/vite.svg";
          }}
          sx={{
            display: "block",
            height: 44,
            width: "auto",
            maxWidth: 180,
            mx: "auto",
            mb: 2,
          }}
        />
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: primaryDark, textAlign: "center" }}>
          Sign In
        </Typography>
        <TextField
          fullWidth
          label="Admin ID"
          variant="outlined"
          placeholder="Enter your admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineIcon sx={{ color: primaryDark, fontSize: "small" }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, ...outlinedFieldSx }}
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: primaryDark, fontSize: "small" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClickShowPassword}
                  edge="end"
                  sx={{ color: primaryDark, height: 32, width: 32 }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
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
          sx={{
            mt: 2,
            textTransform: "capitalize",
            py: 1,
            bgcolor: primaryDark,
            "&:hover": { bgcolor: primaryDarkHover },
            "&:disabled": { bgcolor: "#9aa0a6" },
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </Box>
    </Box>
  );
}
