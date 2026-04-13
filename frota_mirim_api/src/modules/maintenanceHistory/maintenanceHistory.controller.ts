import {
  maintenanceHistoryQuerySchema,
  maintenanceHistoryParamsSchema,
  updateResponsibleSchema,
} from "./maintenanceHistory.schema";
import { MaintenanceHistoryService } from "./maintenanceHistory.service";
import { FastifyRequest, FastifyReply } from "fastify";

const service = new MaintenanceHistoryService();

// GET ALL (BY MAINTENANCE)
export async function getAllMaintenanceHistoryController(
  request: FastifyRequest
) {
  const query = maintenanceHistoryQuerySchema.parse(request.query);

  return service.getAll(query);
}

// GET BY ID (opcional, mas útil)
export async function getMaintenanceHistoryByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = maintenanceHistoryParamsSchema.parse(request.params);

  const history = await service.getById?.(id);

  return reply.send({
    history,
  });
}

// UPDATE RESPONSIBLE
export async function updateMaintenanceHistoryResponsibleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = maintenanceHistoryParamsSchema.parse(request.params);
  const body = updateResponsibleSchema.parse(request.body);

  const updated = await service.updateResponsible(id, body);

  return reply.send(updated);
}