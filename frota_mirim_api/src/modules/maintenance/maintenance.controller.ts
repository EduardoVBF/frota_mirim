import { FastifyReply, FastifyRequest } from "fastify";
import { MaintenanceService } from "./maintenance.service";
import {
  maintenanceQuerySchema,
  maintenanceParamsSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceStatusUpdateSchema,
} from "./maintenance.schema";

const service = new MaintenanceService();

export async function getAllMaintenanceController(
  request: FastifyRequest
) {
  const query = maintenanceQuerySchema.parse(request.query);

  return service.getAllMaintenance(query);
}

export async function getMaintenanceByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = maintenanceParamsSchema.parse(request.params);

  const maintenance = await service.getMaintenanceById(id);

  return reply.send({ maintenance });
}

export async function createMaintenanceController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createMaintenanceSchema.parse(request.body);

  const userId = (request.user as any)?.sub;

  const maintenance = await service.createMaintenance(body, userId);

  return reply.status(201).send(maintenance);
}

export async function updateMaintenanceController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = maintenanceParamsSchema.parse(request.params);
  const body = updateMaintenanceSchema.parse(request.body);

  const userId = (request.user as any)?.sub;

  const maintenance = await service.updateMaintenance(id, body, userId);

  return reply.send(maintenance);
}

export async function updateMaintenanceStatusController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = maintenanceParamsSchema.parse(request.params);
  const body = maintenanceStatusUpdateSchema.parse(request.body);
  const userId = (request.user as any)?.sub;

  const maintenance = await service.updateMaintenanceStatus(id, body.status, userId);

  return reply.send(maintenance);
}

export async function finalizeMaintenanceController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = maintenanceParamsSchema.parse(request.params);

  const userId = (request.user as any)?.sub;

  const maintenance = await service.finalizeMaintenance(id, userId);

  return reply.send(maintenance);
}