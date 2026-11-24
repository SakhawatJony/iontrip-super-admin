import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL, TOUR_API_BASE_URL, API_ENDPOINTS } from "../config/api.js";
import AdminPageTitleBar from "./AdminPageTitleBar.jsx";

const C = {
  pageBg: "#F5F7FB",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  primary: "#024DAF",
  primaryDark: "#0F2F56",
  softBlue: "#E8F1FF",
  softTeal: "#E0F7F5",
  softOrange: "#FFF4E5",
  softPurple: "#F3E8FF",
  softPink: "#FCE7F3",
  softGreen: "#DCFCE7",
  shadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: "8px",
    fontSize: 13,
    "& fieldset": { borderColor: C.border },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused fieldset": { borderColor: C.primary, borderWidth: 1 },
  },
  "& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)": { height: 42 },
  "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
    py: 0,
    px: 1.5,
    height: 42,
    boxSizing: "border-box",
  },
  "& .MuiInputLabel-root": {
    position: "static",
    transform: "none",
    display: "block",
    mb: 0.75,
    fontSize: 12.5,
    fontWeight: 600,
    color: C.text,
    "&.MuiInputLabel-shrink": { transform: "none" },
    "&.Mui-focused": { color: C.primary },
  },
};

const multilineSx = {
  ...fieldSx,
  "& .MuiOutlinedInput-root.MuiInputBase-multiline": { height: "auto" },
  "& .MuiOutlinedInput-inputMultiline": { py: 1.25, px: 1.5 },
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function showApiError(err, fallback = "Failed to create tour package.") {
  const data = err?.response?.data;
  if (Array.isArray(data?.message) && data.message.length) {
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

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.catagories)) return payload.catagories;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories;
  if (Array.isArray(payload?.data?.catagories)) return payload.data.catagories;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

function categoryLabel(item) {
  if (typeof item === "string") return item.trim();
  return String(item?.name || item?.title || item?.category || item?.label || "").trim();
}

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
    if (payload.data.title || payload.data.packageId || payload.data._id || payload.data.id) return payload.data;
  }
  if (payload?.title || payload?.packageId || payload?._id || payload?.id) return payload;
  return null;
}

