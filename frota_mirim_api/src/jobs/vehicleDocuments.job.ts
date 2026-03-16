import { AlertsService } from "../modules/alerts/alerts.service";
import { prisma } from "../shared/database/prisma";

const alertsService = new AlertsService();

type VehicleDocumentType = "IPVA" | "LICENSING";

/* CALCULATE DUE DATE FOR CURRENT YEAR (FIRST DAY OF MONTH) */
function getDueDate(month: number) {
  const now = new Date();
  const year = now.getFullYear();

  return new Date(year, month - 1, 1);
}

/* CALCULATE DAY DIFFERENCE */
function diffDays(date: Date) {
  const now = new Date();

  const diff = date.getTime() - now.getTime();

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/* CHECK IF DOCUMENT WAS PAID THIS YEAR */
function isDocumentPaid(vehicle: any, document: VehicleDocumentType) {
  const currentYear = new Date().getFullYear();

  if (document === "IPVA") {
    return vehicle.ipvaPaidYear === currentYear;
  }

  if (document === "LICENSING") {
    return vehicle.licensingPaidYear === currentYear;
  }

  return false;
}

/* HUMAN DOCUMENT NAME */
function getDocumentName(document: VehicleDocumentType) {
  switch (document) {
    case "IPVA":
      return "IPVA";
    case "LICENSING":
      return "Licenciamento";
    default:
      return document;
  }
}

/* CREATE ALERT FOR DOCUMENT */
async function processVehicleDocumentAlert({
  vehicle,
  document,
  dueMonth,
}: {
  vehicle: any;
  document: VehicleDocumentType;
  dueMonth: number;
}) {
  /* SKIP IF DOCUMENT WAS ALREADY PAID */
  if (isDocumentPaid(vehicle, document)) {
    return;
  }

  const dueDate = getDueDate(dueMonth);

  const days = diffDays(dueDate);

  const documentName = getDocumentName(document);

  /* DOCUMENT EXPIRING */
  if (days <= 30 && days > 0) {
    await alertsService.createAlertIfNotExists({
      type: "VEHICLE_DOCUMENT_EXPIRING",
      severity: "WARNING",
      title: `${documentName} próximo do vencimento`,
      message: `${documentName} do veículo ${vehicle.placa} vence em ${days} dias`,
      entityType: "VEHICLE",
      entityId: vehicle.id,
      metadata: {
        document,
        dueDate,
        vehiclePlate: vehicle.placa,
      },
    });

    return;
  }

  /* DOCUMENT EXPIRED */
  if (days <= 0) {
    await alertsService.createAlertIfNotExists({
      type: "VEHICLE_DOCUMENT_EXPIRED",
      severity: "CRITICAL",
      title: `${documentName} vencido`,
      message: `${documentName} do veículo ${vehicle.placa} está vencido`,
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
    const documents: {
      type: VehicleDocumentType;
      dueMonth: number;
    }[] = [
      {
        type: "IPVA",
        dueMonth: vehicle.ipvaDueMonth,
      },
      {
        type: "LICENSING",
        dueMonth: vehicle.licensingDueMonth,
      },
    ];

    for (const doc of documents) {
      if (!doc.dueMonth) continue;

      await processVehicleDocumentAlert({
        vehicle,
        document: doc.type,
        dueMonth: doc.dueMonth,
      });
    }
  }
}
