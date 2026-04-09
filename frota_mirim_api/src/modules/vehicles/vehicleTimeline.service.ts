import { AppError } from "../../infra/errors/app-error";

type NeighborEvent = {
  date: Date;
  km: number;
};

export class VehicleTimelineService {
  /* Evento anterior mais próximo */
  private async getPreviousEvent(
    vehicleId: string,
    date: Date,
    tx: any,
  ): Promise<NeighborEvent | null> {
    const [prevUsage, prevFuel] = await Promise.all([
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

    if (!candidates.length) return null;

    return candidates.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  }

  /* Próximo evento mais próximo */
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

  /* Validação de KM na timeline */
  async validateKm(
    vehicleId: string,
    newDate: Date,
    newKm: number,
    tx: any,
  ) {
    const safeDate = new Date(newDate);

    if (isNaN(safeDate.getTime())) {
      throw new AppError("Data inválida", 400);
    }

    const [prev, next] = await Promise.all([
      this.getPreviousEvent(vehicleId, safeDate, tx),
      this.getNextEvent(vehicleId, safeDate, tx),
    ]);

    // console.log("📅 Novo evento:", {
    //   date: safeDate.toISOString(),
    //   km: newKm,
    // });

    // console.log("⬅️ Evento anterior:", prev);
    // console.log("➡️ Próximo evento:", next);

    /* REGRA 1: não pode voltar KM no tempo */
    if (prev && newKm < prev.km) {
      throw new AppError(
        `KM inválido. Deve ser maior ou igual ao KM anterior (${prev.km}).`,
        400,
      );
    }

    /* REGRA 2: não pode ultrapassar o próximo evento */
    if (next && newKm > next.km) {
      throw new AppError(
        `KM inválido. Deve ser menor ou igual ao próximo evento (${next.km}).`,
        400,
      );
    }

    /* REGRA 3: evitar KM duplicado na mesma data */
    if (prev && next && prev.km === next.km && newKm === prev.km) {
      throw new AppError(
        `KM inválido. Já existe evento com esse KM nessa faixa.`,
        400,
      );
    }
  }

  /* Último KM real (fonte da verdade) */
  async getLastKm(vehicleId: string, tx: any): Promise<number | null> {
    const [lastUsage, lastFuel] = await Promise.all([
      tx.vehicleUsage.findFirst({
        where: { vehicleId },
        orderBy: { eventAt: "desc" },
      }),
      tx.fuelSupply.findFirst({
        where: { vehicleId },
        orderBy: { data: "desc" },
      }),
    ]);

    const candidates: number[] = [];

    if (lastUsage) candidates.push(lastUsage.km);
    if (lastFuel) candidates.push(lastFuel.kmAtual);

    if (!candidates.length) return null;

    return Math.max(...candidates);
  }
}