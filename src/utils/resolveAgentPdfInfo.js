export const DEFAULT_CAAB_NUMBER = "0016634";

export function normalizeAgentProfile(agent) {
  if (!agent || typeof agent !== "object") return null;

  return {
    id: agent.id ?? agent.agent_id ?? null,
    agentId: agent.agentId || agent.agent_id || "",
    name: agent.name || agent.agentName || agent.agent_name || "",
    email: agent.email || agent.agentEmail || agent.agent_email || "",
    companyName: agent.companyName || agent.company_name || "",
    companyAddress: agent.companyAddress || agent.company_address || "",
    mobile: agent.mobile || agent.phone || agent.agentMobile || agent.agent_mobile || "",
    logoUrl: agent.logoUrl || agent.logo || agent.logo_url || "",
    civilAviationNumber:
      agent.civilAviationNumber ||
      agent.caabNumber ||
      agent.caab_number ||
      agent.civilAviationNo ||
      "",
    country: agent.country || "",
    currency: agent.currency || "",
    businessType: agent.businessType || agent.business_type || "",
    markup: agent.markup ?? null,
  };
}

export function mergeAgentProfiles(...profiles) {
  const merged = {};

  profiles.forEach((profile) => {
    if (!profile || typeof profile !== "object") return;
    Object.entries(profile).forEach(([key, value]) => {
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        merged[key] = value;
      }
    });
  });

  return Object.keys(merged).length ? merged : null;
}

export function normalizeAgentListResponse(response) {
  const payload = response?.data ?? response;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.agents)
        ? payload.agents
        : [];

  const rawAgent = list[0] || payload?.agent || null;
  const agentInfo = normalizeAgentProfile(rawAgent);
  return { agentInfo, list };
}

export function resolveAgentPdfHeader(agentInfo, caabInfo, data, options = {}) {
  const { includeDefaultCaab = false } = options;
  const bookingAgent = normalizeAgentProfile(data?.agent);
  const agent = mergeAgentProfiles(agentInfo, bookingAgent);

  const resolvedCaab =
    caabInfo?.civilAviationNumber ||
    agent?.civilAviationNumber ||
    agent?.caabNumber ||
    data?.civilAviationNumber ||
    "";

  const civilAviationNumber =
    String(resolvedCaab || "").trim() || (includeDefaultCaab ? DEFAULT_CAAB_NUMBER : "");

  const agencyName =
    caabInfo?.agencyName ||
    agent?.companyName ||
    agent?.name ||
    data?.agencyName ||
    "";

  const companyAddress = agent?.companyAddress || data?.companyAddress || "";
  const contactPhone = agent?.mobile || agent?.phone || data?.agentMobile || data?.agent?.mobile || "";
  const supportEmail =
    agent?.email || data?.agent?.email || data?.supportEmail || data?.contactEmail || "";
  const logoUrl = agent?.logoUrl || data?.logoUrl || data?.agent?.logoUrl || "";

  return {
    agencyName: agencyName || "IONTRIP & TRAVEL LTD.",
    civilAviationNumber,
    companyAddress: companyAddress || "44A, PURANA PALTAN, DHAKA-1000",
    contactPhone: contactPhone || "8801813304444",
    supportEmail: supportEmail || "support@iontrip.com",
    logoUrl,
  };
}

export function resolveAgentInfoFromBooking(booking) {
  if (!booking) return null;

  const nestedAgent = normalizeAgentProfile(booking.agent);
  const flatAgent = normalizeAgentProfile({
    name: booking.agentName || booking.agent_name || booking.agent?.name,
    email: booking.agentEmail || booking.agent_email || booking.agent?.email,
    companyName: booking.companyName || booking.company_name || booking.agent?.companyName,
    companyAddress: booking.companyAddress || booking.company_address || booking.agent?.companyAddress,
    mobile: booking.agentMobile || booking.agent_mobile || booking.agent?.mobile,
    logoUrl: booking.logoUrl || booking.logo_url || booking.agent?.logoUrl,
    civilAviationNumber: booking.civilAviationNumber || booking.caabNumber,
    agentId: booking.agentId || booking.agent_id || booking.agent?.agentId,
  });

  return mergeAgentProfiles(nestedAgent, flatAgent);
}

/** Normalize agent logo src for PDF capture. */
export function getAgentLogoProxyUrl(url) {
  if (!url || typeof url !== "string") return url || "";
  if (url.startsWith("data:")) return url;
  return url.trim();
}
