import { api } from "./api";
import qs from "qs";

export type UserPhone = {
  id: string;
  userId: string;
  phone: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserPhonePayload = {
  userId: string;
  phone: string;
  isPrimary?: boolean;
  isActive?: boolean;
};

export type UpdateUserPhonePayload = {
  userId?: string;
  phone?: string;
  isPrimary?: boolean;
  isActive?: boolean;
};

export type UserPhoneFilters = {
  userId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type UserPhonesResponse = {
  phones: UserPhone[];
  meta: {
    total: number;
    totalFiltered: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export async function createUserPhone(
  payload: CreateUserPhonePayload
): Promise<UserPhone> {
  const { data } = await api.post("/user-phones", payload);
  return data;
}

export async function getUserPhones(
  filters: UserPhoneFilters
): Promise<UserPhonesResponse> {
  const { data } = await api.get("/user-phones", {
    params: filters,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return data;
}

export async function getUserPhoneById(
  id: string
): Promise<UserPhone> {
  const { data } = await api.get(`/user-phones/${id}`);
  return data;
}

export async function updateUserPhone(
  id: string,
  payload: UpdateUserPhonePayload
): Promise<UserPhone> {
  const { data } = await api.put(`/user-phones/${id}`, payload);
  return data;
}

export async function deleteUserPhone(
  id: string
): Promise<void> {
  await api.delete(`/user-phones/${id}`);
}
