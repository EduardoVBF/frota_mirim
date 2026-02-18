import {
  userQuerySchema,
} from "./users.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { UsersService } from "./users.service";

const usersService = new UsersService();

export async function getAllUsersController(
  request: FastifyRequest
) {
  const query = userQuerySchema.parse(request.query);
  const result = await usersService.getAllUsers(query);
  return result;
}

export async function getUserByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  const user = await usersService.getUserById(id);

  return reply.send({
    user,
  });
}

export async function updateUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  const requester = request.user as {
    id: string;
    role: "admin" | "editor";
  };

  const updatedUser = await usersService.updateUser(
    id,
    request.body as any,
    requester.role,
    requester.id
  );

  return reply.send(updatedUser);
}

export async function resetPasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  await usersService.resetPassword(id, request.body as any);
  return reply.status(204).send();
}
