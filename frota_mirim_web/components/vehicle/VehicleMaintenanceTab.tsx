"use client";
import {
  getMaintenances,
  Maintenance,
  MaintenanceFilters,
} from "@/services/maintenance.service";
import { MaintenanceTable } from "@/components/maintenance/maintenanceTable";
import { Vehicle } from "@/services/vehicles.service";
import { Wrench, AlertTriangle } from "lucide-react";
import Pagination from "@/components/paginationComp";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";
import { useEffect, useState } from "react";

type Props = {
  vehicle: Vehicle;
};

export default function VehicleMaintenanceTab({ vehicle }: Props) {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    preventive: 0,
    corrective: 0,
    totalCost: "0",
  });

  const [filters, setFilters] = useState<MaintenanceFilters>({
    vehicleId: vehicle.id,
    page: 1,
    limit: 10,
  });

  const fetchMaintenances = async () => {
    setLoading(true);

    try {
      const data = await getMaintenances(filters);

      setMaintenances(data.items);
      setTotalPages(data.meta.totalPages || 1);

      setStats({
        preventive: data.stats?.type?.preventive || 0,
        corrective: data.stats?.type?.corrective || 0,
        totalCost: data.meta?.allTotalCost || "0",
      });
    } catch {
      setMaintenances([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSetFilters = (newFilters: Partial<MaintenanceFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  if (loading && filters.page === 1) return <LoaderComp />;

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-3 gap-6">
        <StatsCard
          label="Total manutenções"
          value={maintenances.length.toString()}
          icon={<Wrench />}
          iconColor="text-accent"
        />

        <StatsCard
          label="Preventivas"
          value={stats.preventive.toString()}
          icon={<Wrench />}
          iconColor="text-success"
        />

        <StatsCard
          label="Corretivas"
          value={stats.corrective.toString()}
          icon={<AlertTriangle />}
          iconColor="text-warning"
        />
      </div>

      {/* TABLE */}
      <MaintenanceTable
        maintenances={maintenances}
        vehicles={[vehicle]}
        isLoading={loading}
        filters={filters}
        setFilters={handleSetFilters}
        onChange={fetchMaintenances}
        isVehiclePage
        vehicle={vehicle}
      />

      {/* PAGINATION */}
      <Pagination
        page={filters.page || 1}
        totalPages={totalPages}
        onPageChange={(newPage) =>
          setFilters((prev) => ({
            ...prev,
            page: newPage,
          }))
        }
      />
    </div>
  );
}