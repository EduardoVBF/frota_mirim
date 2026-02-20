import { z } from "zod";

export const USER_ROLES = ["admin", "editor", "motorista"] as const;

export const userRoleSchema = z.enum(USER_ROLES);

export type UserRole = z.infer<typeof userRoleSchema>;

export const userResponseSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  role: userRoleSchema,
  isActive: z.boolean(),
  imageUrl: z.string().url().nullable().optional(),
  cnhExpiresAt: z.coerce.date().nullable().optional(),
});

export type UserResponseDTO = z.infer<typeof userResponseSchema>;

export const usersListResponseSchema = z.array(userResponseSchema);
export type UsersListResponseDTO = z.infer<typeof usersListResponseSchema>;

export const userParamsSchema = z.object({
  id: z.uuid(),
});
export type UserParamsDTO = z.infer<typeof userParamsSchema>;

export const updateUserBodySchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  imageBase64: z.string().optional(),
  cnhExpiresAt: z.coerce.date().optional(),
});
export type UpdateUserBodyDTO = z.infer<typeof updateUserBodySchema>;

export const resetPasswordBodySchema = z.object({
  newPassword: z.string().min(8),
});
export type ResetPasswordBodyDTO = z.infer<typeof resetPasswordBodySchema>;

export const userQuerySchema = z.object({
  search: z.string().optional(),

  role: z.preprocess((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  }, z.array(userRoleSchema).optional()),

  isActive: z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),

  page: z.preprocess((val) => {
    if (!val) return 1;
    return Number(val);
  }, z.number().min(1)),

  limit: z.preprocess((val) => {
    if (!val) return 10;
    return Number(val);
  }, z.number().min(1).max(1000)),
});

export type UserQueryDTO = z.infer<typeof userQuerySchema>;
