import {
  vehicleUsageQuerySchema,
  vehicleUsageParamsSchema,
  createVehicleUsageSchema,
} from "./vehicleUsage.schema";
import { VehicleUsageService } from "./vehicleUsage.service";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const service = new VehicleUsageService();

// GET ALL (EVENTOS)
export async function getAllVehicleUsagesController(request: FastifyRequest) {
  const query = vehicleUsageQuerySchema.parse(request.query);

  return service.getAll(query);
}

// GET BY ID
export async function getVehicleUsageByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { id } = vehicleUsageParamsSchema.parse(request.params);

  const usage = await service.getById(id);

  return reply.send({
    usage,
  });
}

// CREATE (ENTRY / EXIT)
export async function createVehicleUsageController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = createVehicleUsageSchema.parse(request.body);

  const usage = await service.create(body);

  return reply.status(201).send(usage);
}

// LAST TRIP BY VEHICLE
export async function getLastTripByVehicleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    vehicleId: z.string().uuid(),
  });

  const { vehicleId } = paramsSchema.parse(request.params);

  const trip = await service.getLastTrip(vehicleId);

  return reply.send({
    trip,
  });
}

//  VEHICLES IN USE
export async function getVehiclesInUseController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const vehicles = await service.getVehiclesInUse();

  return reply.send({
    vehicles,
  });
}

// ALL TRIPS BY VEHICLE
export async function getTripsByVehicleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    vehicleId: z.string().uuid(),
  });

  const { vehicleId } = paramsSchema.parse(request.params);

  const trips = await service.getTripsByVehicle(vehicleId);

  return reply.send({
    trips,
  });
}

// CURRENT VEHICLE BY USER
export async function getCurrentVehicleByUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({
    userId: z.string().uuid(),
  });

  const { userId } = paramsSchema.parse(request.params);

  const vehicle = await service.getCurrentVehicleByUser(userId);

  return reply.send({
    vehicle,
  });
}
