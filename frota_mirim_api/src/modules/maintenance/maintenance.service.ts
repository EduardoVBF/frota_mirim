import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { MaintenanceQueryDTO, MAINTENANCE_STATUS } from "./maintenance.schema";
import { Prisma } from "@prisma/client";
import { AlertsService } from "../alerts/alerts.service";

const alertsService = new AlertsService();

export class MaintenanceService {
  /* INTERNAL: CHECK STOCK ALERTS */
  private async checkStockAlerts(
    itemCatalogId: string,
    currentQuantity: number,
    minimumQuantity: number | null,
    itemName: string,
  ) {
    /* ZERO STOCK */
    if (currentQuantity === 0) {
      await alertsService.createAlertIfNotExists({
        type: "ZERO_STOCK",
        severity: "CRITICAL",
        title: "Item sem estoque",
        message: `${itemName} está sem estoque`,
        entityType: "STOCK_ITEM",
        entityId: itemCatalogId,
        metadata: {
          currentQuantity,
          minimumQuantity,
        },
      });
    } else {
      await alertsService.resolveAlertsByEntity({
        type: "ZERO_STOCK",
        entityType: "STOCK_ITEM",
        entityId: itemCatalogId,
      });
    }

    /* LOW STOCK */
    if (
      minimumQuantity !== null &&
      currentQuantity < minimumQuantity &&
      currentQuantity > 0
    ) {
      await alertsService.createAlertIfNotExists({
        type: "LOW_STOCK",
        severity: "WARNING",
        title: "Estoque baixo",
        message: `${itemName} está abaixo do estoque mínimo`,
        entityType: "STOCK_ITEM",
        entityId: itemCatalogId,
        metadata: {
          currentQuantity,
          minimumQuantity,
        },
      });
    } else {
      await alertsService.resolveAlertsByEntity({
        type: "LOW_STOCK",
        entityType: "STOCK_ITEM",
        entityId: itemCatalogId,
      });
    }
  }

  /* ENSURE MAINTENANCE EXISTS */
  async ensureMaintenanceExists(id: string) {
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    return maintenance;
  }

  /* ENSURE MAINTENANCE EDITABLE */
  async ensureMaintenanceEditable(id: string) {
    const maintenance = await this.ensureMaintenanceExists(id);

    if (maintenance.status === "DONE") {
      throw new AppError("Não é possível alterar manutenção finalizada.", 400);
    }

    return maintenance;
  }

