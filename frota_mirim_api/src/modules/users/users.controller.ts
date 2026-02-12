import { updateUserBodySchema, resetPasswordBodySchema, UserQueryDTO } from "./users.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { UsersService } from "./users.service";

const usersService = new UsersService();

// GETS
export async function getAllUsersController(request: FastifyRequest) {
  const query = request.query as UserQueryDTO;
  return await usersService.getAllUsers(query);
}

export async function getUserByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  const user = await usersService.getUserById(id);
  return reply.send({
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
}

// PUT
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

// POST reset password
export async function resetPasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };

  await usersService.resetPassword(id, request.body as any);
  return reply.status(204).send();
}
