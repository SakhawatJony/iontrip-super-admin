import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { BQ, bqCardSx, bqLabelSx, bqValueSx, bqSidebarBtnSx } from "./booingInfo/bookingQueTheme.js";

function pickArray(...candidates) {
  for (const value of candidates) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeVisaBookingDetail(payload) {
  if (!payload || typeof payload !== "object") return null;

  const candidates = [
    payload?.data?.booking,
    payload?.data?.data?.booking,
    payload?.data?.result,
    payload?.data?.data,
    payload?.booking,
    payload?.result,
    payload?.data,
    payload,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const looksLikeBooking =
      candidate.bookingId ||
      candidate.visaBookingId ||
      candidate.visaId ||
      candidate.visaVariantId ||
      candidate.applicants ||
      candidate.applicantName ||
      candidate.visa ||
      candidate.visaVariant ||
      candidate.status ||
      candidate.bookingStatus;
    if (looksLikeBooking) return candidate;
  }

  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate) && Object.keys(candidate).length > 0) {
      return candidate;
    }
  }

  return null;
}

function formatValue(value) {
  if (value == null || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveApplicants(booking) {
  if (!booking || typeof booking !== "object") return [];

  const list = pickArray(
    booking?.applicants,
    booking?.applicantList,
    booking?.travelers,
    booking?.passengers,
    booking?.data?.applicants,
  );

  if (list.length > 0) {
    return list.map((row, index) => ({
      applicantName: row?.applicantName || row?.name || row?.fullName || `Applicant ${index + 1}`,
      applicantEmail: row?.applicantEmail || row?.email || "",
      applicantPhone: row?.applicantPhone || row?.phone || row?.mobile || "",
      passportNumber: row?.passportNumber || row?.passportNo || row?.passport || "",
      occupation: row?.occupation || row?.profession || "",
      notes: row?.notes || row?.note || "",
      nationality: row?.nationality || "",
      dateOfBirth: row?.dateOfBirth || row?.dob || "",
    }));
  }

  if (booking?.applicantName || booking?.applicantEmail || booking?.passportNumber || booking?.passportNo) {
    return [
      {
        applicantName: booking?.applicantName || booking?.applicant || booking?.name || "",
        applicantEmail: booking?.applicantEmail || booking?.email || "",
        applicantPhone: booking?.applicantPhone || booking?.phone || booking?.mobile || "",
        passportNumber: booking?.passportNumber || booking?.passportNo || "",
        occupation: booking?.occupation || booking?.profession || "",
        notes: booking?.notes || "",
        nationality: booking?.nationality || "",
        dateOfBirth: booking?.dateOfBirth || booking?.dob || "",
      },
    ];
  }

  return [];
}

function resolveDocuments(booking) {
  const applicants = resolveApplicants(booking);
  const docs = pickArray(
    booking?.documents,
    booking?.uploadedDocuments,
    booking?.visaDocuments,
    booking?.documentList,
    ...applicants.map((a) => a?.documents).filter(Boolean),
  );

  return docs.map((doc, index) => {
    if (typeof doc === "string") return { name: doc, url: "" };
    return {
      name: doc?.documentName || doc?.name || doc?.title || doc?.label || `Document ${index + 1}`,
      url: doc?.url || doc?.fileUrl || doc?.documentUrl || doc?.path || "",
    };
  });
}

function formatAmount(booking) {
  const visa = booking?.visa || {};
  const variant = booking?.visaVariant || booking?.variant || {};
  const durationCost = booking?.durationCost || visa?.durationCost || {};
  const amount =
    booking?.totalCost ??
    booking?.totalAmount ??
    booking?.cost ??
    booking?.amount ??
    durationCost?.cost ??
    variant?.totalPrice ??
    variant?.visaFee ??
    null;
  if (amount == null || amount === "") return "-";
  const currency = booking?.currency || booking?.farecurrency || variant?.currency || "BDT";
  const numeric = Number(amount);
  if (Number.isFinite(numeric)) {
    return `${currency} ${numeric.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${currency} ${amount}`;
}

function getStatusColors(statusValue) {
  const s = String(statusValue || "").toLowerCase().trim();
  if (!s || s === "-") return { bg: "#F3F4F6", color: "#6B7280" };
  if (s.includes("confirm") || s.includes("complete") || s.includes("approved") || s.includes("success")) {
    return { bg: "#DCFCE7", color: "#166534" };
  }
  if (s.includes("pending") || s.includes("process") || s.includes("hold")) {
    return { bg: "#FEF3C7", color: "#92400E" };
  }
  if (s.includes("cancel") || s.includes("fail") || s.includes("reject") || s.includes("expired")) {
    return { bg: "#FEE2E2", color: "#991B1B" };
  }
  if (s.includes("refund")) return { bg: "#FFE4E6", color: "#9F1239" };
  return { bg: "#EAF2FF", color: "#0F2F56" };
}

function DetailField({ label, value, copyable = false }) {
  const [copied, setCopied] = useState(false);
  const display = formatValue(value);

  const handleCopy = async () => {
    if (!display || display === "-") return;
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={bqLabelSx}>{label}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
        <Typography sx={{ ...bqValueSx, wordBreak: "break-word" }}>{display}</Typography>
        {copyable && display !== "-" ? (
          <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25, color: BQ.muted }}>
            <ContentCopyIcon sx={{ fontSize: 13 }} />
          </IconButton>
        ) : null}
        {copied ? (
          <Typography sx={{ fontSize: 9, color: BQ.actionBlue, fontWeight: 600 }}>Copied</Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <Box sx={bqCardSx}>
      <Box
        sx={{
          bgcolor: BQ.navy,
          px: 1.75,
          py: 1.1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {Icon ? <Icon sx={{ fontSize: 16, color: "rgba(255,255,255,0.9)" }} /> : null}
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 1.75 }}>{children}</Box>
    </Box>
  );
}

export default function VisaBookingDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { token } = useAuth();

  const bookingId = String(
    params.bookingId || location.state?.bookingId || new URLSearchParams(location.search).get("bookingId") || "",
  ).trim();

  const [booking, setBooking] = useState(location.state?.bookingData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDetails = useCallback(async () => {
    if (!bookingId) {
      setError("Booking ID missing.");
      return;
    }

    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      setError("Authentication token missing. Please login again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.VISA_BOOKING_ADMIN_BY_ID(bookingId)}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
          },
        },
      );
      const normalized = normalizeVisaBookingDetail(response?.data);
      if (!normalized) {
        setError("Visa booking details not found.");
        setBooking(null);
        return;
      }
      setBooking(normalized);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load visa booking details.";
      const text = Array.isArray(message) ? message[0] : message;
      setError(text);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  }, [bookingId, token]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const applicants = useMemo(() => resolveApplicants(booking), [booking]);
  const documents = useMemo(() => resolveDocuments(booking), [booking]);
  const status = booking?.status || booking?.bookingStatus || "-";
  const statusColors = getStatusColors(status);
  const resolvedBookingId =
    booking?.bookingId || booking?.visaBookingId || booking?.id || bookingId || "-";
  const visa = booking?.visa || {};
  const variant = booking?.visaVariant || booking?.variant || {};
  const durationCost = booking?.durationCost || visa?.durationCost || {};

  return (
    <Box sx={{ minHeight: "100%", bgcolor: BQ.pageBg, pb: 4 }}>
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
            onClick={() => navigate("/dashboard/visa/bookinghistory")}
            sx={{ color: "#fff", p: 0.75 }}
            aria-label="Back"
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
            Visa Booking Details
          </Typography>
        </Box>
        <Button
          startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <RefreshIcon />}
          onClick={fetchDetails}
          disabled={loading || !bookingId}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: 12,
            color: "#fff",
            borderColor: "rgba(255,255,255,0.45)",
            "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
          }}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1.25, md: 1.75 }, pt: 1.5 }}>
        {loading && !booking ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={32} sx={{ color: BQ.navy }} />
          </Box>
        ) : error && !booking ? (
          <Box sx={{ ...bqCardSx, p: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#d32f2f", mb: 1.5 }}>{error}</Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/visa/bookinghistory")}
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
                        Booking Overview
                      </Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
                        {resolvedBookingId}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.45,
                        borderRadius: "999px",
                        bgcolor: statusColors.bg,
                        color: statusColors.color,
                        fontSize: 10.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.3,
                      }}
                    >
                      {String(status).replace(/_/g, " ")}
                    </Box>
                  </Box>
                  <Box sx={{ p: 1.75 }}>
                    <Grid container spacing={1.5}>
                      <Grid item xs={6} sm={4}>
                        <DetailField label="Booking ID" value={resolvedBookingId} copyable />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <DetailField label="Status" value={status} />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <DetailField label="Amount" value={formatAmount(booking)} />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <DetailField
                          label="User Email"
                          value={
                            booking?.userEmail ||
                            booking?.user?.email ||
                            booking?.email ||
                            applicants[0]?.applicantEmail
                          }
                          copyable
                        />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <DetailField
                          label="Submission Date"
                          value={formatDate(
                            booking?.submissionDate || booking?.submittedAt || booking?.createdAt,
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={4}>
                        <DetailField
                          label="Booking Time"
                          value={formatDateTime(
                            booking?.bookingTime || booking?.createdAt || booking?.updatedAt,
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                <SectionCard title="Visa Information" icon={PublicOutlinedIcon}>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6} sm={4}>
                      <DetailField
                        label="Destination"
                        value={
                          booking?.arrivalCountry ||
                          visa?.arrivalCountry ||
                          booking?.country ||
                          booking?.toCountry
                        }
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField
                        label="Departure Country"
                        value={
                          booking?.departureCountry ||
                          visa?.departureCountry ||
                          booking?.fromCountry
                        }
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField
                        label="Visa Category"
                        value={
                          booking?.visaCategory ||
                          visa?.visaCategory ||
                          booking?.visaType ||
                          variant?.visaType
                        }
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField
                        label="Visa Type"
                        value={booking?.visaType || visa?.visaType || booking?.category}
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField
                        label="Entry Type"
                        value={
                          booking?.entryType ||
                          visa?.entryType ||
                          variant?.entryType ||
                          durationCost?.entry ||
                          durationCost?.entryType
                        }
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField
                        label="Duration"
                        value={
                          durationCost?.duration ||
                          durationCost?.durationDays ||
                          booking?.duration ||
                          visa?.duration
                        }
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField
                        label="Processing Time"
                        value={
                          booking?.processingTime ||
                          booking?.processingSpeed ||
                          visa?.processingTime ||
                          variant?.processingSpeed
                        }
                      />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField label="Visa ID" value={booking?.visaId || visa?.visaId || visa?.id} />
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <DetailField
                        label="Visa Variant ID"
                        value={booking?.visaVariantId || variant?.visaVariantId || variant?.id}
                      />
                    </Grid>
                  </Grid>
                </SectionCard>

                {applicants.length === 0 ? (
                  <SectionCard title="Applicant Details" icon={PersonOutlineIcon}>
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>No applicant data</Typography>
                  </SectionCard>
                ) : (
                  applicants.map((applicant, index) => (
                    <SectionCard
                      key={`applicant-${index}`}
                      title={applicants.length > 1 ? `Applicant ${index + 1}` : "Applicant Details"}
                      icon={PersonOutlineIcon}
                    >
                      <Grid container spacing={1.5}>
                        <Grid item xs={6} sm={4}>
                          <DetailField label="Name" value={applicant.applicantName} />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <DetailField label="Email" value={applicant.applicantEmail} copyable />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <DetailField label="Phone" value={applicant.applicantPhone} />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <DetailField label="Passport No" value={applicant.passportNumber} copyable />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <DetailField label="Occupation" value={applicant.occupation} />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <DetailField label="Nationality" value={applicant.nationality} />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <DetailField label="Date of Birth" value={formatDate(applicant.dateOfBirth)} />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <DetailField label="Notes" value={applicant.notes} />
                        </Grid>
                      </Grid>
                    </SectionCard>
                  ))
                )}

                <SectionCard title="Documents" icon={DescriptionOutlinedIcon}>
                  {documents.length === 0 ? (
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>No documents uploaded</Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {documents.map((doc, index) => (
                        <Box
                          key={`${doc.name}-${index}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: BQ.fieldBg,
                            border: `1px solid ${BQ.border}`,
                          }}
                        >
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: BQ.text }}>
                            {doc.name}
                          </Typography>
                          {doc.url ? (
                            <Button
                              size="small"
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ textTransform: "none", fontSize: 11, fontWeight: 600 }}
                            >
                              View
                            </Button>
                          ) : (
                            <Typography sx={{ fontSize: 11, color: BQ.muted }}>-</Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </SectionCard>
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
                  <Typography sx={{ ...bqLabelSx, mb: 1 }}>Quick Summary</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18, color: BQ.actionBlue }} />
                      <Box>
                        <Typography sx={bqLabelSx}>Booking ID</Typography>
                        <Typography sx={bqValueSx}>{resolvedBookingId}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PaymentsOutlinedIcon sx={{ fontSize: 18, color: BQ.actionBlue }} />
                      <Box>
                        <Typography sx={bqLabelSx}>Amount</Typography>
                        <Typography sx={bqValueSx}>{formatAmount(booking)}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonOutlineIcon sx={{ fontSize: 18, color: BQ.actionBlue }} />
                      <Box>
                        <Typography sx={bqLabelSx}>Applicants</Typography>
                        <Typography sx={bqValueSx}>
                          {applicants.length || booking?.applicantCount || 1}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ ...bqCardSx, p: 1.75 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate("/dashboard/visa/bookinghistory")}
                    sx={{
                      ...bqSidebarBtnSx,
                      bgcolor: BQ.navy,
                      color: "#fff",
                      justifyContent: "center",
                      "&:hover": { bgcolor: BQ.navyDark },
                    }}
                  >
                    Back to History
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
}
