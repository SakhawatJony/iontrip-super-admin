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

export function getAirlineLogoUrl(data) {
  const seg = data?.goSegments?.[0] || data?.segments?.[0] || {};
  const code =
    seg.marketingcareer ||
    seg.marketingCarrier ||
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
