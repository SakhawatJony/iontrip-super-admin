import { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopbar from "./AdminTopbar.jsx";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box>
        <Grid container sx={{ minHeight: "100vh", flexWrap: { xs: "wrap", md: "nowrap" } }}>
          <Grid
            item
            xs={12}
            md="auto"
            sx={{
              minHeight: "100vh",
              width: { xs: sidebarCollapsed ? 72 : "100%", md: sidebarCollapsed ? 72 : 260 },
              flexShrink: 0,
              transition: "width 0.2s ease",
            }}
          >
            <AdminSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            md
            sx={{
              flex: 1,
              minWidth: 0,
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
