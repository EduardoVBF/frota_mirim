import { FastifyReply, FastifyRequest } from 'fastify';

export async function adminOnly(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // jwtVerify já deve ter sido executado antes
  const user = request.user as { role?: string };

  // esta condição pode ser ajustada conforme necessário.
  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return reply.status(403).send({
      message: 'Acesso negado: apenas administradores podem acessar este recurso.',
    });
  }
}
