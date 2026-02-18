import { z } from "zod";

function normalizePlaca(placa: string) {
  return placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export const VEHICLE_TYPES = ["CARRO", "CAMINHAO", "MOTO", "ONIBUS"] as const;

export const vehicleTypeSchema = z.enum(VEHICLE_TYPES);

export const vehicleResponseSchema = z.object({
  id: z.uuid(),
  placa: z.string(),
  modelo: z.string(),
  marca: z.string(),
  ano: z.number(),
  tipo: vehicleTypeSchema,
  kmAtual: z.number(),
  kmUltimoAbastecimento: z.number().nullable().optional(),
  vencimentoDocumento: z.coerce.date(),
  vencimentoIPVA: z.coerce.date(),
  isActive: z.boolean(),
});

export type VehicleResponseDTO = z.infer<typeof vehicleResponseSchema>;

export const vehiclesListResponseSchema = z.array(vehicleResponseSchema);

export const vehicleParamsSchema = z.object({
  id: z.uuid(),
});

export const vehiclePlacaParamSchema = z.object({
  placa: z
    .string()
    .min(7)
    .transform((val) => normalizePlaca(val)),
});

export const createVehicleSchema = z.object({
  placa: z
    .string()
    .min(7)
    .transform((val) => normalizePlaca(val)),
  modelo: z.string().min(1),
  marca: z.string().min(1),
  ano: z.number().min(1950),
  tipo: vehicleTypeSchema,
  kmAtual: z.number().min(0),
  kmUltimoAbastecimento: z.number().min(0).optional(),
  vencimentoDocumento: z.coerce.date(),
  vencimentoIPVA: z.coerce.date(),
  isActive: z.boolean().default(true),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z.object({
  search: z.string().optional(),

  tipo: z.preprocess((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(vehicleTypeSchema).optional()),

  isActive: z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(100)),
});

export type VehicleQueryDTO = z.infer<typeof vehicleQuerySchema>;
