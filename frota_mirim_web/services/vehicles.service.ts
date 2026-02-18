import { api } from "./api";
import qs from "qs";

export type VehicleType = "CARRO" | "CAMINHAO" | "MOTO" | "ONIBUS";

export type Vehicle = {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  tipo: VehicleType;
  kmAtual: number;
  kmUltimoAbastecimento?: number | null;
  vencimentoDocumento: string;
  vencimentoIPVA: string;
  isActive: boolean;
};

export type VehiclePayload = {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  tipo: VehicleType;
  kmAtual: number;
  kmUltimoAbastecimento?: number | null;
  vencimentoDocumento: string;
  vencimentoIPVA: string;
  isActive: boolean;
};

export type UpdateVehiclePayload = {
  placa?: string;
  modelo?: string;
  marca?: string;
  ano?: number;
  tipo?: VehicleType;
  kmAtual?: number;
  kmUltimoAbastecimento?: number | null;
  vencimentoDocumento?: string;
  vencimentoIPVA?: string;
  isActive?: boolean;
};

export type VehicleFilters = {
  search?: string;
  tipo?: VehicleType[];
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type VehiclesResponse = {
  vehicles: Vehicle[];
  meta: {
    total: number;
    totalFiltered: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export async function createVehicle(
  payload: VehiclePayload
): Promise<Vehicle> {
  const { data } = await api.post("/vehicles", payload);
  return data;
}

export async function getVehicles(
  filters: VehicleFilters
): Promise<VehiclesResponse> {
  const { data } = await api.get("/vehicles", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

export async function getVehicleById(id: string): Promise<Vehicle> {
  const { data } = await api.get(`/vehicles/${id}`);
  return data.vehicle;
}

export async function updateVehicle(
  id: string,
  payload: UpdateVehiclePayload
): Promise<Vehicle> {
  const { data } = await api.put(`/vehicles/${id}`, payload);
  return data;
}
