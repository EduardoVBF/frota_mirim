import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { Prisma } from "@prisma/client";

import {
  AlertsQueryDTO,
  MarkAlertReadDTO,
  ResolveAlertDTO,
} from "./alerts.schema";

export class AlertsService {
  /* GET ALERTS */
  async getAlerts(query: AlertsQueryDTO) {
    const {
      search,
      type,
      severity,
      entityType,
      isRead,
      resolved,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      vehiclePlate,
    } = query;

    const where: Prisma.AlertWhereInput = {};

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          message: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (vehiclePlate) {
      where.metadata = {
        path: ["vehiclePlate"],
        equals: vehiclePlate,
      };
    }

    if (type?.length) {
      where.type = { in: type };
    }

    if (severity?.length) {
      where.severity = { in: severity };
    }

    if (entityType?.length) {
      where.entityType = { in: entityType };
    }

    if (typeof isRead === "boolean") {
      where.isRead = isRead;
    }

    if (typeof resolved === "boolean") {
      where.resolvedAt = resolved ? { not: null } : null;
    }

    const skip = (page - 1) * limit;

    const [
      alerts,
      totalFiltered,
      totalCount,
      unreadCount,
      warningCount,
      criticalCount,
    ] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),

      prisma.alert.count({ where }),

      prisma.alert.count(),

      prisma.alert.count({
        where: {
          isRead: false,
          resolvedAt: null,
        },
      }),

      prisma.alert.count({
        where: {
          severity: "WARNING",
          resolvedAt: null,
        },
      }),

      prisma.alert.count({
        where: {
          severity: "CRITICAL",
          resolvedAt: null,
        },
      }),
    ]);

    return {
      items: alerts.map((alert) => ({
        ...alert,
        resolved: alert.resolvedAt !== null,
      })),

      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
      },

      stats: {
        unread: unreadCount,
        warning: warningCount,
        critical: criticalCount,
      },
    };
  }

  /* MARK ALERT READ */
  async markAlertRead(id: string, data: MarkAlertReadDTO) {
    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new AppError("Alerta não encontrado.", 404);
    }

    const readAt = data.read ? new Date() : null;

    return prisma.alert.update({
      where: { id },
      data: {
        isRead: data.read,
        readAt,
      },
    });
  }

  /* MARK ALL READ */
  async markAllRead() {
    await prisma.alert.updateMany({
      where: {
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { message: "Todos os alertas marcados como lidos." };
  }

  /* RESOLVE ALERT */
  async resolveAlert(id: string, data: ResolveAlertDTO) {
    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new AppError("Alerta não encontrado.", 404);
    }

    return prisma.alert.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
        resolvedAt: data.resolved ? new Date() : null,
      },
    });
  }

  /* CREATE ALERT */
  async createAlert(data: {
    type: Prisma.AlertCreateInput["type"];
    severity: Prisma.AlertCreateInput["severity"];
    title: string;
    message: string;
    entityType: Prisma.AlertCreateInput["entityType"];
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.alert.create({
      data: {
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata,
      },
    });
  }

  /* CREATE ALERT IF NOT EXISTS */
  async createAlertIfNotExists(data: {
    type: Prisma.AlertCreateInput["type"];
    severity: Prisma.AlertCreateInput["severity"];
    title: string;
    message: string;
    entityType: Prisma.AlertCreateInput["entityType"];
    entityId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const document = (data.metadata as any)?.document;
    const entityType = data.entityType;

    const where: Prisma.AlertWhereInput = {
      type: data.type,
      entityType: data.entityType,
      entityId: data.entityId,
      resolvedAt: null,
    };

    if (document) {
      where.metadata = {
        path: ["document"],
        equals: document,
      };
    }

    if (entityType === "VEHICLE" && data.metadata) {
      const vehiclePlate = (data.metadata as any)?.vehiclePlate;
      if (vehiclePlate) {
        where.metadata = {
          path: ["vehiclePlate"],
          equals: vehiclePlate,
        };
      }
    }

    const existing = await prisma.alert.findFirst({
      where,
    });

    if (existing) {
      return existing;
    }

    return prisma.alert.create({
      data: {
        type: data.type,
        severity: data.severity,
        title: data.title,
        message: data.message,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata,
      },
    });
  }

  /* RESOLVE ALERTS BY ENTITY */
  async resolveAlertsByEntity(data: {
    type: Prisma.AlertCreateInput["type"];
    entityType: Prisma.AlertCreateInput["entityType"];
    entityId?: string;
  }) {
    await prisma.alert.updateMany({
      where: {
        type: data.type,
        entityType: data.entityType,
        entityId: data.entityId,
        resolvedAt: null,
      },
      data: {
        isRead: true,
        readAt: new Date(),
        resolvedAt: new Date(),
      },
    });
  }
}
