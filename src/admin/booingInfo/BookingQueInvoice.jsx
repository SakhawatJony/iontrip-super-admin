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
  const [bookingInvoiceDialogOpen, setBookingInvoiceDialogOpen] = useState(false);
  const [bookingInvoiceWithCAABDialogOpen, setBookingInvoiceWithCAABDialogOpen] = useState(false);
  const [eTicketDownloadWithPrice, setETicketDownloadWithPrice] = useState(true);
  /** Filename / flow: eticket | booking | agent — capture always uses ETicketPdfLayout */
  const [pdfCaptureVariant, setPdfCaptureVariant] = useState("eticket");
  /** Agency + CAAB from ETicketWithCAABDialog / booking invoice CAAB dialog */
  const [caabPdfPayload, setCaabPdfPayload] = useState(null);
  const [triggerPdfDownload, setTriggerPdfDownload] = useState(false);
  const pdfSourceRef = useRef(null);

  const isBookingOrCustomerInvoice =
    invoiceType === "Booking Invoice" || invoiceType === "Customer Invoice";
  const downloadDialogTitle =
    invoiceType === "Customer Invoice" ? "Customer Invoice Download" : "Booking Invoice Download";

  useEffect(() => {
    if (!triggerPdfDownload || !pdfSourceRef.current || !bookingData) return;
    const id = bookingData?.bookingId || "ticket";
    const suffix = eTicketDownloadWithPrice ? "with-price" : "without-price";
    let filename;
    if (pdfCaptureVariant === "booking") {
      filename = `${invoiceType === "Customer Invoice" ? "customer-invoice" : "booking-invoice"}-${id}-${suffix}`;
    } else if (pdfCaptureVariant === "agent") {
      filename = `agent-invoice-${id}-${suffix}`;
    } else {
      filename = `e-ticket-${id}-${suffix}`;
    }
    const el = pdfSourceRef.current;
    const timer = setTimeout(() => {
      downloadElementAsPdf(el, filename)
        .then(() => setTriggerPdfDownload(false))
        .catch(() => setTriggerPdfDownload(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [triggerPdfDownload, eTicketDownloadWithPrice, bookingData, pdfCaptureVariant, invoiceType]);

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
          {isBookingOrCustomerInvoice && (
            <>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setBookingInvoiceWithCAABDialogOpen(true)}
                sx={{
                  bgcolor: "var(--primary-color)",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
                }}
              >
                {invoiceType === "Customer Invoice" ? "Customer Invoice With CAAB" : "Booking Invoice With CAAB"}
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setBookingInvoiceDialogOpen(true)}
                sx={{
                  bgcolor: "var(--primary-color)",
                  color: "white",
                  textTransform: "capitalize",
                  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
                }}
              >
                {invoiceType === "Customer Invoice" ? "Customer Invoice" : "Booking Invoice"}
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
          {invoiceType !== "Agent Invoice" &&
            invoiceType !== "Customer Invoice" &&
            invoiceType !== "Booking Invoice" && (
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
            setPdfCaptureVariant("eticket");
            setCaabPdfPayload(null);
            setETicketDownloadWithPrice(true);
            setTriggerPdfDownload(true);
          }}
          onDownloadWithoutPrice={() => {
            setETicketDialogOpen(false);
            setPdfCaptureVariant("eticket");
            setCaabPdfPayload(null);
            setETicketDownloadWithPrice(false);
            setTriggerPdfDownload(true);
          }}
        />
        <ETicketWithCAABDialog
          open={eTicketWithCAABDialogOpen}
          onClose={() => setETicketWithCAABDialogOpen(false)}
          onDownloadWithPrice={(payload) => {
            setETicketWithCAABDialogOpen(false);
            setPdfCaptureVariant("eticket");
            setCaabPdfPayload(payload);
            setETicketDownloadWithPrice(true);
            setTriggerPdfDownload(true);
          }}
          onDownloadWithoutPrice={(payload) => {
            setETicketWithCAABDialogOpen(false);
            setPdfCaptureVariant("eticket");
            setCaabPdfPayload(payload);
            setETicketDownloadWithPrice(false);
            setTriggerPdfDownload(true);
          }}
        />
        <ETicketDownloadDialog
          open={bookingInvoiceDialogOpen}
          onClose={() => setBookingInvoiceDialogOpen(false)}
          title={downloadDialogTitle}
          onDownloadWithPrice={() => {
            setBookingInvoiceDialogOpen(false);
            setPdfCaptureVariant("booking");
            setCaabPdfPayload(null);
            setETicketDownloadWithPrice(true);
            setTriggerPdfDownload(true);
          }}
          onDownloadWithoutPrice={() => {
            setBookingInvoiceDialogOpen(false);
            setPdfCaptureVariant("booking");
            setCaabPdfPayload(null);
            setETicketDownloadWithPrice(false);
            setTriggerPdfDownload(true);
          }}
        />
        <ETicketWithCAABDialog
          open={bookingInvoiceWithCAABDialogOpen}
          onClose={() => setBookingInvoiceWithCAABDialogOpen(false)}
          title={downloadDialogTitle}
          onDownloadWithPrice={(payload) => {
            setBookingInvoiceWithCAABDialogOpen(false);
            setPdfCaptureVariant("booking");
            setCaabPdfPayload(payload);
            setETicketDownloadWithPrice(true);
            setTriggerPdfDownload(true);
          }}
          onDownloadWithoutPrice={(payload) => {
            setBookingInvoiceWithCAABDialogOpen(false);
            setPdfCaptureVariant("booking");
            setCaabPdfPayload(payload);
            setETicketDownloadWithPrice(false);
            setTriggerPdfDownload(true);
          }}
        />
        <AgentInvoiceDownloadDialog
          open={agentInvoiceDialogOpen}
          onClose={() => setAgentInvoiceDialogOpen(false)}
          onDownloadWithPrice={() => {
            setAgentInvoiceDialogOpen(false);
            setPdfCaptureVariant("agent");
            setCaabPdfPayload(null);
            setETicketDownloadWithPrice(true);
            setTriggerPdfDownload(true);
          }}
          onDownloadWithoutPrice={() => {
            setAgentInvoiceDialogOpen(false);
            setPdfCaptureVariant("agent");
            setCaabPdfPayload(null);
            setETicketDownloadWithPrice(false);
            setTriggerPdfDownload(true);
          }}
        />
        <AgentInvoiceWithCAABDialog
          open={agentInvoiceWithCAABDialogOpen}
          onClose={() => setAgentInvoiceWithCAABDialogOpen(false)}
          onDownloadWithPrice={(payload) => {
            setAgentInvoiceWithCAABDialogOpen(false);
            setPdfCaptureVariant("agent");
            setCaabPdfPayload(payload);
            setETicketDownloadWithPrice(true);
            setTriggerPdfDownload(true);
          }}
          onDownloadWithoutPrice={(payload) => {
            setAgentInvoiceWithCAABDialogOpen(false);
            setPdfCaptureVariant("agent");
            setCaabPdfPayload(payload);
            setETicketDownloadWithPrice(false);
            setTriggerPdfDownload(true);
          }}
        />
        {/* Hidden node for html2canvas — ETicketPdfLayout for all PDF downloads */}
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
          <ETicketPdfLayout
            data={bookingData}
            showFareSummary={eTicketDownloadWithPrice}
            agencyName={caabPdfPayload?.agencyName}
            binNumber={caabPdfPayload?.civilAviationNumber}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <BookingQueDetailsCard data={bookingData} />
          <BookingQuePassengerList data={bookingData} />
          <BookingQueCustomerFareSummary data={bookingData} />
        </Box>
      </Box>
    </Box>
  );
};

export default BookingQueInvoice;
