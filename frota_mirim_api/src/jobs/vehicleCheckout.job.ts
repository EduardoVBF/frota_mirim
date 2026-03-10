import { prisma } from "../shared/database/prisma";
import { AlertsService } from "../modules/alerts/alerts.service";

const alertsService = new AlertsService();

const MAX_HOURS_OUT = 12;

function diffHours(date: Date) {
  const now = new Date();

  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
}

export async function vehicleCheckoutJob() {
  const exits = await prisma.vehicleUsage.findMany({
    where: {
      type: "EXIT",
    },

    include: {
      vehicle: true,
    },

    orderBy: {
      eventAt: "desc",
    },
  });

  const checkedVehicles = new Set<string>();

  for (const usage of exits) {
    if (checkedVehicles.has(usage.vehicleId)) continue;

    checkedVehicles.add(usage.vehicleId);

    const lastEntry = await prisma.vehicleUsage.findFirst({
      where: {
        vehicleId: usage.vehicleId,
        type: "ENTRY",
        eventAt: {
          gt: usage.eventAt,
        },
      },
    });

    if (lastEntry) continue;

    const hours = diffHours(usage.eventAt);

    if (hours >= MAX_HOURS_OUT) {
      await alertsService.createAlertIfNotExists({
        type: "VEHICLE_CHECKOUT_TOO_LONG",

        severity: "WARNING",

        title: "Veículo fora por muito tempo",

        message: `Veículo ${usage.vehicle.placa} está fora há ${hours} horas`,

        entityType: "VEHICLE",

        entityId: usage.vehicleId,

        metadata: {
          vehiclePlate: usage.vehicle.placa,
          hoursOut: hours,
          exitAt: usage.eventAt,
        },
      });
    }
  }
}
