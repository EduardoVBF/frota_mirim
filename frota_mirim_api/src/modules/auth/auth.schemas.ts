import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(["admin", "motorista", "editor"]).optional(),
  isActive: z.boolean(),
  imageBase64: z.string().optional(),
  cnhExpiresAt: z.coerce.date().optional(),
  cpf: z.string().length(11),
});