  /* RECALCULATE COSTS */
  async recalculateMaintenanceCosts(
    tx: Prisma.TransactionClient,
    maintenanceId: string,
  ) {
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

  // Atualiza o status do veículo com base nas manutenções que bloqueiam o veículo
  private async updateVehicleStatus(
    tx: Prisma.TransactionClient,
    vehicleId: string,
  ) {
    const blockingMaintenance = await tx.maintenanceOrder.findFirst({
      where: {
        vehicleId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
        blocksVehicle: true,
      },
    });

    if (blockingMaintenance) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          status: "UNDER_MAINTENANCE",
          unavailabilityReason: "Em manutenção",
        },
      });
    } else {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          status: "AVAILABLE",
          unavailabilityReason: null,
        },
      });
    }
  }

  /* GET ALL MAINTENANCE */
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

    const where: Prisma.MaintenanceOrderWhereInput = {};

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
      const seq = Number(search);

      where.OR = [
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          vehicle: {
            placa: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        ...(Number.isNaN(seq)
          ? []
          : [
              {
                sequenceId: seq,
              },
            ]),
      ];
    }

    const skip = (page - 1) * limit;

    const [maintenances, totalFiltered, totalCount, statsStatus, statsType] =
      await Promise.all([
        prisma.maintenanceOrder.findMany({
          where,
          include: {
            vehicle: {
              select: {
                id: true,
                placa: true,
                modelo: true,
                marca: true,
              },
            },
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
          where,
          _count: true,
        }),

        prisma.maintenanceOrder.groupBy({
          by: ["type"],
          where,
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

    const totalCostResult = await prisma.maintenanceOrder.aggregate({
      where,
      _sum: {
        totalCost: true,
      },
    });

    const totalCost = totalCostResult._sum.totalCost ?? 0;

    return {
      items: maintenances,
      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
        allTotalCost: totalCost,
      },
      stats: {
        status: statusStats,
        type: typeStats,
      },
    };
  }

  /* GET BY ID */
  async getMaintenanceById(id: string) {
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            placa: true,
            modelo: true,
            marca: true,
          },
        },
        maintenanceItems: true,
      },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    return maintenance;
  }

  /* CREATE */
  async createMaintenance(data: any, userId?: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Veículo não encontrado.", 404);
    }

    return prisma.$transaction(async (tx) => {
      const last = await tx.maintenanceOrder.aggregate({
        _max: { sequenceId: true },
      });

      const nextSequence = (last._max.sequenceId ?? 0) + 1;

      const maintenance = await tx.maintenanceOrder.create({
        data: {
          ...data,
          sequenceId: nextSequence,
          createdByUserId: userId,
        },
      });

      if (data.blocksVehicle) {
        await this.updateVehicleStatus(tx, data.vehicleId);
      }

      return maintenance;
    });
  }

  /* UPDATE */
  async updateMaintenance(id: string, data: any, userId?: string) {
    const maintenance = await this.ensureMaintenanceEditable(id);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceOrder.update({
        where: { id },
        data: {
          ...data,
          updatedByUserId: userId,
        },
      });

      if (data.blocksVehicle !== undefined) {
        await this.updateVehicleStatus(tx, maintenance.vehicleId);
      }

      return updated;
    });
  }

  /* UPDATE STATUS */
  async updateMaintenanceStatus(id: string, status: string) {
    const maintenance = await this.ensureMaintenanceExists(id);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceOrder.update({
        where: { id },
        data: {
          status: status as (typeof MAINTENANCE_STATUS)[number],
          completedAt: status === "DONE" ? new Date() : null,
        },
      });

      await this.updateVehicleStatus(tx, maintenance.vehicleId);

      return updated;
    });
  }

  /* FINALIZE MAINTENANCE */
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

    const stockResults: any[] = [];

    const result = await prisma.$transaction(async (tx) => {
      const itemCatalogIds = maintenance.maintenanceItems.map(
        (i) => i.itemCatalogId,
      );

      const catalogs = await tx.itemCatalog.findMany({
        where: { id: { in: itemCatalogIds } },
      });

      const catalogMap = new Map(catalogs.map((c) => [c.id, c]));

      const stockItems = await tx.stockItem.findMany({
        where: {
          itemCatalogId: {
            in: catalogs.filter((c) => c.isStockItem).map((c) => c.id),
          },
        },
      });

      const stockMap = new Map(stockItems.map((s) => [s.itemCatalogId, s]));

      let partsCost = 0;
      let servicesCost = 0;

      /* VALIDATE STOCK */
      for (const item of maintenance.maintenanceItems) {
        const total = Number(item.totalPrice);

        if (item.typeSnapshot === "PART") {
          partsCost += total;

          const catalog = catalogMap.get(item.itemCatalogId);

          if (catalog?.isStockItem) {
            const stock = stockMap.get(catalog.id);

            if (!stock) {
              throw new AppError(
                `Estoque não encontrado para ${catalog.name}`,
                500,
              );
            }

            if (stock.currentQuantity < item.quantity) {
              throw new AppError(
                `Estoque insuficiente para ${item.nameSnapshot}`,
                400,
              );
            }
          }
        } else {
          servicesCost += total;
        }
      }

      /* APPLY STOCK */
      for (const item of maintenance.maintenanceItems) {
        const catalog = catalogMap.get(item.itemCatalogId);

        if (catalog?.isStockItem) {
          const stock = stockMap.get(catalog.id)!;

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

          stockResults.push({
            itemCatalogId: catalog.id,
            itemName: catalog.name,
            newQuantity,
            minimumQuantity: stock.minimumQuantity,
          });
        }
      }

      const totalCost = partsCost + servicesCost;

      const updated = await tx.maintenanceOrder.update({
        where: { id },
        data: {
          status: "DONE",
          completedAt: new Date(),
          partsCost,
          servicesCost,
          totalCost,
        },
      });

      await this.updateVehicleStatus(tx, maintenance.vehicleId);

      return updated;
    });

    /* CHECK ALERTS AFTER STOCK UPDATE */
    for (const stock of stockResults) {
      await this.checkStockAlerts(
        stock.itemCatalogId,
        stock.newQuantity,
        stock.minimumQuantity,
        stock.itemName,
      );
    }

    return result;
  }
}
