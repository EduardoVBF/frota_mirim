import { FastifyReply, FastifyRequest } from "fastify";
import { ItemCatalogService } from "./itemCatalog.service";
import {
  itemCatalogQuerySchema,
  itemCatalogParamsSchema,
  createItemCatalogSchema,
  updateItemCatalogSchema,
} from "./itemCatalog.schema";

const service = new ItemCatalogService();

export async function getAllItemCatalogController(
  request: FastifyRequest
) {
  const query = itemCatalogQuerySchema.parse(request.query);
  return service.getAllItems(query);
}

export async function getItemCatalogByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = itemCatalogParamsSchema.parse(request.params);

  const item = await service.getItemById(id);

  return reply.send({ item });
}

export async function createItemCatalogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createItemCatalogSchema.parse(request.body);

  const item = await service.createItem(body);

  return reply.status(201).send(item);
}

export async function updateItemCatalogController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = itemCatalogParamsSchema.parse(request.params);
  const body = updateItemCatalogSchema.parse(request.body);

  const item = await service.updateItem(id, body);

  return reply.send(item);
}