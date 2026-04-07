import { uploadBase64ToFirebase } from "../../services/uploadImageBase64";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";

export class MaintenanceAttachmentsService {
  private allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  private extractMimeType(base64: string) {
    const match = base64.match(/^data:(.+);base64,/);
    return match?.[1];
  }

  private calculateSize(base64: string) {
    const base64Data = base64.split(",")[1];
    if (!base64Data) return null;

    return Math.round((base64Data.length * 3) / 4);
  }

  async createAttachment(
    maintenanceId: string,
    data: { name: string; fileBase64: string },
    userId?: string
  ) {
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id: maintenanceId },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    if (!data.fileBase64.startsWith("data:")) {
      throw new AppError("Arquivo inválido.", 400);
    }

    const mimeType = this.extractMimeType(data.fileBase64);

    if (!mimeType) {
      throw new AppError("Tipo de arquivo inválido.", 400);
    }

    // Valida tipo permitido
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new AppError("Tipo de arquivo não permitido.", 400);
    }

    const size = this.calculateSize(data.fileBase64);

    // Valida tamanho (5MB imagem / 10MB pdf)
    if (size) {
      const maxSize =
        mimeType === "application/pdf" ? 100 * 1024 * 1024 : 5 * 1024 * 1024;

      if (size > maxSize) {
        throw new AppError("Arquivo muito grande.", 400);
      }
    }

    // upload firebase
    const fileUrl = await uploadBase64ToFirebase(
      data.fileBase64,
      `maintenance/${maintenanceId}`
    );

    return prisma.maintenanceAttachment.create({
      data: {
        maintenanceOrderId: maintenanceId,
        name: data.name.trim(),
        fileUrl,
        mimeType,
        size,
        createdByUserId: userId,
      },
    });
  }

  async deleteAttachment(id: string) {
    const attachment = await prisma.maintenanceAttachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new AppError("Anexo não encontrado.", 404);
    }

    // 🔥 FUTURO (IMPORTANTE)
    // await deleteFromFirebase(attachment.fileUrl);

    await prisma.maintenanceAttachment.delete({
      where: { id },
    });

    return { success: true };
  }

  async getAttachmentsByMaintenance(maintenanceId: string) {
    const maintenance = await prisma.maintenanceOrder.findUnique({
      where: { id: maintenanceId },
    });

    if (!maintenance) {
      throw new AppError("Manutenção não encontrada.", 404);
    }

    return prisma.maintenanceAttachment.findMany({
      where: { maintenanceOrderId: maintenanceId },
      orderBy: { createdAt: "desc" },
    });
  }
}