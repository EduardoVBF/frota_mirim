import { AppError } from "../../infra/errors/app-error";

type NeighborEvent = {
  date: Date;
  km: number;
};

export class VehicleTimelineService {
  // Busca somente o evento anterior mais próximo
  private async getPreviousEvent(
    vehicleId: string,
    date: Date,
    tx: any,
  ): Promise<NeighborEvent | null> {
    const [prevUsage, prevFuel, vehicle] = await Promise.all([
      tx.vehicleUsage.findFirst({
        where: {
          vehicleId,
          eventAt: { lt: date },
        },
        orderBy: { eventAt: "desc" },
      }),

      tx.fuelSupply.findFirst({
        where: {
          vehicleId,
          data: { lt: date },
        },
        orderBy: { data: "desc" },
      }),

      tx.vehicle.findUnique({
        where: { id: vehicleId },
        select: { kmAtual: true, createdAt: true },
      }),
    ]);

    const candidates: NeighborEvent[] = [];

    if (prevUsage) {
      candidates.push({
        date: prevUsage.eventAt,
        km: prevUsage.km,
      });
    }

    if (prevFuel) {
      candidates.push({
        date: prevFuel.data,
        km: prevFuel.kmAtual,
      });
    }

    // KM inicial do veículo entra como fallback
    if (vehicle?.kmAtual !== null) {
      candidates.push({
        date: vehicle.createdAt,
        km: vehicle.kmAtual,
      });
    }

    if (!candidates.length) return null;

    return candidates.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  }

  // Busca somente o próximo evento mais próximo
  private async getNextEvent(
    vehicleId: string,
    date: Date,
    tx: any,
  ): Promise<NeighborEvent | null> {
    const [nextUsage, nextFuel] = await Promise.all([
      tx.vehicleUsage.findFirst({
        where: {
          vehicleId,
          eventAt: { gt: date },
        },
        orderBy: { eventAt: "asc" },
      }),

      tx.fuelSupply.findFirst({
        where: {
          vehicleId,
          data: { gt: date },
        },
        orderBy: { data: "asc" },
      }),
    ]);

    const candidates: NeighborEvent[] = [];

    if (nextUsage) {
      candidates.push({
        date: nextUsage.eventAt,
        km: nextUsage.km,
      });
    }

    if (nextFuel) {
      candidates.push({
        date: nextFuel.data,
        km: nextFuel.kmAtual,
      });
    }

    if (!candidates.length) return null;

    return candidates.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  }

  // validação leve (sem timeline completa)
  async validateKm(
    vehicleId: string,
    newDate: Date,
    newKm: number,
    tx: any,
  ) {
    const [prev, next] = await Promise.all([
      this.getPreviousEvent(vehicleId, newDate, tx),
      this.getNextEvent(vehicleId, newDate, tx),
    ]);

    if (prev && newKm < prev.km) {
      throw new AppError(
        `KM inválido. Deve ser maior ou igual ao KM anterior (${prev.km}).`,
        400,
      );
    }

    if (next && newKm > next.km) {
      throw new AppError(
        `KM inválido. Deve ser menor ou igual ao próximo evento (${next.km}).`,
        400,
      );
    }
  }

  // SUPER otimizado (1 query só)
  async getLastKm(vehicleId: string, tx: any): Promise<number | null> {
    const [lastUsage, lastFuel, vehicle] = await Promise.all([
      tx.vehicleUsage.findFirst({
        where: { vehicleId },
        orderBy: { eventAt: "desc" },
      }),

      tx.fuelSupply.findFirst({
        where: { vehicleId },
        orderBy: { data: "desc" },
      }),

      tx.vehicle.findUnique({
        where: { id: vehicleId },
        select: { kmAtual: true },
      }),
    ]);

    const candidates: number[] = [];

    if (lastUsage) candidates.push(lastUsage.km);
    if (lastFuel) candidates.push(lastFuel.kmAtual);
    if (vehicle?.kmAtual !== null) candidates.push(vehicle.kmAtual);

    if (!candidates.length) return null;

    return Math.max(...candidates);
  }
}