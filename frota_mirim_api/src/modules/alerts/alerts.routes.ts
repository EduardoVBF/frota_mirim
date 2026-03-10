import {
  getAlertsController,
  markAlertReadController,
  markAllReadController,
  resolveAlertController,
} from "./alerts.controller";
import {
  alertsQuerySchema,
  alertParamsSchema,
  markAlertReadSchema,
  resolveAlertSchema,
} from "./alerts.schema";
import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function alertsRoutes(app: FastifyInstance) {

  /* GET ALERTS */
  app.get(
    "/alerts",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { query } = await validateRequest(request, {
        query: alertsQuerySchema,
      });

      return getAlertsController({ ...request, query } as any, reply);
    },
  );

  /* MARK ALERT READ */
  app.patch(
    "/alerts/:id/read",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params, body } = await validateRequest(request, {
        params: alertParamsSchema,
        body: markAlertReadSchema,
      });

      return markAlertReadController(
        { ...request, params, body } as any,
        reply,
      );
    },
  );

  /* MARK ALL READ */
  app.patch(
    "/alerts/read-all",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return markAllReadController(request, reply);
    },
  );

  /* RESOLVE ALERT */
  app.patch(
    "/alerts/:id/resolve",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { params, body } = await validateRequest(request, {
        params: alertParamsSchema,
        body: resolveAlertSchema,
      });

      return resolveAlertController(
        { ...request, params, body } as any,
        reply,
      );
    },
  );
}