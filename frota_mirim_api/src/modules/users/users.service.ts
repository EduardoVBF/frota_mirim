import {
  UserResponseDTO,
  UserParamsDTO,
  ResetPasswordBodyDTO,
  UpdateUserBodyDTO,
  UserQueryDTO,
} from "./users.schema";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";
import { startOfMonth } from "date-fns";
import bcrypt from "bcrypt";

export class UsersService {
  async getAllUsers(query: UserQueryDTO) {
    const { search, role, isActive } = query;

    const where: any = { AND: [] };

    // 🔎 Search
    if (search) {
      where.AND.push({
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // 🎭 Role (pode ser múltipla)
    if (role) {
      const roles = Array.isArray(role) ? role : [role];

      where.AND.push({
        role: {
          in: roles,
        },
      });
    }

    // 🔵 Status (boolean simples)
    if (typeof isActive === "boolean") {
      where.AND.push({ isActive });
    }

    const finalWhere = where.AND.length > 0 ? where : {};

    const [users, totalCount, activeCount, monthCount] = await Promise.all([
      prisma.user.findMany({
        where: finalWhere,
        orderBy: { firstName: "asc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true,
        },
      }),

      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth(new Date()),
          },
        },
      }),
    ]);

    return {
      users,
      meta: {
        total: totalCount,
        active: activeCount,
        newThisMonth: monthCount,
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
        role: true,
        isActive: true,
      },
    }) as Promise<UserResponseDTO>;
  }

  async updateUser(
    id: UserParamsDTO["id"],
    data: Partial<UpdateUserBodyDTO>,
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

    return prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
        role: data.role ?? user.role,
        isActive: data.isActive ?? user.isActive,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
    }) as Promise<UserResponseDTO>;
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
