import { FastifyReply, FastifyRequest } from 'fastify';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Verifica o token e popula request.user
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      message: 'Não autorizado: token inválido ou ausente.',
    });
  }
}
