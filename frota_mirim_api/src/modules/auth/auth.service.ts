import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";
import bcrypt from "bcrypt";

type LoginInput = {
  email: string;
  password: string;
};

enum UserRole {
  ADMIN = "admin",
  MOTORISTA = "motorista",
  EDITOR = "editor",
}

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive: boolean;
};

export class AuthService {
  async login({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      throw new AppError("Credenciais inválidas", 401);
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    };
  }

  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("Usuário com este email já existe", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: data.role ?? UserRole.EDITOR,
        isActive: data.isActive,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    };
  }
}
