import {
  CreateVehicleUsageDTO,
  UpdateVehicleUsageDTO,
  VehicleUsageQueryDTO,
} from "./vehicleUsage.schema";
import { VehicleTimelineService } from "../vehicles/vehicleTimeline.service";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";

export class VehicleUsageService {
  // GET ALL
  async getAll(query: VehicleUsageQueryDTO) {
    const {
      vehicleId,
      userId,
      assistantId,
      type,
      dataInicio,
      dataFim,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};

    if (vehicleId) where.vehicleId = vehicleId;
    if (assistantId) where.assistantId = assistantId;
    if (userId) where.userId = userId;
    if (type) where.type = type;

    if (dataInicio || dataFim) {
      where.eventAt = {};
      if (dataInicio) where.eventAt.gte = dataInicio;
      if (dataFim) where.eventAt.lte = dataFim;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.vehicleUsage.findMany({
        where,
        orderBy: { eventAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vehicleUsage.count({ where }),
    ]);

    return {
      usages: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET BY ID
  async getById(id: string) {
    const usage = await prisma.vehicleUsage.findUnique({
      where: { id },
    });

    if (!usage) {
      throw new AppError("Uso do veículo não encontrado.", 404);
    }

    return usage;
  }

  // CREATE (ENTRY ou EXIT)
  async create(data: CreateVehicleUsageDTO) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: data.vehicleId },
      });

      if (!vehicle) throw new AppError("Veículo não encontrado.", 404);
      if (!vehicle.isActive) throw new AppError("Veículo inativo.", 400);

      const user = await tx.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) throw new AppError("Usuário não encontrado.", 404);
      if (!user.isActive) throw new AppError("Usuário inativo.", 400);

      const lastVehicleEvent = await tx.vehicleUsage.findFirst({
        where: { vehicleId: data.vehicleId },
        orderBy: { eventAt: "desc" },
      });

      const lastUserEvent = await tx.vehicleUsage.findFirst({
        where: { userId: data.userId },
        orderBy: { eventAt: "desc" },
      });

      const lastAssistantEvent = data.assistantId
        ? await tx.vehicleUsage.findFirst({
            where: { assistantId: data.assistantId },
            orderBy: { eventAt: "desc" },
          })
        : null;

      if (data.type === "ENTRY") {
        if (lastVehicleEvent?.type === "ENTRY") {
          throw new AppError("Este veículo já está em uso.", 400);
        }

        if (lastUserEvent?.type === "ENTRY") {
          throw new AppError(
            "Este usuário já está utilizando um veículo.",
            400,
          );
        }

        if (data.assistantId && lastAssistantEvent?.type === "ENTRY") {
          throw new AppError(
            "Este auxiliar já está auxiliando em um veículo.",
            400,
          );
        }
      }

      if (data.type === "EXIT") {
        if (!lastVehicleEvent || lastVehicleEvent.type !== "ENTRY") {
          throw new AppError(
            "Não existe entrada aberta para este veículo.",
            400,
          );
        }

        if (!lastUserEvent || lastUserEvent.type !== "ENTRY") {
          throw new AppError("Este usuário não possui entrada aberta.", 400);
        }

        if (data.eventAt <= lastVehicleEvent.eventAt) {
          throw new AppError("Horário de saída inválido.", 400);
        }

        if (data.assistantId) {
          if (
            !lastAssistantEvent ||
            lastAssistantEvent.type !== "ENTRY" ||
            lastAssistantEvent.vehicleId !== data.vehicleId
          ) {
            throw new AppError(
              "Este auxiliar não possui entrada aberta para este veículo.",
              400,
            );
          }
        }
      }

      const timelineService = new VehicleTimelineService();

      await timelineService.validateKm(
        data.vehicleId,
        data.eventAt,
        data.km,
        tx,
      );

      const usage = await tx.vehicleUsage.create({
        data,
      });

      const lastKm = await timelineService.getLastKm(data.vehicleId, tx);

      if (lastKm !== null) {
        await tx.vehicle.update({
          where: { id: data.vehicleId },
          data: { kmAtual: lastKm },
        });
      }

