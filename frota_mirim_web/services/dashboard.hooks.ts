import {
  getDashboardOverview,
  getDashboardFinancial,
  getDashboardInsights,
  getDashboardAlerts,
  DashboardFilters,
  DashboardOverview,
  DashboardFinancial,
  getDashboardCharts,
} from "./dashboard.service";

import { useQuery } from "@tanstack/react-query";

/* OVERVIEW */
export function useDashboardOverview(filters: DashboardFilters) {
  return useQuery<DashboardOverview>({
    queryKey: ["dashboard-overview", filters],
    queryFn: () => getDashboardOverview(filters),
    placeholderData: (prev) => prev,
  });
}

/* FINANCIAL */
export function useDashboardFinancial(filters: DashboardFilters) {
  return useQuery<DashboardFinancial>({
    queryKey: ["dashboard-financial", filters],
    queryFn: () => getDashboardFinancial(filters),
    placeholderData: (prev) => prev,
  });
}

/* GRÁFICOS */
export function useDashboardCharts(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard-charts", filters],
    queryFn: () => getDashboardCharts(filters),
    placeholderData: (prev) => prev,
  });
}

/* INSIGHTS */
export function useDashboardInsights(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard-insights", filters],
    queryFn: () => getDashboardInsights(filters),
    placeholderData: (prev) => prev,
  });
}

/* ALERTS */
export function useDashboardAlerts() {
  return useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: getDashboardAlerts,
    refetchInterval: 1000 * 30,
  });
}