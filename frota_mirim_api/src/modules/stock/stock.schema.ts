import { z } from "zod";

// ENUMS
export const stockMovementTypes = ["IN", "OUT", "ADJUST"] as const;
export const stockMovementTypeSchema = z.enum(stockMovementTypes);

export const stockParamsSchema = z.object({
  itemCatalogId: z.uuid(),
});

export const stockUpdateConfigSchema = z.object({
  minimumQuantity: z.number().min(0).optional(),
  location: z.string().optional(),
});

export const stockEntrySchema = z.object({
  itemCatalogId: z.uuid(),
  quantity: z.number().min(1),
  unitCost: z.number().min(0).optional(),
  reason: z.string().optional(),
});

export const stockAdjustSchema = z.object({
  itemCatalogId: z.uuid(),
  quantity: z.number(),
  reason: z.string().min(1),
});

export const stockQuerySchema = z.object({
  search: z.string().optional(),

  type: z.enum(["IN", "OUT", "ADJUST"]).optional(),

  lowStock: z.preprocess(
    (v) => v === "true" || v === true,
    z.boolean().optional(),
  ),

  zeroStock: z.preprocess(
    (v) => v === "true" || v === true,
    z.boolean().optional(),
  ),

  sortBy: z
    .enum(["name", "quantity"])
    .optional()
    .default("name"),

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .default("asc"),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(1000)),
});

export type StockQueryDTO = z.infer<typeof stockQuerySchema>;

export const stockMovementsQuerySchema = z.object({
  search: z.string().optional(),

  type: z.preprocess((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(stockMovementTypeSchema).optional()),

  sortBy: z
    .enum(["createdAt", "quantity"])
    .optional()
    .default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc"),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(1000)),
});

export type StockMovementsQueryDTO = z.infer<typeof stockMovementsQuerySchema>;