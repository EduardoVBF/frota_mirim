import { loginController, registerController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";
import { validateRequest } from "../../infra/http/validate";
import { FastifyInstance } from "fastify";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const { body } = await validateRequest(request, {
      body: loginSchema,
    });

    return loginController({ ...request, body } as any, reply);
  });

  app.post("/auth/register", async (request, reply) => {
    const { body } = await validateRequest(request, {
      body: registerSchema,
    });

    return registerController({ ...request, body } as any, reply);
  });
}
