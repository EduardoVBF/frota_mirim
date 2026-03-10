import { AlertsService } from "../modules/alerts/alerts.service";
import { prisma } from "../shared/database/prisma";

const alertsService = new AlertsService();

/* CALCULATE NEXT DUE DATE */
function getNextDueDate(month: number) {

  const now = new Date();

  const currentYear = now.getFullYear();

  const dueDate = new Date(currentYear, month - 1, 1);

  if (dueDate < now) {
    dueDate.setFullYear(currentYear + 1);
  }

  return dueDate;
}

/* VEHICLE DOCUMENT ALERTS */
export async function vehicleDocumentsJob() {

  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
  });

  const now = new Date();

  for (const vehicle of vehicles) {

    /* IPVA */
    const ipvaDueDate = getNextDueDate(vehicle.ipvaDueMonth);

    const ipvaDiffDays = Math.floor(
      (ipvaDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (ipvaDiffDays <= 30 && ipvaDiffDays > 0) {

      await alertsService.createAlertIfNotExists({
        type: "VEHICLE_DOCUMENT_EXPIRING",
        severity: "WARNING",
        title: "IPVA próximo do vencimento",
        message: `IPVA do veículo ${vehicle.placa} vence em ${ipvaDiffDays} dias`,
        entityType: "VEHICLE",
        entityId: vehicle.id,
        metadata: {
          document: "IPVA",
          dueDate: ipvaDueDate,
          vehiclePlate: vehicle.placa,
        },
      });

    }

    if (ipvaDiffDays <= 0) {

      await alertsService.createAlertIfNotExists({
        type: "VEHICLE_DOCUMENT_EXPIRED",
        severity: "CRITICAL",
        title: "IPVA vencido",
        message: `IPVA do veículo ${vehicle.placa} está vencido`,
        entityType: "VEHICLE",
        entityId: vehicle.id,
        metadata: {
          document: "IPVA",
          dueDate: ipvaDueDate,
          vehiclePlate: vehicle.placa,
        },
      });

    }

    /* LICENSING */
    const licensingDueDate = getNextDueDate(vehicle.licensingDueMonth);

    const licensingDiffDays = Math.floor(
      (licensingDueDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (licensingDiffDays <= 30 && licensingDiffDays > 0) {

      await alertsService.createAlertIfNotExists({
        type: "VEHICLE_DOCUMENT_EXPIRING",
        severity: "WARNING",
        title: "Licenciamento próximo do vencimento",
        message: `Licenciamento do veículo ${vehicle.placa} vence em ${licensingDiffDays} dias`,
        entityType: "VEHICLE",
        entityId: vehicle.id,
        metadata: {
          document: "LICENSING",
          dueDate: licensingDueDate,
          vehiclePlate: vehicle.placa,
        },
      });

    }

    if (licensingDiffDays <= 0) {

      await alertsService.createAlertIfNotExists({
        type: "VEHICLE_DOCUMENT_EXPIRED",
        severity: "CRITICAL",
        title: "Licenciamento vencido",
        message: `Licenciamento do veículo ${vehicle.placa} está vencido`,
        entityType: "VEHICLE",
        entityId: vehicle.id,
        metadata: {
          document: "LICENSING",
          dueDate: licensingDueDate,
          vehiclePlate: vehicle.placa,
        },
      });

    }

  }

}