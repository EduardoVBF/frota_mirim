import {
  getAllUserPhonesController,
  getUserPhoneByIdController,
  createUserPhoneController,
  updateUserPhoneController,
  deleteUserPhoneController,
} from "./usersTelephones.controller";
import {
  userPhoneParamsSchema,
  createUserPhoneSchema,
  updateUserPhoneSchema,
  userPhoneQuerySchema,
} from "./usersTelephones.schema";
import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function userPhonesRoutes(app: FastifyInstance) {
  app.get(
    "/user-phones",
    { preHandler: [authMiddleware] },
    async (request) => {
      const { query } = await validateRequest(request, {
        query: userPhoneQuerySchema,
      });

      return getAllUserPhonesController({
        ...request,
        query,
      } as any);
    }
  );

  app.get(
    "/user-phones/:id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: userPhoneParamsSchema,
      });

      return getUserPhoneByIdController(
        { ...request, params } as any,
        reply
      );
    }
  );

  app.post(
    "/user-phones",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body } = await validateRequest(request, {
        body: createUserPhoneSchema,
      });

      return createUserPhoneController(
        { ...request, body } as any,
        reply
      );
    }
  );

  app.put(
    "/user-phones/:id",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: updateUserPhoneSchema,
        params: userPhoneParamsSchema,
      });

      return updateUserPhoneController(
        { ...request, body, params } as any,
        reply
      );
    }
  );

  app.delete(
    "/user-phones/:id",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: userPhoneParamsSchema,
      });

      return deleteUserPhoneController(
        { ...request, params } as any,
        reply
      );
    }
  );
}
