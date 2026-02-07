import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

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
          label="Email"
          variant="standard"
          defaultValue="syedafridi02@gmail.com"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineIcon sx={{ color: "#9aa0a6" }} />
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
          type="password"
          defaultValue="****************"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: "#9aa0a6" }} />
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
          onClick={() => navigate("/dashboard")}
          sx={{
            mt: 4,
            textTransform: "capitalize",
            py: 1.4,
            bgcolor: "#1f2a44",
            "&:hover": { bgcolor: "#182038" },
          }}
        >
          Sign In
        </Button>
      </Box>
    </Box>
  );
}
