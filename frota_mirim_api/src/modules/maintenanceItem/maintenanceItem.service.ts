import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";

export class MaintenanceItemService {

  async addItem(maintenanceId: string, data: any) {

    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id: maintenanceId },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    if (maintenance.status === "DONE") {
      throw new AppError("Não é possível alterar manutenção finalizada.", 400);
    }

    const catalogItem = await prisma.itemCatalog.findUnique({
      where: { id: data.itemCatalogId },
    });

    if (!catalogItem) {
      throw new AppError("Item do catálogo não encontrado.", 404);
    }

    const unitPrice =
      data.unitPrice ?? Number(catalogItem.defaultPrice ?? 0);

    const totalPrice = unitPrice * data.quantity;

    return prisma.maintenanceItem.create({
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
  }

  async updateItem(id: string, data: any) {

    const item = await prisma.maintenanceItem.findUnique({
      where: { id },
      include: { maintenanceOrder: true },
    });

    if (!item) {
      throw new AppError("Item não encontrado.", 404);
    }

    if (item.maintenanceOrder.status === "DONE") {
      throw new AppError("Não é possível editar item de manutenção finalizada.", 400);
    }

    const quantity = data.quantity ?? item.quantity;
    const unitPrice = data.unitPrice ?? Number(item.unitPrice);

    const totalPrice = quantity * unitPrice;

    return prisma.maintenanceItem.update({
      where: { id },
      data: {
        quantity,
        unitPrice,
        totalPrice,
      },
    });
  }

  async deleteItem(id: string) {

    const item = await prisma.maintenanceItem.findUnique({
      where: { id },
      include: { maintenanceOrder: true },
    });

    if (!item) {
      throw new AppError("Item não encontrado.", 404);
    }

    if (item.maintenanceOrder.status === "DONE") {
      throw new AppError("Não é possível remover item de manutenção finalizada.", 400);
    }

    await prisma.maintenanceItem.delete({
      where: { id },
    });

    return { message: "Item removido com sucesso." };
  }
}