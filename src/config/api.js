// API Base URL Configuration
export const API_BASE_URL = "https://iontrip-backend-production.up.railway.app";

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
};
