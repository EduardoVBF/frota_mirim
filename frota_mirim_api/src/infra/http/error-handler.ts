import { ValidationError } from "../errors/validation-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/app-error";

export function errorHandler(
  error: any,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ValidationError) {
    return reply.status(400).send({
      message: error.message,
      errors: error.errors,
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      message: error.message,
    });
  }

  return reply.status(500).send({
    message: "Erro interno do servidor",
  });
}
