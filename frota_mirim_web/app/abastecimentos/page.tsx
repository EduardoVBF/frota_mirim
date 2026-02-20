"use client";
import {
  getFuelSupplies,
  FuelSupply,
  FuelSupplyFilters,
} from "@/services/fuel-supply.service";
import { FuelSupplyTable } from "@/components/fuel-supply/FuelSupplyTable";
import { getVehicles, Vehicle } from "@/services/vehicles.service";
import FilterChips from "@/components/fuel-supply/FilterChips";
import PrimarySelect from "@/components/form/primarySelect";
import PrimaryInput from "@/components/form/primaryInput";
import { useEffect, useState, useCallback } from "react";
import { Fuel, DollarSign, Gauge } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";

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

  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1,
  });

  // LOAD VEHICLES
  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await getVehicles({ limit: 100 });
        setVehicles(res.vehicles);
      } catch {
        setVehicles([]);
      }
    }

    loadVehicles();
  }, []);

  // FETCH ABASTECIMENTOS
  const fetchAbastecimentos = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getFuelSupplies({
        ...filters,
        page,
        limit,
      });

      setAbastecimentos(data.abastecimentos);
      setMeta({
        total: data.meta.total,
        totalPages: data.meta.totalPages,
      });
    } catch {
      setAbastecimentos([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchAbastecimentos();
  }, [fetchAbastecimentos]);

  const handleClearFilters = () => {
    setPage(1);
    setFilters({
      vehicleId: undefined,
      dataInicio: undefined,
      dataFim: undefined,
      tipoCombustivel: undefined,
      postoTipo: undefined,
      tanqueCheio: undefined,
    });
  };

  // STATS
  const totalLitros = abastecimentos.reduce(
    (acc, item) => acc + Number(item.litros),
    0,
  );

  const totalGasto = abastecimentos.reduce(
    (acc, item) => acc + Number(item.valorTotal),
    0,
  );

  const medias = abastecimentos.filter((a) => a.media);

  const mediaGeral =
    medias.reduce((acc, item) => acc + Number(item.media), 0) /
    (medias.length || 1);

  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold">
            Controle de <span className="text-accent">Abastecimentos</span>
          </h1>
        </header>

        {/* CARDS */}
        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              label="Total Litros (Página)"
              value={`${totalLitros.toFixed(2)} L`}
              icon={<Fuel />}
              iconColor="text-accent"
            />
            <StatsCard
              label="Total Gasto (Página)"
              value={`R$ ${totalGasto.toFixed(2)}`}
              icon={<DollarSign />}
              iconColor="text-success"
            />
            <StatsCard
              label="Média Geral (Página)"
              value={`${mediaGeral.toFixed(2)} Km/L`}
              icon={<Gauge />}
              iconColor="text-info"
            />
          </div>
        )}

        {/* FILTROS */}
        <div className="bg-alternative-bg/70 backdrop-blur-md border border-border/60 rounded-3xl py-3 shadow-md space-y-2 transition-all">
          {/* HEADER FILTROS */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-lg font-semibold ml-4">Filtros</h2>

            <button
              onClick={handleClearFilters}
              className="mr-4 text-sm px-4 py-2 rounded-xl border border-border hover:bg-muted/40 transition-all"
            >
              Limpar filtros
            </button>
          </div>

          {/* FILTROS RÁPIDOS */}
          <div className="flex flex-wrap gap-4 px-4">
            <FilterChips
              label="Combustível"
              options={[
                { label: "Gasolina", value: "GASOLINA" },
                { label: "Etanol", value: "ETANOL" },
                { label: "Diesel", value: "DIESEL" },
              ]}
              value={filters.tipoCombustivel}
              onChange={(val) => {
                setPage(1);
                setFilters({
                  ...filters,
                  tipoCombustivel: val || undefined,
                });
              }}
            />

            <div className="w-px h-14 bg-border/50" />

            <FilterChips
              label="Posto"
              options={[
                { label: "Interno", value: "INTERNO" },
                { label: "Externo", value: "EXTERNO" },
              ]}
              value={filters.postoTipo}
              onChange={(val) => {
                setPage(1);
                setFilters({
                  ...filters,
                  postoTipo: val || undefined,
                });
              }}
            />
          </div>

          {/* DIVIDER */}
          <div className="h-px bg-border/50" />

          {/* FILTROS AVANÇADOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
            <PrimarySelect
              label="Veículo"
              value={filters.vehicleId || ""}
              onChange={(val) => {
                setPage(1);
                setFilters({
                  ...filters,
                  vehicleId: val || undefined,
                });
              }}
              options={[
                { label: "Todos os veículos", value: "" },
                ...vehicles.map((v) => ({
                  label: `${v.modelo} - ${v.placa}`,
                  value: v.id,
                })),
              ]}
            />

            <PrimaryInput
              label="Data Início"
              type="date"
              value={filters.dataInicio || ""}
              onChange={(e) => {
                setPage(1);
                setFilters({
                  ...filters,
                  dataInicio: e.target.value || undefined,
                });
              }}
            />

            <PrimaryInput
              label="Data Fim"
              type="date"
              value={filters.dataFim || ""}
              onChange={(e) => {
                setPage(1);
                setFilters({
                  ...filters,
                  dataFim: e.target.value || undefined,
                });
              }}
            />
          </div>
        </div>

        {/* TABELA */}
        <FuelSupplyTable
          abastecimentos={abastecimentos}
          isLoading={loading}
          filters={filters}
          setFilters={(newFilters) => {
            setPage(1);
            setFilters(newFilters);
          }}
          onChange={fetchAbastecimentos}
        />

        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onPageChange={setPage}
        />
      </div>
    </FadeIn>
  );
}
