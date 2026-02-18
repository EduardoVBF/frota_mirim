import { FastifyReply, FastifyRequest } from "fastify";
import { VehiclesService } from "./vehicles.service";
import { vehicleQuerySchema } from "./vehicles.schema";

const service = new VehiclesService();

export async function getAllVehiclesController(
  request: FastifyRequest
) {
  const query = vehicleQuerySchema.parse(request.query);
  return service.getAllVehicles(query);
}

export async function getVehicleByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const vehicle = await service.getVehicleById(id);
  return reply.send({ vehicle });
}

export async function getVehicleByPlacaController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { placa } = request.params as { placa: string };
  const vehicle = await service.getVehicleByPlaca(placa);
  return reply.send({ vehicle });
}

export async function createVehicleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const vehicle = await service.createVehicle(request.body);
  return reply.status(201).send(vehicle);
}

export async function updateVehicleController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.params as { id: string };
  const vehicle = await service.updateVehicle(id, request.body);
  return reply.send(vehicle);
}
