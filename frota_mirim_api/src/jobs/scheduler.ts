import { maintenanceDurationJob } from "./maintenanceDuration.job";
import { maintenanceAlertsJob } from "./maintenanceAlerts.job";
import { vehicleDocumentsJob } from "./vehicleDocuments.job";
import { vehicleCheckoutJob } from "./vehicleCheckout.job";
import cron from "node-cron";

export function startScheduler() {
  console.log("🟢 Scheduler iniciado");

  /* MAINTENANCE OVERDUE - A CADA 30 MINUTOS */
  cron.schedule("*/30 * * * *", async () => {
    console.log("🔧 Verificando manutenções atrasadas");

    await maintenanceAlertsJob();
  });

  /* DOCUMENT ALERTS - A CADA DIA ÀS 2 DA MANHÃ */
  cron.schedule("0 2 * * *", async () => {
    console.log("📄 Verificando documentos de veículos");

    await vehicleDocumentsJob();
  });

  /* MAINTENANCE DURATION - A CADA HORA */
  cron.schedule("0 * * * *", async () => {
    console.log("⏱ Verificando duração das manutenções");

    await maintenanceDurationJob();
  });

  /* VEHICLE CHECKOUT - A CADA 30 MINUTOS */
  cron.schedule("*/30 * * * *", async () => {
    console.log("🚗 Verificando veículos fora");

    await vehicleCheckoutJob();
  });
}
