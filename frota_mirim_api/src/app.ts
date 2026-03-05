// import { maintenanceItemRoutes } from "./modules/maintenanceItem/maintenanceItem.routes";
import { userPhonesRoutes } from "./modules/usersTelephones/usersTelephones.routes";
import { vehicleUsageRoutes } from "./modules/vehicleUsage/vehicleUsage.routes";
import { itemCatalogRoutes } from "./modules/itemCatalog/itemCatalog.routes";
import { maintenanceRoutes } from "./modules/maintenance/maintenance.routes";
import { fuelSupplyRoutes } from "./modules/fuelSupply/fuel-supply.routes";
import { vehiclesRoutes } from "./modules/vehicles/vehicles.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { stockRoutes } from "./modules/stock/stock.routes";
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

  // await app.register(maintenanceItemRoutes);
  await app.register(vehicleUsageRoutes);
  await app.register(itemCatalogRoutes);
  await app.register(maintenanceRoutes);
  await app.register(userPhonesRoutes);
  await app.register(fuelSupplyRoutes);
  await app.register(vehiclesRoutes);
  await app.register(usersRoutes);
  await app.register(stockRoutes);
  await app.register(authRoutes);
});

export { app };

export default async (req: any, res: any) => {
  await app.ready();
  app.server.emit("request", req, res);
};
