import {
  getAllFuelSuppliesController,
  getFuelSupplyByIdController,
  createFuelSupplyController,
  updateFuelSupplyController,
  deleteFuelSupplyController,
} from "./fuel-supply.controller";

import {
  fuelSupplyQuerySchema,
  fuelSupplyParamsSchema,
  createFuelSupplySchema,
} from "./fuel-supply.schema";

import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function fuelSupplyRoutes(app: FastifyInstance) {

  // GET ALL (PROTEGIDO)
  app.get(
    "/fuel-supplies",
    { preHandler: [authMiddleware] },
    async (request) => {
      const { query } = await validateRequest(request, {
        query: fuelSupplyQuerySchema,
      });

      return getAllFuelSuppliesController({
        ...request,
        query,
      } as any);
    }
  );

  // GET BY ID
  app.get(
    "/fuel-supplies/:id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: fuelSupplyParamsSchema,
      });

      return getFuelSupplyByIdController(
        { ...request, params } as any,
        reply
      );
    }
  );

  // CREATE
  app.post(
    "/fuel-supplies",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { body } = await validateRequest(request, {
        body: createFuelSupplySchema,
      });

      return createFuelSupplyController(
        { ...request, body } as any,
        reply
      );
    }
  );

  // UPDATE
  app.put(
    "/fuel-supplies/:id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: createFuelSupplySchema.partial(),
        params: fuelSupplyParamsSchema,
      });

      return updateFuelSupplyController(
        { ...request, body, params } as any,
        reply
      );
    }
  );

  // DELETE (ADMIN ONLY)
  app.delete(
    "/fuel-supplies/:id",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: fuelSupplyParamsSchema,
      });

      return deleteFuelSupplyController(
        { ...request, params } as any,
        reply
      );
    }
  );
}
