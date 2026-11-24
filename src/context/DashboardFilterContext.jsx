import { createContext, useContext, useMemo, useState } from "react";
import { getDefaultDateRange } from "../admin/dashboardData.js";

const DashboardFilterContext = createContext(null);

export function DashboardFilterProvider({ children }) {
  const [dateRange, setDateRange] = useState(() => getDefaultDateRange());
  const [currency] = useState("BDT");

  const value = useMemo(
    () => ({
      dateRange,
      setDateRange,
      currency,
    }),
    [dateRange, currency]
  );

  return (
    <DashboardFilterContext.Provider value={value}>{children}</DashboardFilterContext.Provider>
  );
}

export function useDashboardFilter() {
  const context = useContext(DashboardFilterContext);
  if (!context) {
    throw new Error("useDashboardFilter must be used within DashboardFilterProvider");
  }
  return context;
}
