import React from "react";
import { Box, Divider, Typography } from "@mui/material";

const BookingQueFareDetails = ({ data }) => {
  const pricebreakdown = data?.pricebreakdown || [];
  const currency = data?.farecurrency || "MYR";

  // Format number with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return "0.00";
    const numStr = typeof num === "string" ? num : String(num);
    const parts = numStr.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length > 1 ? `${parts[0]}.${parts[1]}` : `${parts[0]}.00`;
  };

  // Build traveler rows from pricebreakdown
  const buildTravelerRows = () => {
    return pricebreakdown.map((item, index) => {
      const paxType = item.PaxType || "ADULT";
      const paxCount = item.PaxCount || "1";
      const baseFare = parseFloat(item.BaseFare || 0) * parseFloat(paxCount);
      const tax = parseFloat(item.Tax || 0) * parseFloat(paxCount);
      const total = baseFare + tax;
      
      return {
        label: `Traveler ${index + 1} : ${paxType} (x${paxCount})`,
        value: `${formatNumber(total)} ${currency}`,
      };
    });
  };

  const rows = buildTravelerRows();

  // Calculate summary
  const totalBaseFare = pricebreakdown.reduce((sum, item) => {
    return sum + (parseFloat(item.BaseFare || 0) * parseFloat(item.PaxCount || 1));
  }, 0);

  const totalTax = pricebreakdown.reduce((sum, item) => {
    return sum + (parseFloat(item.Tax || 0) * parseFloat(item.PaxCount || 1));
  }, 0);

  const totalDiscount = pricebreakdown.reduce((sum, item) => {
    return sum + (parseFloat(item.Discount || 0) * parseFloat(item.PaxCount || 1));
  }, 0);

  const summaryRows = [
    { label: "Total Base Fare", value: `${formatNumber(totalBaseFare)} ${currency}` },
    { label: "Total Tax & Fee", value: `${formatNumber(totalTax)} ${currency}` },
    { label: "Discount", value: `-${formatNumber(totalDiscount)} ${currency}` },
  ];

  const grandTotal = parseFloat(data?.netPrice || data?.clientFare || 0);
  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        borderRadius: 1.5,
        border: "1px solid #E5E7EB",
        p: 2,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography fontSize={12} color="#64748B" fontWeight={600}>
          Fare Breakdown
        </Typography>
        <Typography fontSize={11} color="#64748B">
          Price as shown in {currency}
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <Typography sx={{ fontSize: 11, color: "#6B7280", textAlign: "center", py: 1 }}>
          No fare breakdown available
        </Typography>
      ) : (
        rows.map((row) => (
          <Box
            key={row.label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 0.35,
            }}
          >
            <Typography fontSize={11} color="#475569">
              {row.label}
            </Typography>
            <Typography fontSize={11} color="#0F172A" fontWeight={600}>
              {row.value}
            </Typography>
          </Box>
        ))
      )}

      <Divider sx={{ my: 1 }} />

      {summaryRows.map((row) => (
        <Box
          key={row.label}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 0.35,
          }}
        >
          <Typography fontSize={11} color="#475569">
            {row.label}
          </Typography>
          <Typography fontSize={11} color="#0F172A" fontWeight={600}>
            {row.value}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography fontSize={12} fontWeight={700} color="#0F172A">
          Grand Total
        </Typography>
        <Typography fontSize={12} fontWeight={700} color="#0F2F56">
          {formatNumber(grandTotal)} {currency}
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingQueFareDetails;
