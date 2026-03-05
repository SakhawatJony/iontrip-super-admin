import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography, CircularProgress } from "@mui/material";
import { useLocation } from "react-router-dom";

import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import BookingQueDetailsCard from "./BookingQueDetailsCard";
import BookingQuePassengerList from "./BookingQuePassengerList";
import BookingQueFareDetails from "./BookingQueFareDetails";
import BookingQueSupport from "./BookingQueSupport";
import BookingQueSessionTime from "./BookingQueSessionTime";
import BookingQueInfoSection from "./BookingQueInfoSection";

const BookingQueDetails = () => {
  const location = useLocation();
  const { token, user } = useAuth();
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://iontrip-backend-production.up.railway.app";

  const bookingId = location.state?.bookingId || "";
  const superAdminEmail = location.state?.email || user?.email || "";

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("Booking ID missing.");
        return;
      }

      if (!superAdminEmail) {
        setError("Super admin email missing. Please login again.");
        return;
      }

      const superAdminToken = token || localStorage.getItem("adminToken") || "";
      if (!superAdminToken) {
        setError("Super admin token missing. Please login again.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        // Pass bookingId as path parameter for admin endpoint
        const response = await axios.get(`${baseUrl}/booking/admin/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${superAdminToken}`,
            "Content-Type": "application/json",
          },
        });

        setBookingData(response?.data || response?.data?.data || null);
      } catch (err) {
        const apiMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load booking details.";
        setError(apiMessage);
        console.error("Fetch booking details failed:", err?.response?.data || err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, superAdminEmail, token, baseUrl]);
  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: "#0F2F56" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography sx={{ fontSize: 14, color: "#d32f2f" }}>{error}</Typography>
      </Box>
    );
  }

  if (!bookingData) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Typography sx={{ fontSize: 14, color: "#6B7280" }}>No booking data found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", px: 4, py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={9}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <BookingQueInfoSection data={bookingData} />
            <BookingQueDetailsCard data={bookingData} />
            <BookingQuePassengerList data={bookingData} />
          </Box>
        </Grid>

        <Grid item xs={12} lg={3}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <BookingQueFareDetails data={bookingData} />
            <BookingQueSupport />
            <BookingQueSessionTime data={bookingData} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingQueDetails;
