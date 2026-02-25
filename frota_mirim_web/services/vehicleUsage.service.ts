import { api } from "./api";
import qs from "qs";

// TYPES
export type VehicleUsageType = "ENTRY" | "EXIT";

export type VehicleUsage = {
  id: string;
  vehicleId: string;
  userId: string | null;

  type: VehicleUsageType;

  eventAt: Date;
  km: number;

  notes?: string | null;

  createdAt: string;
};

// RESPONSE PAGINADA
export type VehicleUsagesResponse = {
  usages: VehicleUsage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// PAYLOADS
export type CreateVehicleUsagePayload = {
  vehicleId: string;
  userId: string;
  type: VehicleUsageType;
  eventAt: Date;
  km: number;
  notes?: string;
};

// FILTERS
export type VehicleUsageFilters = {
  vehicleId?: string;
  userId?: string;
  type?: VehicleUsageType;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;

};

// EXTRA TYPES (INTELIGÊNCIA)
export type VehicleTrip = {
  vehicleId: string;
  startedAt: string;
  finishedAt: string;
  kmStart: number;
  kmEnd: number;
  kmDriven: number;
  userId: string;
};

export type VehicleInUse = {
  vehicleId: string;
  placa: string;
  kmAtual: number;
  startedAt: string;
  userId: string;
};

export type CurrentUserVehicle = {
  vehicleId: string;
  placa: string;
  startedAt: string;
  kmStart: number;
} | null;

// API CALLS

// GET ALL
export async function getVehicleUsages(
  filters: VehicleUsageFilters,
): Promise<VehicleUsagesResponse> {
  const { data } = await api.get("/vehicle-usages", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

// GET BY ID
export async function getVehicleUsageById(
  id: string,
): Promise<VehicleUsage> {
  const { data } = await api.get(`/vehicle-usages/${id}`);
  return data;
}

// CREATE
export async function createVehicleUsage(
  payload: CreateVehicleUsagePayload,
): Promise<VehicleUsage> {
  const { data } = await api.post("/vehicle-usages", payload);
  return data;
}

// INTELIGÊNCIA OPERACIONAL

// Última viagem de um veículo
export async function getLastTripByVehicle(
  vehicleId: string,
): Promise<VehicleTrip | null> {
  const { data } = await api.get(
    `/vehicle-usages/vehicle/${vehicleId}/last-trip`,
  );

  return data;
}

// Todas as viagens de um veículo
export async function getTripsByVehicle(
  vehicleId: string,
): Promise<VehicleTrip[]> {
  const { data } = await api.get(
    `/vehicle-usages/vehicle/${vehicleId}/trips`,
  );

  return data;
}

// Veículos em uso agora
export async function getVehiclesInUse(): Promise<VehicleInUse[]> {
  const { data } = await api.get(
    `/vehicle-usages/in-use`,
  );

  return data;
}

// Veículo atual de um usuário
export async function getCurrentVehicleByUser(
  userId: string,
): Promise<CurrentUserVehicle> {
  const { data } = await api.get(
    `/vehicle-usages/user/${userId}/current`,
  );

  return data;
}