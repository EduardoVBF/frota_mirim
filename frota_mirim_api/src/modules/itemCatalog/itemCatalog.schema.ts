import { z } from "zod";

// ENUMS
export const ITEM_TYPES = ["PART", "SERVICE"] as const;
export const itemTypeSchema = z.enum(ITEM_TYPES);

// RESPONSE
export const itemCatalogResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  type: itemTypeSchema,
  reference: z.string().nullable().optional(),
  defaultPrice: z.number().nullable().optional(),
  isStockItem: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ItemCatalogResponseDTO = z.infer<
  typeof itemCatalogResponseSchema
>;

export const itemCatalogListResponseSchema = z.array(
  itemCatalogResponseSchema
);

// PARAMS
export const itemCatalogParamsSchema = z.object({
  id: z.uuid(),
});

// CREATE
export const createItemCatalogSchema = z.object({
  name: z.string().min(1),

  type: itemTypeSchema,

  reference: z.string().optional(),

  defaultPrice: z.number().min(0).optional(),

  isStockItem: z.boolean().default(false),

  isActive: z.boolean().default(true),
});

// UPDATE
export const updateItemCatalogSchema = createItemCatalogSchema.partial();

// QUERY
export const itemCatalogQuerySchema = z.object({
  search: z.string().optional(),

  type: z.preprocess((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(itemTypeSchema).optional()),

  isStockItem: z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),

  isActive: z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),

  sortBy: z
    .enum(["name", "createdAt", "defaultPrice"])
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

export type ItemCatalogQueryDTO = z.infer<typeof itemCatalogQuerySchema>;