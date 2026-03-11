import { z } from "zod";

/* ENUMS */
export const ALERT_TYPES = [
  "LOW_STOCK",
  "ZERO_STOCK",

  "MAINTENANCE_DUE",
  "MAINTENANCE_OVERDUE",
  "MAINTENANCE_OPEN_TOO_LONG",
  "MAINTENANCE_IN_PROGRESS_TOO_LONG",

  "VEHICLE_DOCUMENT_EXPIRING",
  "VEHICLE_DOCUMENT_EXPIRED",

  "FUEL_CONSUMPTION_ANOMALY",

  "VEHICLE_CHECKOUT_TOO_LONG",
] as const;

export const ALERT_SEVERITIES = ["INFO", "WARNING", "CRITICAL"] as const;

export const ALERT_ENTITY_TYPES = [
  "STOCK_ITEM",
  "VEHICLE",
  "MAINTENANCE",
  "FUEL_SUPPLY",
  "DOCUMENT",
] as const;

export const alertTypeSchema = z.enum(ALERT_TYPES);

export const alertSeveritySchema = z.enum(ALERT_SEVERITIES);

export const alertEntityTypeSchema = z.enum(ALERT_ENTITY_TYPES);

/* PARAMS */
export const alertParamsSchema = z.object({
  id: z.uuid(),
});

/* QUERY */
export const alertsQuerySchema = z.object({
  search: z.string().optional(),

  type: z.preprocess((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(alertTypeSchema).optional()),

  severity: z.preprocess((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(alertSeveritySchema).optional()),

  entityType: z.preprocess((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(alertEntityTypeSchema).optional()),

  isRead: z.preprocess((v) => {
    if (v === undefined) return undefined;
    if (v === "true" || v === true) return true;
    if (v === "false" || v === false) return false;
    return undefined;
  }, z.boolean().optional()),

  resolved: z.preprocess((v) => {
    if (v === undefined) return undefined;
    if (v === "true" || v === true) return true;
    if (v === "false" || v === false) return false;
    return undefined;
  }, z.boolean().optional()),

  sortBy: z
    .enum(["createdAt", "severity", "type", "sequenceId"])
    .optional()
    .default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(100)),
});

/* ACTIONS */
export const markAlertReadSchema = z.object({
  read: z.boolean().default(true),
});

export const resolveAlertSchema = z.object({
  resolved: z.boolean().default(true),
});

/* TYPES */
export type AlertsQueryDTO = z.infer<typeof alertsQuerySchema>;
export type AlertParamsDTO = z.infer<typeof alertParamsSchema>;
export type MarkAlertReadDTO = z.infer<typeof markAlertReadSchema>;
export type ResolveAlertDTO = z.infer<typeof resolveAlertSchema>;
