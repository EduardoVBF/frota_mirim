import { z } from "zod";

export const maintenanceItemParamsSchema = z.object({
  id: z.uuid(),
});

export const maintenanceItemMaintenanceParamsSchema = z.object({
  id: z.uuid(),
});

export const createMaintenanceItemSchema = z.object({
  itemCatalogId: z.uuid(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0).optional(),
});

export const updateMaintenanceItemSchema = z.object({
  quantity: z.number().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
});