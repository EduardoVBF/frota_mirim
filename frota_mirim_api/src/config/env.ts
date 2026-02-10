import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().optional(),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
