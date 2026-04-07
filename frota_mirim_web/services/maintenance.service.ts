import { api } from "./api";
import qs from "qs";

export type MaintenanceType = "PREVENTIVE" | "CORRECTIVE";

export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELED";

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
  sequenceId: number;

  vehicleId: string;

  type: MaintenanceType;

  status: MaintenanceStatus;

  title: string;

  description?: string;

  odometer: number;

  scheduledAt?: string;

  startedAt?: string;

  completedAt?: string;

  partsCost: number;

  servicesCost: number;

  totalCost: number;

  createdAt: string;

  performerType: "INTERNAL" | "EXTERNAL";

  blocksVehicle: boolean;

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
    allTotalCost: string;
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
  status?: MaintenanceStatus;

  vehicleId: string;

  type: MaintenanceType;

  title: string;
  
  description?: string;

  performerType?: "INTERNAL" | "EXTERNAL";

  odometer: number;

  blocksVehicle?: boolean;
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

/* UPDATE STATUS */

export async function updateMaintenanceStatus(
  id: string,
  status: MaintenanceStatus,
): Promise<Maintenance> {
  if (!["OPEN", "IN_PROGRESS", "CANCELED"].includes(status)) {
    throw new Error("Status inválido para atualização direta");
  }

  const { data } = await api.patch(`/maintenance/${id}/status`, { status });

  return data;
}

/* FINALIZE MAINTENANCE */

export async function finalizeMaintenance(
  id: string,
): Promise<Maintenance> {
  const { data } = await api.post(`/maintenance/${id}/finalize`);

  return data;
}