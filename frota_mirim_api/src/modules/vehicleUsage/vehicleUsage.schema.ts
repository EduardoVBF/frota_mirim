import { z } from "zod";

// ENUM
export const VEHICLE_USAGE_TYPES = ["ENTRY", "EXIT"] as const;
export const vehicleUsageTypeSchema = z.enum(VEHICLE_USAGE_TYPES);

// RESPONSE
export const vehicleUsageResponseSchema = z.object({
  id: z.string().uuid(),

  vehicleId: z.string().uuid(),
  userId: z.string().uuid().nullable(),

  type: vehicleUsageTypeSchema,

  eventAt: z.coerce.date(),
  km: z.number(),

  notes: z.string().nullable().optional(),

  createdAt: z.coerce.date(),
});

export type VehicleUsageResponseDTO = z.infer<
  typeof vehicleUsageResponseSchema
>;

// CREATE (ENTRY ou EXIT)
export const createVehicleUsageSchema = z.object({
  vehicleId: z.string().uuid(),
  userId: z.string().uuid(),

  type: vehicleUsageTypeSchema,

  eventAt: z.coerce.date(),
  km: z.number().min(0),

  notes: z.string().optional(),
});

export type CreateVehicleUsageDTO = z.infer<
  typeof createVehicleUsageSchema
>;

// PARAMS
export const vehicleUsageParamsSchema = z.object({
  id: z.string().uuid(),
});

export type VehicleUsageParamsDTO = z.infer<
  typeof vehicleUsageParamsSchema
>;

// QUERY (GET ALL)
export const vehicleUsageQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),

  type: vehicleUsageTypeSchema.optional(),

  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(1000)),
});

export type VehicleUsageQueryDTO = z.infer<
  typeof vehicleUsageQuerySchema
>;