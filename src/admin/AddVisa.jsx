import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutline";
import FlightOutlinedIcon from "@mui/icons-material/FlightOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const VISA_TYPE_OPTIONS = [
  { value: "Tourist Visa", label: "Tourist Visa", icon: LuggageOutlinedIcon },
  { value: "Business Visa", label: "Business Visa", icon: BusinessCenterOutlinedIcon },
  { value: "Student Visa", label: "Student Visa", icon: SchoolOutlinedIcon },
  { value: "Work Visa", label: "Work Visa", icon: WorkOutlineOutlinedIcon },
  { value: "Transit Visa", label: "Transit Visa", icon: FlightOutlinedIcon },
  { value: "Medical Visa", label: "Medical Visa", icon: MedicalServicesOutlinedIcon },
];

function getVisaTypeOption(value) {
  return VISA_TYPE_OPTIONS.find((option) => option.value === value) || null;
}

function normalizeVisaTypeValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const direct = getVisaTypeOption(text);
  if (direct) return direct.value;
  const loose = VISA_TYPE_OPTIONS.find(
    (option) => option.label.toLowerCase() === text.toLowerCase()
      || option.value.replace(" Visa", "").toLowerCase() === text.toLowerCase(),
  );
  return loose?.value || text;
}

const ENTRY_TYPE_OPTIONS = [
  { value: "Single Entry", label: "Single Entry", iconKey: "single" },
  { value: "Double Entry", label: "Double Entry", iconKey: "double" },
  { value: "Multiple Entry", label: "Multiple Entry", iconKey: "multiple" },
];

function getEntryTypeOption(value) {
  return ENTRY_TYPE_OPTIONS.find((option) => option.value === value) || null;
}

function normalizeEntryTypeValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const direct = getEntryTypeOption(text);
  if (direct) return direct.value;
  const compact = text.toLowerCase().replace(/[\s-]+/g, "");
  const loose = ENTRY_TYPE_OPTIONS.find((option) => {
    const optionCompact = option.value.toLowerCase().replace(/[\s-]+/g, "");
    return optionCompact === compact || option.label.toLowerCase() === text.toLowerCase();
  });
  return loose?.value || text;
}

