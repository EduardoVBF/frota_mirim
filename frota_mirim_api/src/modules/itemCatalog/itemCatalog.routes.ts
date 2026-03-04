import {
  getAllItemCatalogController,
  getItemCatalogByIdController,
  createItemCatalogController,
  updateItemCatalogController,
} from "./itemCatalog.controller";

import {
  itemCatalogParamsSchema,
  itemCatalogQuerySchema,
  createItemCatalogSchema,
  updateItemCatalogSchema,
} from "./itemCatalog.schema";

import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function itemCatalogRoutes(app: FastifyInstance) {
  app.get(
    "/item-catalog",
    { preHandler: [authMiddleware] },
    async (request) => {
      const { query } = await validateRequest(request, {
        query: itemCatalogQuerySchema,
      });

      return getAllItemCatalogController({ ...request, query } as any);
    }
  );

  app.get(
    "/item-catalog/:id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: itemCatalogParamsSchema,
      });

      return getItemCatalogByIdController(
        { ...request, params } as any,
        reply
      );
    }
  );

  app.post(
    "/item-catalog",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body } = await validateRequest(request, {
        body: createItemCatalogSchema,
      });

      return createItemCatalogController(
        { ...request, body } as any,
        reply
      );
    }
  );

  app.put(
    "/item-catalog/:id",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: updateItemCatalogSchema,
        params: itemCatalogParamsSchema,
      });

      return updateItemCatalogController(
        { ...request, body, params } as any,
        reply
      );
    }
  );
}