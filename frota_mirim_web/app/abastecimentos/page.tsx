"use client";
import {
  getFuelSupplies,
  FuelSupply,
  FuelSupplyFilters,
} from "@/services/fuel-supply.service";
import { FuelSupplyTable } from "@/components/fuel-supply/FuelSupplyTable";
import { getVehicles, Vehicle } from "@/services/vehicles.service";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Fuel, DollarSign, Gauge } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import dayjs from "dayjs";

export default function AbastecimentosPage() {
  const [loading, setLoading] = useState(false);
  const [abastecimentos, setAbastecimentos] = useState<FuelSupply[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [filters, setFilters] = useState<FuelSupplyFilters>({
    vehicleId: undefined,
    dataInicio: undefined,
    dataFim: undefined,
    tipoCombustivel: undefined,
    postoTipo: undefined,
    tanqueCheio: undefined,
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  // LOAD VEHICLES
  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await getVehicles({ limit: 200, page: 1 });
        setVehicles(res.vehicles);
      } catch {
        setVehicles([]);
      }
    }

    loadVehicles();
  }, []);

  // FETCH TODOS ABASTECIMENTOS
  const fetchAbastecimentos = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getFuelSupplies({
        limit: 1000,
        page: 1,
      });

      setAbastecimentos(data.abastecimentos);
    } catch {
      setAbastecimentos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbastecimentos();
  }, [fetchAbastecimentos]);

  // PROCESSAMENTO NO FRONT
  const processedData = useMemo(() => {
    const filtered = abastecimentos.filter((item) => {
      if (filters.vehicleId && item.vehicleId !== filters.vehicleId)
        return false;

      if (
        filters.tipoCombustivel &&
        !filters.tipoCombustivel.includes(item.tipoCombustivel)
      )
        return false;

      if (filters.postoTipo && item.postoTipo !== filters.postoTipo)
        return false;

      if (filters.tanqueCheio !== undefined) {
        if (item.tanqueCheio !== filters.tanqueCheio) return false;
      }

      if (filters.dataInicio) {
        if (dayjs(item.data).isBefore(dayjs(filters.dataInicio)))
          return false;
      }

      if (filters.dataFim) {
        if (dayjs(item.data).isAfter(dayjs(filters.dataFim).endOf("day")))
          return false;
      }

      return true;
    });

    const start = (page - 1) * limit;
    const end = start + limit;

    // STATS BASEADOS NA PÁGINA
    const pageData = filtered.slice(start, end);

    const totalLitros = pageData.reduce(
      (acc, item) => acc + Number(item.litros),
      0
    );

    const totalGasto = pageData.reduce(
      (acc, item) => acc + Number(item.valorTotal),
      0
    );

    const medias = pageData.filter((a) => a.media);

    const mediaGeral =
      medias.reduce((acc, item) => acc + Number(item.media), 0) /
      (medias.length || 1);

    return {
      data: pageData,
      totalFiltered: filtered.length,
      totalLitros,
      totalGasto,
      mediaGeral,
    };
  }, [abastecimentos, filters, page]);

  const totalPages = Math.ceil(processedData.totalFiltered / limit);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">
            Controle de <span className="text-accent">Abastecimentos</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              label="Total Litros (Página)"
              value={`${processedData.totalLitros.toFixed(2)} L`}
              icon={<Fuel />}
              iconColor="text-accent"
            />
            <StatsCard
              label="Total Gasto (Página)"
              value={`R$ ${processedData.totalGasto.toFixed(2)}`}
              icon={<DollarSign />}
              iconColor="text-success"
            />
            <StatsCard
              label="Média Geral (Página)"
              value={`${processedData.mediaGeral.toFixed(2)} Km/L`}
              icon={<Gauge />}
              iconColor="text-info"
            />
          </div>
        )}

        <FuelSupplyTable
          abastecimentos={processedData.data}
          vehicles={vehicles}
          filters={filters}
          isLoading={loading}
          setFilters={setFilters}
          onChange={fetchAbastecimentos}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </FadeIn>
  );
}