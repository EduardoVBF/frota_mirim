import {
  UserResponseDTO,
  UserParamsDTO,
  UsersListResponseDTO,
  ResetPasswordBodyDTO,
  UpdateUserBodyDTO,
  UserQueryDTO,
} from "./users.schema";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";
import bcrypt from "bcrypt";

export class UsersService {
  
  async getAllUsers(query: UserQueryDTO) {
  const { search, role, isActive } = query;

  const where: any = {
    AND: []
  };

  // Filtro de Busca Textual
  if (search) {
    where.AND.push({
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    });
  }

  // Filtro de Role
  if (role) {
    where.AND.push({ role });
  }

  // Filtro de Status
  if (isActive !== undefined) {
    where.AND.push({ isActive });
  }

  return prisma.user.findMany({
    where: where.AND.length > 0 ? where : {},
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
