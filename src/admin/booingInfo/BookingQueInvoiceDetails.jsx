import React from "react";
import { Box, Typography, Divider, Table, TableBody, TableRow, TableCell } from "@mui/material";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch {
    return "N/A";
  }
};

const formatTime = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "N/A";
  }
};

const getTitle = (gender) => {
  if (!gender) return "MR";
  return gender === "MALE" ? "MR" : gender === "FEMALE" ? "MRS" : "MR";
};

const formatNumber = (num) => {
  if (!num && num !== 0) return "0.00";
  const numStr = typeof num === "string" ? num : String(num);
  const parts = numStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : `${parts[0]}.00`;
};

const BookingQueInvoiceDetails = ({ data, invoiceType = "Booking Invoice" }) => {
  if (!data) return null;

  const travellers = data?.travellers || [];
  const segments = data?.segments || {};
  const goSegments = segments?.go || [];
  const backSegments = segments?.back || [];
  const pricebreakdown = data?.pricebreakdown || [];
  const currency = data?.farecurrency || "MYR";
  const grandTotal = parseFloat(data?.netPrice || data?.clientFare || 0);

  const totalBaseFare = (pricebreakdown || []).reduce(
    (sum, item) => sum + parseFloat(item.BaseFare || 0) * parseFloat(item.PaxCount || 1),
    0
  );
  const totalTax = (pricebreakdown || []).reduce(
    (sum, item) => sum + parseFloat(item.Tax || 0) * parseFloat(item.PaxCount || 1),
    0
  );
  const totalDiscount = (pricebreakdown || []).reduce(
    (sum, item) => sum + parseFloat(item.Discount || 0) * parseFloat(item.PaxCount || 1),
    0
  );

  const allSegments = [...goSegments, ...backSegments];

  return (
    <Box sx={{ bgcolor: "#fff", borderRadius: 1, p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1F2937", mb: 2 }}>
        {invoiceType}
      </Typography>

      {/* Booking info */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: "#F3F4F6", borderRadius: 1 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>
          Booking Information
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 10, color: "#6B7280" }}>Booking ID</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{data?.bookingId || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10, color: "#6B7280" }}>PNR</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{data?.gdsPNR || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10, color: "#6B7280" }}>Airlines PNR</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{data?.airlinePNR || data?.gdsPNR || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10, color: "#6B7280" }}>Status</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{(data?.status || "N/A").toUpperCase()}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Flight segments */}
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>
        Flight Details
      </Typography>
      <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 1, overflow: "hidden", mb: 2 }}>
        <Table size="small">
          <TableBody>
            {allSegments.map((seg, idx) => (
              <TableRow key={idx}>
                <TableCell sx={{ fontSize: 11, py: 0.75 }}>
                  {seg.departureAirport || seg.departure || "N/A"} → {seg.arrivalAirport || seg.arrival || "N/A"}
                </TableCell>
                <TableCell sx={{ fontSize: 11, py: 0.75 }}>
                  {formatDate(seg.departureTime)} {formatTime(seg.departureTime)}
                </TableCell>
                <TableCell sx={{ fontSize: 11, py: 0.75 }}>
                  {seg.marketingcareerName || seg.marketingcareer || "N/A"} {seg.marketingflight || ""}
                </TableCell>
                <TableCell sx={{ fontSize: 11, py: 0.75 }}>{seg.class || "ECONOMY"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Passengers */}
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>
        Passenger Details
      </Typography>
      <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 1, overflow: "hidden", mb: 2 }}>
        <Table size="small">
          <TableBody>
            {travellers.map((pax, idx) => (
              <TableRow key={idx}>
                <TableCell sx={{ fontSize: 11 }}>{getTitle(pax.gender)} {pax.firstName || ""} {pax.lastName || ""}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{pricebreakdown[idx]?.PaxType || "ADULT"}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{pax.passportNumber || "N/A"}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{data?.airlinePNR || data?.gdsPNR || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Fare summary */}
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>
        Fare Summary
      </Typography>
      <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 1, p: 1.5, mb: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 11, py: 0.25 }}>
          <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Total Base Fare</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{formatNumber(totalBaseFare)} {currency}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 11, py: 0.25 }}>
          <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Total Tax & Fee</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>{formatNumber(totalTax)} {currency}</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: 11, py: 0.25 }}>
          <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Discount</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600 }}>-{formatNumber(totalDiscount)} {currency}</Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Grand Total</Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "var(--primary-color)" }}>{formatNumber(grandTotal)} {currency}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default BookingQueInvoiceDetails;