function EntryTypeIcon({ iconKey }) {
  if (iconKey === "multiple") {
    return <AllInclusiveIcon sx={{ fontSize: 20, color: C.muted }} />;
  }

  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: 0.75,
        border: `1.5px solid ${C.muted}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 700,
        color: C.muted,
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {iconKey === "single" ? "1" : "2"}
    </Box>
  );
}

const selectMenuProps = {
  PaperProps: {
    sx: {
      borderRadius: 2,
      mt: 0.5,
      boxShadow: "0 10px 28px rgba(15, 47, 86, 0.14)",
    },
  },
};

const DURATION_DAY_OPTIONS = ["15", "30", "45", "60", "90", "180", "365"];

const PROCESSING_SPEED_OPTIONS = [
  { value: "Standard", label: "Standard", subtitle: "7-10 business days", icon: ScheduleOutlinedIcon },
  { value: "Express", label: "Express", subtitle: "3-5 business days", icon: BoltOutlinedIcon },
  { value: "Rush", label: "Rush", subtitle: "1-2 business days", icon: RocketLaunchOutlinedIcon },
  { value: "Super Rush", label: "Super Rush", subtitle: "Same day processing", icon: FlashOnOutlinedIcon },
];

function normalizeDurationDays(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const digits = text.replace(/[^\d]/g, "");
  return digits || text;
}

function getDurationLabel(days) {
  const normalized = normalizeDurationDays(days);
  if (!normalized) return "";
  return `${normalized} Days`;
}

function getProcessingSpeedOption(value) {
  return PROCESSING_SPEED_OPTIONS.find((option) => option.value === value) || null;
}

function normalizeProcessingSpeed(value) {
  const text = String(value || "").trim();
  if (!text) return "Standard";
  const direct = getProcessingSpeedOption(text);
  if (direct) return direct.value;
  const lower = text.toLowerCase();
  if (lower === "urgent") return "Rush";
  const loose = PROCESSING_SPEED_OPTIONS.find(
    (option) => option.label.toLowerCase() === lower || option.value.toLowerCase() === lower,
  );
  return loose?.value || text;
}

const CURRENCIES = ["BDT", "NPR", "USD", "INR", "AED", "EUR", "GBP"];
const COUNTRIES = [
  "Afghanistan", "Australia", "Bangladesh", "Bhutan", "Canada", "China", "France", "Germany",
  "India", "Indonesia", "Japan", "Malaysia", "Maldives", "Nepal", "Pakistan", "Philippines",
  "Qatar", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Thailand", "Turkey",
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam",
].sort();

const TABS = [
  { id: "general", label: "General Info", icon: InfoOutlinedIcon },
  { id: "pricing", label: "Pricing", icon: PaymentsOutlinedIcon },
  { id: "requirements", label: "Requirements", icon: DescriptionOutlinedIcon },
];

const emptyPricingVariant = () => ({
  visaType: "",
  entryType: "",
  durationDays: "",
  processingSpeed: "Standard",
  visaFee: "",
  commission: "",
  currency: "BDT",
});

function calcVariantTotal(row) {
  const fee = Number(row.visaFee) || 0;
  const commission = Number(row.commission) || 0;
  return fee + commission;
}

function formatVariantTotal(row) {
  return calcVariantTotal(row).toFixed(2);
}

const emptyRequirement = () => "";

function normalizeRequirements(raw) {
  if (Array.isArray(raw?.requirements) && raw.requirements.length > 0) {
    const items = raw.requirements.map((item) => String(item || "").trim()).filter(Boolean);
    return items.length > 0 ? items : [emptyRequirement()];
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const items = raw
      .map((row) => {
        if (typeof row === "string") return row.trim();
        return String(row?.documents || row?.requirement || row?.text || "").trim();
      })
      .filter(Boolean);
    return items.length > 0 ? items : [emptyRequirement()];
  }
  if (raw && typeof raw === "object") {
    const value = String(raw.documents || raw.requirement || "").trim();
    return value ? [value] : [emptyRequirement()];
  }
  return [emptyRequirement()];
}

const C = {
  pageBg: "var(--page-bg, #F4F7FE)",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  primary: "#0F2F56",
  secondary: "#024DAF",
  muted: "#64748B",
  danger: "#E11D48",
};

const INPUT_HEIGHT = 30;

const labelSx = {
  fontSize: 12,
  fontWeight: 600,
  color: C.primary,
  mb: 0.5,
  display: "block",
};

const fieldSx = {
  "& .MuiInputBase-root": {
    minHeight: INPUT_HEIGHT,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.25,
    fontSize: 13,
    bgcolor: "#FAFBFC",
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: "#94A3B8" },
    "&.Mui-focused fieldset": { borderColor: C.secondary, borderWidth: 2 },
  },
  "& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)": {
    height: INPUT_HEIGHT,
    minHeight: INPUT_HEIGHT,
  },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
    py: 0,
    px: 1.25,
    height: INPUT_HEIGHT,
    boxSizing: "border-box",
    fontSize: 13,
  },
  "& .MuiSelect-select": {
    minHeight: "unset !important",
    display: "flex",
    alignItems: "center",
    py: 0,
    fontSize: 13,
  },
  "& .MuiAutocomplete-inputRoot": {
    minHeight: `${INPUT_HEIGHT}px !important`,
    height: INPUT_HEIGHT,
    py: "0 !important",
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
  },
  "& .MuiAutocomplete-input": {
    py: "0 !important",
    fontSize: 13,
  },
};

const multilineFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root.MuiInputBase-multiline": {
    height: "auto",
    minHeight: "auto",
  },
  "& .MuiOutlinedInput-inputMultiline": {
    py: 0.85,
    fontSize: 13,
    lineHeight: 1.45,
  },
};

const checkboxSx = {
  color: "#94A3B8",
  "&.Mui-checked": { color: C.secondary },
};

const readOnlyFieldSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root": {
    ...fieldSx["& .MuiOutlinedInput-root"],
    bgcolor: "#EEF2F7",
  },
};

function showApiErrorToasts(err, fallback = "Failed to save visa.") {
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

function showApiSuccessToast(response, fallback = "Visa saved successfully.") {
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

function normalizeRequirementsFromVisa(visa) {
  if (!visa) return [emptyRequirement()];
  if (Array.isArray(visa.requirements) && visa.requirements.length > 0) {
    return normalizeRequirements(visa.requirements);
  }
  return normalizeRequirements(visa.visaRequiredDocuments);
}

function normalizePricingVariants(raw) {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((row) => ({
      visaType: normalizeVisaTypeValue(row?.processingFee || row?.visaType || ""),
      entryType: normalizeEntryTypeValue(row?.entry || row?.entryType || ""),
      durationDays: normalizeDurationDays(row?.duration || row?.durationDays || ""),
      processingSpeed: normalizeProcessingSpeed(row?.processingTime || row?.processingSpeed || "Standard"),
      visaFee: row?.embassyFee != null && row.embassyFee !== ""
        ? String(row.embassyFee)
        : row?.visaFee != null
          ? String(row.visaFee)
          : row?.cost != null
            ? String(row.cost)
            : "",
      commission: row?.agentFee != null && row.agentFee !== ""
        ? String(row.agentFee)
        : row?.commission != null
          ? String(row.commission)
          : "",
      currency: String(row?.serviceCharge || row?.currency || "BDT").trim() || "BDT",
    }));
  }
  return [emptyPricingVariant()];
}

function DurationDaysSelect({ value, onChange }) {
  const [customDays, setCustomDays] = useState("");

  useEffect(() => {
    const normalized = normalizeDurationDays(value);
    if (!normalized) {
      setCustomDays("");
      return;
    }
    setCustomDays(DURATION_DAY_OPTIONS.includes(normalized) ? "" : normalized);
  }, [value]);

  const handlePresetChange = (days) => {
    setCustomDays("");
    onChange(days);
  };

  const handleCustomChange = (nextValue) => {
    const digits = nextValue.replace(/\D/g, "");
    setCustomDays(digits);
    onChange(digits);
  };

  return (
    <TextField
      select
      fullWidth
      value={normalizeDurationDays(value)}
      onChange={(e) => handlePresetChange(e.target.value)}
      sx={fieldSx}
      SelectProps={{
        displayEmpty: true,
        renderValue: (selected) => {
          if (!selected) {
            return (
              <Typography sx={{ fontSize: 14, color: C.muted }}>
                Select
              </Typography>
            );
          }
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: C.muted }} />
              <Typography sx={{ fontSize: 14, color: C.primary, fontWeight: 500 }}>
                {getDurationLabel(selected)}
              </Typography>
            </Box>
          );
        },
        MenuProps: {
          ...selectMenuProps,
          autoFocus: false,
        },
      }}
    >
      <MenuItem value="" disabled>
        Select
      </MenuItem>
      {DURATION_DAY_OPTIONS.map((days) => (
        <MenuItem
          key={days}
          value={days}
          sx={{
            py: 1.25,
            gap: 1.5,
            fontSize: 14,
            color: C.primary,
          }}
        >
          <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: C.muted }} />
          {getDurationLabel(days)}
        </MenuItem>
      ))}
      <MenuItem
        disableRipple
        onMouseDown={(e) => e.preventDefault()}
        sx={{
          py: 1,
          px: 1.5,
          "&:hover": { bgcolor: "transparent" },
          cursor: "default",
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Custom Days..."
          value={customDays}
          onChange={(e) => handleCustomChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          sx={fieldSx}
        />
      </MenuItem>
    </TextField>
  );
}

function PricingVariantCard({ index, row, onChange, onRemove, canRemove }) {
  const totalPrice = formatVariantTotal(row);

  return (
    <Box
      sx={{
        mb: 2,
        border: `1px solid ${C.border}`,
        borderRadius: 2,
        bgcolor: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pt: 2,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            bgcolor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 1,
            px: 1.25,
            py: 0.5,
          }}
        >
          <PaymentsOutlinedIcon sx={{ fontSize: 16, color: C.secondary }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.secondary }}>
            Variant #{index + 1}
          </Typography>
        </Box>
        {canRemove ? (
          <IconButton
            size="small"
            onClick={onRemove}
            aria-label={`Remove variant ${index + 1}`}
            sx={{ color: C.muted, "&:hover": { color: C.danger } }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography sx={labelSx}>
              Visa Type <span style={{ color: C.danger }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={row.visaType}
              onChange={(e) => onChange("visaType", e.target.value)}
              sx={fieldSx}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ fontSize: 14, color: C.muted }}>
                        Select
                      </Typography>
                    );
                  }
                  const option = getVisaTypeOption(selected);
                  if (!option) return selected;
                  const Icon = option.icon;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Icon sx={{ fontSize: 20, color: C.muted }} />
                      <Typography sx={{ fontSize: 14, color: C.primary, fontWeight: 500 }}>
                        {option.label}
                      </Typography>
                    </Box>
                  );
                },
                MenuProps: selectMenuProps,
              }}
            >
              <MenuItem value="" disabled>
                Select
              </MenuItem>
              {VISA_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{
                      py: 1.25,
                      gap: 1.5,
                      fontSize: 14,
                      color: C.primary,
                    }}
                  >
                    <Icon sx={{ fontSize: 20, color: C.muted }} />
                    {option.label}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={labelSx}>
              Entry Type <span style={{ color: C.danger }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={row.entryType}
              onChange={(e) => onChange("entryType", e.target.value)}
              sx={fieldSx}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ fontSize: 14, color: C.muted }}>
                        Select
                      </Typography>
                    );
                  }
                  const option = getEntryTypeOption(selected);
                  if (!option) return selected;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EntryTypeIcon iconKey={option.iconKey} />
                      <Typography sx={{ fontSize: 14, color: C.primary, fontWeight: 500 }}>
                        {option.label}
                      </Typography>
                    </Box>
                  );
                },
                MenuProps: selectMenuProps,
              }}
            >
              <MenuItem value="" disabled>
                Select
              </MenuItem>
              {ENTRY_TYPE_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{
                    py: 1.25,
                    gap: 1.5,
                    fontSize: 14,
                    color: C.primary,
                  }}
                >
                  <EntryTypeIcon iconKey={option.iconKey} />
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={labelSx}>
              Duration (Days) <span style={{ color: C.danger }}>*</span>
            </Typography>
            <DurationDaysSelect
              value={row.durationDays}
              onChange={(days) => onChange("durationDays", days)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={labelSx}>
              Processing speed <span style={{ color: C.danger }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={row.processingSpeed}
              onChange={(e) => onChange("processingSpeed", e.target.value)}
              sx={fieldSx}
              SelectProps={{
                renderValue: (selected) => {
                  const option = getProcessingSpeedOption(selected);
                  if (!option) return selected;
                  const Icon = option.icon;
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Icon sx={{ fontSize: 18, color: C.muted }} />
                      <Typography sx={{ fontSize: 14, color: C.primary, fontWeight: 500 }}>
                        {option.label}
                      </Typography>
                    </Box>
                  );
                },
                MenuProps: selectMenuProps,
              }}
            >
              {PROCESSING_SPEED_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{
                      py: 1.25,
                      alignItems: "flex-start",
                      gap: 1.25,
                    }}
                  >
                    <Icon sx={{ fontSize: 18, color: C.muted, mt: 0.25 }} />
                    <Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.primary, lineHeight: 1.3 }}>
                        {option.label}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: C.muted, lineHeight: 1.3 }}>
                        {option.subtitle}
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={labelSx}>Visa Fee</Typography>
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              placeholder="0.00"
              value={row.visaFee}
              onChange={(e) => onChange("visaFee", e.target.value)}
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={labelSx}>Commission</Typography>
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              placeholder="0.00"
              value={row.commission}
              onChange={(e) => onChange("commission", e.target.value)}
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={labelSx}>
              Total Price <span style={{ color: C.danger }}>*</span>
            </Typography>
            <TextField
              fullWidth
              value={totalPrice}
              InputProps={{ readOnly: true }}
              sx={readOnlyFieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography sx={labelSx}>
              Currency <span style={{ color: C.danger }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              value={row.currency}
              onChange={(e) => onChange("currency", e.target.value)}
              sx={fieldSx}
            >
              {CURRENCIES.map((currency) => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function FormSection({ title, children }) {
  return (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: 2,
        bgcolor: "#FAFBFC",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${C.border}`,
          bgcolor: "#FFFFFF",
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 18, color: C.secondary }} />
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{title}</Typography>
      </Box>
      <Box sx={{ p: { xs: 2, md: 2.5 } }}>{children}</Box>
    </Box>
  );
}

