import {
  UserResponseDTO,
  UserParamsDTO,
  UsersListResponseDTO,
  ResetPasswordBodyDTO,
  UpdateUserBodyDTO,
} from "./users.schema";
import { prisma } from "../../shared/database/prisma";
import bcrypt from "bcrypt";
import { AppError } from "../../infra/errors/app-error";

export class UsersService {
  async getAllUsers(search?: string) {
    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    return prisma.user.findMany({
      where,
      orderBy: { firstName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
      },
    }) as Promise<UsersListResponseDTO>;
  }

  async getUserById(id: UserParamsDTO["id"]) {
    const user = (await prisma.user.findUnique({
      where: { id },
    })) as UserResponseDTO | null;

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
    const user = (await prisma.user.findUnique({
      where: { id },
    })) as UserResponseDTO | null;

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    // Editor nunca altera role
    if (data.role && requesterRole !== "admin") {
      throw new AppError("Sem permissão para alterar função.", 403);
    }

    // Admin não pode se auto-rebaixar
    if (data.role && requesterId === id && data.role !== user.role) {
      throw new AppError("Você não pode alterar sua própria função.", 403);
    }

    return prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
        role: data.role ?? user.role,
        isActive: data.isActive ?? true,
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
    const user = (await prisma.user.findUnique({
      where: { id },
    })) as UserResponseDTO | null;

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    return prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    }) as Promise<UserResponseDTO>;
  }
}
