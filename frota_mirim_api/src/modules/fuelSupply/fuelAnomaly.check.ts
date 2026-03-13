import { prisma } from "../../shared/database/prisma";
import { AlertsService } from "../alerts/alerts.service";

const alertsService = new AlertsService();

export async function checkFuelAnomaly(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) return;

  const supplies = await prisma.fuelSupply.findMany({
    where: {
      vehicleId,
      tanqueCheio: true,
      media: {
        not: null,
      },
    },
    orderBy: {
      data: "desc",
    },
    take: 10,
  });

  if (supplies.length < 5) return;

  const medias = supplies.map((s) => Number(s.media));

  const avg = medias.reduce((a, b) => a + b, 0) / medias.length;

  const last = medias[0];

  if (last < avg * 0.6) {
    await alertsService.createAlertIfNotExists({
      type: "FUEL_CONSUMPTION_ANOMALY",

      severity: "WARNING",

      title: "Consumo de combustível anormal",

      message: `Veículo ${vehicle.placa} apresentou consumo muito abaixo da média`,

      entityType: "FUEL_SUPPLY",

      entityId: supplies[0].id,

      metadata: {
        vehiclePlate: vehicle.placa,
        lastAverage: last,
        historicalAverage: avg,
      },
    });
  }
}