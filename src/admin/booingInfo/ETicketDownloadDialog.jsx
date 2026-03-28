import React from "react";
import { Dialog, DialogContent, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const ETicketDownloadDialog = ({ open, onClose, onDownloadWithPrice, onDownloadWithoutPrice }) => {
  const optionSx = {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    justifyContent: "flex-start",
    py: 1,
    px: 1,
    borderRadius: "8px",
    border: "1px solid var(--primary-color)",
    backgroundColor: "var(--primary-light-bg, rgba(18, 61, 110, 0.1))",
    color: "var(--primary-color)",
    fontSize: 12,
    fontWeight: 500,
    textTransform: "capitalize",
    cursor: "pointer",
    fontFamily: "inherit",
    outline: "none",
    "&:hover": {
      backgroundColor: "var(--primary-light-bg-hover, rgba(18, 61, 110, 0.16))",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
     
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 20,
          overflow: "hidden",
          width: "250px",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          backgroundColor: "var(--primary-color)",
          color: "white",
          px: 1,
          py: 1,
        }}
      >
        <FileDownloadIcon sx={{ fontSize: 16 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 700, flex: 1 }}>
          E-Ticket Download
        </Typography>
        
      </Box>
      <DialogContent sx={{ backgroundColor: "#fff", pt: 1, pb: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box
          component="button"
          onClick={() => {
            onDownloadWithPrice?.();
            onClose();
          }}
          sx={optionSx}
        >
          <FileDownloadIcon sx={{ fontSize: 16, color: "var(--primary-color)" }} />
          Download with price
        </Box>
        <Box
          component="button"
          onClick={() => {
            onDownloadWithoutPrice?.();
            onClose();
          }}
          sx={optionSx}
        >
          <FileDownloadIcon sx={{ fontSize: 16, color: "var(--primary-color)" }} />
          Download without price
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ETicketDownloadDialog;
