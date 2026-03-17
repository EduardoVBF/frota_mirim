import { DashboardQueryDTO } from "./dashboard.schema";
import { resolveDateRange } from "./dashboard.schema";
import { prisma } from "../../shared/database/prisma";
import dayjs from "dayjs";

export class DashboardService {
  /* OVERVIEW (KPIs) */
  async getOverview(query: DashboardQueryDTO) {
    const { startDate, endDate } = resolveDateRange(query);

    const [
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      alertsActive,
      avgFuel,
    ] = await Promise.all([
      prisma.vehicle.count(),

      prisma.vehicle.count({
        where: { isActive: true },
      }),

      prisma.maintenanceOrder.count({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
      }),

      prisma.alert.count({
        where: { resolvedAt: null },
      }),

      prisma.fuelSupply.aggregate({
        _avg: { media: true },
        where: {
          media: { not: null },
          data: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const vehiclesCheckedOut = await this.getVehiclesCheckedOut();

    const availability = totalVehicles > 0 ? activeVehicles / totalVehicles : 0;

    return {
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      vehiclesCheckedOut,
      alertsActive,
      availability,
      avgFuelConsumption: Number(avgFuel._avg.media || 0),
    };
  }

  /* FINANCEIRO */
  async getFinancial(query: DashboardQueryDTO) {
    const { startDate, endDate } = resolveDateRange(query);

    const [fuel, maintenance] = await Promise.all([
      prisma.fuelSupply.aggregate({
        _sum: { valorTotal: true },
        where: {
          data: { gte: startDate, lte: endDate },
        },
      }),

      prisma.maintenanceOrder.aggregate({
        _sum: { totalCost: true },
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: "DONE",
        },
      }),
    ]);

    const fuelCost = Number(fuel._sum.valorTotal || 0);
    const maintenanceCost = Number(maintenance._sum.totalCost || 0);

    /* KM rodado no período */
    const usages = await prisma.vehicleUsage.findMany({
      where: {
        eventAt: { gte: startDate, lte: endDate },
      },
      orderBy: { eventAt: "asc" },
    });

    let totalKm = 0;

    for (let i = 1; i < usages.length; i++) {
      const prev = usages[i - 1];
      const curr = usages[i];

      if (curr.vehicleId === prev.vehicleId) {
        totalKm += Math.max(curr.km - prev.km, 0);
      }
    }

    const costPerKm = totalKm > 0 ? fuelCost / totalKm : 0;

    return {
      fuelCostMonth: fuelCost,
      maintenanceCostMonth: maintenanceCost,
      costPerKm,
    };
  }

  /* GRÁFICOS */
  private resolveGranularity(query: DashboardQueryDTO) {
    switch (query.preset) {
      case "TODAY":
        return "hour";

      case "LAST_7_DAYS":
      case "LAST_30_DAYS":
      case "THIS_MONTH":
      case "LAST_MONTH":
        return "day";

      case "LAST_12_MONTHS":
        return "month";

      case "CUSTOM":
        return "day";

      default:
        return "day";
    }
  }

  private formatLabel(date: dayjs.Dayjs, granularity: string) {
    if (granularity === "hour") return date.format("HH:00");
    if (granularity === "day") return date.format("DD/MM");
    return date.format("MM/YY");
  }

  private generateEmptySeries(
    startDate: Date,
    endDate: Date,
    granularity: string,
  ) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const result: { label: string; value: number }[] = [];

    let cursor = start;

    while (cursor.isBefore(end) || cursor.isSame(end)) {
      result.push({
        label: this.formatLabel(cursor, granularity),
        value: 0,
      });

      if (granularity === "hour") cursor = cursor.add(1, "hour");
      else if (granularity === "day") cursor = cursor.add(1, "day");
      else cursor = cursor.add(1, "month");
    }

    return result;
  }

  private groupByPeriod(
    data: any[],
    dateField: string,
    valueField: string,
    startDate: Date,
    endDate: Date,
    granularity: "hour" | "day" | "month",
  ) {
    const map = new Map<string, number>();

    data.forEach((item) => {
      const date = dayjs(item[dateField]);
      const key = this.formatLabel(date, granularity);

      const current = map.get(key) || 0;
      map.set(key, current + Number(item[valueField]));
    });

    // 🔥 gera base completa (sem buracos)
    const base = this.generateEmptySeries(startDate, endDate, granularity);

    return base.map((item) => ({
      label: item.label,
      value: map.get(item.label) || 0,
    }));
  }

  async getCharts(query: DashboardQueryDTO) {
    const { startDate, endDate } = resolveDateRange(query);
    const granularity = this.resolveGranularity(query);

    const [fuelData, maintenanceData] = await Promise.all([
      prisma.fuelSupply.findMany({
        where: {
          data: { gte: startDate, lte: endDate },
        },
        select: {
          data: true,
          valorTotal: true,
        },
      }),

      prisma.maintenanceOrder.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: "DONE",
        },
        select: {
          createdAt: true,
          totalCost: true,
        },
      }),
    ]);

    return {
      fuel: this.groupByPeriod(
        fuelData,
        "data",
        "valorTotal",
        startDate,
        endDate,
        granularity,
      ),
      maintenance: this.groupByPeriod(
        maintenanceData,
        "createdAt",
        "totalCost",
        startDate,
        endDate,
        granularity,
      ),
      granularity,
    };
  }

