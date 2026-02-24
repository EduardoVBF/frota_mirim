import { UserPhoneQueryDTO } from "./usersTelephones.schema";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";

export class UserPhonesService {
  async getAllUserPhones(query: UserPhoneQueryDTO) {
    const { userId, isActive, page = 1, limit = 10 } = query;

    const where: any = { AND: [] };

    if (userId) {
      where.AND.push({ userId });
    }

    if (typeof isActive === "boolean") {
      where.AND.push({ isActive });
    }

    const finalWhere = where.AND.length ? where : {};
    const skip = (page - 1) * limit;

    const [phones, totalFiltered, totalCount] =
      await Promise.all([
        prisma.userPhone.findMany({
          where: finalWhere,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.userPhone.count({ where: finalWhere }),
        prisma.userPhone.count(),
      ]);

    return {
      phones,
      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
      },
    };
  }

  async getUserPhoneById(id: string) {
    const phone = await prisma.userPhone.findUnique({
      where: { id },
    });

    if (!phone) {
      throw new AppError("Telefone não encontrado.", 404);
    }

    return phone;
  }

  async createUserPhone(data: any) {
    const existing = await prisma.userPhone.findUnique({
      where: { phone: data.phone },
    });

    if (existing) {
      throw new AppError(
        "Esse telefone já está cadastrado.",
        409
      );
    }

    // Se for primário, desmarca os outros
    if (data.isPrimary) {
      await prisma.userPhone.updateMany({
        where: { userId: data.userId },
        data: { isPrimary: false },
      });
    }

    return prisma.userPhone.create({
      data,
    });
  }

  async updateUserPhone(id: string, data: any) {
    const phone = await prisma.userPhone.findUnique({
      where: { id },
    });

    if (!phone) {
      throw new AppError("Telefone não encontrado.", 404);
    }

    if (data.phone) {
      const existing = await prisma.userPhone.findUnique({
        where: { phone: data.phone },
      });

      if (existing && existing.id !== id) {
        throw new AppError(
          "Esse telefone já está cadastrado.",
          409
        );
      }
    }

    if (data.isPrimary) {
      await prisma.userPhone.updateMany({
        where: { userId: phone.userId },
        data: { isPrimary: false },
      });
    }

    return prisma.userPhone.update({
      where: { id },
      data,
    });
  }

  async deleteUserPhone(id: string) {
    const phone = await prisma.userPhone.findUnique({
      where: { id },
    });

    if (!phone) {
      throw new AppError("Telefone não encontrado.", 404);
    }

    return prisma.userPhone.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }
}
