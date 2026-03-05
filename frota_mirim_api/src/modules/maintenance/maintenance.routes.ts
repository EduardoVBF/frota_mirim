import {
  getAllMaintenanceController,
  getMaintenanceByIdController,
  createMaintenanceController,
  updateMaintenanceController,
  updateMaintenanceStatusController,
  finalizeMaintenanceController,
} from "./maintenance.controller";

import {
  maintenanceQuerySchema,
  maintenanceParamsSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceStatusUpdateSchema,
} from "./maintenance.schema";

import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function maintenanceRoutes(app: FastifyInstance) {
  app.get("/maintenance", { preHandler: [authMiddleware] }, async (request) => {
    const { query } = await validateRequest(request, {
      query: maintenanceQuerySchema,
    });

    return getAllMaintenanceController({ ...request, query } as any);
  });

  app.get(
    "/maintenance/:id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: maintenanceParamsSchema,
      });

      return getMaintenanceByIdController({ ...request, params } as any, reply);
    },
  );

  app.post(
    "/maintenance",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body } = await validateRequest(request, {
        body: createMaintenanceSchema,
      });

      return createMaintenanceController({ ...request, body } as any, reply);
    },
  );

  app.put(
    "/maintenance/:id",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: updateMaintenanceSchema,
        params: maintenanceParamsSchema,
      });

      return updateMaintenanceController(
        { ...request, body, params } as any,
        reply,
      );
    },
  );

  app.patch(
    "/maintenance/:id/status",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: maintenanceStatusUpdateSchema,
        params: maintenanceParamsSchema,
      });

      return updateMaintenanceStatusController(
        { ...request, body, params } as any,
        reply,
      );
    },
  );

  app.post(
    "/maintenance/:id/finalize",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: maintenanceParamsSchema,
      });

      return finalizeMaintenanceController(
        { ...request, params } as any,
        reply,
      );
    },
  );
}
