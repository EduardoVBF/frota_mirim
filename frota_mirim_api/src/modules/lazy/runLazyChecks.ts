import { prisma } from "../../shared/database/prisma";
import { lazyJobs } from "./lazyJobs.config";

export async function runLazyChecks() {
  const now = new Date();

  for (const job of lazyJobs) {
    const record = await prisma.systemJob.findUnique({
      where: { job: job.name },
    });

    if (!record) {
      console.warn(`⚠️ Job ${job.name} não encontrado na tabela system_jobs`);
      continue;
    }

    let shouldRun = false;

    if (!record.lastRun) {
      shouldRun = true;
    } else {
      const diffMs = now.getTime() - record.lastRun.getTime();
      const diffMinutes = diffMs / 1000 / 60;

      if (diffMinutes >= job.intervalMinutes) {
        shouldRun = true;
      }
    }

    if (!shouldRun) continue;

    console.log(`⏳ Executando lazy job: ${job.name}`);

    await prisma.systemJob.update({
      where: { job: job.name },
      data: { lastRun: now },
    });

    try {
      await job.handler();
    } catch (error) {
      console.error(`❌ Erro ao executar job ${job.name}`, error);
    }
  }
}
