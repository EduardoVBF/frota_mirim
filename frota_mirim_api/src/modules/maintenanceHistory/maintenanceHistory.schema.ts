import { z } from "zod";

// ENUM
export const MAINTENANCE_HISTORY_ACTIONS = [
  "CREATED",
  "UPDATED",
  "STATUS_CHANGED",
  "ITEM_ADDED",
  "ITEM_REMOVED",
  "ITEM_UPDATED",
  "ATTACHMENT_ADDED",
  "ATTACHMENT_REMOVED",
  "RESPONSIBLE_CHANGED",
] as const;

export const maintenanceHistoryActionSchema = z.enum(
  MAINTENANCE_HISTORY_ACTIONS
);

// RESPONSE
export const maintenanceHistoryResponseSchema = z.object({
  id: z.string().uuid(),

  maintenanceOrderId: z.string().uuid(),

  action: maintenanceHistoryActionSchema,

  actorUserId: z.string().uuid().nullable(),
  responsibleUserId: z.string().uuid().nullable(),

  metadata: z.any().nullable(),

  description: z.string().nullable().optional(),

  createdAt: z.coerce.date(),
});

export type MaintenanceHistoryResponseDTO = z.infer<
  typeof maintenanceHistoryResponseSchema
>;

// PARAMS
export const maintenanceHistoryParamsSchema = z.object({
  id: z.string().uuid(),
});

export type MaintenanceHistoryParamsDTO = z.infer<
  typeof maintenanceHistoryParamsSchema
>;

// QUERY (GET ALL BY MAINTENANCE)
export const maintenanceHistoryQuerySchema = z.object({
  maintenanceOrderId: z.string().uuid(),

  action: maintenanceHistoryActionSchema.optional(),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(100)),
});

export type MaintenanceHistoryQueryDTO = z.infer<
  typeof maintenanceHistoryQuerySchema
>;

// UPDATE RESPONSIBLE
export const updateResponsibleSchema = z.object({
  responsibleUserId: z.string().uuid(),
});

export type UpdateResponsibleDTO = z.infer<
  typeof updateResponsibleSchema
>;