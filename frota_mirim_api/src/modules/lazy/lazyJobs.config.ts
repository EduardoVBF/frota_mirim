import { maintenanceDurationJob } from "../../jobs/maintenanceDuration.job";
import { maintenanceAlertsJob } from "../../jobs/maintenanceAlerts.job";
import { vehicleDocumentsJob } from "../../jobs/vehicleDocuments.job";
import { vehicleCheckoutJob } from "../../jobs/vehicleCheckout.job";

export type LazyJobConfig = {
  name: string;
  intervalMinutes: number;
  handler: () => Promise<void>;
};

export const lazyJobs: LazyJobConfig[] = [
  {
    name: "maintenance_alerts",
    intervalMinutes: 720, // 12h
    handler: maintenanceAlertsJob,
  },
  {
    name: "maintenance_duration",
    intervalMinutes: 1440, // 24h
    handler: maintenanceDurationJob,
  },
  {
    name: "vehicle_checkout",
    intervalMinutes: 60, // 1h
    handler: vehicleCheckoutJob,
  },
  {
    name: "vehicle_documents",
    intervalMinutes: 1440, // 24h
    handler: vehicleDocumentsJob,
  },
];