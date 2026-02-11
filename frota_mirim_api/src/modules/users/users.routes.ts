import {
  getAllUsersController,
  getUserByIdController,
  resetPasswordController,
  updateUserController,
} from "./users.controller";
import {
  resetPasswordBodySchema,
  updateUserBodySchema,
  userParamsSchema,
} from "./users.schema";
import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function usersRoutes(app: FastifyInstance) {
  // Admin
  app.get(
    "/users",
    {
      preHandler: [authMiddleware, adminOnly],
    },
    getAllUsersController,
  );

  app.get(
    "/users/:id",
    {
      preHandler: [authMiddleware, adminOnly],
    },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: userParamsSchema,
      });

      return getUserByIdController({ ...request, params } as any, reply);
    },
  );

  app.put(
    "/users/:id",
    {
      preHandler: [authMiddleware, adminOnly],
    },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: updateUserBodySchema.partial(),
        params: userParamsSchema,
      });

      return updateUserController({ ...request, body, params } as any, reply);
    },
  );

  app.post(
    "/users/:id/reset-password",
    {
      preHandler: [authMiddleware, adminOnly],
    },
    async (request, reply) => {
      const { params, body } = await validateRequest(request, {
        params: userParamsSchema,
        body: resetPasswordBodySchema,
      });

      return resetPasswordController(
        { ...request, body, params } as any,
        reply,
      );
    },
  );
}
