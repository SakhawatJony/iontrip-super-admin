import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../../context/AuthContext.jsx";

const optionSx = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  justifyContent: "flex-start",
  py: 1.25,
  px: 2,
  borderRadius: "8px",
  border: "1px solid var(--primary-color)",
  backgroundColor: "var(--primary-light-bg, rgba(18, 61, 110, 0.1))",
  color: "var(--primary-color)",
  fontSize: 14,
  fontWeight: 500,
  textTransform: "capitalize",
  cursor: "pointer",
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
  "&:hover": {
    backgroundColor: "var(--primary-light-bg-hover, rgba(18, 61, 110, 0.16))",
  },
};

const ETicketWithCAABDialog = ({
  open,
  onClose,
  onDownloadWithPrice,
  onDownloadWithoutPrice,
  defaultAgencyName,
  defaultCivilAviationNumber,
  title = "E-Ticket Download",
}) => {
  const { user } = useAuth();
  const [agencyName, setAgencyName] = useState("");
  const [civilAviationNumber, setCivilAviationNumber] = useState("");

  const initialAgency = defaultAgencyName ?? user?.agentName ?? user?.name ?? user?.companyName ?? "TRIP FINDY";
  const initialCAAB = defaultCivilAviationNumber ?? user?.caabNumber ?? user?.civilAviationNumber ?? "0014537";

  useEffect(() => {
    if (open) {
      setAgencyName(initialAgency);
      setCivilAviationNumber(initialCAAB);
    }
  }, [open, initialAgency, initialCAAB]);

  const handleDownloadWithPrice = () => {
    onDownloadWithPrice?.({ agencyName, civilAviationNumber });
    onClose();
  };

  const handleDownloadWithoutPrice = () => {
    onDownloadWithoutPrice?.({ agencyName, civilAviationNumber });
    onClose();
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#F3F4F6",
      fontSize: 12,
      "& fieldset": { borderColor: "#E5E7EB" },
      "&:hover fieldset": { borderColor: "#D1D5DB" },
      "&.Mui-focused": { outline: "none", boxShadow: "none" },
      "&.Mui-focused fieldset": { borderColor: "var(--primary-color)", borderWidth: "1px" },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 1,
          boxShadow: 20,
          overflow: "hidden",
          width: "300px",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          backgroundColor: "var(--primary-color)",
          color: "white",
          px: 1,
          py: 1,
        }}
      >
        <FileDownloadIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontSize: 16, fontWeight: 700, flex: 1 }}>
          {title}
        </Typography>
      </Box>
      <DialogContent sx={{ backgroundColor: "#fff", pt: 1, pb: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 1 }}>
              Agency Name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Agency Name"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <EditIcon sx={{ fontSize: 15, color: "#6B7280" }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
            <Typography sx={{ fontSize: 10.5, color: "#9CA3AF", mt: 0.5 }}>
              *You can edit your Agency name on your ticket copy
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb:0.5 }}>
              Civil Aviation Number
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={civilAviationNumber}
              onChange={(e) => setCivilAviationNumber(e.target.value)}
              placeholder="Civil Aviation Number"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <EditIcon sx={{ fontSize: 18, color: "#6B7280" }} />
                  </InputAdornment>
                ),
              }}
              sx={inputSx}
            />
            <Typography sx={{ fontSize: 10.5, color: "#9CA3AF", mt: 0.5 }}>
              *You can edit your CAAB number on your ticket copy
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
            <Box
              component="button"
              onClick={handleDownloadWithPrice}
              sx={optionSx}
            >
              <FileDownloadIcon sx={{ fontSize: 16, color: "var(--primary-color)" }} />
              Download with price
            </Box>
            <Box
              component="button"
              onClick={handleDownloadWithoutPrice}
              sx={optionSx}
            >
              <FileDownloadIcon sx={{ fontSize: 16, color: "var(--primary-color)" }} />
              Download without price
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ETicketWithCAABDialog;
