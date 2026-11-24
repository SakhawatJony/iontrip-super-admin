import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RefreshIcon from "@mui/icons-material/Refresh";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext.jsx";
import { TOUR_API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import { BQ, bqCardSx, bqLabelSx, bqValueSx, bqSidebarBtnSx } from "./booingInfo/bookingQueTheme.js";

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const text = value.trim();
    if (!text) return [];
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return text ? [text] : [];
    }
  }
  return [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function pickFirst(...values) {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function displayValue(value) {
  const text = String(value ?? "").trim();
  return text || "N/A";
}

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return displayValue(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return displayValue(value);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(amount, currency = "BDT") {
  if (amount == null || amount === "") return "N/A";
  const num = Number(amount);
  const cur = String(currency || "BDT").trim() || "BDT";
  if (Number.isNaN(num)) return `${displayValue(amount)} ${cur}`;
  return `${num.toLocaleString("en-US")} ${cur}`;
}

function resolveMediaUrl(raw) {
  const src = String(raw || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("/")) return `${TOUR_API_BASE_URL}${src}`;
  return `${TOUR_API_BASE_URL}/${src.replace(/^\/+/, "")}`;
}

function unwrapPackage(payload) {
  if (!payload) return null;
  if (payload?.package && typeof payload.package === "object") return payload.package;
  if (payload?.data?.package && typeof payload.data.package === "object") return payload.data.package;
  if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    if (payload.data.title || payload.data.packageId || payload.data._id) return payload.data;
  }
  if (payload?.title || payload?.packageId || payload?._id || payload?.id) return payload;
  return null;
}

function FieldBox({ label, value, copyable = false }) {
  const [copied, setCopied] = useState(false);
  const display = displayValue(value);

  const handleCopy = async () => {
    if (!display || display === "N/A") return;
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
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
        <Typography sx={bqLabelSx}>{label}</Typography>
        {copyable && display !== "N/A" ? (
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

function SectionCard({ title, right, children, headerNavy = false }) {
  return (
    <Box sx={bqCardSx}>
      <Box
        sx={{
          bgcolor: headerNavy ? BQ.navy : "transparent",
          px: 1.75,
          py: headerNavy ? 1.1 : 1.25,
          borderBottom: headerNavy ? "none" : `1px solid ${BQ.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {!headerNavy ? (
            <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: BQ.navy, flexShrink: 0 }} />
          ) : null}
          <Typography
            sx={{
              fontSize: headerNavy ? 12 : 14,
              fontWeight: 700,
              color: headerNavy ? "#fff" : BQ.text,
            }}
          >
            {title}
          </Typography>
        </Box>
        {right}
      </Box>
      <Box sx={{ p: 1.5 }}>{children}</Box>
    </Box>
  );
}

function StatusChip({ label, active, activeBg, activeColor }) {
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 24,
        fontSize: 11,
        fontWeight: 700,
        bgcolor: active ? activeBg : "#F1F5F9",
        color: active ? activeColor : BQ.muted,
      }}
    />
  );
}

function StringList({ items, empty = "N/A" }) {
  const list = asArray(items).map((v) => String(v || "").trim()).filter(Boolean);
  if (!list.length) {
    return <Typography sx={{ fontSize: 12, color: BQ.muted }}>{empty}</Typography>;
  }
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.25, display: "flex", flexDirection: "column", gap: 0.5 }}>
      {list.map((item, idx) => (
        <Typography component="li" key={`${item}-${idx}`} sx={{ fontSize: 12.5, color: BQ.text, lineHeight: 1.45 }}>
          {item}
        </Typography>
      ))}
    </Box>
  );
}

function GallerySlider({ images }) {
  const urls = useMemo(
    () => asArray(images).map(resolveMediaUrl).filter(Boolean),
    [images],
  );
  const [index, setIndex] = useState(0);
  const safeIndex = urls.length ? index % urls.length : 0;

  if (!urls.length) {
    return (
      <Box
        sx={{
          height: 180,
          borderRadius: "8px",
          bgcolor: BQ.fieldBg,
          border: `1px solid ${BQ.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LuggageOutlinedIcon sx={{ fontSize: 36, color: BQ.muted }} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        component="img"
        src={urls[safeIndex]}
        alt="Gallery"
        sx={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          borderRadius: "8px",
          display: "block",
          border: `1px solid ${BQ.border}`,
        }}
      />
      {urls.length > 1 ? (
        <>
          <IconButton
            size="small"
            onClick={() => setIndex((prev) => (prev - 1 + urls.length) % urls.length)}
            sx={{
              position: "absolute",
              left: 6,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.9)",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIndex((prev) => (prev + 1) % urls.length)}
            sx={{
              position: "absolute",
              right: 6,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.9)",
              "&:hover": { bgcolor: "#fff" },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </>
      ) : null}
      <Typography sx={{ fontSize: 11, color: BQ.muted, mt: 0.75, textAlign: "center" }}>
        {safeIndex + 1} / {urls.length}
      </Typography>
    </Box>
  );
}

export default function TourPackageDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { token } = useAuth();

  const packageId = String(
    params.packageId ||
      location.state?.packageId ||
      new URLSearchParams(location.search).get("packageId") ||
      "",
  ).trim();

  const [pkg, setPkg] = useState(location.state?.packageData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverBroken, setCoverBroken] = useState(false);

  const authHeaders = useCallback(() => {
    const authToken = token || localStorage.getItem("adminToken") || "";
    return {
      Authorization: `Bearer ${authToken}`,
      Accept: "application/json",
    };
  }, [token]);

  const fetchDetails = useCallback(async () => {
    if (!packageId) {
      setError("Package ID is missing.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${TOUR_API_BASE_URL}${API_ENDPOINTS.TOUR_PACKAGE_BY_ID(packageId)}`, {
        headers: authHeaders(),
      });
      const data = unwrapPackage(response.data);
      if (!data) {
        setPkg(null);
        setError("Tour package not found.");
        return;
      }
      setPkg(data);
      setCoverBroken(false);
    } catch (err) {
      console.error("Failed to load tour package:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load tour package.";
      setError(Array.isArray(msg) ? msg.join(", ") : String(msg));
      setPkg((prev) => prev || null);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, packageId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const coverUrl = useMemo(() => {
    return resolveMediaUrl(
      pickFirst(
        pkg?.coverImageURL,
        pkg?.coverImage,
        pkg?.coverUrl,
        pkg?.imageURL,
        pkg?.image,
      ),
    );
  }, [pkg]);

  const galleryImages = useMemo(() => {
    const gallery = asArray(
      pkg?.galleryImageURLs ||
        pkg?.galleryImages ||
        pkg?.gallery ||
        pkg?.images,
    );
    return gallery.length ? gallery : coverUrl ? [coverUrl] : [];
  }, [pkg, coverUrl]);

  const currency = pkg?.currency || "BDT";
  const displayPackageId = pickFirst(pkg?.packageId, packageId, pkg?.id, pkg?._id);
  const recordId = pickFirst(pkg?.packageId, packageId, pkg?.id, pkg?._id);

  const handleDelete = async () => {
    if (!recordId) {
      toast.error("Package id missing.");
      return;
    }
    const result = await Swal.fire({
      title: "Delete tour package?",
      text: `"${pkg?.title || recordId}" will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: BQ.cancelRed,
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.delete(
        `https://api.iontrip.com/admin/tour-packages/${encodeURIComponent(recordId)}`,
        { headers: authHeaders() },
      );
      toast.success("Tour package deleted.");
      navigate("/dashboard/tour/alltour");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete tour package.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : String(msg));
      setLoading(false);
    }
  };

  const highlights = asArray(pkg?.highlights);
  const itinerary = asArray(pkg?.itinerary);
  const hotels = asArray(pkg?.hotels);
  const faqs = asArray(pkg?.faqs);
  const routeStops = asArray(pkg?.route);
  const tags = asArray(pkg?.tags);
  const locations = asArray(pkg?.locations);
  const startDates = asArray(pkg?.startDates);
  const includes = asArray(pkg?.includes);
  const excludes = asArray(pkg?.excludes);

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
            onClick={() => navigate("/dashboard/tour/alltour")}
            sx={{ color: "#fff", p: 0.75 }}
            aria-label="Back"
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
            Tour Package Details
          </Typography>
        </Box>
        <Button
          startIcon={loading ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <RefreshIcon />}
          onClick={fetchDetails}
          disabled={loading || !packageId}
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
        {loading && !pkg ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={32} sx={{ color: BQ.navy }} />
          </Box>
        ) : error && !pkg ? (
          <Box sx={{ ...bqCardSx, p: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#d32f2f", mb: 1.5 }}>{error}</Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/tour/alltour")}
              sx={{ ...bqSidebarBtnSx, bgcolor: BQ.navy, color: "#fff", justifyContent: "center" }}
            >
              Back to All Tours
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "6px",
                          bgcolor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {coverUrl && !coverBroken ? (
                          <Box
                            component="img"
                            src={coverUrl}
                            alt={pkg?.title || "Package"}
                            onError={() => setCoverBroken(true)}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <LuggageOutlinedIcon sx={{ fontSize: 18, color: BQ.navy }} />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>
                          Package Overview
                        </Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
                          {displayValue(pkg?.title)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      <StatusChip
                        label={pkg?.isActive ? "Active" : "Inactive"}
                        active={Boolean(pkg?.isActive)}
                        activeBg="#DCFCE7"
                        activeColor="#166534"
                      />
                      {pkg?.isFeatured ? (
                        <StatusChip label="Featured" active activeBg="#E8F1FF" activeColor={BQ.actionBlue} />
                      ) : null}
                      {pkg?.isBestseller ? (
                        <StatusChip label="Bestseller" active activeBg="#FFF4E5" activeColor="#B45309" />
                      ) : null}
                    </Box>
                  </Box>

                  <Grid container spacing={1.25} sx={{ p: 1.5 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="ID" value={pkg?.id} copyable />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Package ID" value={displayPackageId} copyable />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Title" value={pkg?.title} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Subtitle" value={pkg?.subtitle} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Location" value={pkg?.location} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Country" value={pkg?.country} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Category" value={pkg?.category} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox
                        label="Duration"
                        value={
                          pkg?.durationDays != null || pkg?.durationNights != null
                            ? `${pkg?.durationDays ?? "—"} Days / ${pkg?.durationNights ?? "—"} Nights`
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Price / Person" value={formatMoney(pkg?.pricePerPerson, currency)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Currency" value={pkg?.currency} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox
                        label="Discount %"
                        value={pkg?.discountPercent != null ? `${pkg.discountPercent}%` : ""}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Original Price" value={formatMoney(pkg?.originalPrice, currency)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Rating" value={pkg?.rating} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Review Count" value={pkg?.reviewCount} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Ideal For" value={pkg?.idealFor} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Video URL" value={pkg?.videoURL} copyable />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <FieldBox label="isActive" value={pkg?.isActive == null ? "" : String(pkg.isActive)} />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <FieldBox label="isFeatured" value={pkg?.isFeatured == null ? "" : String(pkg.isFeatured)} />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                      <FieldBox label="isBestseller" value={pkg?.isBestseller == null ? "" : String(pkg.isBestseller)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Created At" value={formatDateTime(pkg?.createdAt || pkg?.created_at)} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FieldBox label="Updated At" value={formatDateTime(pkg?.updatedAt || pkg?.updated_at)} />
                    </Grid>
                  </Grid>
                </Box>

                <SectionCard title="Description">
                  <Typography sx={{ fontSize: 12.5, color: BQ.text, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                    {displayValue(pkg?.description)}
                  </Typography>
                </SectionCard>

                <SectionCard title="Notice">
                  <Typography sx={{ fontSize: 12.5, color: BQ.text, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                    {displayValue(pkg?.notice)}
                  </Typography>
                </SectionCard>

                <SectionCard title="Policy">
                  <Typography sx={{ fontSize: 12.5, color: BQ.text, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                    {displayValue(pkg?.policy)}
                  </Typography>
                </SectionCard>

                <SectionCard title="Locations">
                  <Typography sx={{ ...bqLabelSx, mb: 0.75 }}>Primary Location</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: BQ.value, mb: 1.25 }}>
                    {displayValue(pkg?.location)}
                  </Typography>
                  <Typography sx={{ ...bqLabelSx, mb: 0.75 }}>Additional Locations (locations[])</Typography>
                  <StringList items={locations} empty="N/A" />
                </SectionCard>

                <SectionCard title="Start Dates">
                  <StringList items={startDates.map(formatDate)} empty="N/A" />
                </SectionCard>

                <SectionCard title="Cover Image">
                  {coverUrl ? (
                    <Box
                      component="img"
                      src={coverUrl}
                      alt="Cover"
                      sx={{
                        width: "100%",
                        maxHeight: 280,
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: `1px solid ${BQ.border}`,
                      }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>N/A</Typography>
                  )}
                  <Box sx={{ mt: 1 }}>
                    <FieldBox label="coverImageURL" value={pkg?.coverImageURL || coverUrl} copyable />
                  </Box>
                </SectionCard>

                <SectionCard title={`Gallery Images (${galleryImages.length})`}>
                  {galleryImages.length ? (
                    <Grid container spacing={1}>
                      {galleryImages.map((url, idx) => {
                        const src = resolveMediaUrl(url);
                        return (
                          <Grid item xs={6} sm={4} md={3} key={`gal-${idx}`}>
                            <Box
                              component="img"
                              src={src}
                              alt={`Gallery ${idx + 1}`}
                              sx={{
                                width: "100%",
                                height: 100,
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: `1px solid ${BQ.border}`,
                                display: "block",
                              }}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>N/A</Typography>
                  )}
                </SectionCard>

                <SectionCard title="Tags">
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {tags.length ? (
                      tags.map((tag, idx) => (
                        <Chip
                          key={`${tag}-${idx}`}
                          size="small"
                          label={String(tag)}
                          sx={{ height: 24, fontSize: 11, fontWeight: 600, bgcolor: BQ.accentSoft, color: BQ.navy }}
                        />
                      ))
                    ) : (
                      <Typography sx={{ fontSize: 12, color: BQ.muted }}>N/A</Typography>
                    )}
                  </Box>
                </SectionCard>

                <SectionCard title="Highlights">
                  {highlights.length ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {highlights.map((item, idx) => {
                        const row = asObject(item);
                        return (
                          <Box
                            key={`hl-${idx}`}
                            sx={{
                              p: 1.25,
                              borderRadius: "6px",
                              border: `1px solid ${BQ.border}`,
                              bgcolor: BQ.fieldBg,
                            }}
                          >
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: BQ.value }}>
                              {displayValue(row.title || item)}
                            </Typography>
                            {row.description ? (
                              <Typography sx={{ fontSize: 12, color: BQ.muted, mt: 0.35 }}>
                                {row.description}
                              </Typography>
                            ) : null}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>N/A</Typography>
                  )}
                </SectionCard>

                <SectionCard title="Itinerary">
                  {itinerary.length ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {itinerary.map((item, idx) => {
                        const row = asObject(item);
                        const dayImage = resolveMediaUrl(row.imageURL || row.image);
                        return (
                          <Box
                            key={`it-${idx}`}
                            sx={{
                              p: 1.25,
                              borderRadius: "6px",
                              border: `1px solid ${BQ.border}`,
                              bgcolor: BQ.fieldBg,
                              display: "flex",
                              gap: 1.25,
                            }}
                          >
                            {dayImage ? (
                              <Box
                                component="img"
                                src={dayImage}
                                alt=""
                                sx={{
                                  width: 64,
                                  height: 64,
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                  flexShrink: 0,
                                  border: `1px solid ${BQ.border}`,
                                }}
                              />
                            ) : null}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: 11, fontWeight: 700, color: BQ.actionBlue }}>
                                Day {displayValue(row.day || idx + 1)}
                              </Typography>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: BQ.value, mt: 0.2 }}>
                                {displayValue(row.title)}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: BQ.muted, mt: 0.35, whiteSpace: "pre-wrap" }}>
                                {displayValue(row.description)}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>N/A</Typography>
                  )}
                </SectionCard>

                <SectionCard title="Includes & Excludes">
                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={6}>
                      <Typography sx={{ ...bqLabelSx, mb: 0.75 }}>Includes</Typography>
                      <StringList items={includes} empty="N/A" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography sx={{ ...bqLabelSx, mb: 0.75 }}>Excludes</Typography>
                      <StringList items={excludes} empty="N/A" />
                    </Grid>
                  </Grid>
                </SectionCard>

                <SectionCard title="Hotels">
                  {hotels.length ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {hotels.map((item, idx) => {
                        const row = asObject(item);
                        const hotelImage = resolveMediaUrl(row.imageURL || row.image);
                        return (
                          <Box
                            key={`hotel-${idx}`}
                            sx={{
                              p: 1.25,
                              borderRadius: "6px",
                              border: `1px solid ${BQ.border}`,
                              bgcolor: BQ.fieldBg,
                              display: "flex",
                              gap: 1.25,
                            }}
                          >
                            {hotelImage ? (
                              <Box
                                component="img"
                                src={hotelImage}
                                alt=""
                                sx={{
                                  width: 72,
                                  height: 56,
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                  flexShrink: 0,
                                  border: `1px solid ${BQ.border}`,
                                }}
                              />
                            ) : null}
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: BQ.value }}>
                                {displayValue(row.name)}
                              </Typography>
                              <Typography sx={{ fontSize: 11, color: BQ.muted, mt: 0.25 }}>
                                {row.stars != null ? `${row.stars}★ · ` : ""}
                                {displayValue(row.location)}
                              </Typography>
                              {row.description ? (
                                <Typography sx={{ fontSize: 12, color: BQ.text, mt: 0.35 }}>
                                  {row.description}
                                </Typography>
                              ) : null}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>N/A</Typography>
                  )}
                </SectionCard>

                <SectionCard title="Route">
                  {routeStops.length ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {routeStops.map((item, idx) => {
                        const row = asObject(item);
                        return (
                          <Box
                            key={`route-${idx}`}
                            sx={{
                              p: 1.1,
                              borderRadius: "6px",
                              border: `1px solid ${BQ.border}`,
                              bgcolor: BQ.fieldBg,
                            }}
                          >
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: BQ.value }}>
                              {displayValue(row.name || item)}
                            </Typography>
                            {row.label ? (
                              <Typography sx={{ fontSize: 12, color: BQ.muted, mt: 0.25 }}>{row.label}</Typography>
                            ) : null}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>N/A</Typography>
                  )}
                </SectionCard>

                <SectionCard title="FAQs">
                  {faqs.length ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {faqs.map((item, idx) => {
                        const row = asObject(item);
                        return (
                          <Box
                            key={`faq-${idx}`}
                            sx={{
                              p: 1.25,
                              borderRadius: "6px",
                              border: `1px solid ${BQ.border}`,
                              bgcolor: BQ.fieldBg,
                            }}
                          >
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: BQ.value }}>
                              {displayValue(row.question)}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: BQ.text, mt: 0.4, whiteSpace: "pre-wrap" }}>
                              {displayValue(row.answer)}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: 12, color: BQ.muted }}>N/A</Typography>
                  )}
                </SectionCard>
              </Box>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Box
                sx={{
                  position: { lg: "sticky" },
                  top: { lg: 12 },
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.25,
                }}
              >
                <Box sx={{ ...bqCardSx, p: 1.25 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.text, mb: 1 }}>
                    Cover & Gallery
                  </Typography>
                  <GallerySlider images={galleryImages} />
                </Box>

                <Box sx={{ ...bqCardSx, p: 1.5, bgcolor: BQ.supportBg }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: BQ.text, mb: 1 }}>
                    Quick Summary
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.85 }}>
                    <Box>
                      <Typography sx={bqLabelSx}>ID</Typography>
                      <Typography sx={bqValueSx}>{displayValue(pkg?.id)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Package ID</Typography>
                      <Typography sx={bqValueSx}>{displayValue(displayPackageId)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Title</Typography>
                      <Typography sx={bqValueSx}>{displayValue(pkg?.title)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Price</Typography>
                      <Typography sx={bqValueSx}>{formatMoney(pkg?.pricePerPerson, currency)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Original Price</Typography>
                      <Typography sx={bqValueSx}>{formatMoney(pkg?.originalPrice, currency)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Discount</Typography>
                      <Typography sx={bqValueSx}>
                        {pkg?.discountPercent != null ? `${pkg.discountPercent}%` : "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Duration</Typography>
                      <Typography sx={bqValueSx}>
                        {pkg?.durationDays != null || pkg?.durationNights != null
                          ? `${pkg?.durationDays ?? "—"} Days / ${pkg?.durationNights ?? "—"} Nights`
                          : "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Location</Typography>
                      <Typography sx={bqValueSx}>
                        {[pkg?.location, pkg?.country].filter(Boolean).join(", ") || "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Category</Typography>
                      <Typography sx={bqValueSx}>{displayValue(pkg?.category)}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Start Dates</Typography>
                      <Typography sx={bqValueSx}>
                        {startDates.length ? startDates.map(formatDate).join(", ") : "N/A"}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={bqLabelSx}>Flags</Typography>
                      <Typography sx={bqValueSx}>
                        {[
                          pkg?.isActive ? "Active" : "Inactive",
                          pkg?.isFeatured ? "Featured" : null,
                          pkg?.isBestseller ? "Bestseller" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ ...bqCardSx, p: 1.25, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate("/dashboard/tour/alltour")}
                    sx={{
                      ...bqSidebarBtnSx,
                      bgcolor: BQ.actionBlue,
                      color: "#fff",
                      justifyContent: "center",
                      "&:hover": { bgcolor: BQ.actionBlueHover },
                    }}
                  >
                    Back to All Tours
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={handleDelete}
                    disabled={loading}
                    sx={{
                      ...bqSidebarBtnSx,
                      borderColor: BQ.cancelRed,
                      color: BQ.cancelRed,
                      justifyContent: "center",
                    }}
                  >
                    Delete Package
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
