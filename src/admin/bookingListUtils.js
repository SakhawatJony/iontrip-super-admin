import {
  isRoundTripBooking,
  resolveBookingGoSegments,
  resolveSierraLegSummary,
} from "./flightItineraryUtils.js";

export function formatTripTypeLabel(triptype) {
  const v = String(triptype || "")
    .toLowerCase()
    .replace(/[_\s-]+/g, "");
  if (!v) return "-";
  if (v === "oneway") return "Oneway";
  if (v === "roundtrip" || v === "roundway") return "Roundway";
  if (v === "multicity") return "Multicity";
  return String(triptype).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatBookingStatusLabel(status) {
  if (!status || status === "-") return "-";
  const normalized = String(status).toUpperCase().replace(/[\s_-]+/g, "");
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "Booking Cancelled";
  if (normalized === "EXPIRED") return "Booking Expired";
  if (normalized === "TICKETED") return "Ticketed";
  if (normalized.includes("ISSUE") && normalized.includes("CANCEL")) return "Issue Cancelled";
  if (normalized === "BOOKED") return "Booked";
  if (normalized === "HOLD") return "Hold";
  if (normalized.includes("REFUND")) {
    return String(status)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return String(status)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveBookingRoute(booking) {
  const goSummary = resolveSierraLegSummary(booking, 1);
  const backSummary = isRoundTripBooking(booking) ? resolveSierraLegSummary(booking, 2) : null;

  let goDep = booking?.godeparture || goSummary?.departure;
  let goArr = booking?.goarrival || goSummary?.arrival;

  if (!goDep || !goArr) {
    const goSegs = resolveBookingGoSegments(booking);
    const first = goSegs[0];
    const last = goSegs[goSegs.length - 1] || first;
    goDep = goDep || first?.departure || first?.departureAirport;
    goArr = goArr || last?.arrival || last?.arrivalAirport;
  }

  if (!goDep || !goArr) return "-";

  if (isRoundTripBooking(booking)) {
    const backArr = backSummary?.arrival || booking?.backarrival || goDep;
    return `${goDep}-${goArr}-${backArr}`;
  }

  return `${goDep}-${goArr}`;
}

export function resolveBookingFlightDate(booking) {
  if (booking?.godepartureDate && booking.godepartureDate !== "-") {
    return booking.godepartureDate;
  }

  const goSummary = resolveSierraLegSummary(booking, 1);
  const raw = goSummary?.departureTime || resolveBookingGoSegments(booking)[0]?.departureTime;
  return formatBookingDateShort(raw);
}

function formatBookingDateShort(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return String(value);
  }
}

export function formatBookingMoney(amount, currencyCode = "BDT") {
  const num = parseFloat(amount);
  const code = currencyCode || "BDT";
  if (!Number.isFinite(num)) return `0.00 ${code}`;
  return `${num.toFixed(2)} ${code}`;
}

function resolveCustomerName(booking) {
  const traveller = booking?.travellers?.[0];
  if (traveller?.firstName || traveller?.lastName) {
    return [traveller.firstName, traveller.lastName].filter(Boolean).join(" ").toUpperCase();
  }
  const agentName = booking?.agent?.name || booking?.agent?.companyName;
  return agentName ? String(agentName).toUpperCase() : "-";
}

function resolveGrossFare(booking) {
  return booking?.netPrice ?? booking?.clientFare ?? 0;
}

function resolveTicketFare(booking) {
  return booking?.agentFare ?? booking?.netPrice ?? booking?.clientFare ?? 0;
}

export function mapBookingToTableRow(booking, currencyFallback = "BDT") {
  const currencyCode = booking?.farecurrency || currencyFallback || "BDT";
  const paxCount =
    booking?.travellers?.length ||
    booking?.pricebreakdown?.reduce((sum, row) => sum + parseInt(row.PaxCount || 0, 10), 0) ||
    booking?.segment ||
    0;

  const carrierCode =
    booking?.career ||
    booking?.careerCode ||
    (booking?.careerName ? String(booking.careerName).substring(0, 2).toUpperCase() : "");

  return {
    bookingId: booking?.bookingId || "-",
    customer: resolveCustomerName(booking),
    route: resolveBookingRoute(booking),
    type: formatTripTypeLabel(booking?.triptype),
    pnr: booking?.airlinePNR || booking?.gdsPNR || "-",
    bookingTime: formatBookingDateShort(booking?.bookingDateTime),
    dueAmount: `0 ${currencyCode}`,
    grossFare: formatBookingMoney(resolveGrossFare(booking), currencyCode),
    ticketFare: formatBookingMoney(resolveTicketFare(booking), currencyCode),
    pax: paxCount,
    airline: carrierCode || booking?.careerName || "-",
    carrierCode,
    flightDate: resolveBookingFlightDate(booking),
    status: formatBookingStatusLabel(booking?.status),
  };
}
