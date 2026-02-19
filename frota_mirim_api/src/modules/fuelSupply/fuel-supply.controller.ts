import { FastifyRequest, FastifyReply } from "fastify";
import { FuelSupplyService } from "./fuel-supply.service";
import {
  fuelSupplyQuerySchema,
  fuelSupplyParamsSchema,
  createFuelSupplySchema,
} from "./fuel-supply.schema";

const service = new FuelSupplyService();

// GET ALL
export async function getAllFuelSuppliesController(
  request: FastifyRequest
) {
  const query = fuelSupplyQuerySchema.parse(request.query);

  return service.getAll(query);
}

// GET BY ID
export async function getFuelSupplyByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = fuelSupplyParamsSchema.parse(request.params);

  const abastecimento = await service.getById(id);

  return reply.send({
    abastecimento,
  });
}

// CREATE
export async function createFuelSupplyController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createFuelSupplySchema.parse(request.body);

  const user = request.user as { id: string };

  const abastecimento = await service.create(body, user?.id);

  return reply.status(201).send(abastecimento);
}

// UPDATE
export async function updateFuelSupplyController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = fuelSupplyParamsSchema.parse(request.params);

  const body = createFuelSupplySchema.partial().parse(request.body);

  const abastecimento = await service.update(id, body);

  return reply.send(abastecimento);
}

// DELETE
export async function deleteFuelSupplyController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = fuelSupplyParamsSchema.parse(request.params);

  await service.delete(id);

  return reply.status(204).send();
}
