import {
  MaintenanceHistoryQueryDTO,
  UpdateResponsibleDTO,
} from "./maintenanceHistory.schema";
import { MaintenanceHistoryAction, Prisma } from "@prisma/client";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";

type FieldConfig = {
  field: string;
  label: string;
};

export class MaintenanceHistoryService {
  // GET ALL
  async getAll(query: MaintenanceHistoryQueryDTO) {
    const { maintenanceOrderId, action, page = 1, limit = 10 } = query;

    const where: any = {
      maintenanceOrderId,
    };

    if (action) where.action = action;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.maintenanceHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          actorUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          responsibleUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.maintenanceHistory.count({ where }),
    ]);

    return {
      history: items,
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
    const history = await prisma.maintenanceHistory.findUnique({
      where: { id },
      include: {
        actorUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        responsibleUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!history) {
      throw new AppError("Registro de histórico não encontrado.", 404);
    }

    return history;
  }

  // UPDATE RESPONSIBLE
  async updateResponsible(id: string, data: UpdateResponsibleDTO) {
    const history = await prisma.maintenanceHistory.findUnique({
      where: { id },
    });

    if (!history) {
      throw new AppError("Registro de histórico não encontrado.", 404);
    }

    const user = await prisma.user.findUnique({
      where: { id: data.responsibleUserId },
    });

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    return prisma.maintenanceHistory.update({
      where: { id },
      data: {
        responsibleUserId: data.responsibleUserId,
      },
    });
  }

  // 🔒 CREATE HISTORY (uso interno)
  async createHistory(
    params: {
      maintenanceOrderId: string;
      action: MaintenanceHistoryAction;
      actorUserId?: string;
      responsibleUserId?: string;
      metadata?: any;
      description?: string;
    },
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? prisma;

    return client.maintenanceHistory.create({
      data: {
        maintenanceOrderId: params.maintenanceOrderId,
        action: params.action,
        actorUserId: params.actorUserId ?? null,
        responsibleUserId: params.responsibleUserId ?? null,
        metadata: params.metadata,
        description: params.description,
      },
    });
  }

  // 🔥 HELPER - BUILD CHANGES
  buildChanges(oldData: any, newData: any, fields: FieldConfig[]) {
    const changes: any[] = [];

    for (const f of fields) {
      const oldValue = oldData?.[f.field];
      const newValue = newData?.[f.field];

      // evita falso positivo com null/undefined
      const changed =
        oldValue !== newValue &&
        JSON.stringify(oldValue) !== JSON.stringify(newValue);

      if (changed) {
        changes.push({
          field: f.field,
          label: f.label,
          from: oldValue ?? null,
          to: newValue ?? null,
        });
      }
    }

    return changes;
  }
}
