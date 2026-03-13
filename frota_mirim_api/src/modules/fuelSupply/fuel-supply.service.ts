import { CreateFuelSupplyDTO, FuelSupplyQueryDTO } from "./fuel-supply.schema";
import { AppError } from "../../infra/errors/app-error";
import { checkFuelAnomaly } from "./fuelAnomaly.check";
import { prisma } from "../../shared/database/prisma";

export class FuelSupplyService {
  // GET ALL
  async getAll(query: FuelSupplyQueryDTO) {
    const {
      vehicleId,
      dataInicio,
      dataFim,
      tipoCombustivel,
      postoTipo,
      tanqueCheio,
      userId,
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};

    if (vehicleId) where.vehicleId = vehicleId;
    if (tipoCombustivel) where.tipoCombustivel = tipoCombustivel;
    if (postoTipo) where.postoTipo = postoTipo;
    if (tanqueCheio !== undefined) where.tanqueCheio = tanqueCheio;
    if (userId) where.userId = userId;

    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = dataInicio;
      if (dataFim) where.data.lte = dataFim;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.fuelSupply.findMany({
        where,
        orderBy: { data: "desc" },
        skip,
        take: limit,
      }),
      prisma.fuelSupply.count({ where }),
    ]);

    return {
      abastecimentos: items,
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
    const fuel = await prisma.fuelSupply.findUnique({ where: { id } });
    if (!fuel) throw new AppError("Abastecimento não encontrado.", 404);
    return fuel;
  }

  // CREATE
  async create(data: CreateFuelSupplyDTO) {
    const fuel = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: data.vehicleId },
      });

      if (!vehicle) throw new AppError("Veículo não encontrado.", 404);

      if (data.kmAtual < vehicle.kmAtual) {
        throw new AppError(
          "KM não pode ser menor que o atual do veículo.",
          400,
        );
      }

      const valorTotal = Number(data.litros) * Number(data.valorLitro);

      const fuel = await tx.fuelSupply.create({
        data: {
          ...data,
          valorTotal,
        },
      });

      await this.recalcularMedias(tx, data.vehicleId);

      return fuel;
    });

    await checkFuelAnomaly(data.vehicleId);

    return fuel;
  }

  // UPDATE
  async update(id: string, data: Partial<CreateFuelSupplyDTO>) {
    const updatedFuel = await prisma.$transaction(async (tx) => {
      const fuel = await tx.fuelSupply.findUnique({ where: { id } });
      if (!fuel) throw new AppError("Abastecimento não encontrado.", 404);

      const vehicle = await tx.vehicle.findUnique({
        where: { id: fuel.vehicleId },
      });

      if (!vehicle) throw new AppError("Veículo não encontrado.", 404);

      if (data.kmAtual !== undefined && data.kmAtual < 0) {
        throw new AppError("KM inválido.", 400);
      }

      const valorTotal =
        data.litros !== undefined && data.valorLitro !== undefined
          ? Number(data.litros) * Number(data.valorLitro)
          : fuel.valorTotal;

      await tx.fuelSupply.update({
        where: { id },
        data: {
          ...data,
          valorTotal,
        },
      });

      await this.recalcularMedias(tx, fuel.vehicleId);

      return tx.fuelSupply.findUnique({ where: { id } });
    });

    // 🔎 Verifica anomalia após atualizar médias
    if (updatedFuel) {
      await checkFuelAnomaly(updatedFuel.vehicleId);
    }

    return updatedFuel;
  }

  // RECÁLCULO GLOBAL
  private async recalcularMedias(tx: any, vehicleId: string) {
    const abastecimentos = await tx.fuelSupply.findMany({
      where: { vehicleId },
      orderBy: [{ data: "asc" }, { createdAt: "asc" }],
    });

    // Zera médias de uma vez
    await tx.fuelSupply.updateMany({
      where: { vehicleId },
      data: { media: null },
    });

    let ultimoTanqueCheio: any = null;
    let litrosAcumulados = 0;

    const updates: Promise<any>[] = [];

    for (const abastecimento of abastecimentos) {
      if (ultimoTanqueCheio) {
        litrosAcumulados += Number(abastecimento.litros);
      }

      if (abastecimento.tanqueCheio) {
        if (ultimoTanqueCheio) {
          const kmRodado = abastecimento.kmAtual - ultimoTanqueCheio.kmAtual;

          if (kmRodado > 0 && litrosAcumulados > 0) {
            const media = kmRodado / litrosAcumulados;

            updates.push(
              tx.fuelSupply.update({
                where: { id: abastecimento.id },
                data: { media },
              }),
            );
          }
        }

        ultimoTanqueCheio = abastecimento;
        litrosAcumulados = 0;
      }
    }

    await Promise.all(updates);

    const ultimoAbastecimento = abastecimentos[abastecimentos.length - 1];

    if (ultimoAbastecimento) {
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: {
          kmAtual: ultimoAbastecimento.kmAtual,
          kmUltimoAbastecimento: ultimoAbastecimento.kmAtual,
        },
      });
    }
  }

  // DELETE
  async delete(id: string) {
    const vehicleId = await prisma.$transaction(async (tx) => {
      const fuel = await tx.fuelSupply.findUnique({
        where: { id },
      });

      if (!fuel) {
        throw new AppError("Abastecimento não encontrado.", 404);
      }

      const vehicleId = fuel.vehicleId;

      await tx.fuelSupply.delete({
        where: { id },
      });

      await this.recalcularMedias(tx, vehicleId);

      return vehicleId;
    });

    // 🔎 verifica anomalia após recalcular médias
    await checkFuelAnomaly(vehicleId);
  }
}
