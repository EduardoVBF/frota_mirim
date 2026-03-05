"use client";
import {
  getMaintenances,
  Maintenance,
  MaintenanceFilters,
} from "@/services/maintenance.service";
import { MaintenanceTable } from "@/components/maintenance/maintenanceTable";
import { useEffect, useState, useCallback } from "react";
import { Wrench, AlertTriangle } from "lucide-react";
import { FadeIn } from "@/components/motion/fadeIn";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import toast, { Toaster } from "react-hot-toast";
import { AxiosError } from "axios";

export default function MaintenancePage() {
  const [loading, setLoading] = useState(false);

  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);

  const [filters, setFilters] = useState<
    MaintenanceFilters & { search?: string }
  >({
    search: "",
  });

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);

    try {
      const data = await getMaintenances(filters);

      setMaintenances(data.maintenances);
    } catch (err) {
      if (!(err instanceof AxiosError)) {
        toast.error("Erro ao buscar manutenções");
        return;
      }

      toast.error("Erro ao buscar manutenções");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const preventive = maintenances.filter(
    (m) => m.type === "PREVENTIVE",
  );

  const corrective = maintenances.filter(
    (m) => m.type === "CORRECTIVE",
  );

  return (
    <FadeIn>
      <Toaster />

      <div className="max-w-7xl mx-auto space-y-4">

        <header>
          <h1 className="text-3xl font-bold">
            Controle de{" "}
            <span className="text-accent">Manutenções</span>
          </h1>
        </header>

        {loading ? (
          <LoaderComp />
        ) : (
          <div className="grid grid-cols-3 gap-6">

            <StatsCard
              label="Total manutenções"
              value={maintenances.length.toString()}
              icon={<Wrench />}
              iconColor="text-accent"
            />

            <StatsCard
              label="Preventivas"
              value={preventive.length.toString()}
              icon={<Wrench />}
              iconColor="text-success"
            />

            <StatsCard
              label="Corretivas"
              value={corrective.length.toString()}
              icon={<AlertTriangle />}
              iconColor="text-warning"
            />

          </div>
        )}

        <MaintenanceTable
          maintenances={maintenances}
          isLoading={loading}
          filters={filters}
          setFilters={setFilters}
          onChange={fetchMaintenances}
        />

      </div>
    </FadeIn>
  );
}