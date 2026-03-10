import { maintenanceDurationJob } from "./maintenanceDuration.job";
import { maintenanceAlertsJob } from "./maintenanceAlerts.job";
import { vehicleDocumentsJob } from "./vehicleDocuments.job";
import { vehicleCheckoutJob } from "./vehicleCheckout.job";
import { fuelAnomalyJob } from "./fuelAnomaly.job";
import cron from "node-cron";

export function startScheduler() {
  console.log("🟢 Scheduler iniciado");

  /* MAINTENANCE OVERDUE */
  cron.schedule("*/30 * * * *", async () => {
    console.log("🔧 Verificando manutenções atrasadas");

    await maintenanceAlertsJob();
  });

  /* DOCUMENT ALERTS */
  cron.schedule("0 2 * * *", async () => {
    console.log("📄 Verificando documentos de veículos");

    await vehicleDocumentsJob();
  });

  /* MAINTENANCE DURATION */
  cron.schedule("0 * * * *", async () => {
    console.log("⏱ Verificando duração das manutenções");

    await maintenanceDurationJob();
  });

  /* VEHICLE CHECKOUT */
  cron.schedule("*/30 * * * *", async () => {
    console.log("🚗 Verificando veículos fora");

    await vehicleCheckoutJob();
  });

  /* FUEL ANOMALY */
  cron.schedule("0 * * * *", async () => {
    console.log("⛽ Verificando consumo anormal");

    await fuelAnomalyJob();
  });
}
