import { prisma } from "../../shared/database/prisma";
import { AppError } from "../../infra/errors/app-error";
import { CreateFuelSupplyDTO, FuelSupplyQueryDTO } from "./fuel-supply.schema";

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
      page = 1,
      limit = 10,
    } = query;

    const where: any = {};

    if (vehicleId) where.vehicleId = vehicleId;

    if (tipoCombustivel) where.tipoCombustivel = tipoCombustivel;

    if (postoTipo) where.postoTipo = postoTipo;

    if (tanqueCheio !== undefined) where.tanqueCheio = tanqueCheio;
    
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
  async create(data: CreateFuelSupplyDTO, userId?: string) {
    return prisma.$transaction(async (tx) => {
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
          userId,
          valorTotal,
        },
      });

      await this.recalcularMedias(tx, data.vehicleId);

      return fuel;
    });
  }

  // UPDATE
  async update(id: string, data: Partial<CreateFuelSupplyDTO>) {
    return prisma.$transaction(async (tx) => {
      const fuel = await tx.fuelSupply.findUnique({ where: { id } });
      if (!fuel) throw new AppError("Abastecimento não encontrado.", 404);

      const vehicle = await tx.vehicle.findUnique({
        where: { id: fuel.vehicleId },
      });

      if (!vehicle) throw new AppError("Veículo não encontrado.", 404);

      if (data.kmAtual && data.kmAtual < 0) {
        throw new AppError("KM inválido.", 400);
      }

      const valorTotal =
        data.litros && data.valorLitro
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
  }

  // DELETE
  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const fuel = await tx.fuelSupply.findUnique({ where: { id } });
      if (!fuel) throw new AppError("Abastecimento não encontrado.", 404);

      await tx.fuelSupply.delete({ where: { id } });

      await this.recalcularMedias(tx, fuel.vehicleId);
    });
  }

  // MÉTODO PRIVADO — RECÁLCULO GLOBAL
  private async recalcularMedias(tx: any, vehicleId: string) {
    const abastecimentos = await tx.fuelSupply.findMany({
      where: { vehicleId },
      orderBy: { data: "asc" },
    });

    let ultimoTanqueCheio: any = null;

    for (const abastecimento of abastecimentos) {
      // limpa média
      await tx.fuelSupply.update({
        where: { id: abastecimento.id },
        data: { media: null },
      });

      if (abastecimento.tanqueCheio) {
        if (ultimoTanqueCheio) {
          const periodo = abastecimentos.filter(
            (a: { data: number }) =>
              a.data > ultimoTanqueCheio.data && a.data <= abastecimento.data,
          );

          const somaLitros = periodo.reduce(
            (acc: number, item: { litros: any }) => acc + Number(item.litros),
            0,
          );

          const kmRodado = abastecimento.kmAtual - ultimoTanqueCheio.kmAtual;

          if (somaLitros > 0 && kmRodado > 0) {
            const media = kmRodado / somaLitros;

            await tx.fuelSupply.update({
              where: { id: abastecimento.id },
              data: { media },
            });
          }
        }

        ultimoTanqueCheio = abastecimento;
      }
    }

    // Atualiza kmAtual do veículo
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
}
