import React, { useMemo, useState } from "react";
import { Box, Button, Grid, MenuItem, Paper, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

export default function AddFlightBooking() {
  const navigate = useNavigate();

  const C = useMemo(
    () => ({
      pageBg: "#F4F7F6",
      cardBg: "#FFFFFF",
      mutedTitle: "#4B5563",
      primaryDark: "var(--primary-dark, #024DAF)",
      primary: "var(--primary-color, #0F2F56)",
      placeholder: "#6B7280",
      remove: "#E11D48",
    }),
    [],
  );

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
    },
  };

  const [customer, setCustomer] = useState("");
  const [route, setRoute] = useState("");
  const [type, setType] = useState("flight");
  const [pnr, setPnr] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend API for creating flight booking
    navigate("/dashboard/flightbookings/bookinghistory");
  };

  return (
    <Box sx={{ bgcolor: C.pageBg, minHeight: "100vh", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: C.primaryDark,
        }}
      >
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF" }}>Add Flight</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/dashboard/flightbookings/bookinghistory")}
          sx={{
            textTransform: "none",
            fontWeight: 800,
            bgcolor: "#FFFFFF",
            color: C.primaryDark,
            "&:hover": { bgcolor: "#EAEFF5" },
          }}
          startIcon={<AddIcon />}
        >
          Booking History
        </Button>
      </Box>

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, borderRadius: 2, bgcolor: C.cardBg }}>
        <Typography sx={{ fontWeight: 700, color: C.mutedTitle, mb: 2 }}>Basic Information</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              label="Customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. John Doe"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              fullWidth
              label="Route"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. Dhaka → Bangkok"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              variant="outlined"
              fullWidth
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={fieldSx}
            >
              <MenuItem value="flight">Flight</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              variant="outlined"
              fullWidth
              label="PNR"
              value={pnr}
              onChange={(e) => setPnr(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="e.g. ABC123"
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              variant="outlined"
              fullWidth
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ displayEmpty: true }}
              sx={fieldSx}
            >
              <MenuItem value="" disabled>
                Select Status
              </MenuItem>
              <MenuItem value="booked">Booked</MenuItem>
              <MenuItem value="ticketed">Ticketed</MenuItem>
              <MenuItem value="refund">Refund</MenuItem>
              <MenuItem value="void">Void</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
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
            Save
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

