// API Base URL — set `VITE_API_BASE_URL` in `env/.env` (see vite.config.js `envDir`).
const DEFAULT_API_BASE = "https://iontrip-backend-production-2d3b.up.railway.app";

function normalizeApiBase(url) {
  if (!url || typeof url !== "string") return "";
  return url.trim().replace(/\/+$/, "");
}

export const API_BASE_URL =
  normalizeApiBase(import.meta.env.VITE_API_BASE_URL) || DEFAULT_API_BASE;

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
};
