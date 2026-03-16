import { VehicleQueryDTO, PayVehicleDocumentDTO } from "./vehicles.schema";
import { AppError } from "../../infra/errors/app-error";
import { prisma } from "../../shared/database/prisma";
import { Prisma } from "@prisma/client";

function normalizePlaca(placa: string) {
  return placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export class VehiclesService {
  async getAllVehicles(query: VehicleQueryDTO) {
    const { search, tipo, isActive, page = 1, limit = 10 } = query;

    const where: any = { AND: [] };

    if (search) {
      where.AND.push({
        OR: [
          { placa: { contains: normalizePlaca(search), mode: "insensitive" } },
          { modelo: { contains: search, mode: "insensitive" } },
          { marca: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (tipo) {
      where.AND.push({
        tipo: { in: Array.isArray(tipo) ? tipo : [tipo] },
      });
    }

    if (typeof isActive === "boolean") {
      where.AND.push({ isActive });
    }

    const finalWhere = where.AND.length ? where : {};
    const skip = (page - 1) * limit;

    const [vehicles, totalFiltered, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where: finalWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.vehicle.count({ where: finalWhere }),
      prisma.vehicle.count(),
    ]);

    return {
      vehicles,
      meta: {
        total: totalCount,
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit),
      },
    };
  }

  async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new AppError("Veículo não encontrado.", 404);
    }

    return vehicle;
  }

  async getVehicleByPlaca(placa: string) {
    const normalized = normalizePlaca(placa);

    const vehicle = await prisma.vehicle.findUnique({
      where: { placa: normalized },
    });

    if (!vehicle) {
      throw new AppError("Veículo não encontrado.", 404);
    }

    return vehicle;
  }

  async createVehicle(data: any) {
    const normalizedPlaca = normalizePlaca(data.placa);

    const existing = await prisma.vehicle.findUnique({
      where: { placa: normalizedPlaca },
    });

    if (existing) {
      throw new AppError("Já existe veículo com essa placa.", 409);
    }

    return prisma.vehicle.create({
      data: {
        ...data,
        placa: normalizedPlaca,
      },
    });
  }

  async updateVehicle(id: string, data: any) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new AppError("Veículo não encontrado.", 404);
    }

    if (data.placa) {
      data.placa = normalizePlaca(data.placa);
    }

    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async payVehicleDocument(id: string, data: PayVehicleDocumentDTO) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new AppError("Veículo não encontrado.", 404);
    }

    const currentYear = new Date().getFullYear();

    let updateData: Prisma.VehicleUpdateInput = {};

    if (data.type === "IPVA") {
      if (vehicle.ipvaPaidYear === currentYear) {
        throw new AppError("IPVA já foi marcado como pago este ano.", 400);
      }

      updateData = {
        ipvaPaidYear: currentYear,
      };
    }

    if (data.type === "LICENSING") {
      if (vehicle.licensingPaidYear === currentYear) {
        throw new AppError(
          "Licenciamento já foi marcado como pago este ano.",
          400,
        );
      }

      updateData = {
        licensingPaidYear: currentYear,
      };
    }

    const [updatedVehicle] = await prisma.$transaction([
      prisma.vehicle.update({
        where: { id },
        data: updateData,
      }),

      prisma.alert.updateMany({
        where: {
          entityType: "VEHICLE",
          entityId: id,
          resolvedAt: null,
          metadata: {
            path: ["document"],
            equals: data.type,
          },
        },
        data: {
          resolvedAt: new Date(),
        },
      }),
    ]);

    return updatedVehicle;
  }
}
