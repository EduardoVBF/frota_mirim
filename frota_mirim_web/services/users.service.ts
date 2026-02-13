import { api } from "./api";
import qs from "qs";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "motorista" | "editor";
  isActive: boolean;
};

export type UsersResponse = {
  users: User[];
  meta: {
    total: number;
    totalFiltered: number;
    active: number;
    newThisMonth: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "motorista" | "editor";
  isActive: boolean;
};

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  role?: "admin" | "motorista" | "editor";
  isActive?: boolean;
};

export type UserFilters = {
  search?: string;
  role?: string[];
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function getAdminUsers(
  filters: UserFilters
): Promise<UsersResponse> {
  const { data } = await api.get("/users", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await api.get(`/users/${id}`);
  return data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<User> {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
}

export async function resetUserPassword(
  id: string,
  payload: { newPassword: string }
): Promise<void> {
  await api.post(`/users/${id}/reset-password`, payload);
}
