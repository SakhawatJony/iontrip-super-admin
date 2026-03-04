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
        const tokenData = data.token || data.accessToken || data.access_token;
        const userData = {
          adminId: data.adminId || adminId.trim(),
          ...data.user,
          ...data.admin,
          ...data,
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
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Admin Sign In
        </Typography>
        <TextField
          fullWidth
          label="Admin ID"
          variant="standard"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineIcon sx={{ color: "#9aa0a6", fontSize: "small" }} />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          sx={{
            mb: 3,
            "& .MuiInputBase-root": {
              borderBottom: "1px solid #d6d6d6",
            },
          }}
        />
        <TextField
          fullWidth
          label="Password"
          variant="standard"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: "#9aa0a6", fontSize: "small" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  edge="end"
                  sx={{ color: "#9aa0a6" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          sx={{
            mb: 2,
            "& .MuiInputBase-root": {
              borderBottom: "1px solid #d6d6d6",
            },
          }}
        />
        <Link href="#" underline="none" sx={{ fontSize: 13, color: "#2b2f3a" }}>
          Forgot Password ?
        </Link>
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            mt: 4,
            textTransform: "capitalize",
            py: 1.4,
            bgcolor: "#1f2a44",
            "&:hover": { bgcolor: "#182038" },
            "&:disabled": { bgcolor: "#9aa0a6" },
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </Box>
    </Box>
  );
}
