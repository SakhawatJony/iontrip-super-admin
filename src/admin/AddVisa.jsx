<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
=======
import React, { useEffect, useState } from "react";
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
=======
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
=======
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import FlashOnOutlinedIcon from "@mui/icons-material/FlashOnOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

<<<<<<< HEAD
function resolveVisaImageUrl(raw) {
  const src = String(raw || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("/")) return `${API_BASE_URL}${src}`;
  return `${API_BASE_URL}/${src.replace(/^\/+/, "")}`;
}

=======
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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

<<<<<<< HEAD
=======
const PROCESSING_SPEED_OPTIONS = [
  { value: "Standard", label: "Standard", subtitle: "7-10 business days", icon: ScheduleOutlinedIcon },
  { value: "Express", label: "Express", subtitle: "3-5 business days", icon: BoltOutlinedIcon },
  { value: "Rush", label: "Rush", subtitle: "1-2 business days", icon: RocketLaunchOutlinedIcon },
  { value: "Super Rush", label: "Super Rush", subtitle: "Same day processing", icon: FlashOnOutlinedIcon },
];

>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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

<<<<<<< HEAD
function normalizeProcessingSpeed(value) {
  return String(value || "").trim();
=======
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
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
}

const CURRENCIES = ["BDT", "NPR", "USD", "INR", "AED", "EUR", "GBP"];

const TABS = [
  { id: "general", label: "General Info", icon: InfoOutlinedIcon },
  { id: "pricing", label: "Pricing", icon: PaymentsOutlinedIcon },
  { id: "requirements", label: "Requirements", icon: DescriptionOutlinedIcon },
<<<<<<< HEAD
  { id: "faqs", label: "FAQs", icon: HelpOutlineOutlinedIcon },
];

const emptyFaq = () => ({ question: "", answer: "" });

function normalizeFaqs(raw) {
  if (!Array.isArray(raw)) return [emptyFaq()];
  const faqs = raw
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
    }))
    .filter((item) => item.question || item.answer);
  return faqs.length > 0 ? faqs : [emptyFaq()];
}

=======
];

>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
const emptyPricingVariant = () => ({
  visaType: "",
  entryType: "",
  durationDays: "",
<<<<<<< HEAD
  processingSpeed: "",
  visaFee: "",
  commission: "",
  currency: "BDT",
  visaVariantId: null,
=======
  processingSpeed: "Standard",
  visaFee: "",
  commission: "",
  currency: "BDT",
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
});

function calcVariantTotal(row) {
  const fee = Number(row.visaFee) || 0;
  const commission = Number(row.commission) || 0;
  return fee + commission;
}

function formatVariantTotal(row) {
  return calcVariantTotal(row).toFixed(2);
}

const emptyRequirementGroup = () => ({
  occupation: "",
  requirements: [""],
});

function normalizeRequirementItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return [""];
  const items = rawItems
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return String(item?.documents || item?.requirement || item?.text || "").trim();
    })
    .filter(Boolean);
  return items.length > 0 ? items : [""];
}