function SectionCard({ icon: Icon, title, subtitle, accent, softBg, children, action }) {
  return (
    <Box
      sx={{
        bgcolor: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "10px",
        boxShadow: C.shadow,
        p: { xs: 2, md: 2.5 },
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.25, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: softBg,
              color: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</Typography>
            {subtitle ? (
              <Typography sx={{ fontSize: 12, color: C.muted }}>{subtitle}</Typography>
            ) : null}
          </Box>
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}

function AddRemoveBtn({ onClick, remove = false, label }) {
  return (
    <Button
      size="small"
      variant={remove ? "outlined" : "contained"}
      startIcon={remove ? <RemoveIcon /> : <AddIcon />}
      onClick={onClick}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        borderRadius: "8px",
        ...(remove
          ? { borderColor: "#FECACA", color: "#DC2626", "&:hover": { bgcolor: "#FEF2F2", borderColor: "#F87171" } }
          : { bgcolor: C.primary, "&:hover": { bgcolor: C.primaryDark } }),
      }}
    >
      {label || (remove ? "Remove" : "Add")}
    </Button>
  );
}

function StringListEditor({ items, onChange, placeholder = "Enter value", addLabel = "Add item" }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {items.map((value, index) => (
        <Box key={`str-${index}`} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            fullWidth
            size="small"
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const next = [...items];
              next[index] = e.target.value;
              onChange(next);
            }}
            sx={fieldSx}
          />
          <IconButton
            size="small"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            sx={{ border: `1px solid ${C.border}`, borderRadius: 1, color: "#DC2626" }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Box>
        <AddRemoveBtn label={addLabel} onClick={() => onChange([...items, ""])} />
      </Box>
    </Box>
  );
}

const MONTH_OPTIONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const tourCalendarSx = {
  width: 300,
  maxWidth: "100%",
  "& .MuiDayCalendar-header": {
    justifyContent: "space-between",
    px: 0.5,
  },
  "& .MuiDayCalendar-weekDayLabel": {
    width: 34,
    height: 28,
    margin: 0,
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },
  "& .MuiDayCalendar-weekContainer": {
    justifyContent: "space-between",
    margin: "2px 0",
  },
  "& .MuiPickersDay-root": {
    width: 34,
    height: 34,
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    borderRadius: "50%",
  },
};

const headerSelectSx = {
  height: 32,
  borderRadius: "8px",
  fontSize: 13,
  fontWeight: 600,
  color: C.primaryDark,
  bgcolor: "#FFFFFF",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#94A3B8" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.primary, borderWidth: 1 },
  "& .MuiSelect-select": { py: 0.5, px: 1.25 },
};

function TourCalendarHeader({ currentMonth, onMonthChange, onSelectOpenChange }) {
  const now = dayjs();
  const currentYear = now.year();
  const year = Math.max(currentMonth.year(), currentYear);
  const years = Array.from({ length: 16 }, (_, i) => currentYear + i);

  const selectMenuProps = {
    disablePortal: false,
    keepMounted: false,
    anchorOrigin: { vertical: "bottom", horizontal: "left" },
    transformOrigin: { vertical: "top", horizontal: "left" },
    marginThreshold: 8,
    slotProps: {
      paper: {
        onMouseDown: (e) => e.stopPropagation(),
        sx: {
          maxHeight: 220,
          mt: 0.5,
          zIndex: 2000,
          boxShadow: "0 8px 24px rgba(15, 47, 86, 0.16)",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
        },
      },
      root: {
        sx: { zIndex: 2000 },
        onMouseDown: (e) => e.stopPropagation(),
      },
    },
    // MUI v5/v6 fallback
    PaperProps: {
      onMouseDown: (e) => e.stopPropagation(),
      sx: {
        maxHeight: 220,
        mt: 0.5,
        zIndex: 2000,
        boxShadow: "0 8px 24px rgba(15, 47, 86, 0.16)",
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
      },
    },
    MenuListProps: {
      onMouseDown: (e) => e.stopPropagation(),
      dense: true,
    },
    style: { zIndex: 2000 },
  };

  return (
    <Box
      sx={{ px: 0.5, pt: 0.5, pb: 1 }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 1 }}>
        <IconButton
          size="small"
          disabled={currentMonth.isSame(now, "month") || currentMonth.isBefore(now, "month")}
          onClick={() => {
            const prev = currentMonth.subtract(1, "month");
            if (prev.isBefore(now, "month")) return;
            onMonthChange(prev);
          }}
          sx={{ color: "#94A3B8", p: 0.5 }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ display: "flex", gap: 1, flex: 1, justifyContent: "center" }}>
          <Select
            size="small"
            value={currentMonth.month()}
            onOpen={() => onSelectOpenChange?.(true)}
            onClose={() => {
              // Delay so DatePicker click-away does not close while menu is settling
              window.setTimeout(() => onSelectOpenChange?.(false), 300);
            }}
            onChange={(e) => {
              const nextMonth = Number(e.target.value);
              let next = currentMonth.month(nextMonth);
              if (next.isBefore(now, "month")) next = now.startOf("month");
              onMonthChange(next);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            MenuProps={selectMenuProps}
            sx={{ ...headerSelectSx, minWidth: 78 }}
          >
            {MONTH_OPTIONS.map((label, idx) => {
              const disabled =
                currentMonth.year() < currentYear ||
                (currentMonth.year() === currentYear && idx < now.month());
              return (
                <MenuItem key={label} value={idx} disabled={disabled} sx={{ fontSize: 13 }}>
                  {label}
                </MenuItem>
              );
            })}
          </Select>
          <Select
            size="small"
            value={year}
            onOpen={() => onSelectOpenChange?.(true)}
            onClose={() => {
              window.setTimeout(() => onSelectOpenChange?.(false), 300);
            }}
            onChange={(e) => {
              const nextYear = Number(e.target.value);
              let next = currentMonth.year(nextYear);
              if (next.isBefore(now, "month")) next = now.startOf("month");
              onMonthChange(next);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            MenuProps={selectMenuProps}
            sx={{ ...headerSelectSx, minWidth: 88 }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y} sx={{ fontSize: 13 }}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <IconButton
          size="small"
          onClick={() => onMonthChange(currentMonth.add(1, "month"))}
          sx={{ color: C.primary, p: 0.5 }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Typography
        sx={{
          textAlign: "center",
          fontSize: 15,
          fontWeight: 800,
          color: C.primaryDark,
          letterSpacing: 0.2,
        }}
      >
        {currentMonth.format("MMMM YYYY")}
      </Typography>
    </Box>
  );
}

function TourPickersDay(props) {
  const { day, outsideCurrentMonth, selected, ...other } = props;
  const today = dayjs().startOf("day");
  const isPast = !outsideCurrentMonth && day.isBefore(today, "day");
  const isToday = !outsideCurrentMonth && day.isSame(today, "day");

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      selected={selected}
      sx={{
        ...(outsideCurrentMonth && {
          bgcolor: "#EEF2F7 !important",
          color: "transparent !important",
          pointerEvents: "none",
        }),
        ...(!outsideCurrentMonth &&
          !selected &&
          (isPast || isToday) && {
            bgcolor: "#EEF2F7",
            color: "#64748B",
            "&:hover": { bgcolor: "#E2E8F0" },
          }),
        ...(!outsideCurrentMonth &&
          !selected &&
          !isPast &&
          !isToday && {
            bgcolor: "transparent",
            color: C.primaryDark,
            "&:hover": { bgcolor: "#E8F1FF" },
          }),
        ...(selected && {
          bgcolor: `${C.primary} !important`,
          color: "#FFFFFF !important",
          fontWeight: 800,
          "&:hover, &:focus": { bgcolor: "#013A94 !important" },
        }),
      }}
    />
  );
}

function DateListEditor({ items, onChange, addLabel = "Add date" }) {
  const [openIndex, setOpenIndex] = useState(null);
  const selectOpenRef = useRef(false);
  const skipReopenRef = useRef(false);

  const openPicker = (index) => {
    if (skipReopenRef.current) return;
    setOpenIndex(index);
  };

  const closePicker = () => {
    skipReopenRef.current = true;
    setOpenIndex(null);
    window.setTimeout(() => {
      skipReopenRef.current = false;
    }, 250);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((value, index) => (
          <Box key={`date-${index}`} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <DatePicker
              value={value ? dayjs(value) : null}
              format="YYYY-MM-DD"
              open={openIndex === index}
              onOpen={() => openPicker(index)}
              onClose={() => {
                if (selectOpenRef.current) return;
                closePicker();
              }}
              onChange={(date) => {
                const next = [...items];
                next[index] = date && date.isValid() ? date.format("YYYY-MM-DD") : "";
                onChange(next);
                if (date && date.isValid()) closePicker();
              }}
              closeOnSelect
              minDate={dayjs().startOf("day")}
              showDaysOutsideCurrentMonth
              dayOfWeekFormatter={(d) => {
                if (typeof d === "string") return d.charAt(0).toUpperCase();
                return d.format("dd").charAt(0).toUpperCase();
              }}
              slots={{
                calendarHeader: (headerProps) => (
                  <TourCalendarHeader
                    {...headerProps}
                    onSelectOpenChange={(isOpen) => {
                      selectOpenRef.current = isOpen;
                    }}
                  />
                ),
                day: TourPickersDay,
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  placeholder: "Select date",
                  InputLabelProps: { shrink: true },
                  sx: { ...fieldSx, cursor: "pointer", "& input": { cursor: "pointer" } },
                  onClick: () => openPicker(index),
                  inputProps: { readOnly: true },
                },
                openPickerButton: {
                  sx: { color: C.primary },
                },
                desktopPaper: {
                  sx: {
                    borderRadius: "14px",
                    boxShadow: "0 12px 40px rgba(15, 47, 86, 0.16)",
                    border: "1px solid #E2E8F0",
                    overflow: "hidden",
                    p: 0.5,
                  },
                },
                mobilePaper: {
                  sx: {
                    borderRadius: "14px",
                    overflow: "hidden",
                  },
                },
                popper: {
                  disablePortal: false,
                  onMouseDown: (e) => e.stopPropagation(),
                },
                calendar: {
                  sx: tourCalendarSx,
                },
                day: {
                  disableHighlightToday: true,
                },
              }}
            />
            <IconButton
              size="small"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              sx={{ border: `1px solid ${C.border}`, borderRadius: 1, color: "#DC2626" }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Box>
          <AddRemoveBtn label={addLabel} onClick={() => onChange([...items, ""])} />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

function FilePick({ label, file, preview, onChange, accept = "image/jpeg,image/png,image/webp" }) {
  const inputRef = useRef(null);
  return (
    <Box>
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.text, mb: 0.75 }}>{label}</Typography>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0] || null;
          onChange(f);
        }}
      />
      <Box
        onClick={() => inputRef.current?.click()}
        sx={{
          border: `2px dashed ${preview || file ? C.primary : C.border}`,
          borderRadius: "10px",
          p: 1.5,
          textAlign: "center",
          cursor: "pointer",
          bgcolor: preview || file ? C.softBlue : "#F8FAFC",
        }}
      >
        {preview ? (
          <Box
            component="img"
            src={preview}
            alt=""
            sx={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 1, mb: 1 }}
          />
        ) : (
          <CloudUploadOutlinedIcon sx={{ fontSize: 32, color: C.primary, mb: 0.5 }} />
        )}
        <Typography sx={{ fontSize: 12, color: C.muted }}>
          {file?.name || "Click to upload (jpeg / png / webp)"}
        </Typography>
      </Box>
    </Box>
  );
}

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
        <PlaceOutlinedIcon sx={{ fontSize: size * 0.7, color: C.muted }} />
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

const countryPopupPaperSx = {
  mt: 0.75,
  borderRadius: "12px",
  border: `1px solid ${C.border}`,
  boxShadow: "0 16px 40px rgba(15, 47, 86, 0.16)",
  overflow: "hidden",
};

const countryListboxSx = {
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

function TourCountryField({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ isActive: "true", page: "1", limit: "20" });
        const q = query.trim();
        if (q) params.append("name", q);
        const response = await axios.get(
          `${TOUR_API_BASE_URL}${API_ENDPOINTS.TOUR_COUNTRY_SEARCH}?${params.toString()}`,
          { signal: controller.signal },
        );
        const body = response?.data || {};
        const list = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
        setOptions(
          list
            .map((item) => ({
              name: String(item?.name || "").trim(),
              code: String(item?.code || "").trim().toUpperCase(),
            }))
            .filter((item) => item.name),
        );
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        console.error("Search tour countries failed:", err?.response?.data || err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, query.trim() ? 350 : 0);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [open, query]);

  const selected = value
    ? options.find((item) => item.name.toLowerCase() === value.toLowerCase()) || { name: value, code: "" }
    : null;

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => {
        setOpen(false);
        setQuery("");
      }}
      options={options}
      value={selected}
      loading={loading}
      filterOptions={(items) => items}
      getOptionLabel={(option) => option?.name || ""}
      isOptionEqualToValue={(option, val) => option?.name?.toLowerCase() === val?.name?.toLowerCase()}
      onChange={(_, next) => onChange(next?.name || "")}
      onInputChange={(_, text, reason) => {
        if (reason === "input") setQuery(text);
      }}
      slotProps={{
        paper: { sx: countryPopupPaperSx },
        listbox: { sx: countryListboxSx },
      }}
      renderOption={(props, option, { selected: isSelected }) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest}>
            <CountryFlag code={option.code} />
            <Typography
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: 13.5,
                fontWeight: isSelected ? 700 : 500,
                color: C.text,
                textTransform: "capitalize",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {option.name}
            </Typography>
            {option.code ? (
              <Box
                component="span"
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  color: C.primary,
                  bgcolor: C.softBlue,
                  borderRadius: "6px",
                  px: 0.85,
                  py: 0.25,
                  flexShrink: 0,
                }}
              >
                {option.code}
              </Box>
            ) : null}
            {isSelected ? <CheckRoundedIcon sx={{ fontSize: 18, color: C.primary, flexShrink: 0 }} /> : null}
          </Box>
        );
      }}
      noOptionsText={
        <Typography sx={{ fontSize: 13, color: C.muted, px: 0.5 }}>
          {loading ? "Loading countries…" : "No countries found"}
        </Typography>
      }
      loadingText={
        <Typography sx={{ fontSize: 13, color: C.muted, px: 0.5 }}>Loading countries…</Typography>
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Country"
          placeholder="Search country"
          InputLabelProps={{ shrink: true }}
          sx={{ ...fieldSx, "& .MuiAutocomplete-inputRoot": { py: "0 !important" } }}
          InputProps={{
            ...params.InputProps,
            startAdornment: selected ? (
              <Box sx={{ display: "flex", alignItems: "center", pl: 0.75 }}>
                <CountryFlag code={selected.code} size={18} />
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", pl: 0.75, color: C.muted }}>
                <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
              </Box>
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
    />
  );
}

export default function AddTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { token } = useAuth();
  const authToken = token || localStorage.getItem("adminToken") || "";

  const editPackageId = String(params.packageId || "").trim();
  const isEdit = Boolean(editPackageId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Basic
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locations, setLocations] = useState([""]);
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");

  // Duration / pricing
  const [durationDays, setDurationDays] = useState("");
  const [durationNights, setDurationNights] = useState("");
  const [startDates, setStartDates] = useState([""]);
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [discountPercent, setDiscountPercent] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");

  // Media / description
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [specialNotice, setSpecialNotice] = useState("");
  const [policy, setPolicy] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videoURL, setVideoURL] = useState("");

  // Complex arrays
  const [highlights, setHighlights] = useState([{ title: "", description: "" }]);
  const [itinerary, setItinerary] = useState([{ day: 1, title: "", description: "", imageURL: "" }]);
  const [includes, setIncludes] = useState([""]);
  const [excludes, setExcludes] = useState([""]);
  const [hotels, setHotels] = useState([
    { name: "", stars: "", location: "", imageURL: "", description: "" },
  ]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [tags, setTags] = useState([""]);
  const [route, setRoute] = useState([{ name: "", label: "" }]);

  // Meta
  const [idealFor, setIdealFor] = useState("");
  const [rating, setRating] = useState("");
  const [reviewCount, setReviewCount] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);

  const galleryInputRef = useRef(null);

  const applyPackageToForm = (pkg) => {
    if (!pkg) return;
    setTitle(String(pkg.title || ""));
    setSubtitle(String(pkg.subtitle || ""));
    setLocationName(String(pkg.location || ""));
    const locs = asArray(pkg.locations).map(String);
    setLocations(locs.length ? locs : [""]);
    setCountry(String(pkg.country || ""));
    setCategory(String(pkg.category || ""));
    setDurationDays(pkg.durationDays != null ? String(pkg.durationDays) : "");
    setDurationNights(pkg.durationNights != null ? String(pkg.durationNights) : "");
    const dates = asArray(pkg.startDates).map(String);
    setStartDates(dates.length ? dates : [""]);
    setPricePerPerson(pkg.pricePerPerson != null ? String(pkg.pricePerPerson) : "");
    setCurrency(String(pkg.currency || "BDT"));
    setDiscountPercent(pkg.discountPercent != null ? String(pkg.discountPercent) : "");
    setOriginalPrice(pkg.originalPrice != null ? String(pkg.originalPrice) : "");
    setDescription(String(pkg.description || ""));
    setNotice(String(pkg.notice || ""));
    setSpecialNotice(String(pkg.specialNotice || ""));
    setPolicy(String(pkg.policy || ""));
    setCoverImage(null);
    setCoverPreview(
      resolveMediaUrl(pkg.coverImageURL || pkg.coverImage || pkg.coverUrl || pkg.imageURL || ""),
    );
    const gallery = asArray(pkg.galleryImageURLs || pkg.galleryImages || pkg.gallery)
      .map((url) => resolveMediaUrl(url))
      .filter(Boolean)
      .map((preview) => ({ id: uid(), file: null, preview, existing: true }));
    setGalleryFiles(gallery);
    setVideoURL(String(pkg.videoURL || ""));

    const hl = asArray(pkg.highlights).map((h) => ({
      title: String(h?.title || ""),
      description: String(h?.description || ""),
    }));
    setHighlights(hl.length ? hl : [{ title: "", description: "" }]);

    const it = asArray(pkg.itinerary).map((d, i) => ({
      day: Number(d?.day) || i + 1,
      title: String(d?.title || ""),
      description: String(d?.description || ""),
      imageURL: String(d?.imageURL || d?.image || ""),
    }));
    setItinerary(it.length ? it : [{ day: 1, title: "", description: "", imageURL: "" }]);

    const inc = asArray(pkg.includes).map(String);
    setIncludes(inc.length ? inc : [""]);
    const exc = asArray(pkg.excludes).map(String);
    setExcludes(exc.length ? exc : [""]);

    const ht = asArray(pkg.hotels).map((h) => ({
      name: String(h?.name || ""),
      stars: h?.stars != null ? String(h.stars) : "",
      location: String(h?.location || ""),
      imageURL: String(h?.imageURL || h?.image || ""),
      description: String(h?.description || ""),
    }));
    setHotels(ht.length ? ht : [{ name: "", stars: "", location: "", imageURL: "", description: "" }]);

    const fq = asArray(pkg.faqs).map((f) => ({
      question: String(f?.question || ""),
      answer: String(f?.answer || ""),
    }));
    setFaqs(fq.length ? fq : [{ question: "", answer: "" }]);

    const tg = asArray(pkg.tags).map(String);
    setTags(tg.length ? tg : [""]);

    const rt = asArray(pkg.route).map((r) => ({
      name: String(r?.name || ""),
      label: String(r?.label || ""),
    }));
    setRoute(rt.length ? rt : [{ name: "", label: "" }]);

    setIdealFor(String(pkg.idealFor || ""));
    setRating(pkg.rating != null ? String(pkg.rating) : "");
    setReviewCount(pkg.reviewCount != null ? String(pkg.reviewCount) : "");
    setIsActive(pkg.isActive !== false);
    setIsFeatured(Boolean(pkg.isFeatured));
    setIsBestseller(Boolean(pkg.isBestseller));
  };

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CATEGORY_ADMIN}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
          params: { isActive: true, page: 1, limit: 200 },
        });
        if (!cancelled) {
          const names = unwrapList(res?.data).map(categoryLabel).filter(Boolean);
          setCategories([...new Set(names)]);
        }
      } catch {
        if (!cancelled) setCategories([]);
      }
    };
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    const loadPackage = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${TOUR_API_BASE_URL}${API_ENDPOINTS.TOUR_PACKAGE_BY_ID(editPackageId)}`,
          {
            headers: {
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
              Accept: "application/json",
            },
          },
        );
        const pkg = unwrapPackage(response?.data) || location.state?.packageData || null;
        if (!cancelled && pkg) applyPackageToForm(pkg);
        else if (!cancelled) toast.error("Tour package not found.");
      } catch (err) {
        if (!cancelled) {
          if (location.state?.packageData) applyPackageToForm(location.state.packageData);
          else showApiError(err, "Failed to load tour package.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPackage();
    return () => {
      cancelled = true;
    };
  }, [authToken, editPackageId, isEdit, location.state]);

  useEffect(() => {
    return () => {
      if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
      galleryFiles.forEach((item) => {
        if (item.preview && item.preview.startsWith("blob:")) URL.revokeObjectURL(item.preview);
      });
    };
  }, [coverPreview, galleryFiles]);

  const onCoverChange = (file) => {
    if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverImage(file);
    setCoverPreview(file ? URL.createObjectURL(file) : "");
  };

  const onGalleryPick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = Math.max(0, 30 - galleryFiles.length);
    const next = files.slice(0, remaining).map((file) => ({
      id: uid(),
      file,
      preview: URL.createObjectURL(file),
      existing: false,
    }));
    setGalleryFiles((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeGallery = (id) => {
    setGalleryFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.preview && target.preview.startsWith("blob:")) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  };

  const appendStringArray = (formData, key, values) => {
    values
      .map((v) => String(v || "").trim())
      .filter(Boolean)
      .forEach((v) => formData.append(key, v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Title is required");
    if (!locationName.trim()) return toast.error("Primary location is required");
    if (!String(durationDays).trim()) return toast.error("Duration days is required");
    if (!String(pricePerPerson).trim()) return toast.error("Price per person is required");
    if (!isEdit && !coverImage) return toast.error("Cover image is required");
    if (!authToken) return toast.error("Authentication token missing. Please login again.");

    const formData = new FormData();
    formData.append("title", title.trim());
    if (subtitle.trim()) formData.append("subtitle", subtitle.trim());
    formData.append("location", locationName.trim());
    appendStringArray(formData, "locations", locations);
    if (country.trim()) formData.append("country", country.trim());
    if (category.trim() || isEdit) formData.append("category", category.trim());

    formData.append("durationDays", String(Number(durationDays) || 0));
    if (String(durationNights).trim() !== "") {
      formData.append("durationNights", String(Number(durationNights) || 0));
    }
    appendStringArray(formData, "startDates", startDates);
    formData.append("pricePerPerson", String(Number(pricePerPerson) || 0));
    if (currency.trim()) formData.append("currency", currency.trim());
    if (String(discountPercent).trim() !== "") {
      formData.append("discountPercent", String(Number(discountPercent) || 0));
    }
    if (String(originalPrice).trim() !== "") {
      formData.append("originalPrice", String(Number(originalPrice) || 0));
    }

    if (description.trim()) formData.append("description", description.trim());
    if (notice.trim()) formData.append("notice", notice.trim());
    if (specialNotice.trim()) formData.append("specialNotice", specialNotice.trim());
    if (policy.trim()) formData.append("policy", policy.trim());
    if (coverImage) formData.append("coverImage", coverImage);
    galleryFiles.forEach((item) => {
      if (item.file) formData.append("galleryImages", item.file);
    });
    if (videoURL.trim()) formData.append("videoURL", videoURL.trim());

    const cleanHighlights = highlights
      .map((h) => ({ title: String(h.title || "").trim(), description: String(h.description || "").trim() }))
      .filter((h) => h.title || h.description);
    if (cleanHighlights.length) formData.append("highlights", JSON.stringify(cleanHighlights));

    const cleanItinerary = itinerary
      .map((day, index) => ({
        day: Number(day.day) || index + 1,
        title: String(day.title || "").trim(),
        description: String(day.description || "").trim(),
        imageURL: String(day.imageURL || "").trim(),
      }))
      .filter((d) => d.title || d.description || d.imageURL);
    if (cleanItinerary.length) formData.append("itinerary", JSON.stringify(cleanItinerary));

    appendStringArray(formData, "includes", includes);
    appendStringArray(formData, "excludes", excludes);

    const cleanHotels = hotels
      .map((h) => ({
        name: String(h.name || "").trim(),
        stars: h.stars === "" || h.stars == null ? undefined : Number(h.stars),
        location: String(h.location || "").trim(),
        imageURL: String(h.imageURL || "").trim(),
        description: String(h.description || "").trim(),
      }))
      .filter((h) => h.name || h.location || h.description || h.imageURL);
    if (cleanHotels.length) formData.append("hotels", JSON.stringify(cleanHotels));

    const cleanFaqs = faqs
      .map((f) => ({
        question: String(f.question || "").trim(),
        answer: String(f.answer || "").trim(),
      }))
      .filter((f) => f.question || f.answer);
    if (cleanFaqs.length) formData.append("faqs", JSON.stringify(cleanFaqs));

    appendStringArray(formData, "tags", tags);

    const cleanRoute = route
      .map((r) => ({ name: String(r.name || "").trim(), label: String(r.label || "").trim() }))
      .filter((r) => r.name || r.label);
    if (cleanRoute.length) formData.append("route", JSON.stringify(cleanRoute));

    if (idealFor.trim()) formData.append("idealFor", idealFor.trim());
    if (String(rating).trim() !== "") formData.append("rating", String(Number(rating) || 0));
    if (String(reviewCount).trim() !== "") formData.append("reviewCount", String(Number(reviewCount) || 0));
    formData.append("isActive", String(Boolean(isActive)));
    formData.append("isFeatured", String(Boolean(isFeatured)));
    formData.append("isBestseller", String(Boolean(isBestseller)));

    setSaving(true);
    try {
      const headers = {
        Authorization: `Bearer ${authToken}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      };

      const response = isEdit
        ? await axios.patch(
            `${TOUR_API_BASE_URL}${API_ENDPOINTS.TOUR_PACKAGE_BY_ID(editPackageId)}`,
            formData,
            { headers },
          )
        : await axios.post(`${TOUR_API_BASE_URL}${API_ENDPOINTS.TOUR_PACKAGES}`, formData, { headers });

      toast.success(
        response?.data?.message ||
          (isEdit ? "Tour package updated successfully!" : "Tour package created successfully!"),
      );
      setTimeout(() => navigate("/dashboard/tour/alltour"), 500);
    } catch (err) {
      showApiError(err, isEdit ? "Failed to update tour package." : "Failed to create tour package.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setLocationName("");
    setLocations([""]);
    setCountry("");
    setCategory("");
    setDurationDays("");
    setDurationNights("");
    setStartDates([""]);
    setPricePerPerson("");
    setCurrency("BDT");
    setDiscountPercent("");
    setOriginalPrice("");
    setDescription("");
    setNotice("");
    setSpecialNotice("");
    setPolicy("");
    if (coverPreview && coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverImage(null);
    setCoverPreview("");
    galleryFiles.forEach((item) => {
      if (item.preview && item.preview.startsWith("blob:")) URL.revokeObjectURL(item.preview);
    });
    setGalleryFiles([]);
    setVideoURL("");
    setHighlights([{ title: "", description: "" }]);
    setItinerary([{ day: 1, title: "", description: "", imageURL: "" }]);
    setIncludes([""]);
    setExcludes([""]);
    setHotels([{ name: "", stars: "", location: "", imageURL: "", description: "" }]);
    setFaqs([{ question: "", answer: "" }]);
    setTags([""]);
    setRoute([{ name: "", label: "" }]);
    setIdealFor("");
    setRating("");
    setReviewCount("");
    setIsActive(true);
    setIsFeatured(false);
    setIsBestseller(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
        <CircularProgress size={32} sx={{ color: C.primary }} />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ bgcolor: C.pageBg, minHeight: "100%", pb: 3 }}>
      <AdminPageTitleBar
        title={isEdit ? "Edit Tour Package" : "Add Tour Package"}
        subtitle={
          isEdit
            ? `PATCH ${API_ENDPOINTS.TOUR_PACKAGE_BY_ID(editPackageId)}`
            : `POST ${API_ENDPOINTS.TOUR_PACKAGES} — multipart create form`
        }
        action={
          <>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard/tour/alltour")}
              sx={{ textTransform: "none", fontWeight: 600, bgcolor: "#fff", color: C.primary, boxShadow: "none" }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              type="submit"
              disabled={saving}
              sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#fff", color: C.primary, boxShadow: "none" }}
            >
              {saving ? "Saving..." : isEdit ? "Update Package" : "Save Package"}
            </Button>
          </>
        }
      />

      <SectionCard
        icon={LuggageOutlinedIcon}
        title="Basic Info"
        subtitle="Title, location and category"
        accent={C.primary}
        softBg={C.softBlue}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Title *" placeholder="Bangkok & Phuket Holiday Package" value={title} onChange={(e) => setTitle(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Subtitle" placeholder="Two iconic destinations. One unforgettable journey." value={subtitle} onChange={(e) => setSubtitle(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth label="Primary Location *" placeholder="Bangkok" value={locationName} onChange={(e) => setLocationName(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TourCountryField value={country} onChange={setCountry} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                displayEmpty: true,
                MenuProps: {
                  PaperProps: { sx: { maxHeight: 320 } },
                },
                renderValue: (selected) => (selected ? String(selected) : "None"),
              }}
              sx={fieldSx}
            >
              <MenuItem value="">None</MenuItem>
              {category && !categories.includes(category) ? (
                <MenuItem value={category}>{category}</MenuItem>
              ) : null}
              {categories.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.text, mb: 1 }}>
              Additional Locations
            </Typography>
            <StringListEditor items={locations} onChange={setLocations} placeholder="e.g. Phuket" addLabel="Add location" />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        icon={CalendarTodayOutlinedIcon}
        title="Duration & Dates"
        subtitle="Trip length and fixed departures"
        accent="#0D9488"
        softBg={C.softTeal}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="number" label="Duration Days *" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="number" label="Duration Nights" value={durationNights} onChange={(e) => setDurationNights(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.text, mb: 1 }}>
              Start Dates
            </Typography>
            <DateListEditor items={startDates} onChange={setStartDates} addLabel="Add date" />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        icon={PaymentsOutlinedIcon}
        title="Pricing"
        subtitle="Price, currency and discount"
        accent="#D97706"
        softBg={C.softOrange}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="number" label="Price Per Person *" value={pricePerPerson} onChange={(e) => setPricePerPerson(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="number" label="Discount %" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="number" label="Original Price" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        icon={PhotoLibraryOutlinedIcon}
        title="Media & Description"
        subtitle="Cover, gallery (max 30), video, description, notice and policy"
        accent="#7C3AED"
        softBg={C.softPurple}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              placeholder="Experience the best of Thailand with our specially curated package..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={multilineSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Notice"
              placeholder="Limited seats. Confirm your travel date at least 7 days before..."
              helperText="Optional notice shown on the package. Omit if none."
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={multilineSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Policy"
              placeholder="Cancellation: free up to 15 days before departure. After that..."
              helperText="Optional policy / terms section. Omit if none."
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={multilineSx}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Special Notice"
              placeholder="Peak season surcharge may apply for departures in December..."
              helperText="Optional special notice shown on the package. Omit if none."
              value={specialNotice}
              onChange={(e) => setSpecialNotice(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={multilineSx}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <FilePick
              label={isEdit ? "Cover Image (optional — keep existing if empty)" : "Cover Image *"}
              file={coverImage}
              preview={coverPreview}
              onChange={onCoverChange}
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: C.text, mb: 0.75 }}>
              Gallery Images ({galleryFiles.length}/30)
            </Typography>
            <input ref={galleryInputRef} type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={onGalleryPick} />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => galleryInputRef.current?.click()}
              disabled={galleryFiles.length >= 30}
              sx={{ textTransform: "none", mb: 1.5, borderColor: C.border }}
            >
              Add gallery images
            </Button>
            <Grid container spacing={1}>
              {galleryFiles.map((item) => (
                <Grid item xs={6} sm={4} md={3} key={item.id}>
                  <Box sx={{ position: "relative", borderRadius: 1, overflow: "hidden", border: `1px solid ${C.border}` }}>
                    <Box component="img" src={item.preview} alt="" sx={{ width: "100%", height: 90, objectFit: "cover", display: "block" }} />
                    <IconButton
                      size="small"
                      onClick={() => removeGallery(item.id)}
                      sx={{ position: "absolute", top: 4, right: 4, bgcolor: "rgba(255,255,255,0.9)", width: 26, height: 26 }}
                    >
                      <RemoveIcon sx={{ fontSize: 16, color: "#DC2626" }} />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Video URL" placeholder="https://example.com/watch-video" value={videoURL} onChange={(e) => setVideoURL(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard
        icon={StarOutlineIcon}
        title="Highlights"
        subtitle="Array of { title, description }"
        accent="#DB2777"
        softBg={C.softPink}
        action={<AddRemoveBtn label="Add highlight" onClick={() => setHighlights((p) => [...p, { title: "", description: "" }])} />}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {highlights.map((item, index) => (
            <Box key={`hl-${index}`} sx={{ p: 1.5, border: `1px solid ${C.border}`, borderRadius: "8px", bgcolor: "#FAFBFC" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Highlight {index + 1}</Typography>
                <AddRemoveBtn remove label="Remove" onClick={() => setHighlights((p) => p.filter((_, i) => i !== index))} />
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Title" value={item.title} onChange={(e) => {
                    const next = [...highlights];
                    next[index] = { ...item, title: e.target.value };
                    setHighlights(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField fullWidth size="small" label="Description" value={item.description} onChange={(e) => {
                    const next = [...highlights];
                    next[index] = { ...item, description: e.target.value };
                    setHighlights(next);
                  }} sx={fieldSx} />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </SectionCard>

      <SectionCard
        icon={ListAltOutlinedIcon}
        title="Itinerary"
        subtitle="Array of { day, title, description, imageURL }"
        accent={C.primary}
        softBg={C.softBlue}
        action={
          <AddRemoveBtn
            label="Add day"
            onClick={() =>
              setItinerary((p) => [...p, { day: p.length + 1, title: "", description: "", imageURL: "" }])
            }
          />
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {itinerary.map((item, index) => (
            <Box key={`it-${index}`} sx={{ p: 1.5, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Day {index + 1}</Typography>
                <AddRemoveBtn remove label="Remove" onClick={() => setItinerary((p) => p.filter((_, i) => i !== index))} />
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={2}>
                  <TextField fullWidth size="small" type="number" label="Day" value={item.day} onChange={(e) => {
                    const next = [...itinerary];
                    next[index] = { ...item, day: e.target.value };
                    setItinerary(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField fullWidth size="small" label="Title" value={item.title} onChange={(e) => {
                    const next = [...itinerary];
                    next[index] = { ...item, title: e.target.value };
                    setItinerary(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField fullWidth size="small" label="Image URL" value={item.imageURL} onChange={(e) => {
                    const next = [...itinerary];
                    next[index] = { ...item, imageURL: e.target.value };
                    setItinerary(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" multiline minRows={2} label="Description" value={item.description} onChange={(e) => {
                    const next = [...itinerary];
                    next[index] = { ...item, description: e.target.value };
                    setItinerary(next);
                  }} sx={multilineSx} />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </SectionCard>

      <Grid container spacing={2} sx={{ mb: 0 }}>
        <Grid item xs={12} md={6}>
          <SectionCard icon={PlaceOutlinedIcon} title="Includes" subtitle="array&lt;string&gt;" accent="#16A34A" softBg={C.softGreen}>
            <StringListEditor items={includes} onChange={setIncludes} placeholder="Daily breakfast" addLabel="Add include" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard icon={PlaceOutlinedIcon} title="Excludes" subtitle="array&lt;string&gt;" accent="#DC2626" softBg="#FEE2E2">
            <StringListEditor items={excludes} onChange={setExcludes} placeholder="Travel insurance" addLabel="Add exclude" />
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        icon={HotelOutlinedIcon}
        title="Hotels"
        subtitle="Array of { name, stars, location, imageURL, description }"
        accent="#0D9488"
        softBg={C.softTeal}
        action={
          <AddRemoveBtn
            label="Add hotel"
            onClick={() =>
              setHotels((p) => [...p, { name: "", stars: "", location: "", imageURL: "", description: "" }])
            }
          />
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {hotels.map((item, index) => (
            <Box key={`ht-${index}`} sx={{ p: 1.5, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Hotel {index + 1}</Typography>
                <AddRemoveBtn remove label="Remove" onClick={() => setHotels((p) => p.filter((_, i) => i !== index))} />
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth size="small" label="Name" value={item.name} onChange={(e) => {
                    const next = [...hotels];
                    next[index] = { ...item, name: e.target.value };
                    setHotels(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField fullWidth size="small" type="number" label="Stars" value={item.stars} onChange={(e) => {
                    const next = [...hotels];
                    next[index] = { ...item, stars: e.target.value };
                    setHotels(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={6} md={3}>
                  <TextField fullWidth size="small" label="Location" value={item.location} onChange={(e) => {
                    const next = [...hotels];
                    next[index] = { ...item, location: e.target.value };
                    setHotels(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField fullWidth size="small" label="Image URL" value={item.imageURL} onChange={(e) => {
                    const next = [...hotels];
                    next[index] = { ...item, imageURL: e.target.value };
                    setHotels(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Description" value={item.description} onChange={(e) => {
                    const next = [...hotels];
                    next[index] = { ...item, description: e.target.value };
                    setHotels(next);
                  }} sx={fieldSx} />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </SectionCard>

      <SectionCard
        icon={HelpOutlineIcon}
        title="FAQs"
        subtitle="Array of { question, answer }"
        accent="#7C3AED"
        softBg={C.softPurple}
        action={<AddRemoveBtn label="Add FAQ" onClick={() => setFaqs((p) => [...p, { question: "", answer: "" }])} />}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {faqs.map((item, index) => (
            <Box key={`fq-${index}`} sx={{ p: 1.5, border: `1px solid ${C.border}`, borderRadius: "8px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: C.muted }}>FAQ {index + 1}</Typography>
                <AddRemoveBtn remove label="Remove" onClick={() => setFaqs((p) => p.filter((_, i) => i !== index))} />
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Question" value={item.question} onChange={(e) => {
                    const next = [...faqs];
                    next[index] = { ...item, question: e.target.value };
                    setFaqs(next);
                  }} sx={fieldSx} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" multiline minRows={2} label="Answer" value={item.answer} onChange={(e) => {
                    const next = [...faqs];
                    next[index] = { ...item, answer: e.target.value };
                    setFaqs(next);
                  }} sx={multilineSx} />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      </SectionCard>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard icon={LocalOfferOutlinedIcon} title="Tags" subtitle="array&lt;string&gt;" accent="#D97706" softBg={C.softOrange}>
            <StringListEditor items={tags} onChange={setTags} placeholder="Families" addLabel="Add tag" />
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard
            icon={RouteOutlinedIcon}
            title="Route"
            subtitle="Array of { name, label }"
            accent={C.primary}
            softBg={C.softBlue}
            action={<AddRemoveBtn label="Add stop" onClick={() => setRoute((p) => [...p, { name: "", label: "" }])} />}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {route.map((item, index) => (
                <Box key={`rt-${index}`} sx={{ display: "flex", gap: 1 }}>
                  <TextField fullWidth size="small" placeholder="Name" value={item.name} onChange={(e) => {
                    const next = [...route];
                    next[index] = { ...item, name: e.target.value };
                    setRoute(next);
                  }} sx={fieldSx} />
                  <TextField fullWidth size="small" placeholder="Label" value={item.label} onChange={(e) => {
                    const next = [...route];
                    next[index] = { ...item, label: e.target.value };
                    setRoute(next);
                  }} sx={fieldSx} />
                  <IconButton size="small" onClick={() => setRoute((p) => p.filter((_, i) => i !== index))} sx={{ border: `1px solid ${C.border}`, color: "#DC2626" }}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard
        icon={TuneOutlinedIcon}
        title="Flags & Meta"
        subtitle="idealFor, rating, reviewCount, isActive / featured / bestseller"
        accent="#0F2F56"
        softBg={C.softBlue}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Ideal For" placeholder="Ideal for Families, Couples & Friends" value={idealFor} onChange={(e) => setIdealFor(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth type="number" label="Rating" value={rating} onChange={(e) => setRating(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField fullWidth type="number" label="Review Count" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} InputLabelProps={{ shrink: true }} sx={fieldSx} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />} label="isActive" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel control={<Switch checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />} label="isFeatured" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControlLabel control={<Switch checked={isBestseller} onChange={(e) => setIsBestseller(e.target.checked)} />} label="isBestseller" />
          </Grid>
        </Grid>
      </SectionCard>

      <Box
        sx={{
          p: 2,
          borderRadius: "10px",
          bgcolor: C.card,
          border: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.25,
          flexWrap: "wrap",
        }}
      >
        <Button variant="outlined" onClick={resetForm} disabled={saving} sx={{ textTransform: "none", fontWeight: 600 }}>
          Reset
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard/tour/alltour")}
          disabled={saving}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: C.primary, "&:hover": { bgcolor: C.primaryDark } }}
        >
          {saving ? (isEdit ? "Updating..." : "Creating...") : isEdit ? "Update Tour Package" : "Create Tour Package"}
        </Button>
      </Box>
    </Box>
  );
}
