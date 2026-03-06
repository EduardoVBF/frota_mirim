import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { ItemCatalogQueryDTO } from "./itemCatalog.schema";

export class ItemCatalogService {
  async getAllItems(query: ItemCatalogQueryDTO) {
  const {
    search,
    type,
    isStockItem,
    isActive,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type?.length) {
    where.type = { in: type };
  }

  if (typeof isStockItem === "boolean") {
    where.isStockItem = isStockItem;
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  const skip = (page - 1) * limit;

  const [items, totalFiltered, totalCount, stats] = await Promise.all([
    prisma.itemCatalog.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    }),

    prisma.itemCatalog.count({ where }),

    prisma.itemCatalog.count(),

    prisma.itemCatalog.groupBy({
      by: ["type"],
      _count: true,
    }),
  ]);

  const statsMap = {
    parts: 0,
    services: 0,
  };

  stats.forEach((s) => {
    if (s.type === "PART") statsMap.parts = s._count;
    if (s.type === "SERVICE") statsMap.services = s._count;
  });

  return {
    items,

    meta: {
      total: totalCount,
      totalFiltered,
      page,
      limit,
      totalPages: Math.ceil(totalFiltered / limit),
    },

    stats: {
      parts: statsMap.parts,
      services: statsMap.services,
    },
  };
}

  async getItemById(id: string) {
    const item = await prisma.itemCatalog.findUnique({
      where: { id },
    });

    if (!item) {
      throw new AppError("Item não encontrado.", 404);
    }

    return item;
  }

  async createItem(data: any) {
    // SERVICE não pode ter estoque
    if (data.type === "SERVICE") {
      data.isStockItem = false;
    }

    const existing = await prisma.itemCatalog.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      throw new AppError("Já existe um item com esse nome.", 409);
    }

    return prisma.$transaction(async (tx) => {
      const item = await tx.itemCatalog.create({
        data,
      });

      // se for item de estoque criar registro de estoque
      if (item.isStockItem) {
        await tx.stockItem.create({
          data: {
            itemCatalogId: item.id,
            currentQuantity: 0,
          },
        });
      }

      return item;
    });
  }

  async updateItem(id: string, data: any) {
    const item = await prisma.itemCatalog.findUnique({
      where: { id },
    });

    if (!item) {
      throw new AppError("Item não encontrado.", 404);
    }

    // SERVICE não pode ter estoque
    if (data.type === "SERVICE") {
      data.isStockItem = false;
    }

    return prisma.itemCatalog.update({
      where: { id },
      data,
    });
  }
}