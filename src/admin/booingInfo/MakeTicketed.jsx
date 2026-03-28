import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.js";

const labelAboveSx = { fontSize: 14, color: "var(--primary-color)", fontWeight: 500, mb: 0.5 };
const inputSx = {
  "& .MuiInputBase-root": { fontSize: 14 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--input-border)" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--input-border)", borderWidth: "1px" },
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

const MakeTicketed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const superadminToken = token || (typeof localStorage !== "undefined" ? localStorage.getItem("adminToken") : "") || "";
  const { bookingData, bookingId } = location.state || {};
  const travellers = bookingData?.travellers || [];

  const [form, setForm] = useState({
    airlinesPnr: "",
    gdsSegment: "",
    netCost: "",
    vendorName: "",
    gds: "",
    ticketingClass: "",
    afterAdditionalMarkup: "",
    vendorInvoiceAmount: "",
    gdsPnr: "",
    lossProfit: "",
  });
  const [eTickets, setETickets] = useState({});
  const [name, setName] = useState(
    travellers[0] ? `${travellers[0].firstName || ""} ${travellers[0].lastName || ""}`.trim() : ""
  );
  const [agreeLossProfit, setAgreeLossProfit] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleETicketChange = (index, value) => {
    setETickets((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    if (!agreeLossProfit) {
      toast.error("Please agree to the Loss or Profit Amount.");
      return;
    }
    if (!superadminToken) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }
    if (!bookingId && !bookingData?.bookingId) {
      toast.error("Booking ID is missing.");
      return;
    }
    const id = bookingId || bookingData?.bookingId || "";
    const ticketNumber = (travellers.length ? travellers : [{}]).map((_, i) => ({
      index: i,
      eticket: eTickets[i] || "",
    }));
    const payload = {
      bookingId: String(id),
      airlinesPNR: form.airlinesPnr || "",
      gdsPNR: form.gdsPnr || "",
      inVoiceAmount: Number(form.vendorInvoiceAmount) || 0,
      vendorName: form.vendorName || "",
      segmentCount: String(form.gdsSegment || ""),
      ticketNumber,
    };
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.VENDOR_TICKET}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${superadminToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const message = response?.data?.message ?? response?.data?.data?.message ?? "Make Ticketed successful.";
      toast.success(message);
      navigate(-1);
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors[0] : null) ??
        err?.message ??
        "Make Ticketed failed. Please try again.";
      toast.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const displayId = bookingId || bookingData?.bookingId || "—";

  return (
    <Grid container sx={{ minHeight: "100vh", px: 1.5, py: 3 }} spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              textTransform: "capitalize",
              borderColor: "var(--primary-color)",
              color: "var(--primary-color)",
              "&:hover": { borderColor: "var(--primary-dark)", color: "var(--primary-dark)", bgcolor: "rgba(18, 61, 110, 0.04)" },
            }}
          >
            Back
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--primary-color)" }}>
            Make Ticketed #{displayId}
          </Typography>
        </Box>
      </Grid>

      {/* Top form - uniform 3-column grid, 2 rows */}
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography sx={labelAboveSx}>Airlines PNR</Typography>
              <TextField value={form.airlinesPnr} onChange={(e) => handleFormChange("airlinesPnr", e.target.value)} placeholder="Airlines PNR" variant="outlined" size="small" fullWidth sx={inputSx} />
            </Box>
          </Grid>
       
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography sx={labelAboveSx}>GDS PNR</Typography>
              <TextField value={form.gdsPnr} onChange={(e) => handleFormChange("gdsPnr", e.target.value)} placeholder="GDS PNR" variant="outlined" size="small" fullWidth sx={inputSx} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography sx={labelAboveSx}>GDS Segment</Typography>
              <TextField value={form.gdsSegment} onChange={(e) => handleFormChange("gdsSegment", e.target.value)} placeholder="GDS Segment" variant="outlined" size="small" fullWidth sx={inputSx} />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography sx={labelAboveSx}>Vendor Name</Typography>
              <TextField value={form.vendorName} onChange={(e) => handleFormChange("vendorName", e.target.value)} placeholder="Vendor Name" variant="outlined" size="small" fullWidth sx={inputSx} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box>
              <Typography sx={labelAboveSx}>Vendor Invoice Amount</Typography>
              <TextField value={form.vendorInvoiceAmount} onChange={(e) => handleFormChange("vendorInvoiceAmount", e.target.value)} placeholder="Amount" variant="outlined" size="small" fullWidth sx={inputSx} />
            </Box>
          </Grid>
        </Grid>
      </Grid>

      {/* Passenger table */}
      <Grid item xs={12}>
        <TableContainer component={Paper}>
        <Table size="small" sx={{ "& .MuiTableCell-root": { fontSize: 12.3, whiteSpace: "nowrap" } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "var(--primary-color)" }}>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>NAME</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>GENDER</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>DOB</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>PAX TYPE</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>PASSPORT NO</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>EXPIRY DATE</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>PASSPORT</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>VISA</TableCell>
              <TableCell sx={{ fontWeight: 500, color: "white", fontSize: 13 }}>E-TICKET</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {travellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{ color: "#6B7280", fontSize: 13 }}>
                  No passenger data. Open from booking details.
                </TableCell>
              </TableRow>
            ) : (
              travellers.map((pax, index) => (
                <TableRow key={index} sx={{ "&:nth-of-type(even)": { bgcolor: "#f9fafb" } }}>
                  <TableCell sx={{ fontSize: 13 }}>
                    {[pax.firstName, pax.middleName, pax.lastName].filter(Boolean).join(" ")}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{pax.gender === "MALE" ? "Male" : pax.gender === "FEMALE" ? "Female" : pax.gender || "—"}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{formatDate(pax.dateOfBirth)}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{pax.paxType || "ADT"}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{pax.passportNumber || "—"}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>{pax.passportExpiry ? formatDate(pax.passportExpiry) : "—"}</TableCell>
                  <TableCell sx={{ fontSize: 13 }}>
                    <Button size="small" sx={{ textTransform: "none", minWidth: 0, color: "var(--primary-color)", fontSize: 13 }}>
                      View
                    </Button>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>
                    <Button size="small" sx={{ textTransform: "none", minWidth: 0, color: "var(--primary-color)", fontSize: 13 }}>
                      View
                    </Button>
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>
                    <TextField
                      size="small"
                      placeholder="Enter E-ticket Number"
                      value={eTickets[index] || ""}
                      onChange={(e) => handleETicketChange(index, e.target.value)}
                      sx={{
                        width: "100%",
                        maxWidth: 180,
                        fontSize: 13,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--input-border)" },
                        "& .MuiInputBase-input": { fontSize: 13 },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </TableContainer>
      </Grid>

      {/* Section: Name, Note, I have agree checkbox */}
      <Grid item xs={12} md={5}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography sx={labelAboveSx}>Name</Typography>
            <TextField value={name} onChange={(e) => setName(e.target.value)} variant="outlined" size="small" fullWidth sx={inputSx} />
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeLossProfit}
                onChange={(e) => setAgreeLossProfit(e.target.checked)}
                sx={{ "&.Mui-checked": { color: "var(--primary-color)" } }}
              />
            }
            label="I have agree the Loss or Profit Amount"
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={7}>
        <Box>
          <Typography sx={labelAboveSx}>Note</Typography>
          <TextField fullWidth placeholder="Enter Note or Loss Reason" value={note} onChange={(e) => setNote(e.target.value)} variant="outlined" size="small" multiline rows={2} sx={inputSx} />
        </Box>
      </Grid>

      {/* Make Ticketed button */}
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!agreeLossProfit || submitting}
            sx={{
              textTransform: "capitalize",
              px: 3,
              py: 1.5,
              bgcolor: "var(--primary-color)",
              "&:hover": { bgcolor: "var(--primary-dark)" },
            }}
          >
            {submitting ? "Submitting..." : "Make Ticketed"}
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
};

export default MakeTicketed;