function normalizeRequirements(raw) {
  // New nested format: [{ occupation, requirements: string[] }]
  if (Array.isArray(raw) && raw.length > 0) {
    const looksNested = raw.some(
      (row) =>
        row &&
        typeof row === "object" &&
        (Object.prototype.hasOwnProperty.call(row, "occupation") ||
          (Array.isArray(row.requirements) && typeof row.requirements[0] !== "undefined")),
    );

    if (looksNested) {
      const groups = raw
        .map((row) => {
          if (typeof row === "string") {
            const text = row.trim();
            return text ? { occupation: "General", requirements: [text] } : null;
          }
          const occupation = String(
            row?.occupation || row?.profession || row?.title || "",
          ).trim();
          const requirements = normalizeRequirementItems(
            Array.isArray(row?.requirements)
              ? row.requirements
              : row?.documents != null
                ? [row.documents]
                : [],
          );
          if (!occupation && requirements.every((item) => !String(item || "").trim())) {
            return null;
          }
          return {
            occupation,
            requirements,
          };
        })
        .filter(Boolean);

      return groups.length > 0 ? groups : [emptyRequirementGroup()];
    }

    // Legacy flat string list
    const flat = raw
      .map((row) => {
        if (typeof row === "string") return row.trim();
        return String(row?.documents || row?.requirement || row?.text || "").trim();
      })
      .filter(Boolean);

    if (flat.length > 0) {
      return [{ occupation: "General", requirements: flat }];
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    if (Array.isArray(raw.requirements)) {
      return normalizeRequirements(raw.requirements);
    }
    const occupation = String(raw.occupation || raw.profession || "").trim();
    const documents = String(raw.documents || raw.requirement || "").trim();
    if (occupation || documents) {
      return [
        {
          occupation: occupation || "General",
          requirements: documents ? [documents] : [""],
        },
      ];
    }
  }

  return [emptyRequirementGroup()];
}

function normalizeRequirementsFromVisa(visa) {
  if (!visa) return [emptyRequirementGroup()];
  if (Array.isArray(visa.requirements) && visa.requirements.length > 0) {
    return normalizeRequirements(visa.requirements);
  }
  return normalizeRequirements(visa.visaRequiredDocuments);
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

const countryPaperSx = {
  mt: 0.75,
<<<<<<< HEAD
  borderRadius: "12px",
  border: `1px solid ${C.border}`,
  boxShadow: "0 16px 40px rgba(15, 47, 86, 0.16)",
=======
  borderRadius: 2,
  border: `1px solid ${C.border}`,
  boxShadow: "0 12px 32px rgba(15, 47, 86, 0.12)",
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
  overflow: "hidden",
};

const countryListboxSx = {
<<<<<<< HEAD
  p: 0.75,
  maxHeight: 300,
  "& .MuiAutocomplete-option": {
    minHeight: 46,
    px: 1.25,
    py: 0.9,
    borderRadius: "8px",
    gap: 1.25,
    transition: "background-color 0.15s ease",
    "&.Mui-focused": { bgcolor: "#F1F6FF" },
    '&[aria-selected="true"]': { bgcolor: "#E8F1FF" },
    '&[aria-selected="true"].Mui-focused': { bgcolor: "#DCEAFF" },
  },
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 3 },
};

function CountryFlag({ code, size = 22 }) {
  const [failed, setFailed] = useState(false);
  const iso = String(code || "").trim().toLowerCase();

  useEffect(() => {
    setFailed(false);
  }, [iso]);

  const boxSx = {
    width: size * 1.4,
    height: size,
    borderRadius: "4px",
    flexShrink: 0,
    overflow: "hidden",
    border: `1px solid ${C.border}`,
    bgcolor: "#F1F5F9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (!/^[a-z]{2}$/.test(iso) || failed) {
    return (
      <Box sx={boxSx}>
        <PublicOutlinedIcon sx={{ fontSize: size * 0.7, color: C.muted }} />
      </Box>
    );
  }

  return (
    <Box sx={boxSx}>
      <Box
        component="img"
        src={`https://flagcdn.com/w80/${iso}.png`}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </Box>
  );
}

=======
  py: 0.75,
  maxHeight: 280,
  "& .MuiAutocomplete-option": {
    minHeight: 44,
    px: 1.25,
    py: 0.85,
    mx: 0.75,
    my: 0.25,
    borderRadius: 1.25,
    gap: 1,
    transition: "background-color 0.15s ease, color 0.15s ease",
    '&[aria-selected="true"]': {
      bgcolor: "rgba(2, 77, 175, 0.08)",
    },
    "&.Mui-focused, &:hover": {
      bgcolor: "rgba(2, 77, 175, 0.1)",
    },
  },
};

>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
function CountrySelectOption({ option, selected }) {
  const code = String(option?.code || "").toUpperCase();
  const name = String(option?.name || "");

  return (
<<<<<<< HEAD
    <>
      <CountryFlag code={code} />
      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: 13.5,
          fontWeight: selected ? 700 : 500,
          color: "#0F172A",
          textTransform: "capitalize",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </Typography>
      {code ? (
        <Box
          component="span"
          sx={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.4,
            color: C.secondary,
            bgcolor: "#E8F1FF",
            borderRadius: "6px",
            px: 0.85,
            py: 0.25,
            flexShrink: 0,
          }}
        >
          {code}
        </Box>
      ) : null}
      {selected ? (
        <CheckRoundedIcon sx={{ fontSize: 18, color: C.secondary, flexShrink: 0 }} />
      ) : null}
    </>
=======
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        width: "100%",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.25,
          bgcolor: selected ? "rgba(2, 77, 175, 0.14)" : "#EFF6FF",
          color: C.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          border: `1px solid ${selected ? "rgba(2, 77, 175, 0.28)" : "#DBEAFE"}`,
        }}
      >
        {code ? (
          <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, lineHeight: 1 }}>
            {code}
          </Typography>
        ) : (
          <PublicOutlinedIcon sx={{ fontSize: 18 }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 13.5,
            fontWeight: selected ? 700 : 600,
            color: C.primary,
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>
        {code ? (
          <Typography sx={{ fontSize: 11, color: C.muted, mt: 0.15, fontWeight: 500 }}>
            Country code · {code}
          </Typography>
        ) : null}
      </Box>
      {selected ? (
        <CheckRoundedIcon sx={{ fontSize: 18, color: C.secondary, flexShrink: 0 }} />
      ) : null}
    </Box>
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
  );
}

