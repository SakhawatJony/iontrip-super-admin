import { resolveBookingGoSegments } from "../flightItineraryUtils.js";

/** B2B iontrip booking queue — palette from b2b dashboard screenshot */
export const BQ = {
  pageBg: "#F4F7FA",
  navBar: "#003366",
  navy: "#003366",
  navyDark: "#002244",
  actionBlue: "#1A6FB5",
  actionBlueHover: "#155A94",
  accent: "#003366",
  accentSoft: "#E8EFF7",
  card: "#FFFFFF",
  border: "#D6E4F0",
  fieldBg: "#F8FAFC",
  text: "#1A2B3C",
  value: "#003366",
  muted: "#6B7C93",
  label: "#8B9CB3",
  expired: "#D32F2F",
  expiredBg: "#FFEBEE",
  holdOrange: "#E89B0C",
  holdOrangeBg: "#FFF4D6",
  holdWarn: "#F5A623",
  holdWarnBg: "#FFF8E6",
  timerPillBg: "rgba(0, 40, 80, 0.45)",
  cancelRed: "#D32F2F",
  cancelRedHover: "#B71C1C",
  refundBtn: "#8B9CB3",
  refundBtnHover: "#7A8DA6",
  supportBg: "#EEF4FB",
  shadow: "0 1px 6px rgba(0, 51, 102, 0.08)",
  radius: "8px",
  /** @deprecated use accent / actionBlue — kept so older refs stay blue */
  teal: "#1A6FB5",
  tealHover: "#155A94",
  tealSoft: "#E8EFF7",
};

export const bqLabelSx = {
  fontSize: 9,
  fontWeight: 600,
  color: BQ.label,
  letterSpacing: 0.45,
  textTransform: "uppercase",
  lineHeight: 1.2,
};

export const bqValueSx = {
  fontSize: 11,
  fontWeight: 700,
  color: BQ.value,
  lineHeight: 1.35,
};

export const bqCardSx = {
  bgcolor: BQ.card,
  borderRadius: BQ.radius,
  boxShadow: BQ.shadow,
  border: `1px solid ${BQ.border}`,
  overflow: "hidden",
};

export const bqSidebarBtnSx = {
  textTransform: "none",
  fontWeight: 600,
  fontSize: 12,
  borderRadius: "8px",
  py: 0.85,
  px: 1.5,
  minHeight: 36,
  justifyContent: "flex-start",
  boxShadow: "none",
  "& .MuiButton-startIcon": { marginRight: 0.75 },
  "& .MuiButton-startIcon > *:nth-of-type(1)": { fontSize: 17 },
  "& .MuiButton-endIcon > *:nth-of-type(1)": { fontSize: 17 },
};

export function getAirlineNameFromBooking(data) {
  const seg = resolveBookingGoSegments(data)[0] || {};
  const name =
    seg.marketingcareerName ||
    seg.marketingCarrierName ||
    data?.airlineName ||
    data?.airline ||
    "Airline";
  return String(name).toUpperCase();
}
