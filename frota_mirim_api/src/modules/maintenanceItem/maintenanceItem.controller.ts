import { FastifyReply, FastifyRequest } from "fastify";
import { MaintenanceItemService } from "./maintenanceItem.service";
import {
  maintenanceItemParamsSchema,
  maintenanceItemMaintenanceParamsSchema,
  createMaintenanceItemSchema,
  updateMaintenanceItemSchema,
} from "./maintenanceItem.schema";

const service = new MaintenanceItemService();

export async function addMaintenanceItemController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = maintenanceItemMaintenanceParamsSchema.parse(request.params);
  const body = createMaintenanceItemSchema.parse(request.body);
  const userId = (request.user as any)?.sub;

  const item = await service.addItem(id, body, userId);

  return reply.status(201).send(item);
}

export async function updateMaintenanceItemController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = maintenanceItemParamsSchema.parse(request.params);
  const body = updateMaintenanceItemSchema.parse(request.body);

  const userId = (request.user as any)?.sub;

  const item = await service.updateItem(id, body, userId);

  return reply.send(item);
}

export async function deleteMaintenanceItemController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = maintenanceItemParamsSchema.parse(request.params);

  const userId = (request.user as any)?.sub;

  const result = await service.deleteItem(id, userId);

  return reply.send(result);
}