export default function AddVisa() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const visaFromState = location.state?.visa || null;
  const isEditing = Boolean(location.state?.editMode && visaFromState);
  const editingVisaId = visaFromState?.visaId ?? visaFromState?.id ?? visaFromState?._id ?? null;

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [departureCountry, setDepartureCountry] = useState("");
  const [arrivalCountry, setArrivalCountry] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [pricingVariants, setPricingVariants] = useState([emptyPricingVariant()]);
  const [requirements, setRequirements] = useState([emptyRequirement()]);

  useEffect(() => {
    if (!isEditing || !visaFromState) return;

    setDepartureCountry(visaFromState.departureCountry || "");
    setArrivalCountry(visaFromState.arrivalCountry || "");
    setDescription(visaFromState.description || "");
    setIsActive(visaFromState.isActive !== false);
    setPricingVariants(normalizePricingVariants(visaFromState.durationCosts || visaFromState.variants));
    setRequirements(normalizeRequirementsFromVisa(visaFromState));
  }, [isEditing, visaFromState]);

  const updatePricingVariant = (index, field, value) => {
    setPricingVariants((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addPricingVariant = () => {
    setPricingVariants((prev) => [...prev, emptyPricingVariant()]);
  };

  const removePricingVariant = (index) => {
    if (pricingVariants.length <= 1) {
      toast.info("At least one pricing variant is required.");
      return;
    }
    setPricingVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRequirement = (index, value) => {
    setRequirements((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addRequirement = () => {
    setRequirements((prev) => [...prev, emptyRequirement()]);
  };

  const removeRequirement = (index) => {
    if (requirements.length <= 1) {
      setRequirements([emptyRequirement()]);
      return;
    }
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const buildPayload = () => {
    const payload = {
      departureCountry: departureCountry.trim(),
      arrivalCountry: arrivalCountry.trim(),
      description: description.trim(),
      isActive,
      variants: pricingVariants.map((row) => ({
        visaType: String(row.visaType || "").trim(),
        entryType: String(row.entryType || "").trim(),
        durationDays: String(row.durationDays || "").trim(),
        processingSpeed: String(row.processingSpeed || "").trim(),
        visaFee: Number(row.visaFee) || 0,
        commission: Number(row.commission) || 0,
        totalPrice: calcVariantTotal(row),
        currency: String(row.currency || "BDT").trim(),
      })),
      requirements: requirements.map((text) => text.trim()).filter(Boolean),
    };

    return payload;
  };

  const validate = () => {
    if (!departureCountry.trim()) {
      toast.error("From country is required.");
      setActiveTab(0);
      return false;
    }
    if (!arrivalCountry.trim()) {
      toast.error("To country is required.");
      setActiveTab(0);
      return false;
    }
    for (let i = 0; i < pricingVariants.length; i += 1) {
      const row = pricingVariants[i];
      if (!row.visaType) {
        toast.error(`Variant ${i + 1}: visa type is required.`);
        setActiveTab(1);
        return false;
      }
      if (!row.entryType) {
        toast.error(`Variant ${i + 1}: entry type is required.`);
        setActiveTab(1);
        return false;
      }
      if (!row.durationDays) {
        toast.error(`Variant ${i + 1}: duration is required.`);
        setActiveTab(1);
        return false;
      }
      if (!row.processingSpeed) {
        toast.error(`Variant ${i + 1}: processing speed is required.`);
        setActiveTab(1);
        return false;
      }
      if (calcVariantTotal(row) <= 0) {
        toast.error(`Variant ${i + 1}: enter visa fee or commission for total price.`);
        setActiveTab(1);
        return false;
      }
      if (!row.currency) {
        toast.error(`Variant ${i + 1}: currency is required.`);
        setActiveTab(1);
        return false;
      }
    }

    const filledRequirements = requirements.map((text) => text.trim()).filter(Boolean);
    if (filledRequirements.length === 0) {
      toast.error("Add at least one requirement.");
      setActiveTab(2);
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

    if (isEditing && editingVisaId == null) {
      toast.error("Visa ID missing. Cannot update.");
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      const headers = {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      };

      const response = isEditing
        ? await axios.patch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_VISA(editingVisaId)}`, payload, { headers })
        : await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CREATE_VISA}`, payload, { headers });

      if (response.status === 200 || response.status === 201) {
        showApiSuccessToast(response, isEditing ? "Visa updated successfully." : "Visa created successfully.");
        navigate("/dashboard/visa/allvisa");
      }
    } catch (err) {
      showApiErrorToasts(err);
      console.error("Save visa failed:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralTab = () => (
    <FormSection title="Basic Information">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography sx={labelSx}>
            From Country <span style={{ color: C.danger }}>*</span>
          </Typography>
          <Autocomplete
            freeSolo
            options={COUNTRIES}
            value={departureCountry}
            onChange={(_, value) => setDepartureCountry(value || "")}
            onInputChange={(_, value) => setDepartureCountry(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Country"
                sx={fieldSx}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography sx={labelSx}>
            To Country <span style={{ color: C.danger }}>*</span>
          </Typography>
          <Autocomplete
            freeSolo
            options={COUNTRIES}
            value={arrivalCountry}
            onChange={(_, value) => setArrivalCountry(value || "")}
            onInputChange={(_, value) => setArrivalCountry(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select Country"
                sx={fieldSx}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography sx={labelSx}>Description</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Enter Visa Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={multilineFieldSx}
          />
        </Grid>
        <Grid item xs={12}>
          <Box
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 1.5,
              px: 2,
              py: 1,
              bgcolor: "#FFFFFF",
              width: "fit-content",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  sx={checkboxSx}
                />
              }
              label={<Typography sx={{ fontSize: 14, fontWeight: 600, color: C.primary }}>Active</Typography>}
            />
          </Box>
        </Grid>
      </Grid>
    </FormSection>
  );

  const renderPricingTab = () => (
    <Box>
      {pricingVariants.map((row, index) => (
        <PricingVariantCard
          key={`variant-${index}`}
          index={index}
          row={row}
          onChange={(field, value) => updatePricingVariant(index, field, value)}
          onRemove={() => removePricingVariant(index)}
          canRemove={pricingVariants.length > 1}
        />
      ))}

      <Button
        type="button"
        fullWidth
        variant="contained"
        startIcon={<AddCircleOutlineIcon />}
        onClick={addPricingVariant}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          fontSize: 14,
          py: 1.35,
          borderRadius: 1.5,
          bgcolor: C.primary,
          boxShadow: "none",
          "&:hover": { bgcolor: "#0A2540", boxShadow: "none" },
        }}
      >
        Add New Variant
      </Button>
    </Box>
  );

  const renderRequirementsTab = () => (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: 2,
        bgcolor: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          pt: 2,
          pb: 1,
        }}
      >
        <FactCheckOutlinedIcon sx={{ fontSize: 20, color: C.secondary }} />
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.primary }}>
          Visa Requirements
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        {requirements.map((requirement, index) => (
          <Box
            key={`requirement-${index}`}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
            }}
          >
            <TextField
              fullWidth
              placeholder="Enter Requirement"
              value={requirement}
              onChange={(e) => updateRequirement(index, e.target.value)}
              sx={fieldSx}
            />
            <IconButton
              type="button"
              onClick={() => removeRequirement(index)}
              aria-label={`Remove requirement ${index + 1}`}
              sx={{
                width: INPUT_HEIGHT,
                height: INPUT_HEIGHT,
                borderRadius: 1,
                bgcolor: C.primary,
                color: "#FFFFFF",
                flexShrink: 0,
                "&:hover": { bgcolor: "#0A2540" },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}

        <Button
          type="button"
          fullWidth
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={addRequirement}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: 14,
            py: 1.35,
            borderRadius: 1.5,
            bgcolor: C.primary,
            boxShadow: "none",
            "&:hover": { bgcolor: "#0A2540", boxShadow: "none" },
          }}
        >
          Add Requirement
        </Button>
      </Box>
    </Box>
  );

  const tabPanels = [renderGeneralTab, renderPricingTab, renderRequirementsTab];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: C.pageBg,
        px: { xs: 1.5, md: 2 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 960, mx: "auto" }}>
        <AdminPageTitleBar
          title={isEditing ? "Edit Visa" : "Add Visa"}
          subtitle="Configure visa route, pricing, and requirements"
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

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 2,
            borderRadius: 2,
            border: `1px solid ${C.border}`,
            bgcolor: C.cardBg,
            boxShadow: "0 1px 4px rgba(15, 47, 86, 0.06)",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: { xs: 1, md: 2 },
              borderBottom: `1px solid ${C.border}`,
              bgcolor: "#FFFFFF",
              minHeight: 56,
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                bgcolor: C.secondary,
              },
            }}
          >
            {TABS.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <Tab
                  key={tab.id}
                  icon={<Icon sx={{ fontSize: 20 }} />}
                  iconPosition="start"
                  label={tab.label}
                  sx={{
                    textTransform: "none",
                    minHeight: 56,
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.muted,
                    gap: 0.75,
                    "&.Mui-selected": { color: C.secondary },
                  }}
                  id={`visa-tab-${index}`}
                  aria-controls={`visa-tabpanel-${index}`}
                />
              );
            })}
          </Tabs>

          <Box sx={{ p: { xs: 2, md: 2.5 } }}>
            {tabPanels.map((renderPanel, index) => (
              <Box
                key={TABS[index].id}
                role="tabpanel"
                hidden={activeTab !== index}
                id={`visa-tabpanel-${index}`}
                aria-labelledby={`visa-tab-${index}`}
              >
                {activeTab === index ? renderPanel() : null}
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
              flexWrap: "wrap",
              px: { xs: 2, md: 2.5 },
              py: 2,
              borderTop: `1px solid ${C.border}`,
              bgcolor: "#FAFBFC",
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
                color: C.muted,
                borderColor: "#CBD5E1",
                bgcolor: "#FFFFFF",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? null : <SaveOutlinedIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.5,
                px: 3,
                py: 1,
                bgcolor: C.secondary,
                boxShadow: "0 4px 14px rgba(2, 77, 175, 0.3)",
                "&:hover": { bgcolor: "#0A2B76" },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Submit"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
