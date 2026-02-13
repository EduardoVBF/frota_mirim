import { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import { env } from "./env";

export async function registerPlugins(app: FastifyInstance) {
  // CORS
  await app.register(fastifyCors, {
    origin: ["http://localhost:3000", "https://frota-mirim.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  // JWT
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });
}
