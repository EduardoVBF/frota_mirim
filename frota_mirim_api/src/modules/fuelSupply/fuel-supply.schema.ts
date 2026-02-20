import { z } from "zod";

// ENUMS
export const FUEL_TYPES = ["GASOLINA", "ETANOL", "DIESEL"] as const;
export const fuelTypeSchema = z.enum(FUEL_TYPES);

export const FUEL_STATION_TYPES = ["INTERNO", "EXTERNO"] as const;
export const fuelStationTypeSchema = z.enum(FUEL_STATION_TYPES);

// RESPONSE
export const fuelSupplyResponseSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  userId: z.string().uuid().nullable(),

  data: z.coerce.date(),
  kmAtual: z.number(),

  litros: z.number(),
  valorLitro: z.number(),
  valorTotal: z.number(),

  tipoCombustivel: fuelTypeSchema,
  postoTipo: fuelStationTypeSchema,
  postoNome: z.string().nullable().optional(),

  tanqueCheio: z.boolean(),
  media: z.number().nullable().optional(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FuelSupplyResponseDTO = z.infer<
  typeof fuelSupplyResponseSchema
>;

// CREATE
export const createFuelSupplySchema = z.object({
  vehicleId: z.string().uuid(),
  userId: z.string().uuid().optional(),

  data: z.coerce.date(),
  kmAtual: z.number().min(0),

  litros: z.number().positive(),
  valorLitro: z.number().positive(),

  tipoCombustivel: fuelTypeSchema,
  postoTipo: fuelStationTypeSchema,
  postoNome: z.string().optional(),

  tanqueCheio: z.boolean(),
});

export type CreateFuelSupplyDTO = z.infer<
  typeof createFuelSupplySchema
>;

// PARAMS
export const fuelSupplyParamsSchema = z.object({
  id: z.string().uuid(),
});

export type FuelSupplyParamsDTO = z.infer<
  typeof fuelSupplyParamsSchema
>;

// QUERY (GET ALL)
export const fuelSupplyQuerySchema = z.object({
  vehicleId: z.string().uuid().optional(),

  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),

  tipoCombustivel: fuelTypeSchema.optional(),
  postoTipo: fuelStationTypeSchema.optional(),
  tanqueCheio: z.boolean().optional(),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(100)),
});

export type FuelSupplyQueryDTO = z.infer<
  typeof fuelSupplyQuerySchema
>;
