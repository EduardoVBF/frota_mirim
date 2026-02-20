import { api } from "./api";
import qs from "qs";

// TYPES
export type FuelType = "GASOLINA" | "ETANOL" | "DIESEL";

export type FuelStationType = "INTERNO" | "EXTERNO";

export type FuelSupply = {
  id: string;
  vehicleId: string;
  userId?: string | null;

  data: string;
  kmAtual: number;

  litros: number;
  valorLitro: number;
  valorTotal: number;

  tipoCombustivel: FuelType;
  postoTipo: FuelStationType;
  postoNome?: string | null;

  tanqueCheio: boolean;
  media?: number | null;

  createdAt: string;
  updatedAt: string;
};

// RESPONSE PAGINADA
export type FuelSuppliesResponse = {
  abastecimentos: FuelSupply[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// PAYLOADS
export type CreateFuelSupplyPayload = {
  userId?: string | null;
  vehicleId: string;
  data: string;
  kmAtual: number;
  litros: number;
  valorLitro: number;
  tipoCombustivel: FuelType;
  postoTipo: FuelStationType;
  postoNome?: string;
  tanqueCheio: boolean;
};

export type UpdateFuelSupplyPayload = Partial<CreateFuelSupplyPayload>;

// FILTERS
export type FuelSupplyFilters = {
  vehicleId?: string;
  tipoCombustivel?: FuelType[];
  postoTipo?: FuelStationType;
  tanqueCheio?: boolean;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
};

// API CALLS
export async function getFuelSupplies(
  filters: FuelSupplyFilters,
): Promise<FuelSuppliesResponse> {
  const { data } = await api.get("/fuel-supplies", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

export async function getFuelSupplyById(id: string): Promise<FuelSupply> {
  const { data } = await api.get(`/fuel-supplies/${id}`);
  return data.abastecimento;
}

export async function createFuelSupply(
  payload: CreateFuelSupplyPayload,
): Promise<FuelSupply> {
  const { data } = await api.post("/fuel-supplies", payload);
  return data;
}

export async function updateFuelSupply(
  id: string,
  payload: UpdateFuelSupplyPayload,
): Promise<FuelSupply> {
  const { data } = await api.put(`/fuel-supplies/${id}`, payload);
  return data;
}

export async function deleteFuelSupply(id: string): Promise<void> {
  await api.delete(`/fuel-supplies/${id}`);
}