  /* INSIGHTS */
  async getInsights(query: DashboardQueryDTO) {
    const { startDate, endDate } = resolveDateRange(query);

    /* VEÍCULOS COM MAIOR CUSTO DE MANUTENÇÃO */
    const maintenance = await prisma.maintenanceOrder.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "DONE",
      },
      select: {
        vehicleId: true,
        totalCost: true,
        vehicle: {
          select: {
            placa: true,
            modelo: true,
          },
        },
      },
    });

    const costMap = new Map<string, number>();

    maintenance.forEach((m) => {
      const current = costMap.get(m.vehicleId) || 0;
      costMap.set(m.vehicleId, current + Number(m.totalCost));
    });

    const topMaintenanceCost = Array.from(costMap.entries())
      .map(([vehicleId, value]) => {
        const vehicle = maintenance.find(
          (m) => m.vehicleId === vehicleId,
        )?.vehicle;

        return {
          vehicle: `${vehicle?.modelo} - ${vehicle?.placa}`,
          value,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    /* PIOR CONSUMO */
    const fuel = await prisma.fuelSupply.findMany({
      where: {
        media: { not: null },
        data: { gte: startDate, lte: endDate },
      },
      select: {
        vehicleId: true,
        media: true,
        vehicle: {
          select: {
            placa: true,
            modelo: true,
          },
        },
      },
    });

    const fuelMap = new Map<string, number[]>();

    fuel.forEach((f) => {
      if (!fuelMap.has(f.vehicleId)) {
        fuelMap.set(f.vehicleId, []);
      }
      fuelMap.get(f.vehicleId)!.push(Number(f.media));
    });

    const worstFuelEfficiency = Array.from(fuelMap.entries())
      .map(([vehicleId, medias]) => {
        const avg = medias.reduce((acc, val) => acc + val, 0) / medias.length;

        const vehicle = fuel.find((f) => f.vehicleId === vehicleId)?.vehicle;

        return {
          vehicle: `${vehicle?.modelo} - ${vehicle?.placa}`,
          kmPerLiter: avg,
        };
      })
      .sort((a, b) => a.kmPerLiter - b.kmPerLiter)
      .slice(0, 5);

    return {
      topMaintenanceCost,
      worstFuelEfficiency,
    };
  }

  /* ALERTAS */
  async getAlerts() {
    const alerts = await prisma.alert.findMany({
      where: {
        resolvedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return alerts;
  }

  /* HELPERS */
  private async getVehiclesCheckedOut() {
    const lastUsages = await prisma.vehicleUsage.findMany({
      orderBy: { eventAt: "desc" },
      distinct: ["vehicleId"],
    });

    return lastUsages.filter((u) => u.type === "EXIT").length;
  }

  private groupByMonth(data: any[], dateField: string, valueField: string) {
    const map = new Map<string, number>();

    data.forEach((item) => {
      const date = new Date(item[dateField]);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

      const current = map.get(key) || 0;
      map.set(key, current + Number(item[valueField]));
    });

    return Array.from(map.entries()).map(([month, value]) => ({
      month,
      value,
    }));
  }
}