function CountryAutocompleteField({
  value,
  options,
  loading,
  onChange,
  placeholder = "Select Country",
}) {
  const selectedOption =
    options.find((item) => item.name === value) || (value ? { name: value, code: "" } : null);

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      loading={loading}
      getOptionLabel={(option) => option?.name || ""}
      isOptionEqualToValue={(option, val) => option?.name === val?.name}
      onChange={(_, next) => onChange(next?.name || "")}
<<<<<<< HEAD
      slotProps={{
        paper: { sx: countryPaperSx },
        listbox: { sx: countryListboxSx },
      }}
=======
      PaperProps={{ sx: countryPaperSx }}
      ListboxProps={{ sx: countryListboxSx }}
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
      renderOption={(props, option, { selected }) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest}>
            <CountrySelectOption option={option} selected={selected} />
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={loading ? "Loading countries…" : placeholder}
          sx={fieldSx}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    pl: 0.5,
                    pr: 0.25,
                    color: C.secondary,
                  }}
                >
<<<<<<< HEAD
                  {selectedOption ? (
                    <CountryFlag code={selectedOption.code} size={16} />
                  ) : (
                    <PublicOutlinedIcon sx={{ fontSize: 18 }} />
                  )}
=======
                  <PublicOutlinedIcon sx={{ fontSize: 18 }} />
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
                </Box>
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText={
        <Typography sx={{ fontSize: 13, color: C.muted, px: 1, py: 0.5 }}>
          No countries found
        </Typography>
      }
    />
  );
}

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

<<<<<<< HEAD
const ADD_VISA_DRAFT_KEY = "addVisaDraft";

