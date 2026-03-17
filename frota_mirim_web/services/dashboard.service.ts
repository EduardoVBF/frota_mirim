import { api } from "./api";
import qs from "qs";

/* TYPES */
export type DashboardPreset =
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "LAST_12_MONTHS"
  | "CUSTOM";

export type DashboardFilters = {
  preset?: DashboardPreset;
  startDate?: string;
  endDate?: string;
  vehicleId?: string;
};

/* OVERVIEW */
export type DashboardOverview = {
  totalVehicles: number;
  activeVehicles: number;
  vehiclesInMaintenance: number;
  vehiclesCheckedOut: number;
  alertsActive: number;
  availability: number;
  avgFuelConsumption: number;
};

export async function getDashboardOverview(
  filters: DashboardFilters,
): Promise<DashboardOverview> {
  const { data } = await api.get("/dashboard/overview", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

/* FINANCIAL */
export type DashboardFinancial = {
  fuelCostMonth: number;
  maintenanceCostMonth: number;
  costPerKm: number;
};

export async function getDashboardFinancial(
  filters: DashboardFilters,
): Promise<DashboardFinancial> {
  const { data } = await api.get("/dashboard/financial", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

/* CHARTS */
export type ChartItem = {
  month: string;
  value: number;
};

export type DashboardCharts = {
  fuelMonthly: ChartItem[];
  maintenanceMonthly: ChartItem[];
};

export async function getDashboardCharts(
  filters: DashboardFilters,
): Promise<DashboardCharts> {
  const { data } = await api.get("/dashboard/charts", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

/* INSIGHTS */
export type InsightItem = {
  vehicle: string;
  value?: number;
  kmPerLiter?: number;
};

export type DashboardInsights = {
  topMaintenanceCost: InsightItem[];
  worstFuelEfficiency: InsightItem[];
};

export async function getDashboardInsights(
  filters: DashboardFilters,
): Promise<DashboardInsights> {
  const { data } = await api.get("/dashboard/insights", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

/* ALERTS */
export type DashboardAlert = {
  id: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  createdAt: string;
  sequenceId: number;
};

export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  const { data } = await api.get("/dashboard/alerts");
  return data;
}
