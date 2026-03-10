import { AlertsService } from "../modules/alerts/alerts.service";
import { prisma } from "../shared/database/prisma";

const alertsService = new AlertsService();

/* MAINTENANCE ALERTS JOB */
export async function maintenanceAlertsJob() {
  const now = new Date();

  /* MAINTENANCE DUE SOON */
  const dueMaintenances = await prisma.maintenanceOrder.findMany({
    where: {
      scheduledAt: {
        not: null,
      },
      status: {
        not: "DONE",
      },
    },

    include: {
      vehicle: true,
    },
  });

  for (const maintenance of dueMaintenances) {
    if (!maintenance.scheduledAt) continue;

    const diffDays = Math.floor(
      (maintenance.scheduledAt.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 7 && diffDays > 0) {
      await alertsService.createAlertIfNotExists({
        type: "MAINTENANCE_DUE",

        severity: "WARNING",

        title: "Manutenção próxima",

        message: `Manutenção ${maintenance.sequenceId} do veículo ${maintenance.vehicle.placa} vence em ${diffDays} dias`,

        entityType: "MAINTENANCE",

        entityId: maintenance.id,

        metadata: {
          vehiclePlate: maintenance.vehicle.placa,
          scheduledAt: maintenance.scheduledAt,
          daysRemaining: diffDays,
        },
      });
    }
  }

  /* MAINTENANCE OVERDUE */
  const overdueMaintenances = await prisma.maintenanceOrder.findMany({
    where: {
      scheduledAt: {
        lt: now,
      },
      status: {
        not: "DONE",
      },
    },

    include: {
      vehicle: true,
    },
  });

  for (const maintenance of overdueMaintenances) {
    await alertsService.createAlertIfNotExists({
      type: "MAINTENANCE_OVERDUE",

      severity: "CRITICAL",

      title: "Manutenção atrasada",

      message: `Manutenção do veículo ${maintenance.vehicle.placa} está atrasada`,

      entityType: "MAINTENANCE",

      entityId: maintenance.id,

      metadata: {
        vehicleId: maintenance.vehicleId,
        vehiclePlate: maintenance.vehicle.placa,
        scheduledAt: maintenance.scheduledAt,
      },
    });
  }
}