function loadVisaDraft() {
  try {
    const raw = localStorage.getItem(ADD_VISA_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function clearVisaDraft() {
  localStorage.removeItem(ADD_VISA_DRAFT_KEY);
}

=======
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
function normalizePricingVariants(raw) {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.map((row) => ({
      visaType: normalizeVisaTypeValue(row?.processingFee || row?.visaType || ""),
      entryType: normalizeEntryTypeValue(row?.entry || row?.entryType || ""),
      durationDays: normalizeDurationDays(row?.duration || row?.durationDays || ""),
<<<<<<< HEAD
      processingSpeed: normalizeProcessingSpeed(row?.processingTime || row?.processingSpeed || ""),
=======
      processingSpeed: normalizeProcessingSpeed(row?.processingTime || row?.processingSpeed || "Standard"),
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
      visaVariantId: row?.visaVariantId ?? row?.id ?? row?._id ?? null,
=======
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
              fullWidth
              placeholder="e.g. 7-10 business days"
              value={row.processingSpeed}
              onChange={(e) => onChange("processingSpeed", e.target.value)}
              sx={fieldSx}
            />
=======
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
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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

<<<<<<< HEAD
  const [draft] = useState(() => (isEditing ? null : loadVisaDraft()));

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [departureCountry, setDepartureCountry] = useState(draft?.departureCountry ?? "");
  const [arrivalCountry, setArrivalCountry] = useState(draft?.arrivalCountry ?? "");
  const [description, setDescription] = useState(draft?.description ?? "");
  const [notice, setNotice] = useState(draft?.notice ?? "");
  const [specialNotice, setSpecialNotice] = useState(draft?.specialNotice ?? "");
  const [stayPeriod, setStayPeriod] = useState(draft?.stayPeriod ?? "");
  const [discountPercent, setDiscountPercent] = useState(draft?.discountPercent ?? "");
  const [discountAmount, setDiscountAmount] = useState(draft?.discountAmount ?? "");
  const [isActive, setIsActive] = useState(draft?.isActive ?? true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const [pricingVariants, setPricingVariants] = useState(
    draft?.pricingVariants?.length ? draft.pricingVariants : [emptyPricingVariant()],
  );
  const [generalDocuments, setGeneralDocuments] = useState(
    draft?.generalDocuments?.length ? draft.generalDocuments : [""],
  );
  const [requirements, setRequirements] = useState(
    draft?.requirements?.length ? draft.requirements : [emptyRequirementGroup()],
  );
  const [faqs, setFaqs] = useState(draft?.faqs?.length ? draft.faqs : [emptyFaq()]);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (draft) toast.info("Unsaved visa form restored.", { toastId: "add-visa-draft-restored" });
  }, [draft]);

  useEffect(() => {
    if (isEditing) return;
    const snapshot = {
      departureCountry,
      arrivalCountry,
      description,
      notice,
      specialNotice,
      stayPeriod,
      discountPercent,
      discountAmount,
      isActive,
      pricingVariants,
      generalDocuments,
      requirements,
      faqs,
    };
    const emptySnapshot = {
      departureCountry: "",
      arrivalCountry: "",
      description: "",
      notice: "",
      specialNotice: "",
      stayPeriod: "",
      discountPercent: "",
      discountAmount: "",
      isActive: true,
      pricingVariants: [emptyPricingVariant()],
      generalDocuments: [""],
      requirements: [emptyRequirementGroup()],
      faqs: [emptyFaq()],
    };
    if (JSON.stringify(snapshot) === JSON.stringify(emptySnapshot)) {
      clearVisaDraft();
    } else {
      localStorage.setItem(ADD_VISA_DRAFT_KEY, JSON.stringify(snapshot));
    }
  }, [
    isEditing,
    departureCountry,
    arrivalCountry,
    description,
    notice,
    specialNotice,
    stayPeriod,
    discountPercent,
    discountAmount,
    isActive,
    pricingVariants,
    generalDocuments,
    requirements,
    faqs,
  ]);
=======
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [departureCountry, setDepartureCountry] = useState("");
  const [arrivalCountry, setArrivalCountry] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [countryOptions, setCountryOptions] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const [pricingVariants, setPricingVariants] = useState([emptyPricingVariant()]);
  const [requirements, setRequirements] = useState([emptyRequirementGroup()]);
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5

  useEffect(() => {
    const authToken = token || localStorage.getItem("adminToken") || "";
    if (!authToken) {
      setCountryOptions([]);
      return undefined;
    }

    const controller = new AbortController();

    const fetchAllCountries = async () => {
      setCountriesLoading(true);
      try {
        const limit = 100;
        let page = 1;
        let totalPages = 1;
        const all = [];

        do {
          const params = new URLSearchParams({
            page: String(page),
            limit: String(limit),
          });
          const response = await axios.get(
            `${API_BASE_URL}${API_ENDPOINTS.COUNTRIES}?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            },
          );

          const body = response?.data || {};
          const list = Array.isArray(body)
            ? body
            : Array.isArray(body?.data)
              ? body.data
              : Array.isArray(body?.countries)
                ? body.countries
                : [];

          all.push(...list);
          totalPages = Math.max(1, Number(body.totalPages) || 1);
          page += 1;
        } while (page <= totalPages);

        const byName = new Map();
        all
          .filter((item) => item?.isActive !== false && item?.is_active !== false)
          .forEach((item) => {
            const name = String(item?.name || "").trim();
            if (!name || byName.has(name)) return;
            byName.set(name, {
              name,
              code: String(item?.code || "").trim().toUpperCase(),
            });
          });

        const countries = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
        setCountryOptions(countries);
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        console.error("Fetch countries failed:", err?.response?.data || err);
        toast.error(err?.response?.data?.message || "Failed to load countries.");
        setCountryOptions([]);
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchAllCountries();
    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (!isEditing || !visaFromState) return;

    setDepartureCountry(visaFromState.departureCountry || "");
    setArrivalCountry(visaFromState.arrivalCountry || "");
    setDescription(visaFromState.description || "");
<<<<<<< HEAD
    setNotice(visaFromState.notice || "");
    setSpecialNotice(visaFromState.specialNotice || "");
    setStayPeriod(visaFromState.stayPeriod || "");
    setDiscountPercent(
      visaFromState.discountPercent != null && visaFromState.discountPercent !== ""
        ? String(visaFromState.discountPercent)
        : "",
    );
    setDiscountAmount(
      visaFromState.discountAmount != null && visaFromState.discountAmount !== ""
        ? String(visaFromState.discountAmount)
        : "",
    );
    setIsActive(visaFromState.isActive !== false);
    setImageFile(null);
    setImagePreview(
      resolveVisaImageUrl(
        visaFromState.imageURL || visaFromState.imageUrl || visaFromState.image || "",
      ),
    );
    setPricingVariants(normalizePricingVariants(visaFromState.durationCosts || visaFromState.variants));
    const docs = Array.isArray(visaFromState.generalDocuments)
      ? visaFromState.generalDocuments.map((d) => String(d || "").trim()).filter(Boolean)
      : [];
    setGeneralDocuments(docs.length ? docs : [""]);
    setRequirements(normalizeRequirementsFromVisa(visaFromState));
    setFaqs(normalizeFaqs(visaFromState.faqs));
  }, [isEditing, visaFromState]);

  const updateFaq = (index, field, value) => {
    setFaqs((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addFaq = () => {
    setFaqs((prev) => [...prev, emptyFaq()]);
  };

  const removeFaq = (index) => {
    setFaqs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [emptyFaq()];
    });
  };

=======
    setIsActive(visaFromState.isActive !== false);
    setPricingVariants(normalizePricingVariants(visaFromState.durationCosts || visaFromState.variants));
    setRequirements(normalizeRequirementsFromVisa(visaFromState));
  }, [isEditing, visaFromState]);

>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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

  const updateOccupation = (groupIndex, value) => {
    setRequirements((prev) =>
      prev.map((group, i) => (i === groupIndex ? { ...group, occupation: value } : group)),
    );
  };

  const updateRequirementItem = (groupIndex, itemIndex, value) => {
    setRequirements((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;
        return {
          ...group,
          requirements: group.requirements.map((item, j) => (j === itemIndex ? value : item)),
        };
      }),
    );
  };

  const addRequirementItem = (groupIndex) => {
    setRequirements((prev) =>
      prev.map((group, i) =>
        i === groupIndex ? { ...group, requirements: [...group.requirements, ""] } : group,
      ),
    );
  };

  const removeRequirementItem = (groupIndex, itemIndex) => {
    setRequirements((prev) =>
      prev.map((group, i) => {
        if (i !== groupIndex) return group;
        const nextItems = group.requirements.filter((_, j) => j !== itemIndex);
        return {
          ...group,
          requirements: nextItems.length > 0 ? nextItems : [""],
        };
      }),
    );
  };

  const addOccupationGroup = () => {
    setRequirements((prev) => [...prev, emptyRequirementGroup()]);
  };

  const removeOccupationGroup = (groupIndex) => {
    setRequirements((prev) => {
      if (prev.length <= 1) return [emptyRequirementGroup()];
      return prev.filter((_, i) => i !== groupIndex);
    });
  };

<<<<<<< HEAD
  const updateGeneralDocument = (index, value) => {
    setGeneralDocuments((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addGeneralDocument = () => {
    setGeneralDocuments((prev) => [...prev, ""]);
  };

  const removeGeneralDocument = (index) => {
    setGeneralDocuments((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [""];
    });
  };

  const onImageChange = (file) => {
    if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("departureCountry", departureCountry.trim());
    formData.append("arrivalCountry", arrivalCountry.trim());
    if (description.trim()) formData.append("description", description.trim());
    if (notice.trim()) formData.append("notice", notice.trim());
    if (specialNotice.trim()) formData.append("specialNotice", specialNotice.trim());
    if (stayPeriod.trim()) formData.append("stayPeriod", stayPeriod.trim());
    if (String(discountPercent).trim() !== "") {
      formData.append("discountPercent", String(Number(discountPercent) || 0));
    }
    if (String(discountAmount).trim() !== "") {
      formData.append("discountAmount", String(Number(discountAmount) || 0));
    }
    formData.append("isActive", String(Boolean(isActive)));

    if (imageFile) {
      formData.append("imageURL", imageFile);
    }

    const variants = pricingVariants.map((row) => {
      const item = {
=======
  const buildPayload = () => {
    const payload = {
      departureCountry: departureCountry.trim(),
      arrivalCountry: arrivalCountry.trim(),
      description: description.trim(),
      isActive,
      variants: pricingVariants.map((row) => ({
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
        visaType: String(row.visaType || "").trim(),
        entryType: String(row.entryType || "").trim(),
        durationDays: String(row.durationDays || "").trim(),
        processingSpeed: String(row.processingSpeed || "").trim(),
        visaFee: Number(row.visaFee) || 0,
        commission: Number(row.commission) || 0,
        totalPrice: calcVariantTotal(row),
        currency: String(row.currency || "BDT").trim(),
<<<<<<< HEAD
      };
      if (row.visaVariantId != null && row.visaVariantId !== "") {
        item.visaVariantId = Number(row.visaVariantId) || row.visaVariantId;
      }
      return item;
    });
    formData.append("variants", JSON.stringify(variants));

    generalDocuments
      .map((doc) => String(doc || "").trim())
      .filter(Boolean)
      .forEach((doc) => formData.append("generalDocuments", doc));

    const cleanRequirements = requirements
      .map((group) => ({
        occupation: String(group.occupation || "").trim(),
        requirements: (group.requirements || []).map((text) => String(text || "").trim()).filter(Boolean),
      }))
      .filter((group) => group.occupation && group.requirements.length > 0);
    if (cleanRequirements.length) {
      formData.append("requirements", JSON.stringify(cleanRequirements));
    }

    const cleanFaqs = faqs
      .map((item) => ({
        question: String(item.question || "").trim(),
        answer: String(item.answer || "").trim(),
      }))
      .filter((item) => item.question && item.answer);
    if (cleanFaqs.length) {
      formData.append("faqs", JSON.stringify(cleanFaqs));
    }

    return formData;
  };

  const validateGeneral = () => {
=======
      })),
      requirements: requirements
        .map((group) => ({
          occupation: String(group.occupation || "").trim(),
          requirements: (group.requirements || []).map((text) => String(text || "").trim()).filter(Boolean),
        }))
        .filter((group) => group.occupation && group.requirements.length > 0),
    };

    return payload;
  };

  const validate = () => {
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
    return true;
  };

  const validatePricing = () => {
=======
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
    return true;
  };

  const validateRequirements = () => {
=======

>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
    const filledGroups = requirements
      .map((group) => ({
        occupation: String(group.occupation || "").trim(),
        requirements: (group.requirements || []).map((text) => String(text || "").trim()).filter(Boolean),
      }))
      .filter((group) => group.occupation || group.requirements.length > 0);

    if (filledGroups.length === 0) {
      toast.error("Add at least one occupation with requirements.");
      setActiveTab(2);
      return false;
    }

    for (let i = 0; i < filledGroups.length; i += 1) {
      const group = filledGroups[i];
      if (!group.occupation) {
        toast.error(`Occupation group ${i + 1}: occupation is required.`);
        setActiveTab(2);
        return false;
      }
      if (group.requirements.length === 0) {
        toast.error(`"${group.occupation}": add at least one requirement.`);
        setActiveTab(2);
        return false;
      }
    }
<<<<<<< HEAD
    return true;
  };

  const validateFaqs = () => {
    for (let i = 0; i < faqs.length; i += 1) {
      const question = String(faqs[i].question || "").trim();
      const answer = String(faqs[i].answer || "").trim();
      if (question && !answer) {
        toast.error(`FAQ ${i + 1}: answer is required.`);
        setActiveTab(3);
        return false;
      }
      if (answer && !question) {
        toast.error(`FAQ ${i + 1}: question is required.`);
        setActiveTab(3);
        return false;
      }
    }
    return true;
  };

  const tabValidators = [validateGeneral, validatePricing, validateRequirements, validateFaqs];
  const isLastTab = activeTab === TABS.length - 1;

  const validate = () => tabValidators.every((check) => check());

  const goToNextTab = () => {
    if (!tabValidators[activeTab]()) return;
    setActiveTab((prev) => Math.min(prev + 1, TABS.length - 1));
  };

  const goToPreviousTab = () => {
    setActiveTab((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLastTab) {
      goToNextTab();
      return;
    }
=======

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
      const formData = buildFormData();
      const headers = {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      };

      const response = isEditing
        ? await axios.patch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_VISA(editingVisaId)}`, formData, { headers })
        : await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CREATE_VISA}`, formData, { headers });

      if (response.status === 200 || response.status === 201) {
        if (!isEditing) clearVisaDraft();
=======
      const payload = buildPayload();
      const headers = {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      };

      const response = isEditing
        ? await axios.patch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_VISA(editingVisaId)}`, payload, { headers })
        : await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CREATE_VISA}`, payload, { headers });

      if (response.status === 200 || response.status === 201) {
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
            Departure Country <span style={{ color: C.danger }}>*</span>
=======
            From Country <span style={{ color: C.danger }}>*</span>
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
          </Typography>
          <CountryAutocompleteField
            value={departureCountry}
            options={countryOptions}
            loading={countriesLoading}
            onChange={setDepartureCountry}
<<<<<<< HEAD
            placeholder="e.g. Bangladesh"
=======
            placeholder="Select from country"
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography sx={labelSx}>
<<<<<<< HEAD
            Arrival Country <span style={{ color: C.danger }}>*</span>
=======
            To Country <span style={{ color: C.danger }}>*</span>
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
          </Typography>
          <CountryAutocompleteField
            value={arrivalCountry}
            options={countryOptions}
            loading={countriesLoading}
            onChange={setArrivalCountry}
<<<<<<< HEAD
            placeholder="e.g. United States"
=======
            placeholder="Select to country"
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
          />
        </Grid>
        <Grid item xs={12}>
          <Typography sx={labelSx}>Description</Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
<<<<<<< HEAD
            placeholder="Tourist visa for US travel"
=======
            placeholder="Enter Visa Description"
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={multilineFieldSx}
          />
        </Grid>
<<<<<<< HEAD
        <Grid item xs={12} md={6}>
          <Typography sx={labelSx}>Notice</Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Interview may be required. Processing times can vary."
            helperText="Optional notice shown with this visa"
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            sx={multilineFieldSx}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography sx={labelSx}>Stay Period</Typography>
          <TextField
            fullWidth
            placeholder="30 days"
            helperText="How long the traveler may stay"
            value={stayPeriod}
            onChange={(e) => setStayPeriod(e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography sx={labelSx}>Special Notice</Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            placeholder="Embassy appointments are limited this month."
            helperText="Optional special notice shown with this visa"
            value={specialNotice}
            onChange={(e) => setSpecialNotice(e.target.value)}
            sx={multilineFieldSx}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography sx={labelSx}>Discount %</Typography>
          <TextField
            fullWidth
            type="number"
            placeholder="10"
            helperText="0–100, applied to every variant price"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            sx={fieldSx}
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography sx={labelSx}>Discount Amount</Typography>
          <TextField
            fullWidth
            type="number"
            placeholder="20"
            helperText="Fixed amount after % discount"
            value={discountAmount}
            onChange={(e) => setDiscountAmount(e.target.value)}
            sx={fieldSx}
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography sx={labelSx}>Active</Typography>
=======
        <Grid item xs={12}>
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
          <Box
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 1.5,
              px: 2,
<<<<<<< HEAD
              py: 0.5,
              bgcolor: "#FFFFFF",
              height: INPUT_HEIGHT + 8,
              display: "flex",
              alignItems: "center",
=======
              py: 1,
              bgcolor: "#FFFFFF",
              width: "fit-content",
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
              label={<Typography sx={{ fontSize: 14, fontWeight: 600, color: C.primary }}>isActive</Typography>}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography sx={labelSx}>
            Visa Image {isEditing ? "(optional on update)" : ""}
          </Typography>
          <input
            ref={imageInputRef}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              onImageChange(file);
              e.target.value = "";
            }}
          />
          <Box
            onClick={() => imageInputRef.current?.click()}
            sx={{
              border: `2px dashed ${imagePreview || imageFile ? C.secondary : C.border}`,
              borderRadius: 2,
              p: 2,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: imagePreview || imageFile ? "rgba(2, 77, 175, 0.04)" : "#F8FAFC",
            }}
          >
            {imagePreview ? (
              <Box
                component="img"
                src={imagePreview}
                alt="Visa"
                sx={{
                  maxWidth: "100%",
                  maxHeight: 160,
                  objectFit: "contain",
                  borderRadius: 1,
                  mb: 1,
                  display: "block",
                  mx: "auto",
                }}
              />
            ) : (
              <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: C.muted, mb: 0.5 }} />
            )}
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: C.primary }}>
              {imageFile ? imageFile.name : "Choose File (jpeg/png/webp)"}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: C.muted, mt: 0.35 }}>
              Field: imageURL — omit on update to keep current image
            </Typography>
          </Box>
          {(imageFile || imagePreview) && (
            <Button
              type="button"
              size="small"
              onClick={() => {
                if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
                setImageFile(null);
                setImagePreview(
                  isEditing
                    ? resolveVisaImageUrl(
                        visaFromState?.imageURL || visaFromState?.imageUrl || visaFromState?.image || "",
                      )
                    : "",
                );
              }}
              sx={{ mt: 1, textTransform: "none", color: C.danger }}
            >
              Clear new image
            </Button>
          )}
        </Grid>
=======
              label={<Typography sx={{ fontSize: 14, fontWeight: 600, color: C.primary }}>Active</Typography>}
            />
          </Box>
        </Grid>
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          border: `1px solid ${C.border}`,
          borderRadius: 2,
          bgcolor: "#F8FAFC",
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.primary, lineHeight: 1.2 }}>
            General Documents
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: C.muted, mt: 0.25 }}>
            Documents that apply to every applicant. Only one general documents list per visa.
          </Typography>
        </Box>
        <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {generalDocuments.map((doc, index) => (
            <Box key={`gen-doc-${index}`} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                fullWidth
                placeholder={index === 0 ? "Valid passport" : "e.g. Recent photograph"}
                value={doc}
                onChange={(e) => updateGeneralDocument(index, e.target.value)}
                sx={fieldSx}
              />
              <IconButton
                type="button"
                onClick={() => removeGeneralDocument(index)}
                sx={{
                  width: INPUT_HEIGHT,
                  height: INPUT_HEIGHT,
                  borderRadius: 1,
                  border: `1px solid ${C.border}`,
                  color: C.danger,
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            type="button"
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={addGeneralDocument}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: 12.5,
              alignSelf: "flex-start",
              borderColor: "#BFDBFE",
              color: C.secondary,
            }}
          >
            Add string item
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          border: `1px solid ${C.border}`,
          borderRadius: 2,
          bgcolor: "#F8FAFC",
          overflow: "hidden",
        }}
      >
=======
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: 2,
        bgcolor: "#F8FAFC",
        overflow: "hidden",
      }}
    >
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 2,
          pt: 2,
          pb: 1,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FactCheckOutlinedIcon sx={{ fontSize: 20, color: C.secondary }} />
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.primary, lineHeight: 1.2 }}>
<<<<<<< HEAD
              Occupation Requirements
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: C.muted, mt: 0.25 }}>
              Occupation-wise visa documents. Each occupation may appear only once.
=======
              Visa Requirements
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: C.muted, mt: 0.25 }}>
              Group documents by occupation
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1.75 }}>
        {requirements.map((group, groupIndex) => (
          <Box
            key={`occupation-group-${groupIndex}`}
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(15, 47, 86, 0.04)",
            }}
          >
            <Box
              sx={{
                px: 1.75,
                py: 1.35,
                bgcolor: "rgba(2, 77, 175, 0.05)",
                borderBottom: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ ...labelSx, mb: 0.65 }}>
                  Occupation <span style={{ color: C.danger }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. Software Engineer"
                  value={group.occupation}
                  onChange={(e) => updateOccupation(groupIndex, e.target.value)}
                  sx={fieldSx}
                />
              </Box>
              <IconButton
                type="button"
                onClick={() => removeOccupationGroup(groupIndex)}
                aria-label={`Remove occupation group ${groupIndex + 1}`}
                sx={{
                  width: INPUT_HEIGHT,
                  height: INPUT_HEIGHT,
                  borderRadius: 1,
                  bgcolor: "#FEF2F2",
                  color: C.danger,
                  flexShrink: 0,
                  mb: 0.1,
                  border: "1px solid #FECACA",
                  "&:hover": { bgcolor: "#FEE2E2" },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ p: 1.75 }}>
              <Typography sx={{ ...labelSx, mb: 1 }}>
                Requirements <span style={{ color: C.danger }}>*</span>
              </Typography>

              {(group.requirements || []).map((item, itemIndex) => (
                <Box
                  key={`requirement-${groupIndex}-${itemIndex}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.15,
                  }}
                >
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      bgcolor: "#EAF2FF",
                      color: C.secondary,
                      fontSize: 11,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {itemIndex + 1}
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="e.g. Valid passport"
                    value={item}
                    onChange={(e) => updateRequirementItem(groupIndex, itemIndex, e.target.value)}
                    sx={fieldSx}
                  />
                  <IconButton
                    type="button"
                    onClick={() => removeRequirementItem(groupIndex, itemIndex)}
                    aria-label={`Remove requirement ${itemIndex + 1}`}
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
                variant="outlined"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => addRequirementItem(groupIndex)}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12.5,
                  borderRadius: 1.25,
                  borderColor: "#BFDBFE",
                  color: C.secondary,
                  bgcolor: "#F8FBFF",
                  "&:hover": { borderColor: C.secondary, bgcolor: "#EFF6FF" },
                }}
              >
                Add Requirement
              </Button>
            </Box>
          </Box>
        ))}

        <Button
          type="button"
          fullWidth
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={addOccupationGroup}
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
          Add Occupation
        </Button>
      </Box>
