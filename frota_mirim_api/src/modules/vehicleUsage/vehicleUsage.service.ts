import {
  CreateVehicleUsageDTO,
  UpdateVehicleUsageDTO,
  VehicleUsageQueryDTO,
} from "./vehicleUsage.schema";
import { VehicleTimelineService } from "../vehicles/vehicleTimeline.service";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";

export class VehicleUsageService {
  // VALIDAÇÃO CENTRAL (CREATE + UPDATE)
  private async validateUsageConsistency(
    params: {
      vehicleId: string;
      userId: string;
      assistantId?: string | null;
      eventAt: Date;
      type: "ENTRY" | "EXIT";
      ignoreId?: string;
    },
    tx: any,
  ) {
    const { vehicleId, userId, assistantId, eventAt, type, ignoreId } = params;

    const buildWhere = (extra: any) => ({
      ...extra,
      ...(ignoreId && { id: { not: ignoreId } }),
    });

    const [userEvents, vehicleEvents, assistantEvents] = await Promise.all([
      tx.vehicleUsage.findMany({
        where: buildWhere({ userId }),
        orderBy: { eventAt: "asc" },
      }),

      tx.vehicleUsage.findMany({
        where: buildWhere({ vehicleId }),
        orderBy: { eventAt: "asc" },
      }),

      assistantId
        ? tx.vehicleUsage.findMany({
            where: buildWhere({ assistantId }),
            orderBy: { eventAt: "asc" },
          })
        : [],
    ]);

    const isOpenUntil = (events: any[], date: Date) => {
      let open = false;
      for (const e of events) {
        if (e.eventAt > date) break;

        if (e.type === "ENTRY") open = true;
        if (e.type === "EXIT") open = false;
      }
      return open;
    };

    const userOpen = isOpenUntil(userEvents, eventAt);
    const vehicleOpen = isOpenUntil(vehicleEvents, eventAt);
    const assistantOpen = assistantId
      ? isOpenUntil(assistantEvents, eventAt)
      : false;

    // VALIDAÇÃO DE ORDEM TEMPORAL (CORRETA)
    let previousVehicleEvent = null;

    for (let i = vehicleEvents.length - 1; i >= 0; i--) {
      if (vehicleEvents[i].eventAt < eventAt) {
        previousVehicleEvent = vehicleEvents[i];
        break;
      }
    }

    const nextVehicleEvent = vehicleEvents.find(
      (e: any) => e.eventAt > eventAt,
    );

    if (previousVehicleEvent && eventAt <= previousVehicleEvent.eventAt) {
      throw new AppError(
        "Horário inválido: conflito com evento anterior.",
        400,
      );
    }

    if (nextVehicleEvent && eventAt >= nextVehicleEvent.eventAt) {
      throw new AppError(
        "Horário inválido: conflito com evento posterior.",
        400,
      );
    }

    const lastAssistantEvent =
      assistantEvents.length > 0
        ? assistantEvents[assistantEvents.length - 1]
        : null;

    // ENTRY
    if (type === "ENTRY") {
      if (userOpen) {
        throw new AppError(
          "Este usuário já está utilizando um veículo neste momento.",
          400,
        );
      }

      if (vehicleOpen) {
        throw new AppError("Este veículo já está em uso neste momento.", 400);
      }

      if (assistantId && assistantOpen) {
        throw new AppError(
          "Este auxiliar já está em uso em outro veículo.",
          400,
        );
      }
    }

    // EXIT
    if (type === "EXIT") {
      if (!userOpen) {
        throw new AppError("Este usuário não possui uma entrada aberta.", 400);
      }

      if (!vehicleOpen) {
        throw new AppError("Este veículo não possui uma entrada aberta.", 400);
      }

      if (assistantId) {
        if (!assistantOpen) {
          throw new AppError(
            "Este auxiliar não possui uma entrada aberta.",
            400,
          );
        }

        if (!lastAssistantEvent || lastAssistantEvent.vehicleId !== vehicleId) {
          throw new AppError(
            "Este auxiliar não está vinculado a este veículo.",
            400,
          );
        }
      }
    }
  }

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

  // CREATE
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

      await this.validateUsageConsistency(
        {
          vehicleId: data.vehicleId,
          userId: data.userId,
          assistantId: data.assistantId,
          eventAt: data.eventAt,
          type: data.type,
        },
        tx,
      );

      const timelineService = new VehicleTimelineService();

      await timelineService.validateKm(
        data.vehicleId,
        data.eventAt,
        data.km,
        tx,
      );

      const usage = await tx.vehicleUsage.create({ data });

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

      const newKm = data.km ?? usage.km;
      const newEventAt = data.eventAt ?? usage.eventAt;

      if (newKm < 0) {
        throw new AppError("KM inválido.", 400);
      }

      if (data.type && data.type !== usage.type) {
        throw new AppError("Não é permitido alterar o tipo do evento.", 400);
      }

      const timelineService = new VehicleTimelineService();

      await timelineService.validateKm(usage.vehicleId, newEventAt, newKm, tx);

      await this.validateUsageConsistency(
        {
          vehicleId: usage.vehicleId,
          userId: usage.userId,
          assistantId: usage.assistantId,
          eventAt: newEventAt,
          type: usage.type,
          ignoreId: id,
        },
        tx,
      );

      const updated = await tx.vehicleUsage.update({
        where: { id },
        data,
      });

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

  // CURRENT VEHICLE BY USER
  async getCurrentVehicleByUser(userId: string) {
    const events = await prisma.vehicleUsage.findMany({
      where: { userId },
      orderBy: { eventAt: "asc" },
    });

    let open: any = null;

    for (const e of events) {
      if (e.type === "ENTRY") open = e;
      if (e.type === "EXIT") open = null;
    }

    if (!open) return null;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: open.vehicleId },
    });

    return {
      userId,
      vehicleId: vehicle?.id,
      placa: vehicle?.placa,
      startedAt: open.eventAt,
      kmStart: open.km,
      assistantId: open.assistantId,
    };
  }
}
