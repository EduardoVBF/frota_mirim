import { z } from "zod";
import { is } from "zod/v4/locales";

export const userResponseSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  role: z.string(),
  isActive: z.boolean(),
});

export type UserResponseDTO = z.infer<typeof userResponseSchema>;

// Lista de usuários
export const usersListResponseSchema = z.array(userResponseSchema);
export type UsersListResponseDTO = z.infer<typeof usersListResponseSchema>;

export const userParamsSchema = z.object({
  id: z.uuid(),
});
export type UserParamsDTO = z.infer<typeof userParamsSchema>;

export const updateUserBodySchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(["admin", "editor"]).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserBodyDTO = z.infer<typeof updateUserBodySchema>;

export const resetPasswordBodySchema = z.object({
  newPassword: z.string().min(8),
});
export type ResetPasswordBodyDTO = z.infer<typeof resetPasswordBodySchema>;

export const userQuerySchema = z.object({
  search: z.string().optional(),
});

export type UserQueryDTO = z.infer<typeof userQuerySchema>;
