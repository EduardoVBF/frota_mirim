import {
  alertsQuerySchema,
  alertParamsSchema,
  markAlertReadSchema,
  resolveAlertSchema,
} from "./alerts.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { runLazyChecks } from "../lazy/runLazyChecks";
import { AlertsService } from "./alerts.service";

const service = new AlertsService();

/* GET ALL ALERTS */
export async function getAlertsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const query = alertsQuerySchema.parse(request.query);

  await runLazyChecks();

  const alerts = await service.getAlerts(query);

  return reply.send(alerts);
}

/* MARK ALERT READ */
export async function markAlertReadController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = alertParamsSchema.parse(request.params);
  const body = markAlertReadSchema.parse(request.body);

  const alert = await service.markAlertRead(id, body);

  return reply.send(alert);
}

/* MARK ALL READ */
export async function markAllReadController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = await service.markAllRead();

  return reply.send(result);
}

/* RESOLVE ALERT */
export async function resolveAlertController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = alertParamsSchema.parse(request.params);
  const body = resolveAlertSchema.parse(request.body);

  const alert = await service.resolveAlert(id, body);

  return reply.send(alert);
}