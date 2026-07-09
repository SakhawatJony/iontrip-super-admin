const SERVICE_COLORS = {
  flights: { label: "Flights", color: "#0052CC", bg: "#DEEBFF" },
  stays: { label: "Hotels", color: "#36B37E", bg: "#E3FCEF" },
  hotels: { label: "Hotels", color: "#36B37E", bg: "#E3FCEF" },
  tours: { label: "Tours", color: "#7551FF", bg: "#EDE7F6" },
  cars: { label: "Transfer", color: "#00B8D9", bg: "#E0F7FA" },
  transfer: { label: "Transfer", color: "#00B8D9", bg: "#E0F7FA" },
  visa: { label: "Visa", color: "#FFAB00", bg: "#FFF0E0" },
  esim: { label: "eSIM", color: "#6554C0", bg: "#EDE7F6" },
  insurance: { label: "Travel Insurance", color: "#FF5630", bg: "#FFEBE6" },
};

const DONUT_COLORS = ["#0052CC", "#36B37E", "#FFAB00", "#7551FF", "#00B8D9", "#FF5630"];

const QUICK_ACTION_ROUTES = {
  bookings: "/dashboard/flightbookings/bookinghistory",
  users: "/dashboard/customer/allagent",
  flights: "/dashboard/flightbookings/bookinghistory",
  stays: "/dashboard/hotel/bookinghistory",
  tours: "/dashboard/tour/alltour",
  cars: "/dashboard/flightbookings/bookinghistory",
  pages: "/dashboard/manage/website",
  blogs: "/dashboard/manage/allblog",
  finance: "/dashboard/alldeposit",
  settings: "/dashboard/settings/alladmin",
};

const SERVICE_MODULE_ORDER = ["flights", "stays", "tours", "cars", "visa", "esim", "insurance"];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function extractMoney(value, fallbackCurrency = "BDT") {
  if (value == null) return { amount: 0, currency: fallbackCurrency };
  if (typeof value === "number") return { amount: value, currency: fallbackCurrency };
  if (typeof value === "object") {
    return {
      amount: toNumber(value.amount ?? value.value, 0),
      currency: value.currency || fallbackCurrency,
    };
  }
  return { amount: toNumber(value, 0), currency: fallbackCurrency };
}

export function toISODate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().slice(0, 10);
}

export function getDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setUTCDate(endDate.getUTCDate() - 6);
  return { startDate: toISODate(startDate), endDate: toISODate(endDate) };
}

