import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import logoPng from "../assets/updatedslogo2.png";

export default function Navbar() {
  return (
<Box sx={{ bgcolor: "var(--primary-dark, #024DAF)" }}>
<Toolbar
        sx={{
         
          minHeight: 72,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          component="img"
          src={logoPng}
          alt="IonTrip"
          sx={{
            height: { xs: 36, sm: 40 },
            width: "auto",
            maxWidth: 200,
            objectFit: "contain",
            display: "block",
          }}
        />
        <Box sx={{ flexGrow: 1 }} />
        {/* <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
         
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
        </Box> */}
      </Toolbar>
</Box>
  );
}
