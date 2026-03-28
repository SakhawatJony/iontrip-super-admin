import React, { useMemo, useState } from "react";
import { Box, Button, Grid, MenuItem, Paper, TextField, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddVisa() {
  const navigate = useNavigate();

  const STORAGE_KEY = "visa_items";

  const readItems = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const writeItems = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  const C = useMemo(
    () => ({
      pageBg: "#F4F7F6",
      cardBg: "#FFFFFF",
      mutedTitle: "#4B5563",
      primaryDark: "var(--primary-dark, #024DAF)",
      primary: "var(--primary-color, #0F2F56)",
      remove: "#E11D48",
      placeholder: "#6B7280",
    }),
    [],
  );

  // Match `ManageWebsite.jsx` input design: outlined full border, label above, compact height.
  const outlinePrimary = {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: C.primaryDark,
    },
    "& .MuiOutlinedInput-notchedOutline legend": {
      display: "none",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: C.primaryDark,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: C.primaryDark,
      borderWidth: 1,
    },
  };

  const fieldSx = {
    ...outlinePrimary,
    "& .MuiOutlinedInput-root:not(.MuiInputBase-multiline)": {
      height: 35,
      minHeight: 35,
      fontSize: "0.8125rem",
    },
    "& .MuiOutlinedInput-input:not(.MuiInputBase-inputMultiline)": {
      py: 0,
      px: "10px",
      height: 35,
      boxSizing: "border-box",
    },
    "& .MuiInputLabel-root": {
      position: "static",
      transform: "none",
      display: "block",
      mb: "4px",
      lineHeight: "20px",
      fontSize: "0.8125rem",
      color: C.primary,
      "&.MuiInputLabel-shrink": {
        transform: "none",
        lineHeight: "20px",
      },
      "&.Mui-focused": {
        color: C.primaryDark,
      },
    },
    "& .MuiOutlinedInput-input::placeholder": {
      color: C.primary,
      opacity: 1,
    },
  };

  // Basic Information
  const [country, setCountry] = useState("");
  const [firstMiddleName, setFirstMiddleName] = useState("");

  // Entry Information
  const [visaType, setVisaType] = useState("");
  const [entryType, setEntryType] = useState("");
  const [duration, setDuration] = useState("");
  const [processingTime, setProcessingTime] = useState("");
  const [maxStay, setMaxStay] = useState("");
  const [cost, setCost] = useState("");

  // Checklist Information
  const [visaFor, setVisaFor] = useState("");
  const [checklist1, setChecklist1] = useState("");
  const [checklist2, setChecklist2] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = {
      country: String(country || "").trim(),
      firstMiddleName: String(firstMiddleName || "").trim(),
      visaType: String(visaType || "").trim(),
      entryType: String(entryType || "").trim(),
      duration: String(duration || "").trim(),
      processingTime: String(processingTime || "").trim(),
      maxStay: String(maxStay || "").trim(),
      cost: String(cost || "").trim(),
      visaFor: String(visaFor || "").trim(),
      checklist1: String(checklist1 || "").trim(),
      checklist2: String(checklist2 || "").trim(),
    };

    if (!trimmed.visaType) {
      toast.error("Please select Visa Type");
      return;
    }

    const items = readItems();
    const newItem = {
      id: Date.now(),
      ...trimmed,
      createdAt: new Date().toISOString(),
    };

    writeItems([newItem, ...items]);
    toast.success("Visa added successfully");
    navigate("/dashboard/visa/allvisa");
  };

  return (
    <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          p: 1,
          borderRadius: 1,
          bgcolor: C.primaryDark,
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 500, color: "#FFFFFF" }}>Add Visa</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/dashboard/visa/allvisa")}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            bgcolor: "#FFFFFF",
            color: C.primaryDark,
            "&:hover": { bgcolor: "#EAEFF5" },
          }}
          endIcon={<RefreshIcon />}
        >
          Visa History
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, borderRadius: 1, bgcolor: C.cardBg }}>
        {/* Basic Information */}
        <Typography sx={{ fontWeight: 700, color: C.mutedTitle, mb: 2 }}>Basic Information</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              fullWidth
              label="Select Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="Select Country"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              variant="outlined"
              fullWidth
              label="Select Visa Type"
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="" disabled>
                Select Visa Type
              </MenuItem>
              <MenuItem value="single">Single Entry</MenuItem>
              <MenuItem value="double">Double Entry</MenuItem>
              <MenuItem value="multiple">Multiple Entry</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              fullWidth
              label="First & middle name"
              value={firstMiddleName}
              onChange={(e) => setFirstMiddleName(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="Enter first & middle name"
              sx={fieldSx}
            />
          </Grid>
        </Grid>

        {/* Entry Information */}
        <Typography sx={{ fontWeight: 700, color: C.mutedTitle, mt: 4, mb: 2 }}>Entry Information</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              variant="outlined"
              fullWidth
              label="Entry Type"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="" disabled>
                Select Entry Type
              </MenuItem>
              <MenuItem value="business">Business</MenuItem>
              <MenuItem value="tourist">Tourist</MenuItem>
              <MenuItem value="transit">Transit</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              fullWidth
              label="Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. 30 days"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              fullWidth
              label="Maximum Stay"
              value={maxStay}
              onChange={(e) => setMaxStay(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. 15 days"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              fullWidth
              label="Processing Time"
              value={processingTime}
              onChange={(e) => setProcessingTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. 7 working days"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              fullWidth
              label="Cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. 1500"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} md={4} />
        </Grid>

        {/* Button row like screenshot */}
        <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 4 }}>
          <Button
            type="button"
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: C.primaryDark,
              color: "#fff",
              fontWeight: 800,
              borderRadius: 0.5,
              px: 2,
              "&:hover": { bgcolor: C.primaryDark },
            }}
            startIcon={<AddIcon />}
          >
            Add Another
          </Button>
          <Button
            type="button"
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: C.remove,
              color: "#fff",
              fontWeight: 800,
              borderRadius: 0.5,
              px: 2,
              "&:hover": { bgcolor: C.remove },
            }}
            startIcon={<RemoveIcon />}
          >
            Remove
          </Button>
        </Box>

        {/* Checklist Information */}
        <Typography sx={{ fontWeight: 700, color: C.mutedTitle, mt: 1, mb: 2 }}>Checklist Information</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              variant="outlined"
              fullWidth
              label="Select Visa For"
              value={visaFor}
              onChange={(e) => setVisaFor(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="" disabled>
                Select Visa For
              </MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="worker">Worker</MenuItem>
              <MenuItem value="family">Family</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              label="Enter Checklist"
              value={checklist1}
              onChange={(e) => setChecklist1(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. Passport copy"
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              label="Enter Checklist"
              value={checklist2}
              onChange={(e) => setChecklist2(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. Photo copy"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6} />
        </Grid>

        <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
          <Button
            type="button"
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: C.primaryDark,
              color: "#fff",
              fontWeight: 800,
              borderRadius: 0.5,
              px: 2,
              "&:hover": { bgcolor: C.primaryDark },
            }}
            startIcon={<AddIcon />}
          >
            Add Another
          </Button>
          <Button
            type="button"
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: C.remove,
              color: "#fff",
              fontWeight: 800,
              borderRadius: 0.5,
              px: 2,
              "&:hover": { bgcolor: C.remove },
            }}
            startIcon={<RemoveIcon />}
          >
            Remove
          </Button>
        </Box>

        {/* Save at bottom */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: C.primaryDark,
              color: "#fff",
              fontWeight: 900,
              borderRadius: 0.5,
              px: 3,
              "&:hover": { bgcolor: C.primaryDark },
            }}
          >
            Add Visa
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

