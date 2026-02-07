import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function Navbar() {
  return (
<Box sx={{bgcolor:"white"}}>
<Toolbar
        sx={{
         
          minHeight: 72,
          px: { xs: 2, md: 4 },
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: "#1f2a44" }}
        >
          IonTrip
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
         
          <Button
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#1f2a44",
              fontWeight: 600,
              px: 2.5,
              "&:hover": { bgcolor: "#182038" },
            }}
          >
            login or Sign up
          </Button>
        </Box>
      </Toolbar>
</Box>
  );
}
