const FLIGHT_STATUS_HISTORY = {
  ticketed: "/dashboard/flightbookings/ticketedhistory",
  cancelled: "/dashboard/flightbookings/cancelledhistory",
  cancel: "/dashboard/flightbookings/cancelledhistory",
  canceled: "/dashboard/flightbookings/cancelledhistory",
  reissue: "/dashboard/flightbookings/reissuehistory",
  refund: "/dashboard/flightbookings/refundshistory",
};

const MODULE_HISTORY = {
  booking: "/dashboard/flightbookings/bookinghistory",
  flight: "/dashboard/flightbookings/bookinghistory",
  flightbooking: "/dashboard/flightbookings/bookinghistory",
  flight_booking: "/dashboard/flightbookings/bookinghistory",
  deposit: "/dashboard/alldeposit",
  hotel: "/dashboard/hotel/bookinghistory",
  stay: "/dashboard/hotel/bookinghistory",
<<<<<<< HEAD
  visa: "/dashboard/visa/bookinghistory",
  tour: "/dashboard/tour/bookinghistory",
=======
  visa: "/dashboard/visa/allvisa",
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
  agent: "/dashboard/customer/allagent",
  blog: "/dashboard/manage/allblog",
  transaction: "/dashboard/ledgerreport",
};

function pickString(...values) {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function extractReference(item) {
  const reference =
    item?.reference ||
    item?.ref ||
    item?.metadata ||
    item?.meta ||
    item?.data ||
    item?.payload ||
    {};

  return typeof reference === "object" && reference !== null ? reference : {};
}

export function extractNotificationNavFields(item = {}) {
  const reference = extractReference(item);

  const type = pickString(
    item?.type,
    item?.notificationType,
    item?.entityType,
    item?.module,
    item?.category,
    item?.event,
    reference?.type,
    reference?.entityType,
    reference?.module
  );

  const status = pickString(
    item?.status,
    item?.bookingStatus,
    reference?.status,
    reference?.bookingStatus
  );

  const bookingId = pickString(
    item?.bookingId,
    item?.flightBookingId,
    reference?.bookingId,
    reference?.flightBookingId,
    type.includes("booking") || type.includes("flight") || type.includes("refund") || type.includes("reissue")
      ? pickString(item?.entityId, reference?.entityId, item?.targetId, reference?.targetId)
      : ""
  );

  const depositId = pickString(item?.depositId, reference?.depositId);
  const agentId = pickString(item?.agentId, reference?.agentId);
  const url = pickString(item?.url, item?.link, item?.path, item?.redirectUrl, item?.actionUrl);

  return { type, status, bookingId, depositId, agentId, url };
}

function resolveInternalPath(url) {
  const text = String(url || "").trim();
  if (!text) return null;

  if (text.startsWith("/dashboard")) {
    return { path: text, state: undefined };
  }

  if (text.startsWith("/")) {
    return { path: text, state: undefined };
  }

  try {
    const parsed = new URL(text);
    if (parsed.pathname.startsWith("/dashboard")) {
      return { path: `${parsed.pathname}${parsed.search}`, state: undefined };
    }
  } catch {
    return null;
  }

  return null;
}

function resolveBookingDestination({ bookingId, type, status }, userEmail) {
  const typeKey = normalizeKey(type);
  const statusKey = normalizeKey(status);
  const combined = `${typeKey} ${statusKey} ${normalizeKey(
    pickString(type, status)
  )}`;

  if (combined.includes("refund")) {
    return {
      path: "/dashboard/bookingqueuedetails/refund",
      state: { bookingId },
    };
  }

  if (combined.includes("reissue")) {
    return {
      path: "/dashboard/bookingqueuedetails",
      state: { bookingId, email: userEmail },
    };
  }

  for (const [key, path] of Object.entries(FLIGHT_STATUS_HISTORY)) {
    if (statusKey === key || statusKey.includes(key) || combined.includes(key)) {
      return {
        path,
        state: { bookingId, highlightBookingId: bookingId },
      };
    }
  }

  return {
    path: "/dashboard/bookingqueuedetails",
    state: { bookingId, email: userEmail },
  };
}

export function resolveNotificationDestination(notification, { userEmail = "" } = {}) {
  if (!notification) return null;

  const fields = extractNotificationNavFields(notification);
  const { type, status, bookingId, depositId, agentId, url } = fields;

  const directPath = resolveInternalPath(url);
  if (directPath) return directPath;

  if (bookingId) {
    return resolveBookingDestination(fields, userEmail);
  }

  if (depositId) {
    return {
      path: "/dashboard/alldeposit",
      state: { depositId, highlightDepositId: depositId },
    };
  }

  if (agentId) {
    return {
      path: "/dashboard/customer/allagent",
      state: { agentId, highlightAgentId: agentId },
    };
  }

  const typeKey = normalizeKey(type);
  const statusKey = normalizeKey(status);
  const combined = `${typeKey} ${statusKey}`;

  if (combined.includes("deposit")) {
    return { path: "/dashboard/alldeposit", state: undefined };
  }

  if (combined.includes("hotel") || combined.includes("stay")) {
    return { path: "/dashboard/hotel/bookinghistory", state: undefined };
  }

  if (combined.includes("visa")) {
<<<<<<< HEAD
    return { path: "/dashboard/visa/bookinghistory", state: undefined };
  }

  if (combined.includes("tour")) {
    return { path: "/dashboard/tour/bookinghistory", state: undefined };
=======
    return { path: "/dashboard/visa/allvisa", state: undefined };
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
  }

  if (combined.includes("agent")) {
    return { path: "/dashboard/customer/allagent", state: undefined };
  }

  for (const [key, path] of Object.entries(FLIGHT_STATUS_HISTORY)) {
    if (combined.includes(key)) {
      return { path, state: undefined };
    }
  }

  for (const [key, path] of Object.entries(MODULE_HISTORY)) {
    if (typeKey === key || typeKey.includes(key) || combined.includes(key)) {
      return { path, state: undefined };
    }
  }

  return null;
}

export function isNotificationNavigable(notification) {
  return Boolean(resolveNotificationDestination(notification));
}
