import {
  addMaintenanceItemController,
  updateMaintenanceItemController,
  deleteMaintenanceItemController,
} from "./maintenanceItem.controller";

import {
  createMaintenanceItemSchema,
  updateMaintenanceItemSchema,
  maintenanceItemParamsSchema,
  maintenanceItemMaintenanceParamsSchema,
} from "./maintenanceItem.schema";

import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function maintenanceItemRoutes(app: FastifyInstance) {
  // post new maintenance item
  app.post(
    "/maintenance/:id/items",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: createMaintenanceItemSchema,
        params: maintenanceItemMaintenanceParamsSchema,
      });

      return addMaintenanceItemController(
        { ...request, body, params } as any,
        reply,
      );
    },
  );

  // patch maintenance item
  app.patch(
    "/maintenance/items/:id",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: updateMaintenanceItemSchema,
        params: maintenanceItemParamsSchema,
      });

      return updateMaintenanceItemController(
        { ...request, body, params } as any,
        reply,
      );
    },
  );

  // delete maintenance item
  app.delete(
    "/maintenance/items/:id",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: maintenanceItemParamsSchema,
      });

      return deleteMaintenanceItemController(
        { ...request, params } as any,
        reply,
      );
    },
  );
}
