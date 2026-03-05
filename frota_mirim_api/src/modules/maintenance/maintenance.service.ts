import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { MaintenanceQueryDTO, MAINTENANCE_STATUS } from "./maintenance.schema";

export class MaintenanceService {
  async getAllMaintenance(query: MaintenanceQueryDTO) {
    const { vehicleId, status, page = 1, limit = 10 } = query;

    const where: any = { AND: [] };

    if (vehicleId) {
      where.AND.push({ vehicleId });
    }

    if (status) {
      where.AND.push({
        status: { in: status },
      });
    }

    const finalWhere = where.AND.length ? where : {};
    const skip = (page - 1) * limit;

    const [maintenances, totalFiltered, totalCount] = await Promise.all([
      prisma.maintenanceOrder.findMany({
        where: finalWhere,
        include: {
          vehicle: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.maintenanceOrder.count({ where: finalWhere }),
      prisma.maintenanceOrder.count(),
    ]);

    return {
      maintenances,
      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
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
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    if (maintenance.status === "DONE") {
      throw new AppError("Não é possível editar manutenção finalizada.", 400);
    }

    return prisma.maintenanceOrder.update({
      where: { id },
      data: {
        ...data,
        updatedByUserId: userId,
      },
    });
  }

  async updateMaintenanceStatus(id: string, status: string) {
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

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
