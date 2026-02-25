"use client";
import {
  getVehicleUsages,
  VehicleUsage,
  VehicleUsageFilters,
} from "@/services/vehicleUsage.service";
import { VehicleUsageTable } from "@/components/vehicleUsage/vehicleUsageTable";
import { useEffect, useState, useCallback, useMemo } from "react";
import { translateApiErrors } from "@/utils/translateApiError";
import { ClockCheck, LogOut, LogIn } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { AxiosError } from "axios";

export default function VehicleUsagesPage() {
  const [loading, setLoading] = useState(false);
  const [usages, setUsages] = useState<VehicleUsage[]>([]);

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
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao buscar os eventos");
        return;
      } else {
        if (!err.response || !err.response.data) {
          toast.error("Erro ao buscar os eventos");
          return;
        }
        const { toastMessage } = translateApiErrors(err.response.data);

        toast.error(toastMessage || "Erro ao buscar os eventos");
      }
      setUsages([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchUsages();
  }, [fetchUsages]);

  const totalPages = useMemo(() => {
    return Math.ceil(usages.length / limit);
  }, [usages]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  return (
    <FadeIn>
      <Toaster />
      <div className="max-w-7xl mx-auto space-y-4">
        <header>
          <h1 className="text-3xl font-bold">
            Controle de{" "}
            <span className="text-accent">Check-in / Check-out</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <StatsCard
              label="Total Eventos"
              value={usages.length.toString()}
              icon={<ClockCheck />}
              iconColor="text-accent"
            />
            <StatsCard
              label="Entradas"
              value={usages.filter((u) => u.type === "ENTRY").length.toString()}
              icon={<LogIn />}
              iconColor="text-success"
            />
            <StatsCard
              label="Saídas"
              value={usages.filter((u) => u.type === "EXIT").length.toString()}
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
