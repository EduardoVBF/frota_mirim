import { usersRoutes } from "./modules/users/users.routes";
import { errorHandler } from "./infra/http/error-handler";
import { authRoutes } from "./modules/auth/auth.routes";
import { registerPlugins } from "./config/fastify";
import Fastify from "fastify";

const app = Fastify({
  logger: true,
  bodyLimit: 10 * 1024 * 1024,
});

app.register(async (app) => {
  app.setErrorHandler(errorHandler);

  await registerPlugins(app);

  await app.register(authRoutes);
  await app.register(usersRoutes);
});

export { app };

export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit("request", req, res);
};
