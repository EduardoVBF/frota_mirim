import { FastifyReply, FastifyRequest } from "fastify";
import { DashboardService } from "./dashboard.service";

const service = new DashboardService();

export async function getRealtimeController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = await service.getRealtimeOverview();
  return reply.send(data);
}

export async function getOverviewController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = await service.getOverviewByPeriod((request as any).query);
  return reply.send(data);
}

export async function getFinancialController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = await service.getFinancial((request as any).query);
  return reply.send(data);
}

export async function getChartsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = await service.getCharts((request as any).query);
  return reply.send(data);
}

export async function getInsightsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = await service.getInsights((request as any).query);
  return reply.send(data);
}

export async function getAlertsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = await service.getAlerts();
  return reply.send(data);
}
