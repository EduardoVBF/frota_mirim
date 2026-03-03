import { api } from "./api";

enum UserRole {
  ADMIN = "ADMIN",
  MOTORISTA = "MOTORISTA",
  AUXILIAR = "AUXILIAR",
  EDITOR = "EDITOR",
}

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    imageUrl?: string;
    cnhExpiresAt?: Date;
    internalCode: string;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  accessToken: string;
  imageUrl?: string;
  cnhExpiresAt?: Date;
  internalCode: string;
};


export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}
