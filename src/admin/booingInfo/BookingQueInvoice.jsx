import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
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
import {
  mergeAgentProfiles,
  normalizeAgentListResponse,
  resolveAgentInfoFromBooking,
  resolveAgentPdfHeader,
} from "../../utils/resolveAgentPdfInfo";
import { resolveBookingAgentEmail } from "./bookingQueUtils";
import { useAuth } from "../../context/AuthContext.jsx";
import { API_BASE_URL, API_ENDPOINTS } from "../../config/api.js";

const actionBtnSx = {
  bgcolor: "var(--primary-color)",
  color: "white",
  textTransform: "capitalize",
  "&:hover": { bgcolor: "var(--primary-color)", opacity: 0.9 },
};

const editBtnSx = {
  bgcolor: "#2CCEE4",
  color: "white",
  textTransform: "capitalize",
  "&:hover": { bgcolor: "#25b8cc" },
};

const BookingQueInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { bookingData, invoiceType } = location.state || {};
  const [invoiceData, setInvoiceData] = useState(bookingData || null);
  const [editFareDialogOpen, setEditFareDialogOpen] = useState(false);
  const [eTicketDialogOpen, setETicketDialogOpen] = useState(false);
  const [eTicketWithCAABDialogOpen, setETicketWithCAABDialogOpen] = useState(false);
  const [agentInvoiceDialogOpen, setAgentInvoiceDialogOpen] = useState(false);
  const [agentInvoiceWithCAABDialogOpen, setAgentInvoiceWithCAABDialogOpen] = useState(false);
  const [eTicketDownloadWithPrice, setETicketDownloadWithPrice] = useState(true);
  const [triggerPdfDownload, setTriggerPdfDownload] = useState(false);
  const [pdfFilenamePrefix, setPdfFilenamePrefix] = useState("e-ticket");
  const [pdfCaabInfo, setPdfCaabInfo] = useState(null);
  const [pdfDocumentType, setPdfDocumentType] = useState("e-ticket");
  const [bookingInvoiceDialogOpen, setBookingInvoiceDialogOpen] = useState(false);
  const [bookingInvoiceWithCAABDialogOpen, setBookingInvoiceWithCAABDialogOpen] = useState(false);
  const [agentProfile, setAgentProfile] = useState(() => resolveAgentInfoFromBooking(bookingData));
  const [pdfAssetsReady, setPdfAssetsReady] = useState(false);
  const [pdfLoadKey, setPdfLoadKey] = useState(0);
  const pdfSourceRef = useRef(null);
  const handlePdfAssetsReady = useCallback(() => setPdfAssetsReady(true), []);

  const isBookingInvoice = invoiceType === "Booking Invoice";
  const isCustomerInvoice = invoiceType === "Customer Invoice";
  const isAgentInvoice = invoiceType === "Agent Invoice";
  const isBookingOrCustomerInvoice = isBookingInvoice || isCustomerInvoice;
  const bookingInvoiceLabel = isCustomerInvoice ? "Customer Invoice" : "Booking Invoice";
  const agentHeader = resolveAgentPdfHeader(agentProfile, null, invoiceData);

  useEffect(() => {
    if (bookingData) setInvoiceData(bookingData);
  }, [bookingData]);

  useEffect(() => {
    const fromBooking = resolveAgentInfoFromBooking(invoiceData);
    setAgentProfile(fromBooking);

    const agentEmail = resolveBookingAgentEmail(invoiceData);
    const agentId =
      invoiceData?.agent?.agentId ||
      invoiceData?.agent?.agent_id ||
      invoiceData?.agentId ||
      invoiceData?.agent_id ||
      "";

    if (!token || (!agentEmail && !agentId)) return undefined;

    const controller = new AbortController();
    const params = new URLSearchParams({
      page: "1",
      limit: "1",
    });

    if (agentEmail) {
      params.append("email", agentEmail);
    } else {
      params.append("agentId", agentId);
    }

    fetch(`${API_BASE_URL}${API_ENDPOINTS.ALL_AGENTS}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((response) => {
        const { agentInfo } = normalizeAgentListResponse(response);
        if (agentInfo) {
          setAgentProfile((prev) => mergeAgentProfiles(agentInfo, prev, fromBooking));
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [token, invoiceData]);

  useEffect(() => {
    if (!triggerPdfDownload || !pdfAssetsReady || !pdfSourceRef.current || !invoiceData) return;
    const filename = `${pdfFilenamePrefix}-${invoiceData?.bookingId || "ticket"}-${eTicketDownloadWithPrice ? "with-price" : "without-price"}`;
    const el = pdfSourceRef.current;
    const timer = setTimeout(() => {
      downloadElementAsPdf(el, filename, { fitSinglePage: true })
        .then(() => {
          setTriggerPdfDownload(false);
          setPdfCaabInfo(null);
          setPdfAssetsReady(false);
        })
        .catch(() => {
          setTriggerPdfDownload(false);
          setPdfCaabInfo(null);
          setPdfAssetsReady(false);
          Swal.fire({
            icon: "error",
            title: "PDF Download Failed",
            text: "Could not generate the invoice PDF. Please try again.",
            confirmButtonColor: "var(--primary-color)",
          });
        });
    }, 1200);
    return () => clearTimeout(timer);
  }, [
    triggerPdfDownload,
    pdfAssetsReady,
    eTicketDownloadWithPrice,
    invoiceData,
    pdfFilenamePrefix,
    pdfCaabInfo,
    pdfDocumentType,
  ]);

  const calculateCustomerPayable = (breakdown, prev) => {
    const totalBaseFare = breakdown.reduce(
      (sum, item) => sum + parseFloat(item.BaseFare || 0) * parseFloat(item.PaxCount || 1),
      0
    );
    const totalTax = breakdown.reduce(
      (sum, item) => sum + parseFloat(item.Tax || 0) * parseFloat(item.PaxCount || 1),
      0
    );
    const totalServiceFee = breakdown.reduce(
      (sum, item) => sum + parseFloat(item.ServiceFee || 0) * parseFloat(item.PaxCount || 1),
      0
    );
    const totalDiscount = breakdown.reduce(
      (sum, item) => sum + parseFloat(item.Discount || 0) * parseFloat(item.PaxCount || 1),
      0
    );
    const fareTotal = totalBaseFare + totalTax + totalServiceFee - totalDiscount;
    const aitVat = parseFloat(prev?.aitVat ?? prev?.ait ?? prev?.vat ?? 0);
    const extraBaggageMealSeat = parseFloat(prev?.extraBaggage ?? prev?.extraBaggageMealSeat ?? 0);
    const bundleCost = parseFloat(prev?.bundleCost ?? 0);
    return fareTotal + aitVat + extraBaggageMealSeat + bundleCost;
  };

  const triggerInvoicePdfDownload = (prefix, withPrice = true, caabInfo = null) => {
    setPdfFilenamePrefix(prefix);
    setETicketDownloadWithPrice(withPrice);
    setPdfCaabInfo(caabInfo);
    setPdfDocumentType(
      prefix.startsWith("agent-invoice")
        ? "agent-invoice"
        : prefix.startsWith("customer-invoice") || prefix.startsWith("booking-invoice")
          ? "customer-invoice"
          : "e-ticket"
    );

    if (caabInfo) {
      setInvoiceData((prev) => ({
        ...prev,
        agencyName: caabInfo.agencyName,
        civilAviationNumber: caabInfo.civilAviationNumber,
      }));
    }

    setPdfAssetsReady(false);
    setPdfLoadKey((key) => key + 1);
    setTriggerPdfDownload(true);
  };

  const handleFareUpdate = (payload) => {
    setInvoiceData((prev) => {
      const updatedBreakdown = (payload.pricebreakdown || []).map((row, index) => ({
        ...(prev?.pricebreakdown?.[index] || {}),
        ...row,
        currency: payload.currency,
      }));
      const total = calculateCustomerPayable(updatedBreakdown, prev);

      return {
        ...prev,
        farecurrency: payload.currency,
        pricebreakdown: updatedBreakdown,
        netPrice: total.toFixed(2),
        clientFare: total.toFixed(2),
        agentFare: total.toFixed(2),
      };
    });

    setEditFareDialogOpen(false);
    Swal.fire({
      icon: "success",
      title: "Fare Updated",
      text: "Customer fare has been updated on this invoice.",
      confirmButtonColor: "var(--primary-color)",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  if (!invoiceData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          px: 4,
          py: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: 16, color: "#6B7280" }}>
          No booking data. Open invoice from booking details.
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/bookingqueuedetails")}
          variant="outlined"
        >
          Back to Booking
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", width: "100%" }}>
      <Box sx={{ px: 4, py: 4, width: "100%" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, justifyContent: "flex-end" }}>
          {isAgentInvoice && (
            <>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setAgentInvoiceWithCAABDialogOpen(true)}
                sx={actionBtnSx}
              >
                Agent Invoice With CAAB
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setAgentInvoiceDialogOpen(true)}
                sx={actionBtnSx}
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
                sx={actionBtnSx}
              >
                {bookingInvoiceLabel} With CAAB
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setBookingInvoiceDialogOpen(true)}
                sx={actionBtnSx}
              >
                {bookingInvoiceLabel}
              </Button>
              <Button startIcon={<EditIcon />} onClick={() => setEditFareDialogOpen(true)} sx={editBtnSx}>
                Edit Customer Fare
              </Button>
            </>
          )}

          {invoiceType !== "Agent Invoice" && !isBookingOrCustomerInvoice && (
            <>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setETicketWithCAABDialogOpen(true)}
                sx={actionBtnSx}
              >
                E-Ticket With CAAB
              </Button>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => setETicketDialogOpen(true)}
                sx={actionBtnSx}
              >
                E-Ticket
              </Button>
              <Button startIcon={<EditIcon />} onClick={() => setEditFareDialogOpen(true)} sx={editBtnSx}>
                Edit Customer Fare
              </Button>
            </>
          )}
        </Box>

        <EditCustomerFareDialog
          open={editFareDialogOpen}
          onClose={() => setEditFareDialogOpen(false)}
          data={invoiceData}
          onUpdate={handleFareUpdate}
        />

        <ETicketDownloadDialog
          open={eTicketDialogOpen}
          onClose={() => setETicketDialogOpen(false)}
          title="E-Ticket Download"
          onDownloadWithPrice={() => {
            setETicketDialogOpen(false);
            triggerInvoicePdfDownload("e-ticket", true);
          }}
          onDownloadWithoutPrice={() => {
            setETicketDialogOpen(false);
            triggerInvoicePdfDownload("e-ticket", false);
          }}
        />

        <ETicketDownloadDialog
          open={bookingInvoiceDialogOpen}
          onClose={() => setBookingInvoiceDialogOpen(false)}
          title={`${bookingInvoiceLabel} Download`}
          onDownloadWithPrice={() => {
            setBookingInvoiceDialogOpen(false);
            triggerInvoicePdfDownload(
              isCustomerInvoice ? "customer-invoice" : "booking-invoice",
              true,
              null
            );
          }}
          onDownloadWithoutPrice={() => {
            setBookingInvoiceDialogOpen(false);
            triggerInvoicePdfDownload(
              isCustomerInvoice ? "customer-invoice" : "booking-invoice",
              false,
              null
            );
          }}
        />

        <ETicketWithCAABDialog
          open={eTicketWithCAABDialogOpen}
          onClose={() => setETicketWithCAABDialogOpen(false)}
          defaultAgencyName={invoiceData?.agencyName}
          defaultCivilAviationNumber={invoiceData?.civilAviationNumber}
          onDownloadWithPrice={(payload) => {
            setETicketWithCAABDialogOpen(false);
            triggerInvoicePdfDownload("e-ticket-caab", true, payload);
          }}
          onDownloadWithoutPrice={(payload) => {
            setETicketWithCAABDialogOpen(false);
            triggerInvoicePdfDownload("e-ticket-caab", false, payload);
          }}
        />

        <ETicketWithCAABDialog
          open={bookingInvoiceWithCAABDialogOpen}
          onClose={() => setBookingInvoiceWithCAABDialogOpen(false)}
          title={`${bookingInvoiceLabel} Download`}
          defaultAgencyName={invoiceData?.agencyName}
          defaultCivilAviationNumber={invoiceData?.civilAviationNumber}
          onDownloadWithPrice={(payload) => {
            setBookingInvoiceWithCAABDialogOpen(false);
            triggerInvoicePdfDownload(
              isCustomerInvoice ? "customer-invoice-caab" : "booking-invoice-caab",
              true,
              payload
            );
          }}
          onDownloadWithoutPrice={(payload) => {
            setBookingInvoiceWithCAABDialogOpen(false);
            triggerInvoicePdfDownload(
              isCustomerInvoice ? "customer-invoice-caab" : "booking-invoice-caab",
              false,
              payload
            );
          }}
        />

        <AgentInvoiceDownloadDialog
          open={agentInvoiceDialogOpen}
          onClose={() => setAgentInvoiceDialogOpen(false)}
          onDownloadWithPrice={() => {
            setAgentInvoiceDialogOpen(false);
            triggerInvoicePdfDownload("agent-invoice", true, null);
          }}
          onDownloadWithoutPrice={() => {
            setAgentInvoiceDialogOpen(false);
            triggerInvoicePdfDownload("agent-invoice", false, null);
          }}
        />

        <AgentInvoiceWithCAABDialog
          open={agentInvoiceWithCAABDialogOpen}
          onClose={() => setAgentInvoiceWithCAABDialogOpen(false)}
          defaultAgencyName={agentHeader.agencyName}
          defaultCivilAviationNumber={agentHeader.civilAviationNumber}
          onDownloadWithPrice={(payload) => {
            setAgentInvoiceWithCAABDialogOpen(false);
            triggerInvoicePdfDownload("agent-invoice-caab", true, payload);
          }}
          onDownloadWithoutPrice={(payload) => {
            setAgentInvoiceWithCAABDialogOpen(false);
            triggerInvoicePdfDownload("agent-invoice-caab", false, payload);
          }}
        />

        <Box
          ref={pdfSourceRef}
          sx={{
            position: "fixed",
            left: 0,
            top: 0,
            width: 720,
            backgroundColor: "#ECECEC",
            visibility: "hidden",
            opacity: 1,
            zIndex: -1,
            overflow: "visible",
            pointerEvents: "none",
          }}
        >
          <ETicketPdfLayout
            data={invoiceData}
            showFareSummary={eTicketDownloadWithPrice}
            caabInfo={pdfCaabInfo}
            documentType={pdfDocumentType}
            agentInfo={agentProfile}
            onAssetsReady={handlePdfAssetsReady}
            assetLoadKey={pdfLoadKey}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <BookingQueDetailsCard data={invoiceData} />
          <BookingQuePassengerList data={invoiceData} />
          <BookingQueCustomerFareSummary data={invoiceData} invoiceType={invoiceType} />
        </Box>
      </Box>
    </Box>
  );
};

export default BookingQueInvoice;
