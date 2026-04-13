import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { MaintenanceService } from "../maintenance/maintenance.service";
import { MaintenanceHistoryService } from "../maintenanceHistory/maintenanceHistory.service";

const maintenanceService = new MaintenanceService();
const historyService = new MaintenanceHistoryService();

export class MaintenanceItemService {
  async addItem(maintenanceId: string, data: any, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenanceOrder.findUnique({
        where: { id: maintenanceId },
      });

      if (!maintenance) {
        throw new AppError("Manutenção não encontrada.", 404);
      }

      if (maintenance.status === "DONE") {
        throw new AppError(
          "Não é possível alterar manutenção finalizada.",
          400
        );
      }

      const catalogItem = await tx.itemCatalog.findUnique({
        where: { id: data.itemCatalogId },
      });

      if (!catalogItem) {
        throw new AppError("Item do catálogo não encontrado.", 404);
      }

      const unitPrice =
        data.unitPrice ?? Number(catalogItem.defaultPrice ?? 0);

      const totalPrice = unitPrice * data.quantity;

      const item = await tx.maintenanceItem.create({
        data: {
          maintenanceOrderId: maintenanceId,
          itemCatalogId: catalogItem.id,
          nameSnapshot: catalogItem.name,
          referenceSnapshot: catalogItem.reference,
          typeSnapshot: catalogItem.type,
          quantity: data.quantity,
          unitPrice,
          totalPrice,
        },
      });

      // HISTÓRICO - ITEM ADDED
      await historyService.createHistory(
        {
          maintenanceOrderId: maintenanceId,
          action: "ITEM_ADDED",
          actorUserId: userId,
          metadata: {
            context: {
              itemId: item.id,
              name: item.nameSnapshot,
              type: item.typeSnapshot,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            },
          },
        },
        tx
      );

      await maintenanceService.recalculateMaintenanceCosts(tx, maintenanceId);

      return item;
    });
  }

  async updateItem(id: string, data: any, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.maintenanceItem.findUnique({
        where: { id },
        include: { maintenanceOrder: true },
      });

      if (!item) {
        throw new AppError("Item não encontrado.", 404);
      }

      if (item.maintenanceOrder.status === "DONE") {
        throw new AppError(
          "Não é possível editar item de manutenção finalizada.",
          400
        );
      }

      const quantity = data.quantity ?? item.quantity;
      const unitPrice = data.unitPrice ?? Number(item.unitPrice);
      const totalPrice = quantity * unitPrice;

      const updatedItem = await tx.maintenanceItem.update({
        where: { id },
        data: {
          quantity,
          unitPrice,
          totalPrice,
        },
      });

      // BUILD CHANGES
      const changes = historyService.buildChanges(
        item,
        { quantity, unitPrice, totalPrice },
        [
          { field: "quantity", label: "Quantidade" },
          { field: "unitPrice", label: "Preço unitário" },
          { field: "totalPrice", label: "Total" },
        ]
      );

      // HISTÓRICO - ITEM UPDATED
      if (changes.length > 0) {
        await historyService.createHistory(
          {
            maintenanceOrderId: item.maintenanceOrderId,
            action: "ITEM_UPDATED",
            actorUserId: userId,
            metadata: {
              changes,
              context: {
                itemId: item.id,
                name: item.nameSnapshot,
              },
            },
          },
          tx
        );
      }

      await maintenanceService.recalculateMaintenanceCosts(
        tx,
        item.maintenanceOrderId
      );

      return updatedItem;
    });
  }

  async deleteItem(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const item = await tx.maintenanceItem.findUnique({
        where: { id },
        include: { maintenanceOrder: true },
      });

      if (!item) {
        throw new AppError("Item não encontrado.", 404);
      }

      if (item.maintenanceOrder.status === "DONE") {
        throw new AppError(
          "Não é possível remover item de manutenção finalizada.",
          400
        );
      }

      await tx.maintenanceItem.delete({
        where: { id },
      });

      // HISTÓRICO - ITEM REMOVED
      await historyService.createHistory(
        {
          maintenanceOrderId: item.maintenanceOrderId,
          action: "ITEM_REMOVED",
          actorUserId: userId,
          metadata: {
            context: {
              itemId: item.id,
              name: item.nameSnapshot,
              quantity: item.quantity,
            },
          },
        },
        tx
      );

      await maintenanceService.recalculateMaintenanceCosts(
        tx,
        item.maintenanceOrderId
      );

      return { message: "Item removido com sucesso." };
    });
  }
}