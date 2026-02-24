import { z } from "zod";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export const userPhoneResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  phone: z.string(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserPhoneResponseDTO = z.infer<
  typeof userPhoneResponseSchema
>;

export const userPhonesListResponseSchema = z.array(
  userPhoneResponseSchema
);

export const userPhoneParamsSchema = z.object({
  id: z.uuid(),
});

export const createUserPhoneSchema = z.object({
  userId: z.uuid(),
  phone: z
    .string()
    .min(10)
    .transform((val) => normalizePhone(val)),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const updateUserPhoneSchema =
  createUserPhoneSchema.partial();

export const userPhoneQuerySchema = z.object({
  userId: z.uuid().optional(),

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

export type UserPhoneQueryDTO = z.infer<
  typeof userPhoneQuerySchema
>;
