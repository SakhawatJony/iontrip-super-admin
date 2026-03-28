import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

const formatNumber = (num) => {
  if (!num && num !== 0) return "0.00";
  const n = parseFloat(num);
  if (Number.isNaN(n)) return "0.00";
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getPaxTypeLabel = (value) => {
  const v = String(value || "").toUpperCase().replace(/_/g, " ");
  if (["ADT", "ADULT"].includes(v)) return "Adult";
  if (["CHD", "CHILD"].includes(v)) return "Child";
  if (["INF", "INFT", "INFANT", "HELD INFANT", "HELD_INFANT"].includes(v)) return "Infant";
  return value ? String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase() : "Adult";
};

const normalizePaxTypeValue = (value) => {
  const v = String(value || "").toUpperCase().replace(/_/g, " ");
  if (["ADT", "ADULT"].includes(v)) return "ADULT";
  if (["CHD", "CHILD"].includes(v)) return "CHILD";
  if (["INF", "INFT", "INFANT", "HELD INFANT", "HELD_INFANT"].includes(v)) return "INFANT";
  return "ADULT";
};

const CURRENCIES = ["BDT", "USD", "MYR", "EUR", "GBP"];

const noFocusOutline = {
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused": {
      outline: "none",
      boxShadow: "none",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0,0,0,0.23)",
      },
    },
  },
};

const EditCustomerFareDialog = ({ open, onClose, data, onUpdate }) => {
  const pricebreakdown = data?.pricebreakdown || [];
  const defaultCurrency = data?.farecurrency || "BDT";
  const aitVat = parseFloat(data?.aitVat ?? data?.ait ?? data?.vat ?? 0);

  const [currency, setCurrency] = useState(defaultCurrency);
  const [rows, setRows] = useState([]);

  const isBdt = currency === "BDT";

  useEffect(() => {
    if (open && pricebreakdown.length > 0) {
      setCurrency(defaultCurrency);
      setRows(
        pricebreakdown.map((item) => {
          const paxCount = parseInt(item.PaxCount || 1, 10);
          const base = parseFloat(item.BaseFare || 0) * paxCount;
          const tax = parseFloat(item.Tax || 0) * paxCount;
          const discount = parseFloat(item.Discount || 0) * paxCount;
          const paxType = normalizePaxTypeValue(item.PaxType);
          return {
            paxType,
            paxTypeLabel: getPaxTypeLabel(paxType),
            paxCount,
            basePrice: base,
            tax,
            discount,
          };
        })
      );
    }
  }, [open, pricebreakdown, defaultCurrency]);

  const getRowTotal = (r) => r.basePrice + r.tax - r.discount;
  const totalDiscount = rows.reduce((sum, r) => sum + r.discount, 0);
  const fareTotal = rows.reduce((sum, r) => sum + getRowTotal(r), 0);
  const totalTravelerCount = rows.reduce((sum, r) => sum + r.paxCount, 0);
  const totalCustomerPayable = fareTotal + aitVat;

  const handleChange = (index, field, value) => {
    if (field === "paxCount") {
      const v = parseInt(value, 10);
      setRows((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], paxCount: Number.isNaN(v) || v < 1 ? 1 : v };
        return next;
      });
      return;
    }
    const v = parseFloat(value);
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: Number.isNaN(v) ? 0 : v };
      return next;
    });
  };

  const handleUpdate = () => {
    if (onUpdate) {
      const updatedBreakdown = rows.map((r) => ({
        PaxType: r.paxType,
        PaxCount: r.paxCount,
        BaseFare: r.basePrice / r.paxCount,
        Tax: r.tax / r.paxCount,
        Discount: r.discount / r.paxCount,
      }));
      onUpdate({ currency, pricebreakdown: updatedBreakdown, totalCustomerPayable });
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: 24 },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          pb: 1,
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1F2937" }}>
          Edit customer fare
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Currency Change:</Typography>
          <FormControl size="small" sx={{ minWidth: 100, ...noFocusOutline }}>
            <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            sx={{ height: 40 }}
            displayEmpty
            renderValue={(v) => v || "BDT"}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ overflow: "auto" }}>
          <Table size="small" sx={{ "& .MuiTableCell-root": { borderBottom: "1px solid #E5E7EB" } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#E5E7EB" }}>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25 }}>
                  Pax Type
                </TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                  Base Price
                </TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                  Tax
                </TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                  Discount
                </TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                  Pax Count
                </TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: "#374151", py: 1.25, textAlign: "right" }}>
                  Total Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 2, color: "#6B7280" }}>
                    No fare breakdown available
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, index) => (
                  <TableRow key={index} sx={{ backgroundColor: "#fff" }}>
                    <TableCell
                      sx={{
                        fontSize: 12,
                        color: "#374151",
                        fontWeight: 500,
                        py: 1,
                        textAlign: "center",
                        backgroundColor: "#fff",
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      {r.paxTypeLabel}
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={r.basePrice}
                        onChange={(e) => handleChange(index, "basePrice", e.target.value)}
                        inputProps={{ min: 0, step: 0.01, style: { textAlign: "right" } }}
                        sx={{ "& .MuiInputBase-root": { backgroundColor: "#fff" }, maxWidth: 120, ...noFocusOutline }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={r.tax}
                        onChange={(e) => handleChange(index, "tax", e.target.value)}
                        inputProps={{ min: 0, step: 0.01, style: { textAlign: "right" } }}
                        sx={{ "& .MuiInputBase-root": { backgroundColor: "#fff" }, maxWidth: 120, ...noFocusOutline }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={r.discount}
                        onChange={(e) => handleChange(index, "discount", e.target.value)}
                        inputProps={{ min: 0, step: 0.01, style: { textAlign: "right" } }}
                        sx={{ "& .MuiInputBase-root": { backgroundColor: "#fff" }, maxWidth: 120, ...noFocusOutline }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={r.paxCount}
                        onChange={(e) => handleChange(index, "paxCount", e.target.value)}
                        disabled={!isBdt}
                        inputProps={{ min: 1, step: 1, style: { textAlign: "right" } }}
                        sx={{ "& .MuiInputBase-root": { backgroundColor: "#fff" }, maxWidth: 80, ...noFocusOutline }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: "#1F2937", py: 1, textAlign: "right" }}>
                      {formatNumber(getRowTotal(r))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 0.5,
            mt: 2,
            px: 1,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Traveler</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1F2937", minWidth: 100, textAlign: "right" }}>
              {totalTravelerCount} Pax
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Total Discount</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1F2937", minWidth: 100, textAlign: "right" }}>
              - {formatNumber(totalDiscount)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Total AIT VAT</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: "#1F2937", minWidth: 100, textAlign: "right" }}>
              {formatNumber(aitVat)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 0.5 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1F2937" }}>Total Customer Payable</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1F2937", minWidth: 100, textAlign: "right" }}>
              {currency} {formatNumber(totalCustomerPayable)}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 2, fontStyle: "italic" }}>
          Only change the fare when the currency is BDT; otherwise, do not edit it.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3, gap: 2 }}>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              bgcolor: "#dc2626",
              color: "white",
              textTransform: "capitalize",
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            sx={{
              bgcolor: "#1e3a5f",
              color: "white",
              textTransform: "capitalize",
              "&:hover": { bgcolor: "#0F2F56" },
            }}
          >
            Update
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerFareDialog;
