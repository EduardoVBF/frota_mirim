import { z } from "zod";

export const stockParamsSchema = z.object({
  itemCatalogId: z.uuid(),
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