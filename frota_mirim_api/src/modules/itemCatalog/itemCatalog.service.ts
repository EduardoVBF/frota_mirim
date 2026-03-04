import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { ItemCatalogQueryDTO } from "./itemCatalog.schema";

export class ItemCatalogService {
  async getAllItems(query: ItemCatalogQueryDTO) {
    const { search, type, isStockItem, isActive, page = 1, limit = 10 } = query;

    const where: any = { AND: [] };

    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { reference: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (type) {
      where.AND.push({
        type: { in: Array.isArray(type) ? type : [type] },
      });
    }

    if (typeof isStockItem === "boolean") {
      where.AND.push({ isStockItem });
    }

    if (typeof isActive === "boolean") {
      where.AND.push({ isActive });
    }

    const finalWhere = where.AND.length ? where : {};
    const skip = (page - 1) * limit;

    const [items, totalFiltered, totalCount] = await Promise.all([
      prisma.itemCatalog.findMany({
        where: finalWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.itemCatalog.count({ where: finalWhere }),
      prisma.itemCatalog.count(),
    ]);

    return {
      items,
      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
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