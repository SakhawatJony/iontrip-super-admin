import { useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminTopbar() {
  const location = useLocation();
  const { user } = useAuth();
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/dashboard/";

  const displayName = user?.name || user?.adminId || "Super Admin";
  const displayEmail = user?.email || "admin@iontrip.com";

  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: isDashboard ? 2 : 1.25,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: "var(--primary-dark, #024DAF)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        flexWrap: { xs: "wrap", lg: "nowrap" },
      }}
    >
      {isDashboard ? (
        <Box sx={{ minWidth: { xs: "100%", lg: 200 } }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.2 }}>
            Super Admin Dashboard
          </Typography>
          <Typography sx={{ fontSize: 13, color: "rgba(255, 255, 255, 0.85)", fontWeight: 500, mt: 0.25 }}>
            Welcome back, {displayName}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1 }} />
      )}

      <TextField
        size="small"
        placeholder="Search anything..."
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          flex: { xs: "1 1 100%", lg: "1 1 auto" },
          maxWidth: { lg: 420 },
          mx: { lg: "auto" },
          order: { xs: 3, lg: 0 },
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            bgcolor: "#F8FAFC",
            height: 40,
            fontSize: 14,
            "& fieldset": { borderColor: "#E2E8F0" },
            "&:hover fieldset": { borderColor: "#CBD5E1" },
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1, sm: 1.5 },
          ml: { lg: "auto" },
          flexShrink: 0,
        }}
      >
        <Button
          size="small"
          endIcon={<KeyboardArrowDownIcon sx={{ color: "#FFFFFF" }} />}
          startIcon={<CalendarMonthIcon sx={{ fontSize: 18, color: "#FFFFFF" }} />}
          sx={{
            textTransform: "none",
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 12,
            border: "1px solid rgba(255, 255, 255, 0.35)",
            borderRadius: "10px",
            px: 1.5,
            py: 0.75,
            bgcolor: "rgba(255, 255, 255, 0.12)",
            display: { xs: "none", sm: "inline-flex" },
            whiteSpace: "nowrap",
          }}
        >
          May 20, 2024 – May 26, 2024
        </Button>

        <IconButton
          size="small"
          sx={{
            border: "1px solid rgba(255, 255, 255, 0.35)",
            borderRadius: "10px",
            width: 40,
            height: 40,
          }}
        >
          <Badge badgeContent={18} color="error">
            <NotificationsNoneIcon sx={{ color: "#FFFFFF" }} />
          </Badge>
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            pl: { sm: 1 },
            borderLeft: { sm: "1px solid rgba(255, 255, 255, 0.25)" },
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#2563EB",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {displayName[0]?.toUpperCase() || "S"}
          </Avatar>
          <Box sx={{ display: { xs: "none", md: "block" }, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2 }} noWrap>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "rgba(255, 255, 255, 0.85)" }} noWrap>
              {displayEmail}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
