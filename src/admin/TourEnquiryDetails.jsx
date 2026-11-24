import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, CircularProgress, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { BQ, bqCardSx, bqLabelSx, bqSidebarBtnSx, bqValueSx } from "./booingInfo/bookingQueTheme.js";
import { BqAccentTitle, BqStatusPill } from "./booingInfo/bookingQueUi.jsx";

const ENQUIRY_API = "https://api.iontrip.com/admin/tour-package-enquiries";

function pickText(...values) {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function unwrapEnquiry(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (payload.enquiry && typeof payload.enquiry === "object") return payload.enquiry;
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    if (payload.data.enquiry && typeof payload.data.enquiry === "object") return payload.data.enquiry;
    return payload.data;
  }
  return payload;
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("confirm") || s.includes("complete") || s.includes("success")) {
    return { bg: "#E8F5E9", color: "#2E7D32" };
  }
  if (s.includes("cancel") || s.includes("reject") || s.includes("fail")) {
    return { bg: BQ.expiredBg, color: BQ.expired };
  }
  if (s.includes("pending") || s.includes("process") || s.includes("submit") || s.includes("hold")) {
    return { bg: BQ.holdOrangeBg, color: "#B45309" };
  }
  return { bg: BQ.accentSoft, color: BQ.navy };
}

