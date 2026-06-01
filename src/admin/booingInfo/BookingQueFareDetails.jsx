import React from "react";
import { Box, Typography } from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { BQ, bqCardSx } from "./bookingQueTheme.js";
import { BqAccentTitle } from "./bookingQueUi.jsx";
import { formatBqNumber, getPaxTypeShort } from "./bookingQueUtils.js";

const BookingQueFareDetails = ({ data }) => {
  const pricebreakdown = data?.pricebreakdown || [];
  const currency = data?.farecurrency || "BDT";

  const totalBaseFare = pricebreakdown.reduce(
    (sum, item) => sum + parseFloat(item.BaseFare || 0) * parseFloat(item.PaxCount || 1),
    0,
  );
  const totalTax = pricebreakdown.reduce(
    (sum, item) => sum + parseFloat(item.Tax || 0) * parseFloat(item.PaxCount || 1),
    0,
  );
  const grandTotal = parseFloat(data?.netPrice || data?.clientFare || 0);

  const paxRows = pricebreakdown.map((item, idx) => {
    const paxCount = parseFloat(item.PaxCount || 1);
    const lineTotal =
      (parseFloat(item.BaseFare || 0) + parseFloat(item.Tax || 0)) * paxCount +
      parseFloat(item.ServiceFee || 0) * paxCount -
      parseFloat(item.Discount || 0) * paxCount;
    const short = getPaxTypeShort(item.PaxType);
    return {
      key: `${short}-${idx}`,
      label: `${short} × ${paxCount}`,
      value: `${formatBqNumber(lineTotal)} ${currency}`,
    };
  });

  const summaryRows = [
    ...paxRows,
    { key: "base", label: "Base Fare", value: `${formatBqNumber(totalBaseFare)} ${currency}` },
    { key: "tax", label: "Tax & Fees", value: `${formatBqNumber(totalTax)} ${currency}` },
  ];

  return (
    <Box sx={bqCardSx}>
      <Box sx={{ p: 1.5, pb: 0 }}>
        <BqAccentTitle
          title="Fare Summary"
          right={<ReceiptLongOutlinedIcon sx={{ color: BQ.navy, fontSize: 18 }} />}
        />
        <Box sx={{ mt: 0.25, mb: 1 }}>
          {summaryRows.length > 0 ? (
            summaryRows.map((row) => (
              <Box
                key={row.key}
                sx={{ display: "flex", justifyContent: "space-between", py: 0.35 }}
              >
                <Typography sx={{ fontSize: 11, color: BQ.muted, textTransform: "uppercase" }}>
                  {row.label}
                </Typography>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: BQ.text }}>{row.value}</Typography>
              </Box>
            ))
          ) : (
            <Typography sx={{ fontSize: 11, color: BQ.muted }}>No fare breakdown available</Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: BQ.navy,
          px: 1.5,
          py: 1.25,
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
        }}
      >
        <Typography sx={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: 0.5 }}>
          TOTAL AMOUNT
        </Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
          {formatBqNumber(grandTotal)} {currency}
        </Typography>
      </Box>
    </Box>
  );
};

export default BookingQueFareDetails;
