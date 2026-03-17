import dayjs from "dayjs";
import { z } from "zod";

/* ENUM de períodos prontos */
export const dashboardPresetSchema = z.enum([
  "TODAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "THIS_MONTH",
  "LAST_MONTH",
  "LAST_12_MONTHS",
  "CUSTOM",
]);

/* Função para resolver o intervalo de datas com base no preset */
export function resolveDateRange(query: DashboardQueryDTO) {
  const now = dayjs();

  switch (query.preset) {
    case "TODAY":
      return {
        startDate: now.startOf("day").toDate(),
        endDate: now.endOf("day").toDate(),
      };

    case "LAST_7_DAYS":
      return {
        startDate: now.subtract(7, "day").startOf("day").toDate(),
        endDate: now.endOf("day").toDate(),
      };

    case "LAST_30_DAYS":
      return {
        startDate: now.subtract(30, "day").startOf("day").toDate(),
        endDate: now.endOf("day").toDate(),
      };

    case "THIS_MONTH":
      return {
        startDate: now.startOf("month").toDate(),
        endDate: now.endOf("month").toDate(),
      };

    case "LAST_MONTH":
      return {
        startDate: now.subtract(1, "month").startOf("month").toDate(),
        endDate: now.subtract(1, "month").endOf("month").toDate(),
      };

    case "LAST_12_MONTHS":
      return {
        startDate: now.subtract(12, "month").startOf("month").toDate(),
        endDate: now.endOf("month").toDate(),
      };

    case "CUSTOM":
      return {
        startDate: query.startDate
          ? new Date(query.startDate)
          : now.startOf("month").toDate(),
        endDate: query.endDate
          ? new Date(query.endDate)
          : now.endOf("month").toDate(),
      };

    default:
      return {
        startDate: now.startOf("month").toDate(),
        endDate: now.endOf("month").toDate(),
      };
  }
}

/* Query base do dashboard */
export const dashboardQuerySchema = z.object({
  preset: dashboardPresetSchema.optional().default("THIS_MONTH"),

  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),

  vehicleId: z.string().uuid().optional(),

  vehicleType: z.enum(["CARRO", "CAMINHAO", "MOTO", "ONIBUS"]).optional(),

  fuelType: z.enum(["GASOLINA", "ETANOL", "DIESEL"]).optional(),
});

export type DashboardQueryDTO = z.infer<typeof dashboardQuerySchema>;