function DetailField({ label, value, icon: Icon, copyable = false }) {
  const [copied, setCopied] = useState(false);
  const display = pickText(value) || "N/A";

  const handleCopy = async () => {
    if (display === "N/A") return;
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy.");
    }
  };

  return (
    <Box
      sx={{
        border: `1px solid ${BQ.border}`,
        borderRadius: "6px",
        bgcolor: BQ.fieldBg,
        px: 1.25,
        py: 1,
        minHeight: 52,
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.35 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
          {Icon ? <Icon sx={{ fontSize: 13, color: BQ.actionBlue, flexShrink: 0 }} /> : null}
          <Typography sx={bqLabelSx}>{label}</Typography>
        </Box>
        {copyable ? (
          <Tooltip title={copied ? "Copied!" : "Copy"}>
            <IconButton size="small" onClick={handleCopy} sx={{ p: 0.15, color: BQ.muted, mt: -0.25 }}>
              <ContentCopyIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>
      <Typography sx={{ ...bqValueSx, wordBreak: "break-word" }}>{display}</Typography>
    </Box>
  );
}

export default function TourEnquiryDetails() {
  const navigate = useNavigate();
  const { enquiryId: enquiryIdParam } = useParams();
  const { token } = useAuth();
  const enquiryId = String(enquiryIdParam || "").trim();

  const [enquiry, setEnquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEnquiry = useCallback(async () => {
    if (!enquiryId) {
      setError("Enquiry ID missing.");
      setLoading(false);
      return;
    }

    const authToken = String(token || localStorage.getItem("adminToken") || "").trim();
    if (!authToken) {
      setError("Admin token missing. Please login again.");
      setLoading(false);
      toast.error("Admin token missing. Please login again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${ENQUIRY_API}/${encodeURIComponent(enquiryId)}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      });
      const item = unwrapEnquiry(response?.data);
      if (!item) {
        setEnquiry(null);
        setError("Enquiry not found.");
        return;
      }
      setEnquiry(item);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to load enquiry.";
      const text = Array.isArray(message) ? message.join(", ") : String(message);
      setError(text);
      setEnquiry(null);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  }, [enquiryId, token]);

  useEffect(() => {
    fetchEnquiry();
  }, [fetchEnquiry]);

  const nestedPackage = enquiry?.tourPackage || enquiry?.package || enquiry?.tour_package || {};
  const resolvedId = pickText(enquiry?.enquiryId, enquiry?.enquiry_id, enquiryId);
  const packageId = pickText(
    enquiry?.packageId,
    enquiry?.package_id,
    enquiry?.tourPackageId,
    nestedPackage?.packageId,
  );
  const packageTitle = pickText(
    enquiry?.packageTitle,
    enquiry?.packageName,
    nestedPackage?.title,
    nestedPackage?.name,
  );
  const location = pickText(enquiry?.location, nestedPackage?.location, enquiry?.destination);
  const status = pickText(enquiry?.status) || "Submitted";
  const colors = statusStyle(status);
  const name = pickText(
    enquiry?.customerName,
    enquiry?.name,
    enquiry?.fullName,
    enquiry?.userName,
    [enquiry?.firstName, enquiry?.lastName].filter(Boolean).join(" "),
  );
  const email = pickText(enquiry?.email, enquiry?.customerEmail, enquiry?.user?.email);
  const phone = pickText(enquiry?.phone, enquiry?.mobile, enquiry?.phoneNumber);
  const message = pickText(enquiry?.note, enquiry?.message, enquiry?.remarks, enquiry?.comment);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BQ.pageBg, pb: 4 }}>
      <Box
        sx={{
          bgcolor: BQ.navBar,
          px: { xs: 1.5, md: 2 },
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => navigate("/dashboard/tour/bookinghistory")}
            sx={{ color: "#fff", p: 0.75 }}
            aria-label="Back"
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
            Tour Enquiry Details
          </Typography>
        </Box>
        <Button
          startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <RefreshIcon />}
          onClick={fetchEnquiry}
          disabled={loading}
          variant="outlined"
          size="small"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 12,
            color: "#fff",
            borderColor: "rgba(255,255,255,0.45)",
            "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
          }}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1.25, md: 1.75 }, pt: 1.5 }}>
        {loading && !enquiry ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={32} sx={{ color: BQ.navy }} />
          </Box>
        ) : error && !enquiry ? (
          <Box sx={{ ...bqCardSx, p: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: BQ.expired, mb: 1.5 }}>{error}</Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/tour/bookinghistory")}
              sx={{ ...bqSidebarBtnSx, bgcolor: BQ.navy, color: "#fff", justifyContent: "center" }}
            >
              Back to Booking History
            </Button>
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            <Grid item xs={12} lg={8}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={bqCardSx}>
                  <Box
                    sx={{
                      bgcolor: BQ.navy,
                      px: 1.75,
                      py: 1.25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
                        Enquiry Overview
                      </Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                        {resolvedId}
                      </Typography>
                    </Box>
                    <BqStatusPill color={colors.color} bg={colors.bg}>
                      {status.replace(/_/g, " ")}
                    </BqStatusPill>
                  </Box>
                  <Grid container spacing={1.25} sx={{ p: 1.5 }}>
                    <Grid item xs={12} sm={6} md={4}>
                      <DetailField label="Enquiry ID" value={resolvedId} icon={ConfirmationNumberOutlinedIcon} copyable />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <DetailField label="Package ID" value={packageId} icon={LuggageOutlinedIcon} copyable />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <DetailField label="Status" value={status.replace(/_/g, " ")} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <DetailField label="Created" value={formatDateTime(enquiry?.createdAt || enquiry?.created_at || enquiry?.submittedAt)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <DetailField label="Updated" value={formatDateTime(enquiry?.updatedAt || enquiry?.updated_at)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <DetailField label="Travel date" value={pickText(enquiry?.travelDate, enquiry?.startDate, enquiry?.departureDate)} />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <BqAccentTitle title="Customer" />
                  <Grid container spacing={1.25}>
                    <Grid item xs={12} sm={4}>
                      <DetailField label="Name" value={name} icon={PersonOutlineIcon} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DetailField label="Email" value={email} icon={EmailOutlinedIcon} copyable />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <DetailField label="Phone" value={phone} icon={PhoneOutlinedIcon} copyable />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField label="Adults" value={pickText(enquiry?.adults, enquiry?.adultCount)} />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField label="Children" value={pickText(enquiry?.children, enquiry?.childCount)} />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <BqAccentTitle title="Package" />
                  <Grid container spacing={1.25}>
                    <Grid item xs={12} sm={6}>
                      <DetailField label="Title" value={packageTitle} icon={LuggageOutlinedIcon} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailField label="Location" value={location} icon={PlaceOutlinedIcon} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailField label="Country" value={pickText(enquiry?.country, nestedPackage?.country)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailField
                        label="Duration"
                        value={
                          nestedPackage?.durationDays || enquiry?.durationDays
                            ? `${nestedPackage?.durationDays || enquiry?.durationDays || ""}D / ${nestedPackage?.durationNights || enquiry?.durationNights || ""}N`
                            : ""
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <BqAccentTitle title="Message" />
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: BQ.value, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {message || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.25,
                  position: { lg: "sticky" },
                  top: { lg: 12 },
                }}
              >
                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <BqAccentTitle title="Summary" />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <DetailField label="Enquiry ID" value={resolvedId} copyable />
                    <DetailField label="Customer" value={name} />
                    <DetailField label="Package" value={packageTitle || packageId} />
                    <DetailField label="Created" value={formatDateTime(enquiry?.createdAt || enquiry?.created_at)} />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.75 }}>
                    {packageId ? (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<LuggageOutlinedIcon />}
                        onClick={() => navigate(`/dashboard/tour/packagedetails/${encodeURIComponent(packageId)}`)}
                        sx={{ ...bqSidebarBtnSx, bgcolor: BQ.actionBlue, color: "#fff", "&:hover": { bgcolor: BQ.actionBlueHover } }}
                      >
                        View Package
                      </Button>
                    ) : null}
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => navigate("/dashboard/tour/bookinghistory")}
                      sx={{ ...bqSidebarBtnSx, borderColor: BQ.navy, color: BQ.navy }}
                    >
                      Back to Booking History
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
