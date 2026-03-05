import { api } from "./api";
import qs from "qs";

// TYPES
export type ItemType = "PART" | "SERVICE";

export type ItemCatalog = {
  id: string;
  name: string;
  type: ItemType;

  reference?: string | null;
  defaultPrice?: number | null;

  isStockItem: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
};

// RESPONSE PAGINADA
export type ItemCatalogResponse = {
  items: ItemCatalog[];
  meta: {
    total: number;
    totalFiltered: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// PAYLOADS
export type CreateItemCatalogPayload = {
  name: string;
  type: ItemType;
  reference?: string;
  defaultPrice?: number;
  isStockItem?: boolean;
  isActive?: boolean;
};

// FILTERS
export type ItemCatalogFilters = {
  search?: string;
  type?: ItemType[];
  isStockItem?: boolean;
  isActive?: boolean;

  page?: number;
  limit?: number;
};

// API CALLS

// GET ALL
export async function getItemCatalog(
  filters: ItemCatalogFilters,
): Promise<ItemCatalogResponse> {
  const { data } = await api.get("/item-catalog", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

// GET BY ID
export async function getItemCatalogById(
  id: string,
): Promise<ItemCatalog> {
  const { data } = await api.get(`/item-catalog/${id}`);
  return data;
}

// CREATE
export async function createItemCatalog(
  payload: CreateItemCatalogPayload,
): Promise<ItemCatalog> {
  const { data } = await api.post("/item-catalog", payload);
  return data;
}

// UPDATE
export async function updateItemCatalog(
  id: string,
  payload: Partial<CreateItemCatalogPayload>,
): Promise<ItemCatalog> {
  const { data } = await api.put(`/item-catalog/${id}`, payload);
  return data;
}