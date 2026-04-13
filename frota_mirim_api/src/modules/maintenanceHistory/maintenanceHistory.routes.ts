import {
  getAllMaintenanceHistoryController,
  getMaintenanceHistoryByIdController,
  updateMaintenanceHistoryResponsibleController,
} from "./maintenanceHistory.controller";

import {
  maintenanceHistoryQuerySchema,
  maintenanceHistoryParamsSchema,
  updateResponsibleSchema,
} from "./maintenanceHistory.schema";

import { authMiddleware } from "../../shared/middlewares/auth";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function maintenanceHistoryRoutes(app: FastifyInstance) {
  // GET ALL (BY MAINTENANCE)
  app.get(
    "/maintenance-history",
    { preHandler: [authMiddleware] },
    async (request) => {
      const { query } = await validateRequest(request, {
        query: maintenanceHistoryQuerySchema,
      });

      return getAllMaintenanceHistoryController({
        ...request,
        query,
      } as any);
    }
  );

  // GET BY ID
  app.get(
    "/maintenance-history/:id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: maintenanceHistoryParamsSchema,
      });

      return getMaintenanceHistoryByIdController(
        { ...request, params } as any,
        reply
      );
    }
  );

  // UPDATE RESPONSIBLE
  app.patch(
    "/maintenance-history/:id/responsible",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params, body } = await validateRequest(request, {
        params: maintenanceHistoryParamsSchema,
        body: updateResponsibleSchema,
      });

      return updateMaintenanceHistoryResponsibleController(
        { ...request, params, body } as any,
        reply
      );
    }
  );
}