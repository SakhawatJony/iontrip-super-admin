import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopbar from "./AdminTopbar.jsx";

export default function AdminLayout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box>
        <Grid container sx={{ minHeight: "100vh" }}>
          <Grid item xs={12} md={2} sx={{ minHeight: "100vh" }}>
            <AdminSidebar />
          </Grid>
          <Grid item xs={12} md={10}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <AdminTopbar />
              <Box
                sx={{
                  borderRadius: 1,
                  p: { xs: 2, md: 5 },
                }}
              >
                <Outlet />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
