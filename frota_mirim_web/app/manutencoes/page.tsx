"use client";
import {
  getMaintenances,
  Maintenance,
  MaintenanceFilters,
  MaintenancesResponse,
} from "@/services/maintenance.service";
import { MaintenanceTable } from "@/components/maintenance/maintenanceTable";
import { getVehicles, Vehicle } from "@/services/vehicles.service";
import { useEffect, useState, useCallback } from "react";
import { Wrench, AlertTriangle, Coins } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { AxiosError } from "axios";

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [meta, setMeta] = useState({
    total: 0,
    totalFiltered: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    allTotalCost: "0",
  });

  const [stats, setStats] = useState({
    type: {
      preventive: 0,
      corrective: 0,
    },
    status: {
      open: 0,
      inProgress: 0,
      done: 0,
      canceled: 0,
    },
  });

  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<
    MaintenanceFilters & { search?: string }
  >({
    search: "",
  });

  const [page, setPage] = useState(1);

  const limit = 10;

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);

    try {
      const data: MaintenancesResponse = await getMaintenances({
        ...filters,
        page,
        limit,
      });

      setMaintenances(data.items);
      setMeta(data.meta);
      setStats(data.stats);
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao buscar manutenções");
        return;
      }

      toast.error("Erro ao buscar manutenções");
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const data = await getVehicles({
          page: 1,
          limit: 1000,
        });

        setVehicles(data.vehicles);
      } catch {
        toast.error("Erro ao carregar veículos");
      }
    }

    fetchVehicles();
  }, []);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = meta.totalPages;

  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Controle de <span className="text-accent">Manutenções</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-4 gap-6">
            <StatsCard
              label="Total manutenções"
              value={meta.total.toString()}
              icon={<Wrench />}
              iconColor="text-accent"
            />
            
            <StatsCard
              label="Valor total"
              value={meta.allTotalCost ? `R$ ${meta.allTotalCost}` : "R$ 0"}
              icon={<Coins />}
              iconColor="text-success"
            />

            <StatsCard
              label="Preventivas"
              value={stats.type.preventive.toString()}
              icon={<Wrench />}
              iconColor="text-success"
            />

            <StatsCard
              label="Corretivas"
              value={stats.type.corrective.toString()}
              icon={<AlertTriangle />}
              iconColor="text-warning"
            />
          </div>
        )}

        <MaintenanceTable
          maintenances={maintenances}
          vehicles={vehicles}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
          onChange={fetchMaintenances}
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