import { api } from "./api";
import qs from "qs";

export type MaintenanceType = "PREVENTIVE" | "CORRECTIVE";

export type MaintenanceStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCELED";

export type MaintenanceItem = {
  id: string;

  typeSnapshot: "PART" | "SERVICE";

  itemCatalogId: string;

  nameSnapshot: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  referenceSnapshot?: string;
};

export type Maintenance = {
  id: string;

  vehicleId: string;

  type: MaintenanceType;

  status: MaintenanceStatus;

  description?: string;

  odometer: number;

  scheduledAt?: string;

  startedAt?: string;

  completedAt?: string;

  partsCost: number;

  servicesCost: number;

  totalCost: number;

  createdAt: string;

  vehicle: {
    id: string;
    modelo: string;
    placa: string;
    marca?: string;
    ano?: number;
    kmAtual?: number;
  };

  maintenanceItems: MaintenanceItem[];
};

export type MaintenanceFilters = {
  vehicleId?: string;

  type?: MaintenanceType;

  status?: MaintenanceStatus;

  sortBy?: "createdAt" | "scheduledAt" | "completedAt" | "odometer";

  sortOrder?: "asc" | "desc";

  search?: string;

  page?: number;

  limit?: number;
};

export type MaintenancesResponse = {
  items: Maintenance[];

  meta: {
    total: number;
    totalFiltered: number;
    page: number;
    limit: number;
    totalPages: number;
    AllTotalCost: string;
  };

  stats: {
    status: {
      open: number;
      inProgress: number;
      done: number;
      canceled: number;
    };

    type: {
      preventive: number;
      corrective: number;
    };
  };
};

export type CreateMaintenancePayload = {
  vehicleId: string;

  type: MaintenanceType;

  description?: string;

  performerType?: "INTERNAL" | "EXTERNAL";

  odometer: number;
};

export async function getMaintenances(
  filters: MaintenanceFilters,
): Promise<MaintenancesResponse> {
  const { data } = await api.get("/maintenance", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

export async function getMaintenanceById(id: string): Promise<Maintenance> {
  const { data } = await api.get(`/maintenance/${id}`);

  return data.maintenance;
}

export async function createMaintenance(
  payload: CreateMaintenancePayload,
): Promise<Maintenance> {
  const { data } = await api.post("/maintenance", payload);

  return data;
}

export async function updateMaintenance(
  id: string,
  payload: Partial<CreateMaintenancePayload>,
): Promise<Maintenance> {
  const { data } = await api.put(`/maintenance/${id}`, payload);

  return data;
}