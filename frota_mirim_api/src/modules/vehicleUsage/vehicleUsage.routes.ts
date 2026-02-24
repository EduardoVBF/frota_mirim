import {
  getAllVehicleUsagesController,
  getVehicleUsageByIdController,
  createVehicleUsageController,
  getLastTripByVehicleController,
  getVehiclesInUseController,
  getTripsByVehicleController,
  getCurrentVehicleByUserController,
} from "./vehicleUsage.controller";
import {
  vehicleUsageQuerySchema,
  vehicleUsageParamsSchema,
  createVehicleUsageSchema,
} from "./vehicleUsage.schema";
import { authMiddleware } from "../../shared/middlewares/auth";
import { adminOnly } from "../../shared/middlewares/adminOnly";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export async function vehicleUsageRoutes(app: FastifyInstance) {
  // GET ALL (EVENTOS)
  app.get(
    "/vehicle-usages",
    { preHandler: [authMiddleware] },
    async (request) => {
      const { query } = await validateRequest(request, {
        query: vehicleUsageQuerySchema,
      });

      return getAllVehicleUsagesController({
        ...request,
        query,
      } as any);
    },
  );

  // GET BY ID
  app.get(
    "/vehicle-usages/:id",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { params } = await validateRequest(request, {
        params: vehicleUsageParamsSchema,
      });

      return getVehicleUsageByIdController(
        { ...request, params } as any,
        reply,
      );
    },
  );

  // CREATE (ENTRY / EXIT)
  app.post(
    "/vehicle-usages",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { body } = await validateRequest(request, {
        body: createVehicleUsageSchema,
      });

      return createVehicleUsageController({ ...request, body } as any, reply);
    },
  );

  // VEHICLES IN USE
  app.get(
    "/vehicle-usages/in-use",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      return getVehiclesInUseController(request, reply);
    },
  );

  // LAST TRIP BY VEHICLE
  app.get(
    "/vehicle-usages/vehicle/:vehicleId/last-trip",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const paramsSchema = z.object({
        vehicleId: z.string().uuid(),
      });

      const { params } = await validateRequest(request, {
        params: paramsSchema,
      });

      return getLastTripByVehicleController(
        { ...request, params } as any,
        reply,
      );
    },
  );

  // ALL TRIPS BY VEHICLE
  app.get(
    "/vehicle-usages/vehicle/:vehicleId/trips",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const paramsSchema = z.object({
        vehicleId: z.string().uuid(),
      });

      const { params } = await validateRequest(request, {
        params: paramsSchema,
      });

      return getTripsByVehicleController({ ...request, params } as any, reply);
    },
  );

  // CURRENT VEHICLE BY USER
  app.get(
    "/vehicle-usages/user/:userId/current",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const paramsSchema = z.object({
        userId: z.string().uuid(),
      });

      const { params } = await validateRequest(request, {
        params: paramsSchema,
      });

      return getCurrentVehicleByUserController(
        { ...request, params } as any,
        reply,
      );
    },
  );
}
