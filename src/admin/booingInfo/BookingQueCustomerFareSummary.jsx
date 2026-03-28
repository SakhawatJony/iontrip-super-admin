import React from "react";
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";

const formatNumber = (num) => {
  if (!num && num !== 0) return "0.00";
  const numStr = typeof num === "string" ? num : String(num);
  const parts = numStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : `${parts[0]}.00`;
};

const getPaxTypeLabel = (value) => {
  const v = String(value || "").toUpperCase().replace(/_/g, " ");
  if (["ADT", "ADULT"].includes(v)) return "Adult";
  if (["CHD", "CHILD"].includes(v)) return "Child";
  if (["INF", "INFT", "INFANT", "HELD INFANT", "HELD_INFANT"].includes(v)) return "Infant";
  return value ? String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase() : "Adult";
};

const BookingQueCustomerFareSummary = ({ data }) => {
  const pricebreakdown = data?.pricebreakdown || [];
  const currency = data?.farecurrency || "BDT";

  const totalBaseFare = pricebreakdown.reduce(
    (sum, item) => sum + parseFloat(item.BaseFare || 0) * parseFloat(item.PaxCount || 1),
    0
  );
  const totalTax = pricebreakdown.reduce(
    (sum, item) => sum + parseFloat(item.Tax || 0) * parseFloat(item.PaxCount || 1),
    0
  );
  const totalServiceFee = pricebreakdown.reduce(
    (sum, item) => sum + parseFloat(item.ServiceFee || 0) * parseFloat(item.PaxCount || 1),
    0
  );
  const totalDiscount = pricebreakdown.reduce(
    (sum, item) => sum + parseFloat(item.Discount || 0) * parseFloat(item.PaxCount || 1),
    0
  );
  const totalTravelerCount = pricebreakdown.reduce(
    (sum, item) => sum + parseInt(item.PaxCount || 1, 10),
    0
  );
  const fareTotal = totalBaseFare + totalTax + totalServiceFee - totalDiscount;
  const aitVat = parseFloat(data?.aitVat ?? data?.ait ?? data?.vat ?? 0);
  const extraBaggageMealSeat = parseFloat(data?.extraBaggage ?? data?.extraBaggageMealSeat ?? 0);
  const bundleCost = parseFloat(data?.bundleCost ?? 0);
  const calculatedPayable = fareTotal + aitVat + extraBaggageMealSeat + bundleCost;
  const totalCustomerPayable =
    parseFloat(data?.netPrice ?? data?.clientFare ?? "") || calculatedPayable;

  return (
    <Box sx={{ width: "100%",bgcolor:"#ffffff",px:"30px",py:"20px" }}>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 700,
          color: "#1F2937",
          mb: 1.5,
        }}
      >
        Customer Fare Summary
      </Typography>
      <Box
        sx={{
          backgroundColor: "#F3F4F6",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
          border: "1px solid #E5E7EB",
        }}
      >
        <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #E5E7EB" } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#E5E7EB" }}>
              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "center" }}>
                Pax Type
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                Base Fare
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                Tax
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                Service Fee
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                Discount
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                Pax Count
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pricebreakdown.length === 0 ? (
              <TableRow sx={{ backgroundColor: "#fff" }}>
                <TableCell colSpan={7} sx={{ fontSize: 12, color: "#6B7280", py: 2, textAlign: "center" }}>
                  No fare breakdown available
                </TableCell>
              </TableRow>
            ) : (
              pricebreakdown.map((item, idx) => {
                const paxCount = parseInt(item.PaxCount || 1, 10);
                const baseFare = parseFloat(item.BaseFare || 0) * paxCount;
                const tax = parseFloat(item.Tax || 0) * paxCount;
                const serviceFee = parseFloat(item.ServiceFee || 0) * paxCount;
                const discount = parseFloat(item.Discount || 0) * paxCount;
                const amount = baseFare + tax + serviceFee - discount;
                return (
                  <TableRow key={idx} sx={{ backgroundColor: "#fff" }}>
                    <TableCell
                      sx={{
                        fontSize: 12,
                        color: "#374151",
                        fontWeight: 500,
                        py: 1.25,
                        textAlign: "center",
                        backgroundColor: "#fff",
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      {getPaxTypeLabel(item.PaxType)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#1F2937", py: 1.25, textAlign: "right" }}>
                      {formatNumber(baseFare)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#1F2937", py: 1.25, textAlign: "right" }}>
                      {formatNumber(tax)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#1F2937", py: 1.25, textAlign: "right" }}>
                      {formatNumber(serviceFee)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#1F2937", py: 1.25, textAlign: "right" }}>
                      {formatNumber(discount)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#1F2937", py: 1.25, textAlign: "right" }}>
                      {paxCount}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#1F2937", py: 1.25, textAlign: "right" }}>
                      {formatNumber(amount)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 0.5,
            px: 2,
            py: 2,
            backgroundColor: "#F9FAFB",
            borderTop: "1px solid #E5E7EB",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Traveler</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1F2937", minWidth: 80, textAlign: "right" }}>
              {totalTravelerCount} Pax
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Total Discount</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1F2937", minWidth: 80, textAlign: "right" }}>
              {formatNumber(totalDiscount)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Total AIT & VAT</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1F2937", minWidth: 80, textAlign: "right" }}>
              {formatNumber(aitVat)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Extra Baggage/ Meal/ Seat</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1F2937", minWidth: 80, textAlign: "right" }}>
              {formatNumber(extraBaggageMealSeat)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Bundle Cost</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1F2937", minWidth: 80, textAlign: "right" }}>
              {formatNumber(bundleCost)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 2,
              mt: 1,
              pt: 1,
              borderTop: "1px solid #E5E7EB",
              width: "100%",
              maxWidth: 320,
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1F2937" }}>
              Total Customer Payable
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1F2937" }}>
              {currency} {formatNumber(totalCustomerPayable)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BookingQueCustomerFareSummary;
