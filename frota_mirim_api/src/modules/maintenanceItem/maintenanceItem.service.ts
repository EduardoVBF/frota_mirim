import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { MaintenanceService } from "../maintenance/maintenance.service";

const maintenanceService = new MaintenanceService();

export class MaintenanceItemService {

  async addItem(maintenanceId: string, data: any) {

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

      await maintenanceService.recalculateMaintenanceCosts(tx, maintenanceId);

      return item;
    });
  }

  async updateItem(id: string, data: any) {

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

      await maintenanceService.recalculateMaintenanceCosts(
        tx,
        item.maintenanceOrderId
      );

      return updatedItem;
    });
  }

  async deleteItem(id: string) {

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

      await maintenanceService.recalculateMaintenanceCosts(
        tx,
        item.maintenanceOrderId
      );

      return { message: "Item removido com sucesso." };
    });
  }
}