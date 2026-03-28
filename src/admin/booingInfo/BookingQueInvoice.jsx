import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useLocation } from "react-router-dom";
import BookingQueDetailsCard from "./BookingQueDetailsCard";
import BookingQuePassengerList from "./BookingQuePassengerList";
import BookingQueCustomerFareSummary from "./BookingQueCustomerFareSummary";
import EditCustomerFareDialog from "./EditCustomerFareDialog";
import ETicketDownloadDialog from "./ETicketDownloadDialog";
import ETicketWithCAABDialog from "./ETicketWithCAABDialog";
import AgentInvoiceDownloadDialog from "./AgentInvoiceDownloadDialog";
import AgentInvoiceWithCAABDialog from "./AgentInvoiceWithCAABDialog";
import ETicketPdfLayout from "./ETicketPdfLayout";
import { downloadElementAsPdf } from "../../utils/downloadPdf";

const BookingQueInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData, invoiceType } = location.state || {};
  const [editFareDialogOpen, setEditFareDialogOpen] = useState(false);
  const [eTicketDialogOpen, setETicketDialogOpen] = useState(false);
  const [eTicketWithCAABDialogOpen, setETicketWithCAABDialogOpen] = useState(false);
  const [agentInvoiceDialogOpen, setAgentInvoiceDialogOpen] = useState(false);
  const [agentInvoiceWithCAABDialogOpen, setAgentInvoiceWithCAABDialogOpen] = useState(false);
  const [eTicketDownloadWithPrice, setETicketDownloadWithPrice] = useState(true);
  const [triggerPdfDownload, setTriggerPdfDownload] = useState(false);
  const pdfSourceRef = useRef(null);

  useEffect(() => {
    if (!triggerPdfDownload || !pdfSourceRef.current || !bookingData) return;
    const filename = `e-ticket-${bookingData?.bookingId || "ticket"}-${eTicketDownloadWithPrice ? "with-price" : "without-price"}`;
    const el = pdfSourceRef.current;
    // Wait for React to commit and DOM to paint with correct showFareSummary, then capture
    const timer = setTimeout(() => {
      downloadElementAsPdf(el, filename)
        .then(() => setTriggerPdfDownload(false))
        .catch((err) => {
          console.error("E-Ticket PDF download failed:", err);
          setTriggerPdfDownload(false);
        });
    }, 250);
    return () => clearTimeout(timer);
  }, [triggerPdfDownload, eTicketDownloadWithPrice, bookingData]);

  if (!bookingData) {
    return (
      <Box sx={{ minHeight: "100vh", px: 4, py: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <Typography sx={{ fontSize: 16, color: "#6B7280" }}>No booking data. Open invoice from booking details.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/dashboard/bookingqueuedetails")} variant="outlined">
          Back to Booking
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", width: "100%" }}>
      {/* Full-width back row, no heading, no bg */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          bgcolor: "var(--primary-color)",
          py: 1,
          mt:5,
          color: "white",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            textTransform: "capitalize",
            color: "white",
            minWidth: 0,
            "& .MuiButton-startIcon": { color: "white" },
          }}
        >
          Invoice Download
        </Button>
      </Box>
      <Box sx={{ px: 4, py: 4, width: "100%" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, justifyContent: "flex-end" }}>
          {invoiceType === "Agent Invoice" && (
            <>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setAgentInvoiceWithCAABDialogOpen(true)}
                sx={{
                  bgcolor: "var(--primary-color)",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
                }}
              >
                Agent Invoice With CAAB
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setAgentInvoiceDialogOpen(true)}
                sx={{
                  bgcolor: "var(--primary-color)",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
                }}
              >
                Agent Invoice
              </Button>
            </>
          )}
          {invoiceType === "Customer Invoice" && (
            <>
              <Button
                startIcon={<FileDownloadIcon />}
                sx={{
                  bgcolor: "var(--primary-color)",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
                }}
              >
                Customer Invoice With CAAB
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                sx={{
                  bgcolor: "var(--primary-color)",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
                }}
              >
                Customer Invoice
              </Button>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setEditFareDialogOpen(true)}
                sx={{
                  bgcolor: "#2CCEE4",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "#25b8cc" },
                }}
              >
                Edit Customer Fare
              </Button>
            </>
          )}
          {invoiceType !== "Agent Invoice" && invoiceType !== "Customer Invoice" && (
            <>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setETicketWithCAABDialogOpen(true)}
                sx={{
                  bgcolor: "var(--primary-color)",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
                }}
              >
                E-Ticket With CAAB
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setETicketDialogOpen(true)}
                sx={{
                  bgcolor: "var(--primary-color)",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
                }}
              >
                E-Ticket
              </Button>
              <Button
                startIcon={<EditIcon />}
                onClick={() => setEditFareDialogOpen(true)}
                sx={{
                  bgcolor: "#2CCEE4",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "#25b8cc" },
                }}
              >
                Edit Customer Fare
              </Button>
            </>
          )}
        </Box>
        <EditCustomerFareDialog
          open={editFareDialogOpen}
          onClose={() => setEditFareDialogOpen(false)}
          data={bookingData}
          onUpdate={(payload) => {
            // Optional: persist updated fare (e.g. API call, then refresh bookingData)
            console.log("Fare updated:", payload);
          }}
        />
        <ETicketDownloadDialog
          open={eTicketDialogOpen}
          onClose={() => setETicketDialogOpen(false)}
          onDownloadWithPrice={() => {
            setETicketDialogOpen(false);
            setETicketDownloadWithPrice(true);
            setTriggerPdfDownload(true);
          }}
          onDownloadWithoutPrice={() => {
            setETicketDialogOpen(false);
            setETicketDownloadWithPrice(false);
            setTriggerPdfDownload(true);
          }}
        />
        <ETicketWithCAABDialog
          open={eTicketWithCAABDialogOpen}
          onClose={() => setETicketWithCAABDialogOpen(false)}
          onDownloadWithPrice={(payload) => {
            setETicketWithCAABDialogOpen(false);
            setETicketDownloadWithPrice(true);
            setTriggerPdfDownload(true);
          }}
          onDownloadWithoutPrice={(payload) => {
            setETicketWithCAABDialogOpen(false);
            setETicketDownloadWithPrice(false);
            setTriggerPdfDownload(true);
          }}
        />
        <AgentInvoiceDownloadDialog
          open={agentInvoiceDialogOpen}
          onClose={() => setAgentInvoiceDialogOpen(false)}
          onDownloadWithPrice={() => {
            // TODO: trigger Agent Invoice download with price
          }}
          onDownloadWithoutPrice={() => {
            // TODO: trigger Agent Invoice download without price
          }}
        />
        <AgentInvoiceWithCAABDialog
          open={agentInvoiceWithCAABDialogOpen}
          onClose={() => setAgentInvoiceWithCAABDialogOpen(false)}
          onDownloadWithPrice={(payload) => {
            // TODO: trigger Agent Invoice with CAAB download with price (payload: { agencyName, civilAviationNumber })
          }}
          onDownloadWithoutPrice={(payload) => {
            // TODO: trigger Agent Invoice with CAAB download without price
          }}
        />
        {/* Hidden div for PDF capture - off-screen but painted so html2canvas can capture */}
        <Box
          ref={pdfSourceRef}
          sx={{
            position: "fixed",
            left: -9999,
            top: 0,
            width: 720,
            minHeight: 400,
            backgroundColor: "#fff",
            zIndex: 1,
            overflow: "hidden",
            visibility: "visible",
          }}
        >
          <ETicketPdfLayout data={bookingData} showFareSummary={eTicketDownloadWithPrice} />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <BookingQueDetailsCard data={bookingData} />
          <BookingQuePassengerList data={bookingData} />
          <BookingQueCustomerFareSummary data={bookingData} />
          <Box sx={{ mt: 3, p: 2, bgcolor: "#F9FAFB", borderRadius: 1, border: "1px solid #E5E7EB" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#374151", mb: 2 }}>
              E-Ticket / Itinerary (PDF layout)
            </Typography>
            <ETicketPdfLayout data={bookingData} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BookingQueInvoice;
