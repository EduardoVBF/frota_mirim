import { AlertsService } from "../modules/alerts/alerts.service";
import { prisma } from "../shared/database/prisma";

const alertsService = new AlertsService();

/* CALCULATE DUE DATE FOR CURRENT YEAR */
function getDueDate(month: number) {
  const now = new Date();
  const year = now.getFullYear();

  return new Date(year, month - 1, 1);
}

/* CALCULATE DAY DIFFERENCE */
function diffDays(date: Date) {
  const now = new Date();

  return Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/* CREATE ALERT FOR DOCUMENT */
async function processVehicleDocumentAlert({
  vehicle,
  document,
  dueMonth,
}: {
  vehicle: any;
  document: "IPVA" | "LICENSING";
  dueMonth: number;
}) {
  const dueDate = getDueDate(dueMonth);

  const days = diffDays(dueDate);

  const handleDocumentName = (doc: string) => {
    switch (doc) {
      case "IPVA":
        return "IPVA";
      case "LICENSING":
        return "Licenciamento";
      default:
        return doc;
    }
  };

  if (days <= 30 && days > 0) {
    await alertsService.createAlertIfNotExists({
      type: "VEHICLE_DOCUMENT_EXPIRING",
      severity: "WARNING",
      title: `${handleDocumentName(document)} próximo do vencimento`,
      message: `${handleDocumentName(document)} do veículo ${vehicle.placa} vence em ${days} dias`,
      entityType: "VEHICLE",
      entityId: vehicle.id,
      metadata: {
        document,
        dueDate,
        vehiclePlate: vehicle.placa,
      },
    });
  }

  if (days <= 0) {
    await alertsService.createAlertIfNotExists({
      type: "VEHICLE_DOCUMENT_EXPIRED",
      severity: "CRITICAL",
      title: `${handleDocumentName(document)} vencido`,
      message: `${handleDocumentName(document)} do veículo ${vehicle.placa} está vencido`,
      entityType: "VEHICLE",
      entityId: vehicle.id,
      metadata: {
        document,
        dueDate,
        vehiclePlate: vehicle.placa,
      },
    });
  }
}

/* VEHICLE DOCUMENT ALERTS JOB */
export async function vehicleDocumentsJob() {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      isActive: true,
    },
  });

  for (const vehicle of vehicles) {
    /* IPVA */
    if (vehicle.ipvaDueMonth) {
      await processVehicleDocumentAlert({
        vehicle,
        document: "IPVA",
        dueMonth: vehicle.ipvaDueMonth,
      });
    }

    /* LICENSING */
    if (vehicle.licensingDueMonth) {
      await processVehicleDocumentAlert({
        vehicle,
        document: "LICENSING",
        dueMonth: vehicle.licensingDueMonth,
      });
    }
  }
}
