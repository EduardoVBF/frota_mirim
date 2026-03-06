import { api } from "./api";

export type MaintenanceItem = {
  id: string;

  maintenanceOrderId: string;

  itemCatalogId: string;

  nameSnapshot: string;

  referenceSnapshot?: string;

  typeSnapshot: "PART" | "SERVICE";

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  createdAt: string;
};

export type CreateMaintenanceItemPayload = {
  itemCatalogId: string;
  quantity: number;
  unitPrice: number;
};

export type UpdateMaintenanceItemPayload = {
  quantity?: number;
  unitPrice?: number;
};

export async function createMaintenanceItem(
  maintenanceId: string,
  payload: CreateMaintenanceItemPayload,
): Promise<MaintenanceItem> {
  const { data } = await api.post(
    `/maintenance/${maintenanceId}/items`,
    payload,
  );

  return data;
}

export async function updateMaintenanceItem(
  itemId: string,
  payload: UpdateMaintenanceItemPayload,
): Promise<MaintenanceItem> {
  const { data } = await api.patch(`/maintenance/items/${itemId}`, payload);

  return data;
}

export async function deleteMaintenanceItem(itemId: string) {
  await api.delete(`/maintenance/items/${itemId}`);
}