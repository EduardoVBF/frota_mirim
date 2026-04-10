"use client";
import {
  getVehicleUsages,
  VehicleUsage,
  VehicleUsageFilters,
} from "@/services/vehicleUsage.service";
import { VehicleUsageTable } from "@/components/vehicleUsage/vehicleUsageTable";
import { useEffect, useState, useCallback } from "react";
import { translateApiErrors } from "@/utils/translateApiError";
import { ClockCheck, LogOut, LogIn } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { AxiosError } from "axios";

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function VehicleUsagesPage() {
  const [loading, setLoading] = useState(false);
  const [usages, setUsages] = useState<VehicleUsage[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);

  const [filters, setFilters] = useState<
    VehicleUsageFilters & { search?: string }
  >({
    vehicleId: undefined,
    userId: undefined,
    type: undefined,
    search: "",
  });

  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchUsages = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getVehicleUsages({
        ...filters,
        page,
        limit,
      });

      setUsages(data.usages);
      setMeta(data.meta);
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao buscar os eventos");
        return;
      }

      if (!err.response || !err.response.data) {
        toast.error("Erro ao buscar os eventos");
        return;
      }

      const { toastMessage } = translateApiErrors(err.response.data);
      toast.error(toastMessage || "Erro ao buscar os eventos");

      setUsages([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Busca sempre que filtros ou página mudarem
  useEffect(() => {
    fetchUsages();
  }, [fetchUsages]);

  // Sempre volta pra página 1 quando muda filtro
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = meta?.totalPages ?? 1;

  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Controle de{" "}
            <span className="text-accent">Entradas e Saídas</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Total Eventos"
              value={(meta?.total ?? 0).toString()}
              icon={<ClockCheck />}
              iconColor="text-accent"
            />

            <StatsCard
              label="Início de uso"
              value={usages
                .filter((u) => u.type === "ENTRY")
                .length.toString()}
              icon={<LogIn />}
              iconColor="text-success"
            />

            <StatsCard
              label="Fim de uso"
              value={usages
                .filter((u) => u.type === "EXIT")
                .length.toString()}
              icon={<LogOut />}
              iconColor="text-error"
            />
          </div>
        )}

        <VehicleUsageTable
          usages={usages}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
          onChange={fetchUsages}
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