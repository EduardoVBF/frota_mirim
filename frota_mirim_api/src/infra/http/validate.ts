import { translateZodIssue } from "../zod/zod-error-translator";
import { ValidationError } from "../errors/validation-error";
import { ZodError, ZodSchema } from "zod";
import { FastifyRequest } from "fastify";

type RequestPart = "body" | "params" | "query";

type Schemas = Partial<Record<RequestPart, ZodSchema>>;

export async function validateRequest<T extends Schemas>(
  request: FastifyRequest,
  schemas: T
): Promise<{
  [K in keyof T]: any;
}> {
  const errors: Record<string, any> = {};
  const parsedData: Record<string, any> = {};

  for (const part of Object.keys(schemas) as RequestPart[]) {
    const schema = schemas[part];
    if (!schema) continue;

    try {
      const parsed = schema.parse((request as any)[part]);
      parsedData[part] = parsed;
    } catch (err) {
      if (err instanceof ZodError) {
        errors[part] = formatZodError(err);
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  return parsedData as {
    [K in keyof T]: any;
  };
}

function formatZodError(error: ZodError) {
  const formatted: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const field =
      issue.path.length > 0 ? issue.path.join(".") : "root";

    if (!formatted[field]) {
      formatted[field] = [];
    }

    formatted[field].push(translateZodIssue(issue as any));
  });

  return formatted;
}
