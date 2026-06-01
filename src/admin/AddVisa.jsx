import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import PaymentsIcon from "@mui/icons-material/Payments";
import DescriptionIcon from "@mui/icons-material/Description";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PublicIcon from "@mui/icons-material/Public";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const VISA_CATEGORIES = ["Tourist", "Business", "Student", "Work", "Transit", "Medical", "Other"];
const VISA_TYPES = ["Single-entry", "Double-entry", "Multiple-entry"];
const ENTRY_TYPES = ["Consulate", "E-Visa", "Visa on Arrival", "Embassy", "Online"];
const INTERVIEW_OPTIONS = ["Mandatory", "Optional", "Not Required", "Waived"];

const emptyDurationCost = () => ({
  cost: "",
  entry: "",
  duration: "",
  maximumStay: "",
  processingTime: "",
  interview: "",
  embassyFee: "",
  agentFee: "",
  serviceCharge: "",
  processingFee: "",
});

const emptyDocuments = () => ({
  profession: "",
  exceptionalCase: "",
  note: "",
});

const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
const MAX_DOCUMENT_SIZE_MB = 10;
const MAX_DOCUMENT_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function showApiErrorToasts(err, fallback = "Failed to create visa.") {
  const data = err?.response?.data;
  if (Array.isArray(data?.message) && data.message.length > 0) {
    data.message.forEach((msg) => toast.error(String(msg)));
    return;
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    toast.error(data.message);
    return;
  }
  if (typeof data?.error === "string" && data.error.trim()) {
    toast.error(data.error);
    return;
  }
  toast.error(err?.message || fallback);
}

function showApiSuccessToast(response, fallback = "Visa created successfully.") {
  const msg = response?.data?.message;
  if (typeof msg === "string" && msg.trim()) {
    toast.success(msg);
    return;
  }
  if (Array.isArray(msg) && msg.length > 0) {
    toast.success(String(msg[0]));
    return;
  }
  toast.success(fallback);
}

/** Matches MUI Outlined TextField height used in this form */
const INPUT_ROW_HEIGHT = 56;

