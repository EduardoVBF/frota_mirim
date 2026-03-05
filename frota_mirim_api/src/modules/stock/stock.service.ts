import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { StockQueryDTO } from "./stock.schema";

export class StockService {
  async getStock(query: StockQueryDTO) {
    const { search, page = 1, limit = 10 } = query;

    const where: any = {};

    if (search) {
      where.itemCatalog = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    const skip = (page - 1) * limit;

    const [items, totalFiltered, totalCount] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        include: {
          itemCatalog: true,
        },
        skip,
        take: limit,
        orderBy: {
          itemCatalog: { name: "asc" },
        },
      }),
      prisma.stockItem.count({ where }),
      prisma.stockItem.count(),
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

  async getStockMovements(query: StockQueryDTO) {
    const { search, page = 1, limit = 10, type } = query;

    const where: any = {};

    if (search) {
      where.itemCatalog = {
        name: { contains: search, mode: "insensitive" },
      };
    }

    if (type) {
      where.type = {
        in: type,
      };
    }

    const skip = (page - 1) * limit;

    const [movements, totalFiltered, totalCount] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          itemCatalog: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.count(),
    ]);

    return {
      items: movements,
      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
      },
    };
  }

  async stockIn(data: any, userId?: string) {
    const item = await prisma.itemCatalog.findUnique({
      where: { id: data.itemCatalogId },
    });

    if (!item) {
      throw new AppError("Item não encontrado.", 404);
    }

    if (!item.isStockItem) {
      throw new AppError("Este item não possui controle de estoque.", 400);
    }

    return prisma.$transaction(async (tx) => {
      const stock = await tx.stockItem.findUnique({
        where: { itemCatalogId: item.id },
      });

      if (!stock) {
        throw new AppError("Registro de estoque não encontrado.", 500);
      }

      const newQuantity = stock.currentQuantity + data.quantity;

      await tx.stockItem.update({
        where: { itemCatalogId: item.id },
        data: {
          currentQuantity: newQuantity,
        },
      });

      await tx.stockMovement.create({
        data: {
          itemCatalogId: item.id,
          type: "IN",
          quantity: data.quantity,
          unitCost: data.unitCost,
          totalCost: data.unitCost ? data.unitCost * data.quantity : null,
          reason: data.reason,
          referenceType: "PURCHASE",
          createdByUserId: userId,
        },
      });

      return { message: "Entrada de estoque registrada." };
    });
  }

  async adjustStock(data: any, userId?: string) {
    const stock = await prisma.stockItem.findUnique({
      where: { itemCatalogId: data.itemCatalogId },
    });

    if (!stock) {
      throw new AppError("Item de estoque não encontrado.", 404);
    }

    const newQuantity = stock.currentQuantity + data.quantity;

    if (newQuantity < 0) {
      throw new AppError("Estoque não pode ficar negativo.", 400);
    }

    return prisma.$transaction(async (tx) => {
      await tx.stockItem.update({
        where: { itemCatalogId: data.itemCatalogId },
        data: {
          currentQuantity: newQuantity,
        },
      });

      await tx.stockMovement.create({
        data: {
          itemCatalogId: data.itemCatalogId,
          type: "ADJUST",
          quantity: data.quantity,
          reason: data.reason,
          referenceType: "ADJUSTMENT",
          createdByUserId: userId,
        },
      });

      return { message: "Ajuste de estoque realizado." };
    });
  }

  async updateStockConfig(itemCatalogId: string, data: any) {
    const stock = await prisma.stockItem.findUnique({
      where: { itemCatalogId },
    });

    if (!stock) {
      throw new AppError("Item de estoque não encontrado.", 404);
    }

    await prisma.stockItem.update({
      where: { itemCatalogId },
      data: {
        minimumQuantity: data.minimumQuantity,
        location: data.location,
      },
    });

    return { message: "Configurações de estoque atualizadas." };
  }
}
