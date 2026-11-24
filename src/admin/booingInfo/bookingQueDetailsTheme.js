export function getStatusStyle(status) {
  const normalized = String(status || "")
    .toUpperCase()
    .replace(/\s+/g, "");

  if (normalized === "TICKETED") {
    return { color: "#28A745", bg: "#ECFDF5" };
  }
  if (["HOLD", "BOOKED", "CONFIRMED"].includes(normalized)) {
    return { color: "#D97706", bg: "#FFFBEB" };
  }
  if (["CANCELLED", "CANCELED", "EXPIRED", "VOID"].includes(normalized)) {
    return { color: "#DC2626", bg: "#FEF2F2" };
  }
  if (normalized.includes("REFUND")) {
    return { color: "#7C3AED", bg: "#F5F3FF" };
  }
  if (normalized.includes("REISSUE")) {
    return { color: "#024DAF", bg: "#EAF2FF" };
  }
  return { color: "#024DAF", bg: "#EAF2FF" };
}
