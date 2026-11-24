// API Base URL — set `VITE_API_BASE_URL` in `env/.env` (see vite.config.js `envDir`).
const DEFAULT_API_BASE = "https://api.iontrip.com";

function normalizeApiBase(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/+$/, "");
}

export const API_BASE_URL =
  normalizeApiBase(import.meta.env.VITE_API_BASE_URL) || DEFAULT_API_BASE;

<<<<<<< HEAD
function envText(name, fallback) {
  const value = import.meta.env[name];
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function envPath(name, fallback) {
  const value = envText(name, fallback);
  if (/^https?:\/\//i.test(value)) return value.replace(/\/+$/, "");
  return value.startsWith("/") ? value : `/${value}`;
}

/** Public tour API, same host B2B uses (`VITE_PUBLIC_API_BASE_URL` / `VITE_TOUR_API_BASE_URL`). */
export const TOUR_API_BASE_URL =
  normalizeApiBase(import.meta.env.VITE_TOUR_API_BASE_URL) ||
  normalizeApiBase(import.meta.env.VITE_PUBLIC_API_BASE_URL) ||
  "https://api.iontrip.com";

=======
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
// API Endpoints
export const API_ENDPOINTS = {
  ADMIN_LOGIN: "/auth/signAdmin",
  DEPOSIT_LIST: "/deposit/admin/list",
  DEPOSIT_REVIEW: "/deposit/admin/review",
  FLIGHT_BOOKING_LIST: "/booking/admin/list",
  ALL_AGENTS: "/agent/admin/allAgents",
  UPDATE_AGENT_STATUS: "/agent/admin/updateStatus",
  VERIFY_AGENT: "/agent/admin/verify",
  ALL_ADMINS: "/admin/findAllAdmin",
  CREATE_ADMIN: "/admin/createAdmin",
  UPDATE_ADMIN: "/admin/updateAdmin",
  DELETE_ADMIN: "/admin",
  BANK_INFO: "/bank-info",
  CREATE_BANK: "/bank-info",
  UPDATE_BANK: "/bank-info",
  DELETE_BANK: "/bank-info",
  TRANSACTION_LIST: "/transection/admin/list",
  VENDOR_TICKET: "/ticket-actions/VendorTicket",
  CREATE_VISA: "/visa/createVisa",
  FIND_ALL_VISA: "/visa/findAllVisa",
<<<<<<< HEAD
  VISA_BOOKINGS_ADMIN: "/visa/bookings/admin",
  VISA_BOOKING_ADMIN_BY_ID: (id) => `/visa/bookings/admin/${id}`,
  COUNTRIES: "/country",
  COUNTRY_BY_ID: (id) => `/country/${id}`,
  TOUR_COUNTRIES: envPath("VITE_TOUR_PACKAGE_COUNTRY_PATH", "/tour-package-country"),
  TOUR_COUNTRY_BY_ID: (id) =>
    `${envPath("VITE_TOUR_PACKAGE_COUNTRY_PATH", "/tour-package-country")}/${encodeURIComponent(id)}`,
  TOUR_COUNTRY_SEARCH: envPath(
    "VITE_TOUR_PACKAGE_COUNTRY_SEARCH_PATH",
    "/tour-package-country/search",
  ),
  CATEGORY_ADMIN: envPath("VITE_CATEGORY_ADMIN_PATH", "/catagory/admin"),
  TOUR_PACKAGES: envPath("VITE_TOUR_PACKAGES_PATH", "/admin/tour-packages"),
  TOUR_PACKAGE_BY_ID: (id) =>
    `${envPath("VITE_TOUR_PACKAGES_PATH", "/admin/tour-packages")}/${encodeURIComponent(id)}`,
  TOUR_PACKAGE_ENQUIRIES: envPath(
    "VITE_TOUR_PACKAGE_ENQUIRIES_PATH",
    "/admin/tour-package-enquiries",
  ),
  TOUR_PACKAGE_ENQUIRY_BY_ID: (id) =>
    `${envPath("VITE_TOUR_PACKAGE_ENQUIRIES_PATH", "/admin/tour-package-enquiries")}/${encodeURIComponent(id)}`,
=======
  COUNTRIES: "/country",
  COUNTRY_BY_ID: (id) => `/country/${id}`,
>>>>>>> 9ff513b6a1f57c88d07f4f157072a0e15ff4fcf5
  AIRLINE_MARKUP: "/airline-markup",
  AIRLINE_MARKUP_BY_ID: (id) => `/airline-markup/${id}`,
  UPDATE_VISA: (id) => `/visa/updateVisa/${id}`,
  DELETE_VISA: (id) => `/visa/deleteVisa/${id}`,
  BLOG_CREATE: "/blogs/admin/create",
  BLOG_UPDATE: "/blogs/admin/update",
  BLOG_ALL: "/blogs/admin/allBlogs",
  BLOG_DELETE: "/blogs/admin/delete",
  BLOG_CATEGORIES: "/blogs/admin/categories",
  BLOG_TAGS: "/blogs/admin/tags",
  REFUND_QUOTE: (id) => `/refund/admin/${id}/quote`,
  REFUND_REJECT: (id) => `/refund/admin/${id}/reject`,
  REFUND_APPROVE: (id) => `/refund/admin/${id}/approve`,
  REFUND_TRANSFER: (id) => `/refund/admin/${id}/transfer`,
  REISSUE_QUOTE: (id) => `/reissue/admin/${id}/quote`,
  REISSUE_REJECT: (id) => `/reissue/admin/${id}/reject`,
  DASHBOARD_LIVE: "/admin/dashboard/live",
  NOTIFICATION_ADMIN: "/notification/admin",
  NOTIFICATION_READ_ALL: "/notification/admin/read-all",
  ASSIGN_PEOPLE: "/assign-people",
  ASSIGN_PEOPLE_BY_ID: (id) => `/assign-people/${id}`,
  SEARCH_REPORTS: "/flight/admin/search-reports",
};
