import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "./auth.service";

const service = new AuthService();

export async function loginController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = await service.login(request.body as any);
  

  const accessToken = await reply.jwtSign(
    {
      sub: user.id,
      role: user.role,
    },
    {
      expiresIn: "3h",
    }
  );

  return reply.send({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
    },
  });
}

export async function registerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = await service.register(request.body as any);
  return reply.status(201).send(user);
}
