import {
  UserResponseDTO,
  UserParamsDTO,
  ResetPasswordBodyDTO,
  UpdateUserBodyDTO,
  UserQueryDTO,
} from "./users.schema";
import { uploadBase64ToFirebase } from "../../services/uploadImageBase64";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";
import { startOfMonth } from "date-fns";
import bcrypt from "bcrypt";

export class UsersService {
  async getAllUsers(query: UserQueryDTO) {
    const { search, role, isActive, page = 1, limit = 10 } = query;

    const where: any = { AND: [] };

    if (search) {
      where.AND.push({
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (role) {
      where.AND.push({
        role: { in: Array.isArray(role) ? role : [role] },
      });
    }

    if (typeof isActive === "boolean") {
      where.AND.push({ isActive });
    }

    const finalWhere = where.AND.length ? where : {};
    const skip = (page - 1) * limit;

    const [users, totalFiltered, totalCount, activeCount, monthCount] =
      await Promise.all([
        prisma.user.findMany({
          where: finalWhere,
          orderBy: { firstName: "asc" },
          skip,
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            cpf: true,
            role: true,
            isActive: true,
            imageUrl: true,
            cnhExpiresAt: true,
          },
        }),

        prisma.user.count({ where: finalWhere }),
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({
          where: {
            createdAt: { gte: startOfMonth(new Date()) },
          },
        }),
      ]);

    return {
      users,
      meta: {
        total: totalCount,
        totalFiltered,
        active: activeCount,
        newThisMonth: monthCount,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
      },
    };
  }

  async getUserById(id: UserParamsDTO["id"]) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        cpf: true,
        role: true,
        isActive: true,
        imageUrl: true,
        cnhExpiresAt: true,
      },
    }) as Promise<UserResponseDTO>;
  }

  async updateUser(
    id: UserParamsDTO["id"],
    data: Partial<UpdateUserBodyDTO> & { imageBase64?: string },
    requesterRole: "admin" | "editor",
    requesterId: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    if (data.role && requesterRole !== "admin") {
      throw new AppError("Sem permissão para alterar função.", 403);
    }

    if (data.role && requesterId === id && data.role !== user.role) {
      throw new AppError("Você não pode alterar sua própria função.", 403);
    }

    let imageUrl: string | undefined;

    if (data.imageBase64) {
      if (data.imageBase64.startsWith("data:")) {
        imageUrl = await uploadBase64ToFirebase(data.imageBase64, "users");
      } else {
        imageUrl = data.imageBase64;
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
        role: data.role ?? user.role,
        isActive: data.isActive ?? user.isActive,
        cpf: data.cpf ?? user.cpf,
        ...(imageUrl && { imageUrl }),
        ...(data.cnhExpiresAt && { cnhExpiresAt: data.cnhExpiresAt }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        cpf: true,
        isActive: true,
        imageUrl: true,
        cnhExpiresAt: true,
      },
    });
  }

  async resetPassword(id: UserParamsDTO["id"], data: ResetPasswordBodyDTO) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    return prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });
  }
}