function DocumentUploadZone({ files, onAdd, onRemove, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const validateAndAdd = (fileList) => {
    const incoming = Array.from(fileList || []);
    const valid = [];
    for (const file of incoming) {
      if (file.size > MAX_DOCUMENT_BYTES) {
        toast.error(`"${file.name}" exceeds ${MAX_DOCUMENT_SIZE_MB} MB.`);
        continue;
      }
      valid.push({ id: `${file.name}-${file.size}-${file.lastModified}`, file });
    }
    if (valid.length) onAdd(valid);
  };

  return (
    <Box>
      <Box
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) validateAndAdd(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          height: INPUT_ROW_HEIGHT,
          minHeight: INPUT_ROW_HEIGHT,
          maxHeight: INPUT_ROW_HEIGHT,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 1.5,
          textAlign: "center",
          border: "2px dashed",
          borderColor: dragOver ? "#024DAF" : "#CBD5E1",
          borderRadius: 2,
          bgcolor: dragOver ? "#F0F7FF" : "#FAFBFC",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          overflow: "hidden",
          transition: "border-color 0.2s, background-color 0.2s",
          "&:hover": disabled
            ? {}
            : {
                borderColor: "#024DAF",
                bgcolor: "#F8FAFF",
              },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept={DOCUMENT_ACCEPT}
          disabled={disabled}
          onChange={(e) => {
            validateAndAdd(e.target.files);
            e.target.value = "";
          }}
        />
        <CloudUploadOutlinedIcon sx={{ fontSize: 22, color: "#024DAF", mb: 0.25 }} />
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "#0F2F56",
            lineHeight: 1.15,
            px: 0.5,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {files.length === 0
            ? "Drop files here or click to browse"
            : files.length === 1
              ? files[0].file.name
              : `${files.length} files selected — click to add more`}
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
            color: "#64748B",
            lineHeight: 1.15,
            mt: 0.15,
            px: 0.5,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          PDF, Word, JPG, PNG — max {MAX_DOCUMENT_SIZE_MB} MB each
        </Typography>
      </Box>

      {files.length > 0 ? (
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {files.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ color: "#024DAF", fontSize: 22 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0F172A",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.file.name}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#64748B" }}>
                  {formatFileSize(item.file.size)}
                </Typography>
              </Box>
              <IconButton
                size="small"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                aria-label={`Remove ${item.file.name}`}
                sx={{ color: "#94A3B8", "&:hover": { color: "#E11D48" } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

const labelSx = {
  fontSize: 13,
  fontWeight: 600,
  color: "#0F2F56",
  mb: 0.75,
  display: "block",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontSize: 14,
    bgcolor: "#FAFBFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: "#024DAF", borderWidth: 2 },
  },
};

function SectionCard({ step, icon, title, subtitle, children, accent = "#024DAF" }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(15, 47, 86, 0.06)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          px: { xs: 2, md: 2.5 },
          py: 2,
          background: `linear-gradient(90deg, ${accent}14 0%, transparent 55%)`,
          borderBottom: "1px solid #EEF2F6",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: accent,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              component="span"
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                color: accent,
                bgcolor: `${accent}18`,
                px: 1,
                py: 0.25,
                borderRadius: 1,
              }}
            >
              Step {step}
            </Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>
              {title}
            </Typography>
          </Box>
          {subtitle ? (
            <Typography sx={{ fontSize: 13, color: "#64748B", mt: 0.5 }}>{subtitle}</Typography>
          ) : null}
        </Box>
      </Box>
      <Box sx={{ px: { xs: 2, md: 2.5 }, py: 2.5 }}>{children}</Box>
    </Box>
  );
}

export default function AddVisa() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const [departureCountry, setDepartureCountry] = useState("");
  const [arrivalCountry, setArrivalCountry] = useState("");
  const [visaCategory, setVisaCategory] = useState("");
  const [visaType, setVisaType] = useState("");
  const [cost, setCost] = useState("");

  const [durationCosts, setDurationCosts] = useState([emptyDurationCost()]);
  const [visaRequiredDocuments, setVisaRequiredDocuments] = useState(emptyDocuments());
  const [documentFiles, setDocumentFiles] = useState([]);

  const updateDuration = (index, field, value) => {
    setDurationCosts((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addDurationRow = () => {
    setDurationCosts((prev) => [...prev, emptyDurationCost()]);
  };

  const removeDurationRow = (index) => {
    if (durationCosts.length <= 1) {
      toast.info("At least one duration & pricing option is required.");
      return;
    }
    setDurationCosts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDocuments = (field, value) => {
    setVisaRequiredDocuments((prev) => ({ ...prev, [field]: value }));
  };

  const addDocumentFiles = (newItems) => {
    setDocumentFiles((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      for (const item of newItems) {
        if (!existing.has(item.id)) merged.push(item);
      }
      return merged;
    });
  };

  const removeDocumentFile = (id) => {
    setDocumentFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const buildPayload = () => {
    const parsedDurations = durationCosts.map((row) => ({
      cost: Number(row.cost),
      entry: String(row.entry || "").trim(),
      duration: String(row.duration || "").trim(),
      maximumStay: String(row.maximumStay || "").trim(),
      processingTime: String(row.processingTime || "").trim(),
      interview: String(row.interview || "").trim(),
      embassyFee: String(row.embassyFee || "").trim(),
      agentFee: String(row.agentFee || "").trim(),
      serviceCharge: String(row.serviceCharge || "").trim(),
      processingFee: String(row.processingFee || "").trim(),
    }));

    const documentNames = documentFiles.map(({ file }) => file.name).join(", ");

    return {
      departureCountry: departureCountry.trim(),
      arrivalCountry: arrivalCountry.trim(),
      visaCategory: visaCategory.trim(),
      visaType: visaType.trim(),
      cost: Number(cost),
      durationCosts: parsedDurations,
      visaRequiredDocuments: {
        profession: visaRequiredDocuments.profession.trim(),
        documents: documentNames,
        exceptionalCase: visaRequiredDocuments.exceptionalCase.trim(),
        note: visaRequiredDocuments.note.trim(),
      },
    };
  };

  const validate = () => {
    if (!departureCountry.trim()) {
      toast.error("Departure country is required.");
      return false;
    }
    if (!arrivalCountry.trim()) {
      toast.error("Arrival country is required.");
      return false;
    }
    if (!visaCategory) {
      toast.error("Visa category is required.");
      return false;
    }
    if (!visaType) {
      toast.error("Visa type is required.");
      return false;
    }
    if (cost === "" || Number.isNaN(Number(cost)) || Number(cost) < 0) {
      toast.error("Enter a valid base cost.");
      return false;
    }

    for (let i = 0; i < durationCosts.length; i += 1) {
      const row = durationCosts[i];
      if (row.cost === "" || Number.isNaN(Number(row.cost))) {
        toast.error(`Duration option ${i + 1}: cost is required.`);
        return false;
      }
      if (!row.entry || !row.duration || !row.maximumStay || !row.processingTime || !row.interview) {
        toast.error(`Duration option ${i + 1}: fill entry, duration, stay, processing time, and interview.`);
        return false;
      }
    }

    if (!visaRequiredDocuments.profession.trim()) {
      toast.error("Profession is required.");
      return false;
    }
    if (documentFiles.length === 0) {
      toast.error("Upload at least one required document file.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CREATE_VISA}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        showApiSuccessToast(response);
        navigate("/dashboard/visa/allvisa");
      }
    } catch (err) {
      showApiErrorToasts(err);
      console.error("Create visa failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "var(--page-bg, #F4F7FE)",
        px: { xs: 1.5, md: 2 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <AdminPageTitleBar
          title="Add Visa"
          subtitle="Configure route, pricing tiers, and document requirements"
          action={
            <IconButton
              onClick={() => navigate("/dashboard/visa/allvisa")}
              aria-label="Back to visa history"
              sx={{
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.35)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          }
        />

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <SectionCard
            step={1}
            icon={<PublicIcon fontSize="small" />}
            title="Route & visa class"
            subtitle="Where travelers depart from, where they go, and what kind of visa applies"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography sx={labelSx}>
                  Departure country <span style={{ color: "#E11D48" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. India"
                  value={departureCountry}
                  onChange={(e) => setDepartureCountry(e.target.value)}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={labelSx}>
                  Arrival country <span style={{ color: "#E11D48" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. United States"
                  value={arrivalCountry}
                  onChange={(e) => setArrivalCountry(e.target.value)}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography sx={labelSx}>
                  Visa category <span style={{ color: "#E11D48" }}>*</span>
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={visaCategory}
                  onChange={(e) => setVisaCategory(e.target.value)}
                  sx={fieldSx}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="" disabled>
                    Select category
                  </MenuItem>
                  {VISA_CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography sx={labelSx}>
                  Visa type <span style={{ color: "#E11D48" }}>*</span>
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={visaType}
                  onChange={(e) => setVisaType(e.target.value)}
                  sx={fieldSx}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="" disabled>
                    Select type
                  </MenuItem>
                  {VISA_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography sx={labelSx}>
                  Base cost (USD) <span style={{ color: "#E11D48" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, step: "any" }}
                  placeholder="e.g. 200"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>

            {departureCountry && arrivalCountry ? (
              <Box
                sx={{
                  mt: 2.5,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "#F0F7FF",
                  border: "1px dashed #024DAF55",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <FlightTakeoffIcon sx={{ color: "#024DAF", fontSize: 20 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#0F2F56" }}>
                  {departureCountry.trim()}
                </Typography>
                <Typography sx={{ color: "#94A3B8" }}>→</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#024DAF" }}>
                  {arrivalCountry.trim()}
                </Typography>
                {visaCategory ? (
                  <Typography sx={{ fontSize: 12, color: "#64748B", ml: "auto" }}>
                    {visaCategory} · {visaType || "—"}
                  </Typography>
                ) : null}
              </Box>
            ) : null}
          </SectionCard>

          <SectionCard
            step={2}
            icon={<PaymentsIcon fontSize="small" />}
            title="Duration & pricing"
            subtitle="Add one or more processing options with fees and timelines"
            accent="#0A2B76"
          >
            {durationCosts.map((row, index) => (
              <Box
                key={`duration-${index}`}
                sx={{
                  mb: index < durationCosts.length - 1 ? 2.5 : 0,
                  p: 2,
                  borderRadius: 1.5,
                  border: "1px solid #E8EDF5",
                  bgcolor: index % 2 === 0 ? "#FAFCFF" : "#FFFFFF",
                  position: "relative",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>
                    Option {index + 1}
                  </Typography>
                  {durationCosts.length > 1 ? (
                    <IconButton
                      size="small"
                      onClick={() => removeDurationRow(index)}
                      aria-label="Remove duration option"
                      sx={{ color: "#E11D48" }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography sx={labelSx}>Cost *</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      inputProps={{ min: 0 }}
                      placeholder="1500"
                      value={row.cost}
                      onChange={(e) => updateDuration(index, "cost", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography sx={labelSx}>Entry *</Typography>
                    <TextField
                      select
                      fullWidth
                      value={row.entry}
                      onChange={(e) => updateDuration(index, "entry", e.target.value)}
                      sx={fieldSx}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value="" disabled>
                        Select entry
                      </MenuItem>
                      {ENTRY_TYPES.map((e) => (
                        <MenuItem key={e} value={e}>
                          {e}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography sx={labelSx}>Duration *</Typography>
                    <TextField
                      fullWidth
                      placeholder="30 days"
                      value={row.duration}
                      onChange={(e) => updateDuration(index, "duration", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography sx={labelSx}>Maximum stay *</Typography>
                    <TextField
                      fullWidth
                      placeholder="90 days"
                      value={row.maximumStay}
                      onChange={(e) => updateDuration(index, "maximumStay", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelSx}>Processing time *</Typography>
                    <TextField
                      fullWidth
                      placeholder="10 business days"
                      value={row.processingTime}
                      onChange={(e) => updateDuration(index, "processingTime", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelSx}>Interview *</Typography>
                    <TextField
                      select
                      fullWidth
                      value={row.interview}
                      onChange={(e) => updateDuration(index, "interview", e.target.value)}
                      sx={fieldSx}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value="" disabled>
                        Select
                      </MenuItem>
                      {INTERVIEW_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelSx}>Embassy fee</Typography>
                    <TextField
                      fullWidth
                      placeholder="100 USD"
                      value={row.embassyFee}
                      onChange={(e) => updateDuration(index, "embassyFee", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelSx}>Agent fee</Typography>
                    <TextField
                      fullWidth
                      placeholder="50 USD"
                      value={row.agentFee}
                      onChange={(e) => updateDuration(index, "agentFee", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelSx}>Service charge</Typography>
                    <TextField
                      fullWidth
                      placeholder="20 USD"
                      value={row.serviceCharge}
                      onChange={(e) => updateDuration(index, "serviceCharge", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography sx={labelSx}>Processing fee</Typography>
                    <TextField
                      fullWidth
                      placeholder="30 USD"
                      value={row.processingFee}
                      onChange={(e) => updateDuration(index, "processingFee", e.target.value)}
                      sx={fieldSx}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              type="button"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addDurationRow}
              sx={{
                mt: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#024DAF",
                color: "#024DAF",
                borderRadius: 1.5,
                "&:hover": { borderColor: "#0A2B76", bgcolor: "#F0F7FF" },
              }}
            >
              Add another duration option
            </Button>
          </SectionCard>

          <SectionCard
            step={3}
            icon={<DescriptionIcon fontSize="small" />}
            title="Required documents"
            subtitle="Profession-specific checklist and notes for applicants"
            accent="#0369A1"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography sx={labelSx}>
                  Profession <span style={{ color: "#E11D48" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Software Engineer"
                  value={visaRequiredDocuments.profession}
                  onChange={(e) => updateDocuments("profession", e.target.value)}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={labelSx}>
                  Documents <span style={{ color: "#E11D48" }}>*</span>
                </Typography>
                <DocumentUploadZone
                  files={documentFiles}
                  onAdd={addDocumentFiles}
                  onRemove={removeDocumentFile}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography sx={labelSx}>Exceptional case</Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Special cases or alternate documents"
                  value={visaRequiredDocuments.exceptionalCase}
                  onChange={(e) => updateDocuments("exceptionalCase", e.target.value)}
                  sx={fieldSx}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography sx={labelSx}>Note</Typography>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="e.g. Documents must be in English or translated"
                  value={visaRequiredDocuments.note}
                  onChange={(e) => updateDocuments("note", e.target.value)}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </SectionCard>

          <Divider sx={{ borderColor: "#E2E8F0" }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              flexWrap: "wrap",
              pb: 2,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              disabled={loading}
              onClick={() => navigate("/dashboard/visa/allvisa")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
                px: 3,
                color: "#64748B",
                borderColor: "#CBD5E1",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                px: 4,
                py: 1.25,
                bgcolor: "#024DAF",
                boxShadow: "0 4px 14px rgba(2, 77, 175, 0.35)",
                "&:hover": { bgcolor: "#0A2B76" },
              }}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                "Create visa"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
