import { StockQueryDTO, StockMovementsQueryDTO } from "./stock.schema";
import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";

export class StockService {
  async getStock(query: StockQueryDTO) {
    const {
      search,
      page = 1,
      limit = 10,
      lowStock,
      zeroStock,
      sortBy = "name",
      sortOrder = "asc",
    } = query;

    const where: any = {};

    if (search) {
      where.itemCatalog = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    if (zeroStock) {
      where.currentQuantity = 0;
    }

    const skip = (page - 1) * limit;

    const orderBy =
      sortBy === "name"
        ? { itemCatalog: { name: sortOrder } }
        : { currentQuantity: sortOrder };

    const [items, totalFiltered, totalCount, totalUnits, lowStockItems] =
      await Promise.all([
        prisma.stockItem.findMany({
          where,
          include: {
            itemCatalog: true,
          },
          skip,
          take: limit,
          orderBy,
        }),

        prisma.stockItem.count({ where }),

        prisma.stockItem.count(),

        prisma.stockItem.aggregate({
          _sum: {
            currentQuantity: true,
          },
        }),

        prisma.stockItem.findMany({
          select: {
            currentQuantity: true,
            minimumQuantity: true,
          },
        }),
      ]);

    const lowStockCount = lowStockItems.filter(
      (i) =>
        i.minimumQuantity !== null && i.currentQuantity < i.minimumQuantity,
    ).length;

    let filteredItems = items;

    if (lowStock) {
      filteredItems = items.filter(
        (i) =>
          i.minimumQuantity !== null && i.currentQuantity < i.minimumQuantity,
      );
    }

    return {
      items: filteredItems,

      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
      },

      stats: {
        totalItems: totalCount,
        totalUnits: totalUnits._sum.currentQuantity ?? 0,
        lowStock: lowStockCount,
      },
    };
  }

  async getStockMovements(query: StockMovementsQueryDTO) {
    const {
      search,
      page = 1,
      limit = 10,
      type,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const where: any = {};

    if (search) {
      where.itemCatalog = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    if (type && type.length > 0) {
      where.type = {
        in: type,
      };
    }

    const skip = (page - 1) * limit;

    const orderBy =
      sortBy === "quantity"
        ? { quantity: sortOrder }
        : { createdAt: sortOrder };

    const [
      movements,
      totalFiltered,
      totalCount,
      totalQuantity,
      inCount,
      outCount,
      adjustCount,
    ] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          itemCatalog: true,
        },
        skip,
        take: limit,
        orderBy,
      }),

      prisma.stockMovement.count({ where }),

      prisma.stockMovement.count(),

      prisma.stockMovement.aggregate({
        _sum: {
          quantity: true,
        },
      }),

      prisma.stockMovement.count({
        where: { type: "IN" },
      }),

      prisma.stockMovement.count({
        where: { type: "OUT" },
      }),

      prisma.stockMovement.count({
        where: { type: "ADJUST" },
      }),
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

      stats: {
        totalMovements: totalCount,
        totalQuantity: totalQuantity._sum.quantity ?? 0,
        entries: inCount,
        exits: outCount,
        adjustments: adjustCount,
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
