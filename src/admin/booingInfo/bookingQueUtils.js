/** Shared helpers for booking queue UI */
export function formatBqNumber(num) {
  if (num === null || num === undefined || num === "") return "0.00";
  const fixed = Number(num);
  const numStr = Number.isFinite(fixed) ? fixed.toFixed(2) : String(num);
  const parts = numStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : `${parts[0]}.00`;
}

export function formatCountdownTo(deadline) {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return { expired: true, label: "Expired" };

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return { expired: false, label: `${days}d ${hours}h ${minutes}m` };
  }
  if (hours > 0) {
    return { expired: false, label: `${hours}h ${minutes}m ${seconds}s` };
  }
  return { expired: false, label: `${minutes}m ${seconds}s` };
}

export function getPaxTypeShort(paxType) {
  const v = String(paxType || "ADULT").toUpperCase().replace(/_/g, " ");
  if (["ADT", "ADULT"].includes(v)) return "ADULT";
  if (["CHD", "CHILD", "CDH"].includes(v)) return "CHD";
  if (["INF", "INFT", "INFANT", "HELD INFANT"].includes(v)) return "INF";
  return v.slice(0, 6) || "ADULT";
}

export function resolveTravellerTitle(traveller) {
  const title = String(traveller?.title || "").trim();
  if (title) return title.toUpperCase();

  const gender = String(traveller?.gender || "").toUpperCase();
  if (gender === "FEMALE") return "MRS";
  if (gender === "MALE") return "MR";
  return "MR";
}

export function isCustomerInvoiceDocument(documentType) {
  return [
    "customer-invoice",
    "customer-invoice-caab",
    "booking-invoice",
    "booking-invoice-caab",
  ].includes(documentType);
}

export function isAgentInvoiceDocument(documentType) {
  return ["agent-invoice", "agent-invoice-caab"].includes(documentType);
}

export function isETicketDocument(documentType) {
  return documentType === "e-ticket" || documentType === "e-ticket-caab";
}

export function resolveRawAitVat(data) {
  return parseFloat(data?.aitVat ?? data?.ait ?? data?.vat ?? 0);
}

export function resolveInvoiceAitVat(data, documentType) {
  if (isCustomerInvoiceDocument(documentType) || isETicketDocument(documentType)) return 0;
  return resolveRawAitVat(data);
}

export function resolveAgentCommissionAmount(data) {
  const explicit = parseFloat(
    data?.commission ?? data?.agentCommission ?? data?.totalCommission ?? "",
  );
  if (Number.isFinite(explicit) && explicit !== 0) return Math.abs(explicit);

  const clientFare = parseFloat(data?.clientFare ?? data?.netPrice ?? "");
  const agentFare = parseFloat(data?.agentFare ?? "");
  if (Number.isFinite(clientFare) && Number.isFinite(agentFare) && clientFare > agentFare) {
    return clientFare - agentFare;
  }
  return 0;
}

export function resolveInvoiceGrandTotal(data, documentType, fallback = 0) {
  const clientFare = parseFloat(data?.clientFare ?? data?.netPrice ?? "");
  const agentFare = parseFloat(data?.agentFare ?? "");

  if (isAgentInvoiceDocument(documentType) && Number.isFinite(agentFare)) {
    return agentFare;
  }
  if (
    (isCustomerInvoiceDocument(documentType) || isETicketDocument(documentType)) &&
    Number.isFinite(clientFare)
  ) {
    return clientFare;
  }
  return fallback;
}

export function getAirlineLogoUrl(data) {
  const seg = data?.goSegments?.[0] || data?.segments?.[0] || {};
  const code =
    seg.marketingcareer ||
    seg.marketingCarrier ||
    data?.career ||
    data?.careerCode ||
    data?.airlineCode ||
    data?.carrierCode ||
    "";
  const carrier = String(code).trim().toUpperCase();
  if (!carrier) return "";
  return `https://tbbd-flight.s3.ap-southeast-1.amazonaws.com/airlines-logo/${carrier}.png`;
}

export function isRefundRequestStatus(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return normalized === "REFUNDREQUEST" || normalized.includes("REFUNDREQUEST");
}

export function isRefundQuotedStatus(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return normalized === "REFUNDQUOTED" || normalized.includes("REFUNDQUOTED");
}

export function isRefundProcessingStatus(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return normalized === "REFUNDPROCESSING" || normalized.includes("REFUNDPROCESSING");
}

export function isRefundedStatus(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return normalized === "REFUNDED";
}

export function isReissueRequestStatus(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return normalized === "REISSUEREQUEST" || normalized.includes("REISSUEREQUEST");
}

export function isReissueQuotedStatus(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return normalized === "REISSUEQUOTED" || normalized.includes("REISSUEQUOTED");
}

export function isReissueProcessingStatus(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return normalized === "REISSUEPROCESSING" || normalized.includes("REISSUEPROCESSING");
}

export function isReissuedStatus(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
  return normalized === "REISSUED" || normalized.includes("REISSUED");
}

export function resolveRefundRequestId(bookingData) {
  return (
    bookingData?.refundRequestId ||
    bookingData?.refundId ||
    bookingData?.refundRequest?.id ||
    bookingData?.refund?.id ||
    bookingData?.refund?.refundRequestId ||
    bookingData?.requestId ||
    ""
  );
}

export function resolveReissueRequestId(bookingData) {
  return (
    bookingData?.reissueRequestId ||
    bookingData?.reissueId ||
    bookingData?.reissueRequest?.id ||
    bookingData?.reissue?.id ||
    bookingData?.reissue?.reissueRequestId ||
    ""
  );
}

export function resolveReissueFlightBookingId(bookingData, fallbackBookingId = "") {
  return (
    bookingData?.bookingId ||
    bookingData?.reissueRequest?.flightBookingId ||
    bookingData?.reissue?.flightBookingId ||
    bookingData?.flightBookingId ||
    fallbackBookingId ||
    ""
  );
}

export function normalizeBookingStatusKey(status) {
  return String(status || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "");
}

export function shouldShowBookingDeadlineTimer(status) {
  const key = normalizeBookingStatusKey(status);
  return key === "BOOKED" || key === "ISSUEINPROCESS" || key === "ISSUEINPROGRESS";
}

export function resolveBookingDisplayStatus(data) {
  return (
    data?.status ||
    data?.bookingStatus ||
    data?.booking?.status ||
    data?.refundRequest?.status ||
    data?.reissueRequest?.status ||
    ""
  );
}

export function resolveBookingAgentEmail(data, fallbackEmail = "") {
  return (
    data?.agentEmail ||
    data?.agent?.email ||
    data?.userEmail ||
    data?.email ||
    fallbackEmail ||
    ""
  );
}
