import { AlertsService } from "../modules/alerts/alerts.service";
import { prisma } from "../shared/database/prisma";

const alertsService = new AlertsService();

/* CONFIGURATION */
const OPEN_LIMIT_DAYS = 3;
const IN_PROGRESS_LIMIT_DAYS = 7;

/* HELPER */
function diffDays(date: Date) {
  const now = new Date();

  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

/* MAINTENANCE DURATION JOB */
export async function maintenanceDurationJob() {
  const maintenances = await prisma.maintenanceOrder.findMany({
    where: {
      status: {
        in: ["OPEN", "IN_PROGRESS"],
      },
    },

    include: {
      vehicle: true,
    },
  });

  for (const maintenance of maintenances) {
    const createdDays = diffDays(maintenance.createdAt);

    /* OPEN TOO LONG */
    if (maintenance.status === "OPEN" && createdDays >= OPEN_LIMIT_DAYS) {
      await alertsService.createAlertIfNotExists({
        type: "MAINTENANCE_OPEN_TOO_LONG",

        severity: "WARNING",

        title: "Manutenção aberta há muito tempo",

        message: `Manutenção ${maintenance.sequenceId} do veículo ${maintenance.vehicle.placa} está aberta há ${createdDays} dias`,

        entityType: "MAINTENANCE",

        entityId: maintenance.id,

        metadata: {
          maintenanceSequence: maintenance.sequenceId,
          vehiclePlate: maintenance.vehicle.placa,
          daysOpen: createdDays,
        },
      });
    }

    /* IN PROGRESS TOO LONG */
    if (
      maintenance.status === "IN_PROGRESS" &&
      createdDays >= IN_PROGRESS_LIMIT_DAYS
    ) {
      await alertsService.createAlertIfNotExists({
        type: "MAINTENANCE_IN_PROGRESS_TOO_LONG",

        severity: "WARNING",

        title: "Manutenção demorando para finalizar",

        message: `Manutenção ${maintenance.sequenceId} do veículo ${maintenance.vehicle.placa} está em andamento há ${createdDays} dias`,

        entityType: "MAINTENANCE",

        entityId: maintenance.id,

        metadata: {
          maintenanceSequence: maintenance.sequenceId,
          vehiclePlate: maintenance.vehicle.placa,
          daysInProgress: createdDays,
        },
      });
    }
  }
}
