import { z } from "zod";

export const MAINTENANCE_TYPES = ["PREVENTIVE", "CORRECTIVE"] as const;
export const MAINTENANCE_STATUS = [
  "OPEN",
  "IN_PROGRESS",
  "DONE",
  "CANCELED",
] as const;

export const maintenanceTypeSchema = z.enum(MAINTENANCE_TYPES);
export const maintenanceStatusSchema = z.enum(MAINTENANCE_STATUS);

export const maintenanceParamsSchema = z.object({
  id: z.uuid(),
});

export const createMaintenanceSchema = z.object({
  vehicleId: z.uuid(),
  type: maintenanceTypeSchema,
  description: z.string().optional(),
  odometer: z.number().min(0),

  performerType: z.enum(["INTERNAL", "EXTERNAL"]),

  performedByUserId: z.uuid().optional(),
  performedByExternal: z.string().optional(),

  scheduledAt: z.date().optional(),
});

export const updateMaintenanceSchema = createMaintenanceSchema.partial();

export const maintenanceStatusUpdateSchema = z.object({
  status: maintenanceStatusSchema,
});

export const maintenanceQuerySchema = z.object({
  vehicleId: z.uuid().optional(),

  status: z.preprocess((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(maintenanceStatusSchema).optional()),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(1000)),
});

export type MaintenanceQueryDTO = z.infer<typeof maintenanceQuerySchema>;