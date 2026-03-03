import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";
import bcrypt from "bcrypt";
import { uploadBase64ToFirebase } from "../../services/uploadImageBase64";
import { UserRole } from "../users/users.schema";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive: boolean;
  cpf: string;

  imageBase64?: string;
  cnhExpiresAt?: Date;
};

// Função para formatar internalCode modelo: 000X
function formatInternalCode(code: number) {
  return code.toString().padStart(4, "0");
}

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
      internalCode: formatInternalCode(user.internalCode),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      imageUrl: user.imageUrl,
      cnhExpiresAt: user.cnhExpiresAt,
      cpf: user.cpf,
    };
  }

  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const existingCpf = await prisma.user.findUnique({
      where: { cpf: data.cpf },
    });

    if (existingUser) {
      throw new AppError("Usuário com este email já existe", 409);
    }

    if (existingCpf) {
      throw new AppError("Usuário com este CPF já existe", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    let imageUrl: string | undefined;

    // Upload da imagem se enviada
    if (data.imageBase64) {
      imageUrl = await uploadBase64ToFirebase(data.imageBase64, "users");
    }

    const lastUser = await prisma.user.findFirst({
      orderBy: { internalCode: "desc" },
    });

    const nextInternalCode = lastUser ? lastUser.internalCode + 1 : 1;

    const user = await prisma.user.create({
      data: {
        internalCode: nextInternalCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: data.role ?? "MOTORISTA",
        isActive: data.isActive,
        imageUrl,
        cnhExpiresAt: data.cnhExpiresAt,
        cpf: data.cpf,
      },
    });

    return {
      id: user.id,
      internalCode: formatInternalCode(user.internalCode),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      imageUrl: user.imageUrl,
      cnhExpiresAt: user.cnhExpiresAt,
      cpf: user.cpf,
    };
  }
}
