import { AppError } from "../../infra/errors/app-error";

type TimelineEvent = {
  date: Date;
  km: number;
};

export class VehicleTimelineService {
  // Busca eventos ordenados (Fuel + Usage)
  async getTimeline(vehicleId: string, tx: any) {
    const [usages, fuels] = await Promise.all([
      tx.vehicleUsage.findMany({
        where: { vehicleId },
        select: { eventAt: true, km: true },
      }),
      tx.fuelSupply.findMany({
        where: { vehicleId },
        select: { data: true, kmAtual: true },
      }),
    ]);

    const events: TimelineEvent[] = [
      ...usages.map((u: { eventAt: Date; km: number }) => ({
        date: u.eventAt,
        km: u.km,
      })),
      ...fuels.map((f: { data: Date; kmAtual: number }) => ({
        date: f.data,
        km: f.kmAtual,
      })),
    ];

    return events.sort((a, b) => {
      if (a.date.getTime() === b.date.getTime()) {
        return a.km - b.km; // fallback simples
      }
      return a.date.getTime() - b.date.getTime();
    });
  }

  // Validação principal
  async validateKm(vehicleId: string, newDate: Date, newKm: number, tx: any) {
    const timeline = await this.getTimeline(vehicleId, tx);

    let prev: TimelineEvent | null = null;
    let next: TimelineEvent | null = null;

    for (const event of timeline) {
      if (event.date < newDate) {
        prev = event;
        continue;
      }

      if (event.date > newDate) {
        next = event;
        break;
      }
    }

    // 🔒 validações
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

  // Obter o último KM registrado
  async getLastKm(vehicleId: string, tx: any): Promise<number | null> {
    const timeline = await this.getTimeline(vehicleId, tx);

    if (!timeline.length) return null;

    return timeline[timeline.length - 1].km;
  }
}
