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
          <Grid
            item
            xs={12}
            md={10}
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
              bgcolor: "#F4F7F6",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <AdminTopbar />
              <Box
                sx={{
                  flex: 1,
                  p: { xs: 2, md: 3 },
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
