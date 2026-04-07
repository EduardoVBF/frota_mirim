import { MaintenanceAttachmentsService } from "./maintenanceAttachments.service";
import { FastifyReply, FastifyRequest } from "fastify";

const service = new MaintenanceAttachmentsService();

/* CREATE */
export async function createAttachmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { maintenanceId } = request.params as {
    maintenanceId: string;
  };

  const body = request.body as {
    name: string;
    fileBase64: string;
  };

  const userId = (request.user as { id: string })?.id;

  const result = await service.createAttachment(maintenanceId, body, userId);

  return reply.status(201).send(result);
}

/* DELETE */
export async function deleteAttachmentController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = request.params as { id: string };

  await service.deleteAttachment(id);

  return reply.status(204).send();
}

/* GET BY MAINTENANCE */
export async function getAttachmentsByMaintenanceController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { maintenanceId } = request.params as {
    maintenanceId: string;
  };

  const result = await service.getAttachmentsByMaintenance(maintenanceId);

  return reply.send(result);
}
