"use client";
import {
  getVehicleUsages,
  VehicleUsage,
  VehicleUsageFilters,
} from "@/services/vehicleUsage.service";
import { VehicleUsageTable } from "@/components/vehicleUsage/vehicleUsageTable";
import { useEffect, useState } from "react";
import { ClockCheck, LogIn, LogOut } from "lucide-react";
import { Vehicle } from "@/services/vehicles.service";
import Pagination from "@/components/paginationComp";
import { StatsCard } from "@/components/statsCard";
import LoaderComp from "@/components/loaderComp";

type Props = {
  vehicle: Vehicle;
};

export default function VehicleUsageTab({ vehicle }: Props) {
  const [usages, setUsages] = useState<VehicleUsage[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<VehicleUsageFilters>({
    vehicleId: vehicle.id,
    userId: undefined,
    type: undefined,
    page: 1,
    limit: 10,
  });

  const fetchUsages = async () => {
    setLoading(true);
    try {
      const data = await getVehicleUsages(filters);
      setTotalPages(data.meta.totalPages || 1);
      setUsages(data.usages);
    } catch {
      setUsages([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSetFilters = (newFilters: Partial<VehicleUsageFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  if (loading && filters.page === 1) return <LoaderComp />;

  return (
    <div className="space-y-6">
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

      <VehicleUsageTable
        usages={usages}
        isLoading={loading}
        filters={filters}
        setFilters={handleSetFilters}
        onChange={fetchUsages}
        isVehiclePage
        vehicle={vehicle}
      />

      <Pagination
        page={filters.page  || 1}
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