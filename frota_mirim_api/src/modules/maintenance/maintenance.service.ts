import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { MaintenanceQueryDTO, MAINTENANCE_STATUS } from "./maintenance.schema";

export class MaintenanceService {
  async ensureMaintenanceExists(id: string) {
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    return maintenance;
  }

  async ensureMaintenanceEditable(id: string) {
    const maintenance = await this.ensureMaintenanceExists(id);

    if (maintenance.status === "DONE") {
      throw new AppError("Não é possível alterar manutenção finalizada.", 400);
    }

    return maintenance;
  }

  async recalculateMaintenanceCosts(tx: any, maintenanceId: string) {
    const items = await tx.maintenanceItem.findMany({
      where: { maintenanceOrderId: maintenanceId },
    });

    let partsCost = 0;
    let servicesCost = 0;

    for (const item of items) {
      const total = Number(item.totalPrice);

      if (item.typeSnapshot === "PART") {
        partsCost += total;
      } else {
        servicesCost += total;
      }
    }

    const totalCost = partsCost + servicesCost;

    await tx.maintenanceOrder.update({
      where: { id: maintenanceId },
      data: {
        partsCost,
        servicesCost,
        totalCost,
      },
    });
  }

  async getAllMaintenance(query: MaintenanceQueryDTO) {
    const {
      vehicleId,
      search,
      type,
      status,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const where: any = {};

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (type?.length) {
      where.type = { in: type };
    }

    if (status?.length) {
      where.status = { in: status };
    }

    if (search) {
      where.OR = [
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          vehicle: {
            plate: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [maintenances, totalFiltered, totalCount, statsStatus, statsType] =
      await Promise.all([
        prisma.maintenanceOrder.findMany({
          where,
          include: {
            vehicle: true,
          },
          orderBy: {
            [sortBy]: sortOrder,
          },
          skip,
          take: limit,
        }),

        prisma.maintenanceOrder.count({ where }),

        prisma.maintenanceOrder.count(),

        prisma.maintenanceOrder.groupBy({
          by: ["status"],
          _count: true,
        }),

        prisma.maintenanceOrder.groupBy({
          by: ["type"],
          _count: true,
        }),
      ]);

    const statusStats = {
      open: 0,
      inProgress: 0,
      done: 0,
      canceled: 0,
    };

    statsStatus.forEach((s) => {
      if (s.status === "OPEN") statusStats.open = s._count;
      if (s.status === "IN_PROGRESS") statusStats.inProgress = s._count;
      if (s.status === "DONE") statusStats.done = s._count;
      if (s.status === "CANCELED") statusStats.canceled = s._count;
    });

    const typeStats = {
      preventive: 0,
      corrective: 0,
    };

    statsType.forEach((t) => {
      if (t.type === "PREVENTIVE") typeStats.preventive = t._count;
      if (t.type === "CORRECTIVE") typeStats.corrective = t._count;
    });

    return {
      items: maintenances,
      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
      },
      stats: {
        status: statusStats,
        type: typeStats,
      },
    };
  }

  async getMaintenanceById(id: string) {
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id },
      include: {
        vehicle: true,
        maintenanceItems: true,
      },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    return maintenance;
  }

  async createMaintenance(data: any, userId?: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Veículo não encontrado.", 404);
    }

    return prisma.maintenanceOrder.create({
      data: {
        ...data,
        createdByUserId: userId,
      },
    });
  }

  async updateMaintenance(id: string, data: any, userId?: string) {
    await this.ensureMaintenanceEditable(id);

    return prisma.maintenanceOrder.update({
      where: { id },
      data: {
        ...data,
        updatedByUserId: userId,
      },
    });
  }

  async updateMaintenanceStatus(id: string, status: string) {
    await this.ensureMaintenanceExists(id);

    return prisma.maintenanceOrder.update({
      where: { id },
      data: {
        status: status as (typeof MAINTENANCE_STATUS)[number],
        completedAt: status === "DONE" ? new Date() : null,
      },
    });
  }

  async finalizeMaintenance(id: string, userId?: string) {
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id },
      include: {
        maintenanceItems: true,
      },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    if (maintenance.status === "DONE") {
      throw new AppError("Manutenção já finalizada.", 400);
    }

    if (maintenance.maintenanceItems.length === 0) {
      throw new AppError("Não é possível finalizar manutenção sem itens.", 400);
    }

    return prisma.$transaction(async (tx) => {
      let partsCost = 0;
      let servicesCost = 0;

      for (const item of maintenance.maintenanceItems) {
        const total = Number(item.totalPrice);

        if (item.typeSnapshot === "PART") {
          partsCost += total;

          const catalog = await tx.itemCatalog.findUnique({
            where: { id: item.itemCatalogId },
          });

          if (catalog?.isStockItem) {
            const stock = await tx.stockItem.findUnique({
              where: { itemCatalogId: catalog.id },
            });

            if (!stock) {
              throw new AppError("Estoque não encontrado.", 500);
            }

            if (stock.currentQuantity < item.quantity) {
              throw new AppError(
                `Estoque insuficiente para ${item.nameSnapshot}`,
                400,
              );
            }

            const newQuantity = stock.currentQuantity - item.quantity;

            await tx.stockItem.update({
              where: { itemCatalogId: catalog.id },
              data: {
                currentQuantity: newQuantity,
              },
            });

            await tx.stockMovement.create({
              data: {
                itemCatalogId: catalog.id,
                type: "OUT",
                quantity: item.quantity,
                unitCost: item.unitPrice,
                totalCost: item.totalPrice,
                referenceType: "MAINTENANCE",
                referenceId: maintenance.id,
                createdByUserId: userId,
              },
            });
          }
        } else {
          servicesCost += total;
        }
      }

      const totalCost = partsCost + servicesCost;

      return tx.maintenanceOrder.update({
        where: { id },
        data: {
          status: "DONE",
          completedAt: new Date(),
          partsCost,
          servicesCost,
          totalCost,
        },
      });
    });
  }
}
