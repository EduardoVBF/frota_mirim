import { UserPhonesService } from "./usersTelephones.service";
import { FastifyReply, FastifyRequest } from "fastify";

const service = new UserPhonesService();

export async function getAllUserPhonesController(
  request: FastifyRequest
) {
  return service.getAllUserPhones(request.query as any);
}

export async function getUserPhoneByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const phone = await service.getUserPhoneById(id);
  return reply.send(phone);
}

export async function createUserPhoneController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const phone = await service.createUserPhone(
    request.body
  );
  return reply.status(201).send(phone);
}

export async function updateUserPhoneController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const phone = await service.updateUserPhone(
    id,
    request.body
  );
  return reply.send(phone);
}

export async function deleteUserPhoneController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  await service.deleteUserPhone(id);
  return reply.status(204).send();
}