export function formatCurrency(value, currency = "BDT") {
  const { amount } =
    typeof value === "object" && value !== null ? extractMoney(value, currency) : { amount: value };
  const num = toNumber(amount, NaN);
  if (!Number.isFinite(num)) return "—";
  return `${currency} ${num.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function formatCompactCurrency(value, currency = "BDT") {
  const { amount } =
    typeof value === "object" && value !== null ? extractMoney(value, currency) : { amount: value };
  const num = toNumber(amount, NaN);
  if (!Number.isFinite(num)) return "—";
  if (num >= 1_000_000) return `${currency} ${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${currency} ${(num / 1_000).toFixed(1)}K`;
  return formatCurrency(num, currency);
}

export function formatNumber(value) {
  const num = toNumber(value, NaN);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("en-US");
}

export function formatTrend(value) {
  const num = toNumber(value, NaN);
  if (!Number.isFinite(num)) return "—";
  return `${Math.abs(num).toFixed(1)}%`;
}

export function formatSignedTrend(value) {
  const num = toNumber(value, NaN);
  if (!Number.isFinite(num)) return "—";
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
}

function formatChartLabel(label) {
  if (!label) return "";
  const parsed = new Date(label);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return String(label);
}

export function formatRangeLabel(startDate, endDate) {
  if (!startDate || !endDate) return "Select date range";
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Select date range";
  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function mapKpiItem(item, sparkline = [], currency = "BDT") {
  const money = extractMoney(item?.value ?? item, currency);
  const change = item?.changePercent;
  return {
    value: money.amount,
    currency,
    change,
    trendUp: change == null ? true : toNumber(change) >= 0,
    comparisonLabel: item?.comparisonLabel || "",
    sparkline: sparkline.length ? sparkline : [0, 0, 0, 0, 0, 0, 0],
  };
}

function mapTrendSeries(list, seriesAKey, seriesBKey) {
  const rows = asArray(list);
  if (!rows.length) return { labels: [], seriesA: [], seriesB: [] };
  return {
    labels: rows.map((item) => formatChartLabel(item.period || item.date || item.label)),
    seriesA: rows.map((item) => toNumber(item[seriesAKey], 0)),
    seriesB: rows.map((item) => toNumber(item[seriesBKey], 0)),
  };
}

function mapServices(byModule = {}) {
  const modules = byModule || {};
  return SERVICE_MODULE_ORDER.map((key) => {
    const meta = SERVICE_COLORS[key] || { label: key, color: "#0052CC", bg: "#DEEBFF" };
    return {
      label: meta.label,
      count: toNumber(modules[key], 0),
      color: meta.color,
      bg: meta.bg,
    };
  });
}

function mapRevenueByService(list, currency = "BDT") {
  return asArray(list).map((item, index) => {
    const money = extractMoney(item.amount, currency);
    return {
      label: item.service || `Service ${index + 1}`,
      pct: toNumber(item.percentage, 0),
      amount: formatNumber(money.amount),
      color: DONUT_COLORS[index % DONUT_COLORS.length],
      rawAmount: money.amount,
    };
  });
}

function mapAlerts(list) {
  return asArray(list).map((item) => ({
    title: item.message || "Notification",
    desc: "",
    time: item.relativeTime || "",
    severity: item.severity || "info",
  }));
}

function mapTopAgents(list, currency = "BDT") {
  return asArray(list).map((item, index) => {
    const money = extractMoney(item.revenue, currency);
    return {
      rank: toNumber(item.rank, index + 1),
      name: item.agentName || "—",
      revenue: formatNumber(money.amount),
      growth: toNumber(item.growthPercent, 0),
    };
  });
}

function mapRiskOverview(agentRisk, currency = "BDT") {
  const risk = agentRisk || {};
  return {
    highRisk: toNumber(risk.highRisk, 0),
    mediumRisk: toNumber(risk.mediumRisk, 0),
    lowRisk: toNumber(risk.lowRisk, 0),
    categories: asArray(risk.breakdown).map((item) => {
      const money = extractMoney(item.amount, currency);
      return {
        label: item.label || "—",
        amount: formatCurrency(money.amount, currency),
        agents: toNumber(item.agentCount, 0),
      };
    }),
  };
}

function mapTopRoutes(list) {
  const routes = asArray(list);
  const maxCount = Math.max(...routes.map((item) => toNumber(item.bookings, 0)), 1);
  return routes.map((item) => {
    const count = toNumber(item.bookings, 0);
    const route = String(item.route || "—").replace(/\s*-\s*/g, " → ");
    return {
      route,
      count,
      pct: Math.round((count / maxCount) * 100),
    };
  });
}

function mapLiveActivity(list) {
  return asArray(list).map((item) => {
    const action = String(item.action || "").toLowerCase();
    let type = "default";
    if (action.includes("cancel")) type = "cancel";
    else if (action.includes("deposit") || action.includes("credit") || action.includes("paid")) type = "payment";
    else if (action.includes("ticket") || action.includes("issued")) type = "ticket";
    else if (action.includes("book")) type = "book";
    else if (action.includes("refund")) type = "cancel";

    return {
      text: `${item.agentName || "Agent"} ${item.action || ""}`.trim(),
      route: "",
      time: item.relativeTime || "",
      type,
    };
  });
}

function mapFinancialCard(item, currency = "BDT") {
  const money = extractMoney(item?.value ?? item, currency);
  const change = item?.changePercent;
  return {
    value: money.amount,
    currency,
    trend: change,
    up: change == null ? true : toNumber(change) >= 0,
  };
}

function mapRequiredActions(actionsRequired = {}) {
  const items = [
    { label: "Unpaid Bookings", count: actionsRequired.unpaidBookings, severity: "warning" },
    { label: "Failed Payments", count: actionsRequired.failedPayment, severity: "danger" },
    { label: "Cancellation Requests", count: actionsRequired.cancellationRequests, severity: "warning" },
    { label: "Pending Verification Deposits", count: actionsRequired.pendingVerificationDeposits, severity: "info" },
    { label: "Inactive Users", count: actionsRequired.inactiveUsers, severity: "info" },
  ];
  return items.filter((item) => item.count != null);
}

function mapQuickActions(list) {
  return asArray(list).map((item) => ({
    key: item.key,
    title: item.title,
    subtitle: item.subtitle,
    path: QUICK_ACTION_ROUTES[item.key] || "/dashboard",
  }));
}

function mapFooterStats(root) {
  const overview = root.overview || {};
  const summary = root.agentStatusSummary || {};

  const pickStat = (obj) => ({
    value: obj?.value,
    change: obj?.changePercent,
  });

  return {
    totalUsers: { value: overview.totalUsers, change: null },
    totalBookings: { value: overview.totalBookings, change: null },
    totalAgents: pickStat(summary.totalAgents),
    verifiedAgents: pickStat(summary.verifiedAgents),
    pendingVerification: pickStat(summary.pendingVerification),
    inactiveAgents: pickStat(summary.inactiveAgents),
  };
}

export function mapDashboardResponse(raw, displayCurrency = "BDT") {
  const root = raw?.data ?? raw ?? {};
  const currency = displayCurrency || "BDT";
  const dateRange = root.dateRange || {};
  const periodAnalytics = asArray(root.periodAnalytics);
  const revenueProfitTrend = asArray(root.revenueProfitTrend);
  const cashFlowTrendRaw = asArray(root.cashFlowTrend);
  const byModule = root.monthPerformance?.current?.byModule || {};

  const revenueSparkline = periodAnalytics.map((item) => toNumber(item.revenue, 0));
  const profitSparkline = revenueProfitTrend.map((item) => toNumber(item.profit, 0));
  const bookingsSparkline = periodAnalytics.map((item) => toNumber(item.paidBookings, 0) + toNumber(item.unpaidBookings, 0));
  const cashSparkline = cashFlowTrendRaw.map((item) => toNumber(item.cashIn, 0));

  const kpis = root.kpis || {};
  const revenueByService = mapRevenueByService(root.revenueByService, currency);
  const revenueTotal = revenueByService.reduce((sum, item) => sum + toNumber(item.rawAmount, 0), 0);

  return {
    reportingCurrency: currency,
    meta: {
      startDate: dateRange.start,
      endDate: dateRange.end,
      dateLabel: dateRange.label || "",
      comparisonLabel: dateRange.comparisonLabel || "",
      serverTime: root.generatedAt,
    },
    overview: root.overview || {},
    kpis: {
      totalRevenue: mapKpiItem(kpis.totalRevenue, revenueSparkline, currency),
      netProfit: mapKpiItem(kpis.netProfit, profitSparkline, currency),
      totalBookings: mapKpiItem(kpis.totalBookings, bookingsSparkline, currency),
      activeAgents: mapKpiItem(kpis.activeAgents, [], currency),
      totalOutstanding: mapKpiItem(kpis.totalOutstanding, [], currency),
      cashFlow: mapKpiItem(kpis.cashFlow, cashSparkline, currency),
    },
    services: mapServices(byModule),
    revenueTrend: mapTrendSeries(revenueProfitTrend, "revenue", "profit"),
    revenueByService,
    revenueByServiceTotal: revenueTotal,
    alerts: mapAlerts(root.alerts),
    topAgents: mapTopAgents(root.topAgents, currency),
    riskOverview: mapRiskOverview(root.agentRisk, currency),
    topRoutes: mapTopRoutes(root.topRoutes),
    liveActivity: mapLiveActivity(root.liveActivity),
    financialOverview: {
      totalReceivable: mapFinancialCard(root.financialOverview?.totalReceivable, currency),
      totalPayable: mapFinancialCard(root.financialOverview?.totalPayable, currency),
      cashInBank: mapFinancialCard(root.financialOverview?.cashInBank, currency),
      dailyCollectionAvg: mapFinancialCard(root.financialOverview?.dailyCollectionAvg, currency),
    },
    cashFlowTrend: mapTrendSeries(cashFlowTrendRaw, "cashIn", "cashOut"),
    requiredActions: mapRequiredActions(root.actionsRequired),
    requiredActionsTotal: toNumber(root.actionsRequired?.totalPending, 0),
    quickActions: mapQuickActions(root.quickActions),
    footerStats: mapFooterStats(root),
    recentBookings: asArray(root.recentBookings),
    notificationCount: asArray(root.alerts).length,
  };
}
