import {
  getAllVehiclesController,
  getVehicleByIdController,
  createVehicleController,
  updateVehicleController,
} from "./vehicles.controller";

import {
  vehicleParamsSchema,
  vehicleQuerySchema,
  createVehicleSchema,
  updateVehicleSchema,
} from "./vehicles.schema";

import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function vehiclesRoutes(app: FastifyInstance) {
  app.get(
    "/vehicles",
    { preHandler: [authMiddleware] },
    async (request) => {
      const { query } = await validateRequest(request, {
        query: vehicleQuerySchema,
      });

      return getAllVehiclesController({ ...request, query } as any);
    }
  );

  app.get(
    "/vehicles/:id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: vehicleParamsSchema,
      });

      return getVehicleByIdController({ ...request, params } as any, reply);
    }
  );

  app.post(
    "/vehicles",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body } = await validateRequest(request, {
        body: createVehicleSchema,
      });

      return createVehicleController({ ...request, body } as any, reply);
    }
  );

  app.put(
    "/vehicles/:id",
    { preHandler: [authMiddleware, adminOnly] },
    async (request, reply) => {
      const { body, params } = await validateRequest(request, {
        body: updateVehicleSchema,
        params: vehicleParamsSchema,
      });

      return updateVehicleController(
        { ...request, body, params } as any,
        reply
      );
    }
  );
}