      return usage;
    });
  }

  // UPDATE
  async update(id: string, data: UpdateVehicleUsageDTO) {
    return prisma.$transaction(async (tx) => {
      const usage = await tx.vehicleUsage.findUnique({
        where: { id },
      });

      if (!usage) {
        throw new AppError("Uso do veículo não encontrado.", 404);
      }

      const vehicle = await tx.vehicle.findUnique({
        where: { id: usage.vehicleId },
      });

      if (!vehicle) {
        throw new AppError("Veículo não encontrado.", 404);
      }

      const user = await tx.user.findUnique({
        where: { id: usage.userId },
      });

      if (!user) {
        throw new AppError("Usuário não encontrado.", 404);
      }

      const newKm = data.km ?? usage.km;
      const newEventAt = data.eventAt ?? usage.eventAt;
      const newType = data.type ?? usage.type;

      if (newKm < 0) {
        throw new AppError("KM inválido.", 400);
      }
      if (newType !== usage.type) {
        throw new AppError("Não é permitido alterar o tipo do evento.", 400);
      }

      const timelineService = new VehicleTimelineService();

      // validação com fuel + usage
      await timelineService.validateKm(usage.vehicleId, newEventAt, newKm, tx);

      const updated = await tx.vehicleUsage.update({
        where: { id },
        data,
      });

      // recalcular kmAtual
      const lastKm = await timelineService.getLastKm(usage.vehicleId, tx);

      if (lastKm !== null) {
        await tx.vehicle.update({
          where: { id: usage.vehicleId },
          data: { kmAtual: lastKm },
        });
      }

      return updated;
    });
  }

  // LAST TRIP
  async getLastTrip(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) throw new AppError("Veículo não encontrado.", 404);

    const lastExit = await prisma.vehicleUsage.findFirst({
      where: { vehicleId, type: "EXIT" },
      orderBy: { eventAt: "desc" },
    });

    if (!lastExit) return null;

    const entry = await prisma.vehicleUsage.findFirst({
      where: {
        vehicleId,
        type: "ENTRY",
        eventAt: { lt: lastExit.eventAt },
      },
      orderBy: { eventAt: "desc" },
    });

    if (!entry) return null;

    return {
      vehicleId,
      startedAt: entry.eventAt,
      finishedAt: lastExit.eventAt,
      kmStart: entry.km,
      kmEnd: lastExit.km,
      kmDriven: lastExit.km - entry.km,
      userId: entry.userId,
      assistantId: entry.assistantId,
    };
  }

  // VEHICLES IN USE
  async getVehiclesInUse() {
    const inUse = await prisma.vehicleUsage.findMany({
      where: { type: "ENTRY" },
      orderBy: { eventAt: "desc" },
      distinct: ["vehicleId"],
    });

    return inUse.map((item) => ({
      vehicleId: item.vehicleId,
      userId: item.userId,
      assistantId: item.assistantId,
      startedAt: item.eventAt,
    }));
  }

  // TRIPS BY VEHICLE
  async getTripsByVehicle(vehicleId: string) {
    const events = await prisma.vehicleUsage.findMany({
      where: { vehicleId },
      orderBy: { eventAt: "asc" },
    });

    const trips: any[] = [];
    let openEntry: any = null;

    for (const event of events) {
      if (event.type === "ENTRY") {
        openEntry = event;
      }

      if (event.type === "EXIT" && openEntry) {
        trips.push({
          startedAt: openEntry.eventAt,
          finishedAt: event.eventAt,
          kmStart: openEntry.km,
          kmEnd: event.km,
          kmDriven: event.km - openEntry.km,
          userId: openEntry.userId,
          assistantId: openEntry.assistantId,
        });

        openEntry = null;
      }
    }

    return trips.reverse();
  }

  // CURRENT VEHICLE BY USER
  async getCurrentVehicleByUser(userId: string) {
    const lastEvent = await prisma.vehicleUsage.findFirst({
      where: { userId },
      orderBy: { eventAt: "desc" },
    });

    if (!lastEvent || lastEvent.type !== "ENTRY") {
      return null;
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: lastEvent.vehicleId },
    });

    return {
      userId: userId,
      vehicleId: vehicle?.id,
      placa: vehicle?.placa,
      startedAt: lastEvent.eventAt,
      kmStart: lastEvent.km,
      assistantId: lastEvent.assistantId,
    };
  }
}
