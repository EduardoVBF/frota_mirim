import { api } from "./api";
import qs from "qs";

/* TYPES */
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AlertType =
  | "LOW_STOCK"
  | "ZERO_STOCK"
  | "MAINTENANCE_DUE"
  | "MAINTENANCE_OVERDUE"
  | "MAINTENANCE_OPEN_TOO_LONG"
  | "MAINTENANCE_IN_PROGRESS_TOO_LONG"
  | "VEHICLE_DOCUMENT_EXPIRING"
  | "VEHICLE_DOCUMENT_EXPIRED"
  | "FUEL_CONSUMPTION_ANOMALY"
  | "VEHICLE_CHECKOUT_TOO_LONG";

export type AlertEntityType =
  | "STOCK_ITEM"
  | "VEHICLE"
  | "MAINTENANCE"
  | "FUEL_SUPPLY"
  | "DOCUMENT";

export type Alert = {
  id: string;

  sequenceId: number;

  type: AlertType;

  severity: AlertSeverity;

  title: string;

  message: string;

  entityType: AlertEntityType;

  entityId: string;

  metadata?: JSON;

  isRead: boolean;

  resolved: boolean;

  createdAt: string;

  resolvedAt?: string;
};

/* FILTERS */
export type AlertFilters = {
  search?: string;

  type?: AlertType;

  severity?: AlertSeverity;

  entityType?: AlertEntityType;

  isRead?: boolean;

  resolved?: boolean;

  page?: number;

  limit?: number;
};

/* RESPONSE */
export type AlertsResponse = {
  items: Alert[];

  meta: {
    total: number;
    totalFiltered: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  stats: {
    unread: number;
    warning: number;
    critical: number;
  };
};

/* GET ALERTS */
export async function getAlerts(
  filters: AlertFilters,
): Promise<AlertsResponse> {
  const { data } = await api.get("/alerts", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

/* MARK ALERT READ */
export async function markAlertRead(id: string): Promise<Alert> {
  const { data } = await api.patch(`/alerts/${id}/read`, { read: true });

  return data;
}

/* MARK ALL READ */
export async function markAllAlertsRead() {
  const { data } = await api.patch("/alerts/read-all");

  return data;
}

/* RESOLVE ALERT */
export async function resolveAlert(id: string): Promise<Alert> {
  const { data } = await api.patch(`/alerts/${id}/resolve`, { resolved: true });

  return data;
}
