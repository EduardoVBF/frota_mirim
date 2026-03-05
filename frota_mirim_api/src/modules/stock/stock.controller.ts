import { FastifyReply, FastifyRequest } from "fastify";
import { StockService } from "./stock.service";
import {
  stockQuerySchema,
  stockEntrySchema,
  stockAdjustSchema,
  stockUpdateConfigSchema,
} from "./stock.schema";

const service = new StockService();

export async function getStockController(request: FastifyRequest) {
  const query = stockQuerySchema.parse(request.query);

  return service.getStock(query);
}

export async function getStockMovementsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const movements = await service.getStockMovements({
    ...stockQuerySchema.parse(request.query),
  });

  return reply.send(movements);
}

export async function stockInController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = stockEntrySchema.parse(request.body);

  const userId = (request.user as any)?.id;

  const result = await service.stockIn(body, userId);

  return reply.status(201).send(result);
}

export async function adjustStockController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = stockAdjustSchema.parse(request.body);

  const userId = (request.user as any)?.id;

  const result = await service.adjustStock(body, userId);

  return reply.send(result);
}

export async function updateStockConfigController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { itemCatalogId } = request.params as any;
  const body = stockUpdateConfigSchema.parse(request.body);

  await service.updateStockConfig(itemCatalogId, body);
  return reply.send({ message: "Configurações de estoque atualizadas" });
}
