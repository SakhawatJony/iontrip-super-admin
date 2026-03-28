import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export default function AdminTopbar() {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 1.25,
        display: "flex",
        alignItems: "center",
        gap: 2,
        bgcolor: "#FFFFFF",
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      <Typography sx={{ fontWeight: 700, color: "#333333", fontSize: 18 }}>
        IonTrip
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <TextField
        size="small"
        placeholder="Search By"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#6b7a90" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          width: { xs: 180, sm: 260 },
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
            bgcolor: "#d7e5f4",
            height: 36,
            fontSize: 14,
          },
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          sx={{
            bgcolor: "#0d2a52",
            color: "white",
            width: 34,
            height: 34,
            borderRadius: 1,
            "&:hover": { bgcolor: "#0b2446" },
          }}
        >
          <PersonOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          size="small"
          sx={{
            bgcolor: "#0d2a52",
            color: "white",
            width: 34,
            height: 34,
            borderRadius: 1,
            "&:hover": { bgcolor: "#0b2446" },
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
