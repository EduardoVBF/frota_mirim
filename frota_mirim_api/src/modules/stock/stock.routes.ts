import {
  getStockController,
  getStockMovementsController,
  stockInController,
  adjustStockController,
} from "./stock.controller";

import {
  stockQuerySchema,
  stockEntrySchema,
  stockAdjustSchema,
} from "./stock.schema";

import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function stockRoutes(app: FastifyInstance) {
  // get all stock items
  app.get("/stock", { preHandler: [authMiddleware] }, async (request) => {
    const { query } = await validateRequest(request, {
      query: stockQuerySchema,
    });

    return getStockController({ ...request, query } as any);
  });

  // get stock movements
  app.get(
    "/stock/movements",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return getStockMovementsController(request, reply);
    },
  );

  // post stock entry
  app.post(
    "/stock/in",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body } = await validateRequest(request, {
        body: stockEntrySchema,
      });

      return stockInController({ ...request, body } as any, reply);
    },
  );

  // post stock adjustment
  app.post(
    "/stock/adjust",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body } = await validateRequest(request, {
        body: stockAdjustSchema,
      });

      return adjustStockController({ ...request, body } as any, reply);
    },
  );
}
