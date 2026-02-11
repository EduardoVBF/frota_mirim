import { updateUserBodySchema, resetPasswordBodySchema } from "./users.schema";
import { FastifyReply, FastifyRequest } from "fastify";
import { UsersService } from "./users.service";

const usersService = new UsersService();

// GETS
export async function getAllUsersController() {
  return await usersService.getAllUsers();
}

export async function getUserByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  // try {
  //   const user = await usersService.getUserById(id);
  //   return reply.send(user);
  // } catch (err: any) {
  //   return reply.status(404).send({
  //     message: err.message ?? "Usuário não encontrado.",
  //   });
  // }
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
  // const parsedData = updateUserBodySchema.partial().safeParse(request.body);

  // if (!parsedData.success) {
  //   return reply.status(400).send({
  //     message: "Dados de usuário inválidos.",
  //     errors: parsedData.error,
  //   });
  // }

  const requester = request.user as {
    id: string;
    role: "admin" | "editor";
  };

  // try {
  //   const updatedUser = await usersService.updateUser(
  //     id,
  //     request.body as any,
  //     requester.role,
  //     requester.id
  //   );
  //   return reply.send(updatedUser);
  // } catch (err: any) {
  //   return reply.status(404).send({
  //     message: err.message ?? "Operação não permitida.",
  //   });
  // }
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
  // const parsedData = resetPasswordBodySchema.safeParse(request.body);

  // if (!parsedData.success) {
  //   return reply.status(400).send({
  //     message: "Dados de usuário inválidos.",
  //     errors: parsedData.error,
  //   });
  // }

  // try {
  //   await usersService.resetPassword(id, request.body as any);
  //   return reply.status(204).send();
  // } catch (err: any) {
  //   return reply.status(404).send({
  //     message: err.message ?? "Usuário não encontrado.",
  //   });
  // }
  await usersService.resetPassword(id, request.body as any);
  return reply.status(204).send();
}
