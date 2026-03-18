import {
  getRealtimeController,
  getOverviewController,
  getFinancialController,
  getChartsController,
  getInsightsController,
  getAlertsController,
} from "./dashboard.controller";
import { authMiddleware } from "../../shared/middlewares/auth";
import { validateRequest } from "../../infra/http/validate";
import { dashboardQuerySchema } from "./dashboard.schema";
import { FastifyInstance } from "fastify";

export async function dashboardRoutes(app: FastifyInstance) {
  /* REALTIME */
  app.get(
    "/dashboard/realtime",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return getRealtimeController(request, reply);
    },
  );

  /* OVERVIEW */
  app.get(
    "/dashboard/overview",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { query } = await validateRequest(request, {
        query: dashboardQuerySchema,
      });

      return getOverviewController({ ...request, query } as any, reply);
    },
  );

  /* FINANCIAL */
  app.get(
    "/dashboard/financial",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { query } = await validateRequest(request, {
        query: dashboardQuerySchema,
      });

      return getFinancialController({ ...request, query } as any, reply);
    },
  );

  /* CHARTS */
  app.get(
    "/dashboard/charts",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { query } = await validateRequest(request, {
        query: dashboardQuerySchema,
      });

      return getChartsController({ ...request, query } as any, reply);
    },
  );

  /* INSIGHTS */
  app.get(
    "/dashboard/insights",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { query } = await validateRequest(request, {
        query: dashboardQuerySchema,
      });

      return getInsightsController({ ...request, query } as any, reply);
    },
  );

  /* ALERTS */
  app.get(
    "/dashboard/alerts",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return getAlertsController(request, reply);
    },
  );
}