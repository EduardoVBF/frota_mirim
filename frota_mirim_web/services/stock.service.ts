import { api } from "./api";

// TYPES
export type StockItem = {
  id: string;
  itemCatalogId: string;
  currentQuantity: number;
  minimumQuantity?: number | null;
  location?: string | null;
  createdAt: string;
  updatedAt: string;

  itemCatalog: {
    id: string;
    name: string;
    type: "SUPPLY" | "PART";
    reference?: string | null;
    defaultPrice: number;
    isStockItem: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export type StockMovementType = "IN" | "OUT" | "ADJUST";


// FILTERS
export type StockFilters = {
  search?: string;

  lowStock?: boolean;
  zeroStock?: boolean;

  sortBy?: "name" | "quantity";
  sortOrder?: "asc" | "desc";

  type?: StockMovementType[];
};


// RESPONSE TYPES
export type StockListResponse = {
  items: StockItem[];

  meta: {
    total: number;
    totalFiltered: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  stats: {
    totalItems: number;
    totalUnits: number;
    lowStock: number;
  };
};

export type StockMovement = {
  id: string;
  itemCatalogId: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number | null;
  totalCost?: number | null;
  reason?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  createdByUserId: string;
  createdAt: string;
  userId: string;

  itemCatalog: {
    id: string;
    name: string;
    type: "SUPPLY" | "PART";
    reference?: string | null;
    defaultPrice: number;
    isStockItem: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

export type StockMovementListResponse = {
  items: StockMovement[];

  meta: {
    total: number;
    totalFiltered: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};


// PAYLOADS
export type StockEntryPayload = {
  itemCatalogId: string;
  quantity: number;
  unitCost?: number;
  reason?: string;
};

export type StockAdjustPayload = {
  itemCatalogId: string;
  quantity: number;
  reason?: string;
};

export type UpdateStockConfigPayload = {
  minimumQuantity?: number;
  location?: string;
};


// API
export async function getStock(
  filters: StockFilters & { page?: number; limit?: number },
): Promise<StockListResponse> {
  const { data } = await api.get("/stock", {
    params: filters,
  });

  return data;
}

export async function stockEntry(payload: StockEntryPayload): Promise<void> {
  await api.post("/stock/in", payload);
}

export async function stockAdjust(payload: StockAdjustPayload): Promise<void> {
  await api.post("/stock/adjust", payload);
}

export async function getStockMovements(
  filters: StockFilters & { page?: number; limit?: number },
): Promise<StockMovementListResponse> {
  const { data } = await api.get("/stock/movements", {
    params: filters,
  });

  return data;
}

export async function updateStockConfig(
  itemCatalogId: string,
  payload: UpdateStockConfigPayload,
) {
  await api.put(`/stock/${itemCatalogId}/config`, payload);
}
