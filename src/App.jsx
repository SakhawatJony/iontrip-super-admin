

import React from "react";
import Box from "@mui/material/Box";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./shared/Navbar.jsx";
import Footer from "./shared/Footer.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import AllDeposit from "./admin/AllDeposit.jsx";
import AllFlightBooking from "./admin/AllFlightBooking.jsx";
import AllAgent from "./admin/AllAgent.jsx";

export default function App() {
  const location = useLocation();
  const hideChrome = location.pathname.startsWith("/dashboard");

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {!hideChrome && <Navbar />}
      <Box sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="alldeposit" element={<AllDeposit />} />
            <Route path="flightbookings" element={<AllFlightBooking />} />
            <Route path="customer/allagent" element={<AllAgent />} />
          </Route>
        </Routes>
      </Box>
      {!hideChrome && <Footer />}
    </Box>
  );
}