<<<<<<< HEAD
      </Box>
    </Box>
  );

  const renderFaqsTab = () => (
    <Box
      sx={{
        border: `1px solid ${C.border}`,
        borderRadius: 2,
        bgcolor: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, pt: 2, pb: 1 }}>
        <HelpOutlineOutlinedIcon sx={{ fontSize: 20, color: C.secondary }} />
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: C.primary, lineHeight: 1.2 }}>
            FAQs
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: C.muted, mt: 0.25 }}>
            Frequently asked questions for this visa. Optional.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1.75 }}>
        {faqs.map((item, index) => (
          <Box
            key={`faq-${index}`}
            sx={{
              border: `1px solid ${C.border}`,
              borderRadius: 2,
              bgcolor: "#FFFFFF",
              p: 1.75,
              boxShadow: "0 2px 10px rgba(15, 47, 86, 0.04)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: C.secondary }}>
                FAQ #{index + 1}
              </Typography>
              <IconButton
                type="button"
                onClick={() => removeFaq(index)}
                aria-label={`Remove FAQ ${index + 1}`}
                sx={{
                  width: INPUT_HEIGHT,
                  height: INPUT_HEIGHT,
                  borderRadius: 1,
                  bgcolor: "#FEF2F2",
                  color: C.danger,
                  border: "1px solid #FECACA",
                  "&:hover": { bgcolor: "#FEE2E2" },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography sx={labelSx}>Question</Typography>
            <TextField
              fullWidth
              placeholder="How long does processing take?"
              value={item.question}
              onChange={(e) => updateFaq(index, "question", e.target.value)}
              sx={{ ...fieldSx, mb: 1.25 }}
            />
            <Typography sx={labelSx}>Answer</Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="Standard processing takes 5-7 working days."
              value={item.answer}
              onChange={(e) => updateFaq(index, "answer", e.target.value)}
              sx={multilineFieldSx}
            />
          </Box>
        ))}

        <Button
          type="button"
          fullWidth
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={addFaq}
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
          Add FAQ
        </Button>
      </Box>
    </Box>
  );

  const tabPanels = [renderGeneralTab, renderPricingTab, renderRequirementsTab, renderFaqsTab];
=======
    </Box>
  );

  const tabPanels = [renderGeneralTab, renderPricingTab, renderRequirementsTab];
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5

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
<<<<<<< HEAD
          subtitle="POST /visa/createVisa — multipart form with variants, documents & requirements"
=======
          subtitle="Configure visa route, pricing, and requirements"
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
              onClick={() => {
                if (!isEditing) clearVisaDraft();
                navigate("/dashboard/visa/allvisa");
              }}
=======
              onClick={() => navigate("/dashboard/visa/allvisa")}
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
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
<<<<<<< HEAD
            {activeTab > 0 ? (
              <Button
                type="button"
                variant="outlined"
                disabled={loading}
                startIcon={<ArrowBackIcon />}
                onClick={goToPreviousTab}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 1.5,
                  px: 3,
                  color: C.secondary,
                  borderColor: "#BFDBFE",
                  bgcolor: "#FFFFFF",
                }}
              >
                Back
              </Button>
            ) : null}
            {isLastTab ? (
              <Button
                key="submit"
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
            ) : (
              <Button
                key="next"
                type="button"
                variant="contained"
                disabled={loading}
                endIcon={<ArrowForwardIcon />}
                onClick={goToNextTab}
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
                Next
              </Button>
            )}
=======
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
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
